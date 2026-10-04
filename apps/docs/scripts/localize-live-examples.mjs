import { readFile, writeFile, mkdir, access, unlink, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";
import generateModule from "@babel/generator";
import { format } from "oxfmt";
import { canonicalDemoFile, canonicalExampleName } from "./docs-projection.mjs";
import {
  sourcePins,
  implementationPins as disclosureImplementationPins,
  verifyDisclosureInputs,
  verifyDisclosureOutput,
} from "./capture-disclosure-source.mjs";

const generate = generateModule.default ?? generateModule;
const root = fileURLToPath(new URL("../", import.meta.url));
const revision = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";

export function authoredLocaleModifications(file, code) {
  const modifications = [];
  if (file !== "en/input-group/with-loading-suffix.tsx") return { code, modifications };
  const tree = ast(code);
  function visit(node, fieldName) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child, fieldName));
      return;
    }
    if (node.type === "JSXElement") {
      const element = node.openingElement;
      const attribute = (name) =>
        element.attributes.find((item) => item.type === "JSXAttribute" && item.name.name === name);
      const name = attribute("name");
      const ownName = name?.value?.type === "StringLiteral" ? name.value.value : fieldName;
      const label = attribute("aria-label");
      if (
        ownName === "status" &&
        label?.value?.type === "StringLiteral" &&
        label.value.value === "Status"
      ) {
        label.value.value = "状态";
        delete label.value.extra;
        modifications.push({
          attribute: "aria-label",
          targetName: "status",
          from: "Status",
          to: "状态",
          basis: "Lenso-authored accessible name; not a pinned upstream translation",
        });
      }
      visit(node.children, ownName);
      return;
    }
    Object.values(node).forEach((child) => visit(child, fieldName));
  }
  visit(tree);
  return {
    code: modifications.length
      ? generate(tree, { comments: true, jsescOption: { minimal: true } }).code
      : code,
    modifications,
  };
}

const ignored = new Set([
  "start",
  "end",
  "loc",
  "extra",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "tokens",
  "errors",
]);
const digest = (value) => createHash("sha256").update(value).digest("hex");
// These compositions differ in the pinned CN source, not merely in their copy.
// An input change invalidates the adaptation rather than silently cloning EN.
const compositionPins = {
  "en/avatar-group/basic.tsx": [
    "35098081a7d697dbc879cbd57834ef2f143502d604a5b88db143712b50732ab9",
    "8790d9056547499d29c70befcfb769e213e589ebe2b09bb5d991aa0124367ae3",
    "de12b9c07fb0647693b1dc42d2f0effbb584103704c69f830f54463e4cd670e3",
  ],
  "en/avatar-group/max.tsx": [
    "4e543da85195bbb42f87d0fe3449c17d41b9c98180ff8992b03509f2f7de4b1d",
    "7cf104d97f7d04c8a61b3290ccdf8005008d3d8b8927fbd2c6ecd919cf5cfa98",
    "8801e6cb4cd449ff8c620a056a2d10a5f96c01a5032154a24b3b46736a564d87",
  ],
  "en/avatar-group/count.tsx": [
    "07a73336903e1d5a81b71936271655b84a0913b14511fd0450f1411b59898b02",
    "17b0c181c9ccccdb1d2051cef859427d09b41a834e7cb7d5fb1d3d06458a2380",
    "267a3c7fbad9f4cc8a274c003dfe1d78a6115b00ece0f18327b047406441076e",
  ],
  "en/avatar-group/sizes.tsx": [
    "81cf06ee431459bb14aa820a0554b66e696c3359ac9af33831871b1164037055",
    "489d581fae2a906191074d77283e30790beb031f3ae8911094aaf3c8bae69eee",
    "f866e80407094f5da65bc74a17122e07b04c4a7a3dbb3d1a8abb982c1e3000b9",
  ],
  "en/avatar-group/grid.tsx": [
    "e51a4b4d74c794079261120507f42ebda3e582c41fcd53196582457063279245",
    "f948592be270f0dc0e1f259597d69a9c4e9ec27b5e460ac2a4d1f100cf0595c2",
    "eb6ad113a1cf424f1dd25804391d120f29f67c5e7be1f7630d5e5a78f3865a3a",
  ],
  "en/scroll-shadow/default.tsx": [
    "fac2a26326d06b248e2e398ea53579831d641409aa014d1471ff8fe1df0e473a",
    "c9c20daac7dd929cd6727477afd0f3d5cd82e7605e77b1f2d13490e51b11a4d9",
    "c8f8faae3e81b59e781f2bfe6237fe402c93ec2f7f1bff07ff158712cb44196b",
  ],
  "en/scroll-shadow/size.tsx": [
    "621bfb053845b5d3cb794f249368dd4285829e27e768d34b357a5eb6526e4605",
    "269b4052db7d2633c9c5a7e366d3f86fe0a7e8c85c7da31526d62e832e76c6ea",
    "c314f0a6709248ebfa9def9bfb6902d2131a90bafd1711f87c3f73fd9386d994",
  ],
  "en/scroll-shadow/hide-scroll-bar.tsx": [
    "f1cb0e9ab830f3dbe73c6eab3f68dada6084b0f4a2a5dc37b7517e3437d720b5",
    "3ba9ef78c9554cc77b5669019a49eeec3aeab49380ab4ff908234d98aa0afe82",
    "1e600324e6cbb258a26e7c160f2f54c7fa053d4dd082148f45763fcf53ab421b",
  ],
  "en/scroll-shadow/custom-styles.tsx": [
    "343d6f4259a76f45989aaf03ea242962439de9135583be92a91b6f6443570818",
    "eed2a6efcbb2c70d007dfad09909f7c5903cabacc7991c928a682c235062fbfc",
    "3ed189c2758b7c7fee6f0eeef415105be53f86ab6fe74d9604c2cc162fd5140e",
  ],
};
const additionalCompositionPins = {
  "en/pagination/basic.tsx": "65b1df514788504cc6780df02d8623f316c9d84f67c52d29250fd65aa0606ae0",
  "en/pagination/disabled.tsx": "e3d6bd81440a1f8995f2f1d06068435c513542f73d4ce9c63ebb7e80636c4313",
  "en/pagination/simple-prev-next.tsx":
    "e00508e0317cd6c84256980e67de284c7f58ba7817c92f695b8e07ee440ec2a4",
  "en/pagination/controlled.tsx":
    "ffcff47f62f67c46c59173b13805ba276e7225f96de255ea87777823a171e826",
  "en/pagination/with-ellipsis.tsx":
    "9b7ac7a5a50d7dabbaa65f3c5a67728ecb4c1afb86065182a3a3752875768101",
  "en/pagination/with-summary.tsx":
    "8c1fa0ea525db10e08568103cd953ff88570c4179b1850113e523c2f8476ac14",
  "en/pagination/custom-icons.tsx":
    "0aa3a584ccd7fad7b14ef1a1bcb4f3250031ced40c9fc7fea3f1567e7e41d704",
  "en/alert-dialog/statuses.tsx":
    "817885726d38c39bc171f45dfb8e0f2a0382c728b9c0c0eb0765810e4df26bb2",
  "en/calendar/multiple-months.tsx":
    "53becf14093a066dea99a274e54486a8252a5c9b33eac70c0993a62768fe92bb",
  "en/color-slider/vertical.tsx":
    "c19d5ee61586f5fe97d0784c9e7996f57d54830695d7bcae2cf1f2058ad0a138",
  "en/color-swatch/transparency.tsx":
    "c3f9a94402fcc0b30d48b4e50ca94293cfcd32a79ac9773f6c8f09a061627db0",
  "en/color-swatch/render-function.tsx":
    "aa1efcaf178cada930d4b6905c35c7022c23b1e2d53d7d9ca5efeaa813137bad",
  "en/input-group/with-loading-suffix.tsx":
    // Reviewed native input name addition; pinned EN/CN archive bytes are unchanged.
    "d5c609dd58ea3f1404db42fc00d23097b7d00933149bf729f10f739c70d7136f",
  "en/meter/colors.tsx": "fd76f6e97c248ec71a3ba9d2248563fae4b4c14b085e250f1ee614d6efbc5857",
  "en/number-field/with-step.tsx":
    "b8fa3480f3f97f192d437b74d8e5c66b8565c688351201ecae6269db4bcadcde",
  "en/progress-bar/colors.tsx": "54f8840522272646af67d30198993ba554413e43fb96e6e9ea8fc0f2bff39857",
  "en/progress-circle/sizes.tsx":
    "275ff4b895cb9aac2d010b2ae186179923a554e62fe5e12f73e6ea0fc5426e00",
  "en/progress-circle/colors.tsx":
    "94bfc24cc789a90d8f6c2276b18b6d62dfeb997d35c52e0d6dc2e7fb7eff2d9e",
  "en/spinner/sizes.tsx": "983c4ddf4ebeb9caec3d21fea27781b54d4301af3e8b4080d8c2c2b8bb5f7a56",
  "en/typography/typography-scale.tsx":
    "73d4130d7c58a6daeae861bd04e997f859fc831a941e37feff59693e0e06df06",
};
const compositionOutputPins = {
  "en/alert-dialog/statuses.tsx":
    "03c8798684fcfa12289fe8f831688048fabe8474a63ca15b809e3319def5aa82",
  "en/avatar-group/basic.tsx": "367e79cf4cfa826d9b1400349e432faf37e99bf0356f402eb6992bf7f69bc43a",
  "en/avatar-group/max.tsx": "25b11e64c9c44e4b4681e2d5577368eb1c40df9652fc4910eee8f3a6f3e71f5b",
  "en/avatar-group/count.tsx": "bf4ff1ab8c97d2bf5ed29af6db72259f31e699c18a10dc4afb1eaea4df10a7e7",
  "en/avatar-group/sizes.tsx": "367daf82a519716a05c429cd0c3147c9fb62c98571015c6cd85d97380f800b3f",
  "en/avatar-group/grid.tsx": "8ce763cd2965b70f3e0f297c3e7b5bc7a0ad041e6a170589c4ab63763fba835c",
  "en/calendar/multiple-months.tsx":
    "49ca8d04e74a441ede5987f3f620bb4672720e8f77ae2ac677e1fbf42b216eb4",
  "en/color-slider/vertical.tsx":
    "9844e6f274afa3692ca06aca33541f5c9e74a4a693b1a4815b34988651fd515a",
  "en/color-swatch/transparency.tsx":
    "8812b629369b57dc9d813a1f7a07ba17a2d5df4a2c91c931b18c1f2e6a144de4",
  "en/color-swatch/render-function.tsx":
    "dd0394db859333d0f783928801fd72bb12fd12d5b54079b92b60570a4c8e0ad2",
  "en/input-group/with-loading-suffix.tsx":
    "98c0f184c024900e14df70b027b0a5c1d054f01275b3f6c37c9d4ff6de2968ea",
  "en/meter/colors.tsx": "df22692c28dc66a139707eb5648de1c39b79b42d09070177c7195964b2b8e261",
  "en/number-field/with-step.tsx":
    "91da9f7f490b35d6e9c4b33a180ab6d773b2f0b88640f6d633f0af928c9c311d",
  "en/pagination/basic.tsx": "791c1bd044a1262d8fa3360293513f9206979578ee52cbdd1c4636ceddf31b0f",
  "en/pagination/disabled.tsx": "791c1bd044a1262d8fa3360293513f9206979578ee52cbdd1c4636ceddf31b0f",
  "en/pagination/simple-prev-next.tsx":
    "717e63f822a438cb031ff5a2cee3e9f958859129c92de58073f0de0b6b05c47b",
  "en/pagination/controlled.tsx":
    "f213a273246db4a584e5b819f1e06a064170a48d481580409a4dce9b6b077515",
  "en/pagination/with-ellipsis.tsx":
    "791c1bd044a1262d8fa3360293513f9206979578ee52cbdd1c4636ceddf31b0f",
  "en/pagination/with-summary.tsx":
    "f213a273246db4a584e5b819f1e06a064170a48d481580409a4dce9b6b077515",
  "en/pagination/custom-icons.tsx":
    "1943e69dde182ca2737ca05b992d92ded59444ed638a4739c1ee267b18aab11e",
  "en/progress-bar/colors.tsx": "a5126cbd4c411489dbecbcbc2e13fffe772631fdf2003727cbe0b5c61ca519e8",
  "en/progress-circle/sizes.tsx":
    "67c71714072d71cce00c4f6277f464bfd07366f06ed5797309e4b45f213705fa",
  "en/progress-circle/colors.tsx":
    "29289ff6306bc84e15bbe36864e0481b87c4aab9938b80bb18296760b48f0523",
  "en/scroll-shadow/default.tsx":
    "5e2ec034c09bb2f50beb9022fa82cf8662b593525e25b20d7976ab9cdf11158a",
  "en/scroll-shadow/size.tsx": "534d208fd0f13094f2729f19d87cdf0b9501bde443e7d4a9073c042fbe071e38",
  "en/scroll-shadow/hide-scroll-bar.tsx":
    "ef5f9a4fd54765260e18196e2fcf3b554c2ff357a3439c36354a3ce4244e98fc",
  "en/scroll-shadow/custom-styles.tsx":
    "0459712c9b0bf9d02d7b10b1a2b4996281ead0cec695f9531f466147e05d111c",
  "en/spinner/sizes.tsx": "2998b19ad62bdb669206dd284a2a6990f99f15943a2d339eeacd9ba8012c91b5",
  "en/typography/typography-scale.tsx":
    "d389711351a60826345597c17396a8ae0ee45875120a79dbaaaf6da8874584ab",
};

async function formattedModule(file, code) {
  const result = await format(file, code, { printWidth: 100 });
  if (result.errors.length)
    throw new Error(`Cannot format localized module ${file}: ${JSON.stringify(result.errors)}`);
  return result.code;
}
const ast = (code) => parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
const normalize = (value) => value.replace(/\s+/g, " ").trim();
const isPresentationContext = (context) =>
  context === "text" ||
  /^attribute:(label|title|description|textValue|aria-label|aria-description|alt|placeholder)$/.test(
    context,
  ) ||
  /^property:(children|label|title|description|content|text|caption|textValue)$/.test(context);

function children(node) {
  return Object.entries(node).filter(([key]) => !ignored.has(key));
}

function isDisplayedValue(node, ancestors) {
  let value = node;
  for (const parent of [...ancestors].reverse()) {
    if (parent.type === "JSXExpressionContainer") return parent.expression === value;
    if (parent.type === "CallExpression" && parent.callee?.name === "alert")
      return parent.arguments[0] === value;
    if (
      (parent.type === "ConditionalExpression" &&
        (parent.consequent === value || parent.alternate === value)) ||
      (parent.type === "LogicalExpression" && parent.right === value)
    ) {
      value = parent;
      continue;
    }
    return false;
  }
  return false;
}

function literals(tree) {
  const result = [];
  const stylexNames = new Set(["stylex"]);
  for (const statement of tree.program.body) {
    if (statement.type === "ImportDeclaration" && statement.source.value === "@stylexjs/stylex") {
      for (const specifier of statement.specifiers) stylexNames.add(specifier.local.name);
    }
  }
  function visit(node, ancestors, location) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node
        .filter((child) => child?.type !== "JSXText" || normalize(child.value))
        .forEach((child, index) => {
          const declaration = child?.type === "ExportNamedDeclaration" ? child.declaration : child;
          const name =
            ancestors.at(-1)?.type === "Program"
              ? (declaration?.id?.name ?? declaration?.declarations?.[0]?.id?.name)
              : undefined;
          visit(child, ancestors, `${location}/${name ? `declaration:${name}` : index}`);
        });
      return;
    }
    if (node.type === "ExportNamedDeclaration" && node.declaration) {
      visit(node.declaration, ancestors, location);
      return;
    }
    const parent = ancestors.at(-1);
    const attributeIndex = ancestors.findLastIndex((item) => item.type === "JSXAttribute");
    const jsxIndex = ancestors.findLastIndex(
      (item) => item.type === "JSXElement" || item.type === "JSXFragment",
    );
    const propertyIndex = ancestors.findLastIndex((item) => item.type === "ObjectProperty");
    const attribute =
      attributeIndex > jsxIndex && attributeIndex > propertyIndex
        ? ancestors[attributeIndex]
        : undefined;
    const property = propertyIndex > jsxIndex ? ancestors[propertyIndex] : undefined;
    const forbidden =
      ancestors.some(
        (item) =>
          /^(Import|Directive)/.test(item.type) ||
          (item.type.startsWith("TS") &&
            !["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression"].includes(
              item.type,
            )) ||
          (item.type === "VariableDeclarator" && /(?:styles?|css)$/i.test(item.id?.name ?? "")) ||
          (item.type === "CallExpression" &&
            (item.callee?.type === "Import" || item.callee?.name === "require")) ||
          (item.type === "CallExpression" && stylexNames.has(item.callee?.object?.name)),
      ) ||
      ancestors.some(
        (item) =>
          item.type === "JSXAttribute" &&
          ["className", "style", "xstyle"].includes(item.name?.name),
      ) ||
      (parent?.type === "ObjectProperty" && parent.key === node);
    let value;
    if (node.type === "StringLiteral") value = node.value;
    if (node.type === "JSXText") value = normalize(node.value);
    if (node.type === "TemplateElement") value = node.value.cooked;
    if (!forbidden && value?.trim()) {
      const alertMessage =
        parent?.type === "CallExpression" &&
        parent.callee?.name === "alert" &&
        parent.arguments[0] === node;
      const context = alertMessage
        ? "text"
        : attribute
          ? `attribute:${attribute.name.name}`
          : property
            ? `property:${property.key.name ?? property.key.value}`
            : node.type === "TemplateElement" &&
                ancestors.some(
                  (ancestor) =>
                    ancestor.type === "JSXExpressionContainer" ||
                    (ancestor.type === "CallExpression" && ancestor.callee?.name === "alert"),
                )
              ? "template"
              : node.type === "JSXText" || isDisplayedValue(node, ancestors)
                ? "text"
                : "code";
      const jsx = ancestors.findLast(
        (item) => item.type === "JSXElement" || item.type === "JSXFragment",
      );
      const signature =
        node.type === "JSXText" && jsx
          ? JSON.stringify(
              jsx.children
                .filter((child) => child.type !== "JSXText" || normalize(child.value))
                .map((child) =>
                  child.type === "JSXElement"
                    ? [child.type, shape(child.openingElement.name)]
                    : child.type === "JSXExpressionContainer"
                      ? [child.type, child.expression.type]
                      : child.type,
                ),
            )
          : node.type;
      result.push({ node, parent, value, context, location, signature });
    }
    for (const [key, child] of children(node)) {
      if (typeof child === "object") visit(child, [...ancestors, node], `${location}/${key}`);
    }
  }
  visit(tree, [], "");
  return result;
}

function shape(node) {
  if (Array.isArray(node)) return node.map(shape);
  if (!node || typeof node !== "object") return node;
  if (["StringLiteral", "JSXText", "TemplateElement"].includes(node.type))
    return { type: node.type };
  return Object.fromEntries(children(node).map(([key, value]) => [key, shape(value)]));
}

function differences(en, cn, location = "") {
  if (JSON.stringify(en) === JSON.stringify(cn)) return [];
  if (!en || !cn || typeof en !== "object" || typeof cn !== "object") {
    const describe = (value) =>
      value && typeof value === "object"
        ? {
            type: value.type ?? (Array.isArray(value) ? "Array" : "Object"),
            name: value.id?.name,
            hash: digest(JSON.stringify(value)),
          }
        : value;
    return [{ location, en: describe(en), cn: describe(cn) }];
  }
  const keys = new Set([...Object.keys(en), ...Object.keys(cn)]);
  return [...keys]
    .filter((key) => !ignored.has(key))
    .flatMap((key) => differences(en[key], cn[key], `${location}/${key}`));
}

function nodes(tree, type) {
  const result = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === type) result.push(node);
    for (const [, child] of children(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (typeof child === "object") visit(child);
    }
  }
  visit(tree);
  return result;
}

function presentationMaps(tree) {
  const displays = displayedExpressions(tree).map((node) => node.expression);
  return nodes(tree, "VariableDeclarator")
    .map((node) => ({
      ...node,
      init: node.init?.type === "TSAsExpression" ? node.init.expression : node.init,
    }))
    .filter(
      (node) =>
        node.id.type === "Identifier" &&
        node.init?.type === "ObjectExpression" &&
        node.init.properties.length &&
        node.init.properties.every(
          (property) =>
            property.type === "ObjectProperty" &&
            !property.computed &&
            ["Identifier", "StringLiteral"].includes(property.key.type) &&
            property.value.type === "StringLiteral",
        ) &&
        displays.some(
          (expression) =>
            expression.type === "MemberExpression" && expression.object.name === node.id.name,
        ),
    )
    .map((node) => ({
      name: node.id.name,
      initializer: node.init,
      labels: Object.fromEntries(
        node.init.properties.map((property) => [
          property.key.name ?? property.key.value,
          property.value.value,
        ]),
      ),
      expressions: displays.filter(
        (expression) =>
          expression.type === "MemberExpression" &&
          expression.computed &&
          expression.object.name === node.id.name &&
          expression.property.type === "Identifier",
      ),
      applied: 0,
    }));
}

function projectedChineseLiterals(tree, maps) {
  const projected = structuredClone(tree);
  for (const node of nodes(projected, "JSXExpressionContainer")) {
    const expression = node.expression;
    if (
      expression.type !== "MemberExpression" ||
      expression.computed ||
      expression.property.type !== "Identifier"
    )
      continue;
    const map = maps.find((item) => item.name === expression.object.name);
    const value = map?.labels[expression.property.name];
    if (typeof value !== "string") continue;
    // Static map members are exactly source-evidenced text, not translated control values.
    node.type = "JSXText";
    node.value = value;
    delete node.expression;
  }
  // Attribute containers must remain attribute values rather than JSX child text.
  for (const node of nodes(projected, "JSXAttribute")) {
    if (node.value?.type === "JSXText")
      node.value = { type: "StringLiteral", value: node.value.value };
  }
  return literals(projected);
}

function displayedExpressions(tree) {
  return [...nodes(tree, "JSXElement"), ...nodes(tree, "JSXFragment")].flatMap((node) =>
    node.children.filter((child) => child.type === "JSXExpressionContainer"),
  );
}

function localizeAddedAccessibleAttributes(en, cn, adapted) {
  const allowed = new Set(["alt", "aria-label", "placeholder", "title", "aria-description"]);
  const english = nodes(en, "JSXOpeningElement");
  const chinese = nodes(cn, "JSXOpeningElement");
  const tags = new Set(chinese.map((node) => JSON.stringify(shape(node.name))));
  const report = [];
  for (const tag of tags) {
    const enElements = english.filter((node) => JSON.stringify(shape(node.name)) === tag);
    const cnElements = chinese.filter((node) => JSON.stringify(shape(node.name)) === tag);
    if (!enElements.length || enElements.length !== cnElements.length) continue;
    for (const attribute of allowed) {
      if (enElements.some((node) => node.attributes.some((item) => item.name?.name === attribute)))
        continue;
      const values = cnElements.map(
        (node) => node.attributes.find((item) => item.name?.name === attribute)?.value,
      );
      if (
        values.some((node) => node?.type !== "StringLiteral") ||
        new Set(values.map((node) => node.value)).size !== 1
      )
        continue;
      const entry = {
        tag: generate(cnElements[0].name).code,
        attribute,
        value: values[0].value,
        applied: 0,
        blockedExpressions: 0,
      };
      for (const node of nodes(adapted, "JSXOpeningElement").filter(
        (item) => JSON.stringify(shape(item.name)) === tag,
      )) {
        const existing = node.attributes.find((item) => item.name?.name === attribute);
        if (existing && existing.value?.type !== "StringLiteral") {
          entry.blockedExpressions++;
          continue;
        }
        if (existing) existing.value = structuredClone(values[0]);
        else
          node.attributes.push({
            type: "JSXAttribute",
            name: { type: "JSXIdentifier", name: attribute },
            value: structuredClone(values[0]),
          });
        entry.applied++;
      }
      report.push(entry);
    }
  }
  return report;
}

/** Translate only literal pairs evidenced at the same AST location in the pinned sources. */
export function localizeModule(englishSource, chineseSource, adaptedCode) {
  const en = ast(englishSource);
  const cn = ast(chineseSource);
  const adapted = ast(adaptedCode);
  const englishLiterals = literals(en);
  const chineseLiterals = literals(cn);
  const adaptedLiterals = literals(adapted);
  const pairs = [];
  const literalSafetyExceptions = [];
  const labelMaps = presentationMaps(cn);
  const chinese = new Map(
    projectedChineseLiterals(cn, labelMaps).map((item) => [item.location, item]),
  );
  for (const item of englishLiterals) {
    const counterpart = chinese.get(item.location);
    if (
      counterpart &&
      counterpart.context === item.context &&
      counterpart.value !== item.value &&
      !isPresentationContext(item.context) &&
      item.context !== "template"
    )
      literalSafetyExceptions.push({
        from: item.value,
        to: counterpart.value,
        context: item.context,
        location: item.location,
        reason: "non-presentation-literal-preserved",
      });
    if (
      counterpart &&
      (isPresentationContext(item.context) || item.context === "template") &&
      counterpart.context === item.context &&
      counterpart.signature === item.signature &&
      counterpart.value !== item.value
    ) {
      pairs.push({
        from: item.value,
        to: counterpart.value,
        context: item.context,
        location: item.location,
        applied: 0,
      });
    }
  }
  for (const item of englishLiterals.filter((literal) => literal.node.type === "JSXText")) {
    if (pairs.some((pair) => pair.location === item.location)) continue;
    const matches = labelMaps.flatMap((map) =>
      Object.entries(map.labels)
        .filter(([key]) => key.toLowerCase() === item.value.toLowerCase())
        .map(([key, to]) => ({ map: map.name, key, to })),
    );
    if (new Set(matches.map((match) => match.to)).size === 1) {
      pairs.push({
        from: item.value,
        to: matches[0].to,
        context: item.context,
        location: item.location,
        basis: { map: matches[0].map, key: matches[0].key },
        applied: 0,
      });
    }
  }
  const ambiguities = [];
  for (const item of adaptedLiterals) {
    let candidates = pairs.filter(
      (pair) => pair.from === item.value && pair.context === item.context,
    );
    if (!candidates.length && isPresentationContext(item.context))
      candidates = pairs.filter(
        (pair) => pair.from === item.value && isPresentationContext(pair.context),
      );
    const targets = new Set(candidates.map((pair) => pair.to));
    if (targets.size > 1) {
      // An unchanged AST location is stronger evidence than a repeated English word.
      candidates =
        JSON.stringify(shape(en)) === JSON.stringify(shape(adapted))
          ? candidates.filter((pair) => pair.location === item.location)
          : [];
    }
    if (new Set(candidates.map((pair) => pair.to)).size !== 1) {
      if (targets.size > 1)
        ambiguities.push({
          value: item.value,
          context: item.context,
          location: item.location,
          targets: [...targets],
        });
      continue;
    }
    const translated = candidates[0].to;
    if (item.node.type === "TemplateElement") {
      item.node.value = {
        cooked: translated,
        raw: translated.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${"),
      };
    } else {
      item.node.value = translated;
      delete item.node.extra;
      if (item.parent?.type === "JSXAttribute" && /["<\\\n\r]/.test(translated)) {
        item.parent.value = { type: "JSXExpressionContainer", expression: item.node };
      }
    }
    candidates.forEach((pair) => pair.applied++);
  }
  const englishDisplays = displayedExpressions(en)
    .filter((node) => node.expression.type === "Identifier")
    .map((node) => node.expression.name);
  const identifiers = new Set(nodes(adapted, "Identifier").map((node) => node.name));
  const presentationAmbiguities = [];
  for (const container of displayedExpressions(adapted)) {
    if (container.expression.type !== "Identifier") continue;
    const name = container.expression.name;
    const matches = labelMaps
      .filter(
        (map) =>
          englishDisplays.includes(name) ||
          Object.keys(map.labels).every((key) =>
            englishLiterals.some(
              (item) =>
                item.node.type === "JSXText" && item.value.toLowerCase() === key.toLowerCase(),
            ),
          ),
      )
      .flatMap((map) =>
        map.expressions
          .filter((expression) => expression.property.name === name)
          .map((expression) => ({ map, expression })),
      );
    const mapNames = new Set(matches.map((match) => match.map.name));
    if (mapNames.size !== 1 || identifiers.has(matches[0].map.name)) {
      if (matches.length)
        presentationAmbiguities.push({
          identifier: name,
          maps: [...mapNames],
          reason: mapNames.size !== 1 ? "ambiguous-map" : "adapted-identifier-collision",
        });
      continue;
    }
    container.expression = structuredClone(matches[0].expression);
    matches[0].map.applied++;
  }
  for (const map of labelMaps.filter((item) => item.applied)) {
    const insertion = adapted.program.body.findIndex((node) => node.type !== "ImportDeclaration");
    adapted.program.body.splice(insertion === -1 ? adapted.program.body.length : insertion, 0, {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: map.name },
          init: structuredClone(map.initializer),
        },
      ],
    });
  }
  const addedAccessibleAttributes = localizeAddedAccessibleAttributes(en, cn, adapted);
  return {
    code: generate(adapted, { comments: true, jsescOption: { minimal: true } }).code + "\n",
    translations: pairs,
    literalSafetyExceptions,
    ambiguities,
    presentationMaps: labelMaps.map(({ name, labels, applied }) => ({ name, labels, applied })),
    presentationAmbiguities,
    addedAccessibleAttributes,
    unresolved: pairs.filter((pair) => !pair.applied),
    structuralDifference: JSON.stringify(shape(en)) !== JSON.stringify(shape(cn)),
    structuralDifferences: differences(shape(en), shape(cn)),
    unmatchedChineseLiterals: chineseLiterals
      .filter((item) => {
        const counterpart = englishLiterals.find(
          (other) =>
            other.location === item.location &&
            other.context === item.context &&
            other.signature === item.signature,
        );
        return !counterpart;
      })
      .map(({ value, context, location }) => ({ value, context, location })),
    adaptedOnlyLiterals: literals(ast(adaptedCode))
      .filter((item) => !englishLiterals.some((other) => other.value === item.value))
      .map(({ value, context, location }) => ({ value, context, location })),
    identicalSource: englishSource === chineseSource,
    equivalentSourceAst: differences(en, cn).length === 0,
  };
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export function localizeComposition(file, englishSource, chineseSource, adaptedCode) {
  const result = localizeModule(englishSource, chineseSource, adaptedCode);
  const pins = compositionPins[file];
  const combinedPin = additionalCompositionPins[file];
  if (!pins && !combinedPin) return result;
  const inputs = [englishSource, chineseSource, adaptedCode].map(digest);
  if (
    (pins && inputs.some((hash, index) => hash !== pins[index])) ||
    (combinedPin && digest(inputs.join(":")) !== combinedPin)
  )
    throw new Error(`Pinned Chinese composition input changed: ${file}`);
  const source = ast(chineseSource);
  const output = ast(result.code);
  const evidence = [];
  const copy = (node, role) => {
    evidence.push({ role, sourceNodeSha256: digest(JSON.stringify(shape(node))) });
    return structuredClone(node);
  };
  const tag = (node) => generate(node.openingElement.name).code;
  const elements = (tree, name) => nodes(tree, "JSXElement").filter((node) => tag(node) === name);
  const attribute = (node, name) =>
    node.openingElement.attributes.find((item) => item.name?.name === name);
  const variable = (tree, name) =>
    nodes(tree, "VariableDeclarator").find((node) => node.id.name === name);
  const expression = (code) => ast(`const value = ${code}`).program.body[0].declarations[0].init;
  const addMap = (name, values) => {
    const declaration = ast(`const ${name}: Record<string, string> = ${JSON.stringify(values)}`)
      .program.body[0];
    output.program.body.unshift(declaration);
    evidence.push({ role: name, sourceLabels: values });
  };
  if (file.startsWith("en/avatar-group/")) {
    const users = source.program.body.find(
      (node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === "users",
    );
    const initials = source.program.body.find(
      (node) => node.type === "FunctionDeclaration" && node.id.name === "initialsFromName",
    );
    const images = nodes(source, "JSXElement").filter((node) => tag(node) === "Avatar.Image");
    const fallbacks = nodes(source, "JSXElement").filter((node) => tag(node) === "Avatar.Fallback");
    const index = output.program.body.findIndex(
      (node) => node.type === "ImportDeclaration" && node.source.value === "./users",
    );
    if (!users || !initials || index < 0 || !images.length || !fallbacks.length)
      throw new Error(`Incomplete pinned avatar composition: ${file}`);
    output.program.body.splice(index, 1, copy(users, "CN display names with unchanged IDs/images"));
    output.program.body.splice(
      index + 1,
      0,
      copy(initials, "CN and whitespace-separated initials"),
    );
    for (const node of nodes(output, "JSXElement")) {
      if (tag(node) === "Avatar.Image") {
        const alt = node.openingElement.attributes.find((item) => item.name?.name === "alt");
        alt.value = copy(
          images[0].openingElement.attributes.find((item) => item.name?.name === "alt").value,
          "CN avatar accessible name",
        );
      }
      if (tag(node) === "Avatar.Fallback")
        node.children = copy(fallbacks[0].children, "CN initials presentation");
    }
  } else if (file === "en/scroll-shadow/custom-styles.tsx") {
    const entries = (tree) =>
      nodes(tree, "VariableDeclarator").find((node) => node.id.name === "entries");
    entries(output).init = copy(entries(source).init, "CN activity entries");
  } else if (file.startsWith("en/scroll-shadow/")) {
    const paragraph = nodes(source, "JSXElement").find((node) => tag(node) === "p");
    const target = nodes(output, "JSXElement").find((node) => tag(node) === "p");
    if (!paragraph || !target) throw new Error(`Missing pinned indexed paragraph: ${file}`);
    target.children = copy(paragraph.children, "CN paragraph index and retained Latin sample");
    for (const node of nodes(target, "Identifier")) {
      if (node.name === "idx") node.name = "index";
    }
  } else if (file === "en/alert-dialog/statuses.tsx") {
    const roles = new Set(["trigger", "header", "body", "cancel", "confirm"]);
    const enProperties = nodes(ast(englishSource), "ObjectProperty");
    const cnProperties = nodes(source, "ObjectProperty");
    for (const target of nodes(output, "ObjectProperty")) {
      if (!roles.has(target.key.name) || target.value.type !== "StringLiteral") continue;
      const index = enProperties.findIndex(
        (node) => node.key.name === target.key.name && node.value.value === target.value.value,
      );
      if (index < 0) throw new Error(`Unpaired alert display property: ${target.key.name}`);
      target.value = copy(cnProperties[index].value, `CN alert ${target.key.name}`);
    }
  } else if (file === "en/calendar/multiple-months.tsx") {
    attribute(elements(output, "Calendar")[0], "aria-label").value = copy(
      attribute(elements(source, "Calendar")[0], "aria-label").value,
      "CN trip-date accessible name",
    );
  } else if (file === "en/color-slider/vertical.tsx") {
    const labels = Object.fromEntries(
      elements(source, "ColorSlider").map((node) => [
        attribute(node, "channel").value.value,
        attribute(node, "aria-label").value.value,
      ]),
    );
    addMap("CN_CHANNEL_LABELS", labels);
    attribute(elements(output, "ColorSlider")[0], "aria-label").value.expression = expression(
      "CN_CHANNEL_LABELS[channel]",
    );
  } else if (file === "en/color-swatch/transparency.tsx") {
    const suffixes = new Set(
      elements(source, "ColorSwatch").map((node) =>
        attribute(node, "aria-label").value.value.replace(/^\d+/, ""),
      ),
    );
    if (suffixes.size !== 1) throw new Error(`Nonuniform pinned opacity labels: ${file}`);
    const suffix = [...suffixes][0];
    const literal = attribute(elements(output, "ColorSwatch")[0], "aria-label").value.expression;
    literal.quasis[1].value = { raw: suffix, cooked: suffix };
    evidence.push({ role: "CN opacity suffix", sourceLabels: [...suffixes] });
  } else if (file === "en/color-swatch/render-function.tsx") {
    const english = elements(ast(englishSource), "ColorSwatch");
    const chinese = elements(source, "ColorSwatch");
    addMap(
      "CN_SWATCH_LABELS",
      Object.fromEntries(
        english.map((node, index) => [
          attribute(node, "aria-label").value.value,
          attribute(chinese[index], "aria-label").value.value,
        ]),
      ),
    );
    attribute(elements(output, "ColorSwatch")[0], "aria-label").value.expression =
      expression("CN_SWATCH_LABELS[name]");
  } else if (file === "en/input-group/with-loading-suffix.tsx") {
    attribute(elements(output, "InputGroup.Input")[0], "defaultValue").value = copy(
      attribute(elements(source, "TextField")[0], "defaultValue").value,
      "Pinned CN initial form value; name remains status",
    );
  } else if (
    ["en/meter/colors.tsx", "en/progress-bar/colors.tsx", "en/progress-circle/colors.tsx"].includes(
      file,
    )
  ) {
    const labels = variable(source, "COLOR_LABELS");
    const colors = variable(source, "colors");
    output.program.body.unshift(
      copy(
        source.program.body.find((node) => node.declarations?.includes(colors)),
        "Pinned color values supporting the CN dictionary type",
      ),
    );
    output.program.body.unshift(
      copy(
        source.program.body.find((node) => node.declarations?.includes(labels)),
        "Pinned CN color dictionary",
      ),
    );
    const component = file.includes("progress-circle")
      ? "ProgressCircle"
      : file.includes("progress-bar")
        ? "ProgressBar"
        : "Meter";
    const label = elements(output, `${component}.Label`)[0];
    if (label)
      label.children = copy(elements(source, "Label")[0].children, "Pinned CN color caption");
    if (component !== "Meter") {
      const target = elements(output, component)[0];
      const value = copy(
        attribute(elements(source, component)[0], "aria-label"),
        "Pinned CN progress accessible name",
      );
      const current = attribute(target, "aria-label");
      if (current) current.value = value.value;
      else target.openingElement.attributes.push(value);
    }
  } else if (file === "en/progress-circle/sizes.tsx") {
    const labels = variable(source, "SIZE_LABELS");
    output.program.body.unshift(
      copy(
        source.program.body.find((node) => node.declarations?.includes(labels)),
        "Pinned CN progress size dictionary",
      ),
    );
    attribute(elements(output, "ProgressCircle")[0], "aria-label").value = {
      type: "JSXExpressionContainer",
      expression: expression("SIZE_LABELS[size]"),
    };
  } else if (file === "en/spinner/sizes.tsx") {
    const map = variable(source, "SIZE_LABELS").init.expression;
    for (const tuple of nodes(output, "ArrayExpression")) {
      const size = tuple.elements[0]?.value;
      if (!["sm", "md", "lg", "xl"].includes(size)) continue;
      tuple.elements[1] = copy(
        map.properties.find((node) => node.key.name === size).value,
        `Pinned CN spinner ${size} caption`,
      );
    }
  } else if (file === "en/number-field/with-step.tsx") {
    for (const name of ["Label", "Description"]) {
      const from = elements(source, name)[0].children.find((node) => node.type === "JSXText");
      const target = elements(output, name)[0].children.find((node) => node.type === "JSXText");
      target.value = `${normalize(from.value).replace(/1$/, "")}`;
      evidence.push({
        role: `CN ${name} prefix`,
        sourceNodeSha256: digest(JSON.stringify(shape(from))),
      });
    }
  } else if (file === "en/typography/typography-scale.tsx") {
    variable(output, "scale").init = copy(
      variable(source, "scale").init,
      "CN typography samples with unchanged type/metadata/code sample",
    );
  } else if (file.startsWith("en/pagination/")) {
    for (const name of ["Previous", "Next"]) {
      const label = elements(source, `Pagination.${name}`)[0]
        .children.find((node) => node.type === "JSXElement" && tag(node) === "span")
        .children.find((node) => node.type === "JSXText");
      const render = attribute(elements(output, `Pagination.${name}`)[0], "render").value
        .expression;
      attribute(render, "aria-label").value = {
        type: "StringLiteral",
        value: normalize(label.value),
      };
      evidence.push({
        role: `CN ${name} accessible name`,
        sourceNodeSha256: digest(JSON.stringify(shape(label))),
      });
    }
    const link = elements(output, "Pagination.Link")[0];
    const render = attribute(link, "render").value.expression;
    attribute(render, "aria-label").value.expression = expression("`${value}`");
    evidence.push({ role: "Numbered link uses its source number as accessible name" });
    const summary = elements(source, "Pagination.Summary")[0];
    if (summary) {
      const target = elements(output, "Pagination.Summary")[0];
      const conditional = target.children.find(
        (node) => node.type === "JSXExpressionContainer",
      ).expression;
      const template = file.endsWith("/simple-prev-next.tsx")
        ? conditional.consequent
        : conditional.alternate;
      target.children = copy(
        summary.children,
        "CN summary composition with adapted page arithmetic",
      );
      const substitutions = {
        startItem: template.expressions[0],
        endItem: template.expressions[1],
        totalItems: template.expressions[2],
      };
      for (const node of target.children) {
        if (node.type === "JSXExpressionContainer")
          node.expression = structuredClone(substitutions[node.expression.name]);
      }
    }
  } else {
    throw new Error(`No reviewed Chinese composition rule: ${file}`);
  }
  result.code = generate(output, { comments: true, jsescOption: { minimal: true } }).code + "\n";
  if (digest(result.code) !== compositionOutputPins[file])
    throw new Error(`Pinned Chinese composition output changed: ${file}`);
  result.verifiedComposition = {
    inputHashes: { en: inputs[0], cn: inputs[1], adapted: inputs[2] },
    outputSha256: digest(result.code),
    evidence,
  };
  return result;
}

function moduleSpecifiers(tree) {
  const result = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
        "ImportExpression",
      ].includes(node.type) &&
      node.source
    )
      result.push(node.source);
    if (
      node.type === "CallExpression" &&
      (node.callee.type === "Import" || node.callee.name === "require") &&
      node.arguments[0]?.type === "StringLiteral"
    )
      result.push(node.arguments[0]);
    for (const [, child] of children(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (typeof child === "object") visit(child);
    }
  }
  visit(tree);
  return result;
}

export async function reachableAdaptation(directory, file, seen = new Set()) {
  if (seen.has(file))
    throw new Error(`Cyclic live example reexport: ${[...seen, file].join(" -> ")}`);
  const code = await readFile(path.join(directory, "src/demos", file), "utf8");
  const tree = ast(code);
  const evidence = [{ file, sha256: digest(code) }];
  const statements = tree.program.body.filter((node) => node.type !== "EmptyStatement");
  if (
    !statements.length ||
    !statements.every(
      (node) =>
        node.type === "ExportNamedDeclaration" &&
        node.source?.value.startsWith(".") &&
        node.specifiers.every((item) => item.type === "ExportSpecifier"),
    )
  )
    return { code, evidence };
  const targets = new Set(statements.map((node) => node.source.value));
  if (targets.size !== 1)
    throw new Error(
      `Ambiguous live example reexport targets in ${file}: ${[...targets].join(", ")}`,
    );
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), [...targets][0]));
  if (!/^en\/[a-z0-9/.-]+$/.test(target) || target.split("/").includes(".."))
    throw new Error(`Unsafe live example reexport in ${file}: ${target}`);
  let resolved;
  for (const candidate of [target, `${target}.tsx`, `${target}.ts`]) {
    if (await exists(path.join(directory, "src/demos", candidate))) {
      resolved = candidate;
      break;
    }
  }
  if (!resolved) throw new Error(`Missing live example reexport target in ${file}: ${target}`);
  const implementation = await reachableAdaptation(directory, resolved, new Set([...seen, file]));
  const materialized = ast(implementation.code);
  for (const node of moduleSpecifiers(materialized)) {
    if (!node.value.startsWith(".")) continue;
    const absolute = path.posix.normalize(
      path.posix.join(path.posix.dirname(resolved), node.value),
    );
    const relative = path.posix.relative(path.posix.dirname(file), absolute);
    node.value = relative.startsWith(".") ? relative : `./${relative}`;
    delete node.extra;
  }
  const exported = new Set(
    materialized.program.body.flatMap((node) => {
      if (node.type === "ExportDefaultDeclaration") return ["default"];
      if (node.type !== "ExportNamedDeclaration") return [];
      return [
        node.declaration?.id?.name,
        ...(node.declaration?.declarations?.map((item) => item.id.name) ?? []),
        ...node.specifiers.map((item) => item.exported.name ?? item.exported.value),
      ].filter(Boolean);
    }),
  );
  for (const statement of statements) {
    const specifiers = statement.specifiers.filter((item) => {
      if (item.local.name === "default")
        throw new Error(
          `Default-only live reexport requires a named reachable implementation in ${file}`,
        );
      const name = item.exported.name ?? item.exported.value;
      if (!exported.has(name)) return true;
      if (item.local.name !== name)
        throw new Error(`Materialized export collision in ${file}: ${name}`);
      return false;
    });
    if (specifiers.length)
      materialized.program.body.push({
        ...structuredClone(statement),
        source: null,
        specifiers: structuredClone(specifiers),
      });
  }
  return {
    code: generate(materialized, { comments: true, jsescOption: { minimal: true } }).code,
    evidence: [...evidence, ...implementation.evidence],
  };
}

const appliedTranslations = (result) =>
  result.translations.filter((item) => item.applied).length +
  result.presentationMaps.filter((item) => item.applied).length +
  result.addedAccessibleAttributes.filter((item) => item.applied).length +
  (result.verifiedComposition?.evidence.length ?? 0);

async function resolveHelper(directory, target) {
  for (const candidate of [target, `${target}.tsx`, `${target}.ts`]) {
    if (await exists(path.join(directory, "src/demos", candidate))) return candidate;
  }
  return null;
}

async function projectReachableHelper(
  directory,
  file,
  owner,
  english,
  chinese,
  availableHelpers,
  reports,
  cache,
  visiting = new Set(),
) {
  if (cache.has(file)) return cache.get(file);
  if (visiting.has(file)) throw new Error(`Cyclic localization helper graph for ${owner}: ${file}`);
  const implementation = await reachableAdaptation(directory, file);
  const result = localizeModule(english, chinese, implementation.code);
  const tree = ast(result.code);
  const output = path.posix.join(
    path.posix.dirname(file).replace(/^en\//, "cn/"),
    `${path.posix.basename(owner, ".tsx")}--${path.posix.basename(file)}`,
  );
  let applied = appliedTranslations(result);
  const imports = [];
  for (const node of moduleSpecifiers(tree)) {
    if (!node.value.startsWith(".")) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), node.value));
    if (!target.startsWith("en/")) continue;
    const resolved = await resolveHelper(directory, target);
    let destination = target;
    if (resolved && availableHelpers.has(resolved)) destination = resolved.replace(/^en\//, "cn/");
    else if (resolved) {
      const nested = await projectReachableHelper(
        directory,
        resolved,
        owner,
        english,
        chinese,
        availableHelpers,
        reports,
        cache,
        new Set([...visiting, file]),
      );
      if (nested.output) {
        destination = nested.output;
        applied += nested.applied;
      }
    }
    const relative = path.posix
      .relative(path.posix.dirname(output), destination)
      .replace(/\.(tsx|ts)$/, "");
    imports.push({ from: node.value, to: relative.startsWith(".") ? relative : `./${relative}` });
    node.value = imports.at(-1).to;
    delete node.extra;
  }
  const report = {
    file,
    output: applied ? output : null,
    applied,
    adaptedImplementations: implementation.evidence,
    ...result,
    helperImports: imports,
  };
  delete report.code;
  reports.push(report);
  const projection = { output: applied ? output : null, applied };
  cache.set(file, projection);
  if (applied) {
    await mkdir(path.join(directory, "src/demos", path.dirname(output)), { recursive: true });
    await writeFile(
      path.join(directory, "src/demos", output),
      await formattedModule(
        output,
        `// Generated source-backed helper adaptation from HeroUI v3.2.6 (${revision}); Apache-2.0.\n${generate(tree, { comments: true, jsescOption: { minimal: true } }).code}\n`,
      ),
    );
  }
  return projection;
}

export async function generateLocalizedExamples(directory = root) {
  const source = JSON.parse(
    await readFile(path.join(directory, "content/source-index.json"), "utf8"),
  );
  const manifest = { en: {}, cn: {} };
  const modules = {};
  const pending = new Map();
  const prefix = "apps/docs/src/demos/";
  const relative = (value) => {
    if (
      !value.startsWith(prefix) ||
      !/^(en|cn)\/[a-z0-9/-]+\.tsx$/.test(value.slice(prefix.length))
    )
      throw new Error(`Unsafe source path: ${value}`);
    return canonicalDemoFile(value.slice(prefix.length));
  };
  for (const [name, example] of Object.entries(source.examples.en)) {
    const file = relative(example.source);
    if (!(await exists(path.join(directory, "src/demos", file)))) continue;
    manifest.en[canonicalExampleName(name)] = file;
    const counterpart = source.examples.cn[name];
    if (counterpart) pending.set(file, { en: example.file, cn: counterpart.file });
  }
  for (const helper of source.unregisteredSources ?? []) {
    if (helper.locale !== "en") continue;
    const counterpart = source.unregisteredSources.find(
      (item) => item.locale === "cn" && item.source.replace("/cn/", "/en/") === helper.source,
    );
    if (counterpart && (await exists(path.join(directory, "src/demos", relative(helper.source)))))
      pending.set(relative(helper.source), { en: helper.file, cn: counterpart.file });
  }
  const archives = new Map();
  for (const [file, records] of pending) {
    for (const record of Object.values(records)) {
      if (
        !/^content\/examples\/(en|cn)\/[a-z0-9/.-]+\.json$/.test(record) ||
        record.split("/").includes("..")
      )
        throw new Error(`Unsafe archive path: ${record}`);
    }
    archives.set(file, {
      english: JSON.parse(await readFile(path.join(directory, records.en), "utf8")),
      chinese: JSON.parse(await readFile(path.join(directory, records.cn), "utf8")),
    });
  }
  const disclosureFiles = [...pending.keys()].filter((file) => sourcePins[file]);
  let disclosureCapture;
  if (disclosureFiles.length) {
    disclosureCapture = await verifyDisclosureInputs(directory);
    for (const file of disclosureFiles) {
      const pair = archives.get(file);
      for (const [locale, key] of [
        ["en", "english"],
        ["cn", "chinese"],
      ]) {
        const record = pair[key];
        if (typeof record.code === "string" || !record.excludedReason)
          throw new Error(`Disclosure archive exclusion changed: ${file}`);
        const capture = disclosureCapture.sources[file.replace(/^en\//, `${locale}/`)];
        pair[key] = { ...record, code: capture.code, publicSource: capture };
      }
    }
  }
  const localized = (file, english, chinese, adapted) => {
    const result = localizeComposition(file, english, chinese, adapted);
    if (file !== "en/disclosure-group/controlled.tsx" || !disclosureCapture) return result;
    // The EN helper also owns Basic's download branch. Evidence that branch
    // against Basic's exact source, not Controlled's different download copy.
    const basic = archives.get("en/disclosure-group/basic.tsx");
    const supplemented = localizeModule(basic.english.code, basic.chinese.code, result.code);
    for (const key of ["translations", "presentationMaps", "addedAccessibleAttributes"])
      result[key].push(...supplemented[key]);
    result.code = supplemented.code;
    result.supplementalSourceHashes = {
      en: sourcePins["en/disclosure-group/basic.tsx"],
      cn: sourcePins["cn/disclosure-group/basic.tsx"],
    };
    return result;
  };
  const availableHelpers = new Set(
    [...archives]
      .filter(
        ([, pair]) =>
          typeof pair.english.code === "string" && typeof pair.chinese.code === "string",
      )
      .map(([file]) => file),
  );
  const availableHelperEvidence = new Map();
  for (const file of availableHelpers) {
    const { english, chinese } = archives.get(file);
    const implementation = await reachableAdaptation(directory, file);
    const result = localized(file, english.code, chinese.code, implementation.code);
    if (!appliedTranslations(result)) availableHelpers.delete(file);
    else
      availableHelperEvidence.set(file, {
        records: pending.get(file),
        sourceHashes: {
          en: digest(english.code),
          cn: digest(chinese.code),
          adapted: digest(implementation.code),
        },
        adaptedImplementations: implementation.evidence,
        applied: appliedTranslations(result),
      });
  }
  for (const [file, records] of pending) {
    const { english, chinese } = archives.get(file);
    const implementation = await reachableAdaptation(directory, file);
    const adapted = implementation.code;
    if (typeof english.code !== "string" || typeof chinese.code !== "string") {
      modules[file] = {
        records,
        revision,
        status: "missing-pinned-source-code",
        reason:
          chinese.reason ??
          english.reason ??
          "Excluded source record has no code; Chinese adaptation cannot be evidenced.",
      };
      continue;
    }
    const result = localized(file, english.code, chinese.code, adapted);
    const authored = authoredLocaleModifications(file, result.code);
    result.code = authored.code;
    result.authoredModifications = authored.modifications;
    const output = file.replace(/^en\//, "cn/");
    let applied = appliedTranslations(result) + authored.modifications.length;
    const status =
      authored.modifications.length &&
      (result.identicalSource || result.equivalentSourceAst || !appliedTranslations(result))
        ? "lenso-authored-localized"
        : result.identicalSource
          ? "identical-pinned-source-reuse"
          : result.equivalentSourceAst
            ? "equivalent-pinned-source-ast-reuse"
            : applied
              ? "source-backed-localized"
              : "no-source-backed-translation-applied";
    modules[file] = {
      output,
      records,
      revision,
      status,
      ...(english.publicSource
        ? {
            sourceAvailability: "hash-pinned-public-upstream",
            archivedExclusions: { en: english.excludedReason, cn: chinese.excludedReason },
            publicSources: {
              en: { url: english.publicSource.url, sha256: english.publicSource.sha256 },
              cn: { url: chinese.publicSource.url, sha256: chinese.publicSource.sha256 },
            },
            implementationPins: disclosureImplementationPins,
          }
        : {}),
      adaptedImplementations: implementation.evidence,
      sourceHashes: {
        en: digest(english.code),
        cn: digest(chinese.code),
        adapted: digest(adapted),
      },
      ...result,
    };
    delete modules[file].code;
    if ((result.identicalSource || result.equivalentSourceAst) && !authored.modifications.length) {
      modules[file].output = file;
      continue;
    }
    // Rewrite EN-only family helpers to the actual adapted EN file, never an absent CN helper.
    const tree = ast(result.code);
    modules[file].helperImports = [];
    modules[file].reachableHelpers = [];
    const helperCache = new Map();
    for (const node of moduleSpecifiers(tree)) {
      if (!node.value.startsWith(".")) continue;
      const specifier = node.value;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      if (!target.startsWith("en/")) continue;
      const sourceTarget = target.endsWith(".tsx") ? target : `${target}.tsx`;
      if (availableHelpers.has(sourceTarget)) {
        const declaration = tree.program.body.find(
          (item) => item.type === "ImportDeclaration" && item.source === node,
        );
        const renderedNames = new Set(nodes(tree, "JSXIdentifier").map((item) => item.name));
        const rendered = declaration?.specifiers.some((item) => renderedNames.has(item.local.name));
        modules[file].helperImports.push({
          from: specifier,
          to: specifier,
          target: sourceTarget.replace(/^en\//, "cn/"),
          basis: "paired-adapted-helper",
          ...(rendered ? { sourceEvidence: availableHelperEvidence.get(sourceTarget) } : {}),
        });
        if (rendered) applied += availableHelperEvidence.get(sourceTarget).applied;
        continue;
      }
      const resolved = await resolveHelper(directory, target);
      if (resolved) {
        const projected = await projectReachableHelper(
          directory,
          resolved,
          file,
          english.code,
          chinese.code,
          availableHelpers,
          modules[file].reachableHelpers,
          helperCache,
        );
        if (projected.output) {
          const relative = path.posix
            .relative(path.posix.dirname(output), projected.output)
            .replace(/\.(tsx|ts)$/, "");
          node.value = relative.startsWith(".") ? relative : `./${relative}`;
          delete node.extra;
          applied += projected.applied;
          modules[file].helperImports.push({
            from: specifier,
            to: node.value,
            target: projected.output,
            basis: "source-backed-reachable-helper",
          });
          continue;
        }
      }
      let rewritten = path.posix.relative(path.posix.dirname(output), target);
      if (!rewritten.startsWith(".")) rewritten = `./${rewritten}`;
      node.value = rewritten;
      delete node.extra;
      modules[file].helperImports.push({
        from: specifier,
        to: rewritten,
        target,
        basis: "EN-only-adapted-helper",
      });
    }
    if (applied && modules[file].status === "no-source-backed-translation-applied")
      modules[file].status = "source-backed-localized";
    if (modules[file].status === "no-source-backed-translation-applied") {
      const destination = path.join(directory, "src/demos", output);
      if (
        (await exists(destination)) &&
        (await readFile(destination, "utf8")).startsWith("// Generated from HeroUI v3.2.6")
      )
        await unlink(destination);
      continue;
    }
    await mkdir(path.join(directory, "src/demos", path.dirname(output)), { recursive: true });
    const outputCode = await formattedModule(
      output,
      `// Generated from HeroUI v3.2.6 (${revision}); Apache-2.0.\n${authored.modifications.length ? "// Lenso-authored locale accessibility modifications are recorded in localization-provenance.json.\n" : ""}${generate(tree, { comments: true, jsescOption: { minimal: true } }).code}\n`,
    );
    modules[file].outputSha256 = digest(outputCode);
    if (sourcePins[file]) verifyDisclosureOutput(output, outputCode);
    await writeFile(path.join(directory, "src/demos", output), outputCode);
  }
  for (const [name, file] of Object.entries(manifest.en)) {
    const module = modules[file];
    if (module?.output && module.status !== "no-source-backed-translation-applied") {
      manifest.cn[name] = module.output;
    }
  }
  const excluded = (source.excludedExamples ?? []).filter((item) => item.locale === "cn");
  const sourceExceptions = [];
  const inspected = new Set();
  for (const [name, entry] of Object.entries(source.examples.en)) {
    const counterpart = source.examples.cn[name];
    if (!counterpart || inspected.has(entry.file)) continue;
    inspected.add(entry.file);
    const english = JSON.parse(await readFile(path.join(directory, entry.file), "utf8"));
    const chinese = JSON.parse(await readFile(path.join(directory, counterpart.file), "utf8"));
    if (typeof english.code !== "string" || typeof chinese.code !== "string") {
      sourceExceptions.push({
        name,
        family: relative(entry.source).split("/")[1],
        records: { en: entry.file, cn: counterpart.file },
        reason: sourcePins[relative(entry.source)]
          ? "archived-code-omitted-independent-react-projection"
          : "missing-pinned-source-code",
        ...(sourcePins[relative(entry.source)]
          ? { sourceAvailability: "hash-pinned-public-upstream" }
          : {}),
      });
      continue;
    }
    const enShape = shape(ast(english.code));
    const cnShape = shape(ast(chinese.code));
    const structuralDifferences = differences(enShape, cnShape);
    if (structuralDifferences.length)
      sourceExceptions.push({
        name,
        family: relative(entry.source).split("/")[1],
        records: { en: entry.file, cn: counterpart.file },
        structuralDifferences,
        cnLiterals: literals(ast(chinese.code)).map(({ value, context, location }) => ({
          value,
          context,
          location,
        })),
      });
  }
  const provenance = {
    revision,
    method:
      "Pinned paired source AST literals and pure presentation maps applied to independently adapted EN modules; not browser parity evidence. unmatchedChineseLiterals records literals without direct paired locations; presentationMaps and addedAccessibleAttributes record separately handled additions.",
    modules,
    excluded,
    sourceExceptions,
  };
  const generatedFiles = new Set(
    Object.values(modules).flatMap((module) => [
      ...(["source-backed-localized", "lenso-authored-localized"].includes(module.status)
        ? [module.output]
        : []),
      ...(module.reachableHelpers ?? []).flatMap((helper) =>
        helper.output ? [helper.output] : [],
      ),
    ]),
  );
  const cnDirectory = path.join(directory, "src/demos/cn");
  if (await exists(cnDirectory)) {
    for (const entry of await readdir(cnDirectory, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
      const file = path.join(entry.parentPath, entry.name);
      const relativeFile = path
        .relative(path.join(directory, "src/demos"), file)
        .split(path.sep)
        .join("/");
      if (generatedFiles.has(relativeFile)) continue;
      const code = await readFile(file, "utf8");
      if (
        /^\/\/ Generated (?:from HeroUI|source-backed helper adaptation from HeroUI) v3\.2\.6/.test(
          code,
        )
      )
        await unlink(file);
    }
  }
  await writeFile(
    path.join(directory, "src/demos/localized-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await writeFile(
    path.join(directory, "src/demos/localization-provenance.json"),
    await formattedModule(
      "localization-provenance.json",
      `${JSON.stringify(provenance, null, 2)}\n`,
    ),
  );
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await generateLocalizedExamples();
