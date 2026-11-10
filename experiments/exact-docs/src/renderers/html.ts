import type { DocumentNode } from "../content.ts";
export const escapeHtml=(value:string)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

export function renderHtml(nodes:DocumentNode[], component?:(node:Extract<DocumentNode,{kind:"component"}>)=>string):string {
  function emit(node:DocumentNode):string {
    if(node.kind==="text") return escapeHtml(node.value);
    if(node.kind==="image") return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt)}">`;
    if(node.kind==="separator") return "<hr>";
    if(node.kind==="component") {if(!component)throw new Error(`HTML renderer requires a component adapter for ${node.name}`);return component(node);}
    if(node.kind==="code") return `<pre data-docs-language="${escapeHtml(node.language)}"><code>${node.tokens?node.tokens.map(token=>`<span data-docs-token="${escapeHtml(token.kind)}">${escapeHtml(token.text)}</span>`).join(""):escapeHtml(node.value)}</code></pre>`;
    const aliases:Partial<Record<string,string>>={paragraph:"p",emphasis:"em",strikethrough:"del",codespan:"code"};
    const tag=node.kind==="heading"?`h${node.level}`:node.kind==="link"?"a":node.kind==="list"?node.ordered?"ol":"ul":node.kind==="list-item"?"li":aliases[node.kind]??node.kind;
    const attrs=node.kind==="heading"?` id="${escapeHtml(node.id)}"`:node.kind==="link"?` href="${escapeHtml(node.href)}"`:node.kind==="list"&&node.ordered?` start="${node.start}"`:node.kind==="th"?' scope="col"':"";
    return `<${tag}${attrs}>${node.children.map(emit).join("")}</${tag}>`;
  }
  return nodes.map(emit).join("");
}
