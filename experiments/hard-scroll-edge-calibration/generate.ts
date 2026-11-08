import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const material = await readFile(
  new URL("packages/tokens/src/materials/material.styles.ts", root),
  "utf8",
);
const theme = await readFile(new URL("packages/tokens/themes/default/materials.css", root), "utf8");
const filter = material.match(
  /backdropFilter:\s*"(var\(--lenso-material-edge-hard-filter\))"/,
)?.[1];
if (!filter) throw new Error("Current hard-edge filter was not found.");

await writeFile(
  new URL("web.html", import.meta.url),
  `<!doctype html>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${theme}
html,body{margin:0;height:100%;overflow:hidden}
html{--lenso-background-primary:white}html.dark{--lenso-background-primary:black}
body{background:var(--lenso-background-primary)}
#viewport{position:absolute;inset:0;overflow:auto;scrollbar-width:none}
img{display:block;width:100%;height:1800px}
#edge{position:absolute;inset:0 0 auto;height:96px;pointer-events:none}
#edge::before{content:"";position:absolute;inset:0;background:var(--lenso-material-edge-hard);backdrop-filter:${filter}}
#edge::after{content:"";position:absolute;inset: auto 0 0;height:.5px;background:var(--lenso-material-edge-hairline)}
html.previous #edge::before{backdrop-filter:blur(3px);background:rgb(255 255 255 / .85)}
html.previous.dark #edge::before{background:rgb(0 0 0 / .55)}
html.previous #edge::after{display:none}
html.mygo #edge::before{backdrop-filter:blur(6.4px) saturate(1.25) brightness(1.030927835) invert(1) brightness(.97) invert(1);background:rgb(255 255 255 / .8245)}
html.mygo.dark #edge::before{background:rgb(7.65 7.65 7.65 / .8245)}
html.mygo.dark #edge::after{background:rgb(255 255 255 / .07)}
</style>
<div id="viewport"><img src="pattern.png"></div><div id="edge"></div>
<script>
const q=new URLSearchParams(location.search);
document.documentElement.className=(q.get('dark')==='1'?'dark ':'')+q.get('mode');
document.querySelector('img').src=q.get('image')==='photo'?'photo.png':'pattern.png';
document.querySelector('#viewport').scrollTop=Number(q.get('y')||0);
</script>`,
);
