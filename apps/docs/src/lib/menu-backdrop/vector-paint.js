import { fontFaceForImage } from "./paint-fonts.js";
import { paintMask } from "./paint-mask.js";

class UnsupportedPaint extends Error {}

/** Records owned Menu Docs paint, retaining bounded scroll content for live updates. */
export async function captureMenuTexture(
  scene,
  box,
  surface,
  density,
  radius,
  reach,
  blur,
  checkpoint,
  { exclude, layers = [], base } = {},
) {
  const document = scene.ownerDocument,
    view = document.defaultView;
  // The owner relocates its public bounds; recorded paint keeps its original coordinate system.
  box = new DOMRect(box.x, box.y, box.width, box.height);
  const { scrollX, scrollY } = view;
  const origin = scene.getBoundingClientRect();
  const anchors = [];
  const changedOutside = new Set();
  let paintBox = box,
    scrollPixels = 0;
  const scrolls = new Map(),
    textRegions = new Map(),
    scrollPath = [],
    images = new Set(),
    scrollCanvases = new Set();
  const visible = (b) =>
    b.width > 0 &&
    b.height > 0 &&
    b.left < paintBox.right &&
    b.right > paintBox.left &&
    b.top < paintBox.bottom &&
    b.bottom > paintBox.top;
  const outsideCapture = (b) =>
    b.right < box.left - 128 ||
    b.left > box.right + 128 ||
    b.bottom < box.top - 128 ||
    b.top > box.bottom + 128;
  const budget = async () => {
    if (!(await checkpoint())) throw new DOMException("Source capture cancelled", "AbortError");
  };
  const halo = Math.ceil(reach + 3 * blur + 4);
  const inOpticalReach = (b) => {
    if (scrollPath.length) return visible(b);
    const dx = Math.max(surface.left + radius - b.right, b.left - (surface.right - radius), 0);
    const dy = Math.max(surface.top + radius - b.bottom, b.top - (surface.bottom - radius), 0);
    return Math.hypot(dx, dy) <= radius + halo;
  };
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(box.width * density);
  canvas.height = Math.ceil(box.height * density);
  const pageColor = view.getComputedStyle(document.body).backgroundColor;
  const opaquePage =
    /^(?:rgb|hsl)\(/.test(pageColor) ||
    /^color\([^/]*\)$/.test(pageColor) ||
    /^rgba\([^)]*,\s*1\)$/.test(pageColor);
  const ctx = canvas.getContext("2d", { alpha: !opaquePage });
  if (!ctx) return;
  const canvasCasts = new Map();
  const steps = [];
  const release = () => {
    for (const image of images) image.src = "";
    for (const bitmap of scrollCanvases) bitmap.width = bitmap.height = 1;
    for (const { bitmap } of canvasCasts.values()) bitmap.width = bitmap.height = 1;
    canvas.width = canvas.height = 1;
  };
  let retained = false;
  try {
    const ns = "http://www.w3.org/2000/svg";
    const svgNode = (tag, attrs = {}) => {
      const e = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
      return e;
    };
    const svg = svgNode("svg", {
      width: canvas.width,
      height: canvas.height,
      viewBox: [box.x, box.y, box.width, box.height].join(" "),
    });
    let paint = svg;
    const css = svgNode("style"),
      rules = [];
    const collect = async (list) => {
      for (const r of list) {
        await budget();
        if (r instanceof CSSFontFaceRule) rules.push(await fontFaceForImage(document, r));
        else if (r.cssRules) await collect(r.cssRules);
      }
    };
    if (!base) for (const ss of document.styleSheets) await collect(ss.cssRules);
    css.textContent = base?.fontCss ?? rules.join("\n");
    svg.append(css);
    if (!base)
      svg.append(
        svgNode("rect", {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          fill: pageColor,
        }),
      );

    const baselines = new Map();
    const fontProps = [
      "fontFamily",
      "fontWeight",
      "fontSize",
      "fontStyle",
      "fontStretch",
      "fontVariationSettings",
      "fontFeatureSettings",
      "fontKerning",
      "letterSpacing",
      "lineHeight",
    ];
    const paintKey = (style, movingForeground = false, liveOutline = false) =>
      [
        ...fontProps,
        "color",
        "backgroundColor",
        "backgroundImage",
        "backgroundSize",
        "backgroundPosition",
        "backgroundRepeat",
        "boxShadow",
        "textShadow",
        "textDecorationLine",
        "outlineStyle",
        "outlineWidth",
        "outlineColor",
        "outlineOffset",
        "opacity",
        "visibility",
        "display",
        "filter",
        "backdropFilter",
        "maskImage",
        "clipPath",
        "mixBlendMode",
        "borderRadius",
        "borderTopWidth",
        "borderTopColor",
        "borderTopStyle",
        "overflowX",
        "overflowY",
        "zIndex",
        "position",
        "isolation",
        "order",
        "transform",
        "translate",
        "rotate",
        "scale",
        "fontOpticalSizing",
        "textRendering",
        "direction",
        "webkitFontSmoothing",
        "whiteSpace",
        "wordSpacing",
        "wordBreak",
        "overflowWrap",
        "textAlign",
        "textIndent",
        "textTransform",
        "writingMode",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "backgroundAttachment",
      ]
        .map((key) =>
          (movingForeground && (key === "scale" || key === "opacity")) ||
          (liveOutline && key.startsWith("outline"))
            ? ""
            : style[key],
        )
        .join("|");
    function outline(style) {
      const width = parseFloat(style.outlineWidth);
      if (style.outlineStyle === "none" || !width) return;
      const offset = parseFloat(style.outlineOffset);
      if (
        style.outlineStyle !== "solid" ||
        !Number.isFinite(offset) ||
        offset + width > 0 ||
        ["TopRight", "BottomLeft", "BottomRight"].some(
          (corner) => style["border" + corner + "Radius"] !== style.borderTopLeftRadius,
        )
      )
        throw new UnsupportedPaint();
      return { width, inset: -offset - width / 2, color: style.outlineColor };
    }
    const outlineKey = () =>
      anchors
        .filter((anchor) => anchor.liveOutline && anchor.painted)
        .map((anchor) => {
          const ring = outline(view.getComputedStyle(anchor.element));
          if (ring && (anchor.scrollPath.length || anchor.element.getClientRects().length !== 1))
            throw new UnsupportedPaint();
          return ring;
        });
    function font(s) {
      ctx.font = s.fontStyle + " " + s.fontWeight + " " + s.fontSize + " " + s.fontFamily;
      ctx.letterSpacing = s.letterSpacing === "normal" ? "0px" : s.letterSpacing;
      ctx.fontKerning = s.fontKerning;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.direction = "ltr";
      const key = fontProps.map((k) => s[k]).join("|");
      if (baselines.has(key)) return baselines.get(key);
      const offset = ctx.measureText("Hg").fontBoundingBoxAscent;
      baselines.set(key, offset);
      return offset;
    }
    function text(node, s, emit, layer = owner) {
      if (!node.textContent.trim()) return;
      const whole = document.createRange();
      whole.selectNodeContents(node);
      if (![...whole.getClientRects()].map((rect) => localRect(rect, layer)).some(visible)) return;
      const baseline = font(s);
      let run,
        index = 0;
      function flush() {
        if (!run || !run.str.trim()) return;
        if (
          run.endX >= paintBox.left &&
          run.x <= paintBox.right &&
          run.y < paintBox.bottom &&
          run.y + run.h > paintBox.top
        ) {
          const y = Math.round(run.y + baseline + scrollY) - scrollY;
          if (emit) return emit(run.str, run.x, y, s);
          const t = svgNode("text", {
            x: run.x,
            y,
            fill: s.color,
            "xml:space": "preserve",
          });
          for (const k of [
            ...fontProps,
            "fontOpticalSizing",
            "textRendering",
            "direction",
            "webkitFontSmoothing",
          ])
            t.style[k] = s[k];
          t.style.whiteSpace = "pre";
          t.textContent = run.str;
          paint.append(t);
        }
      }
      for (const ch of node.textContent) {
        const r = document.createRange();
        r.setStart(node, index);
        index += ch.length;
        r.setEnd(node, index);
        const rect = r.getClientRects()[0];
        const b = rect && localRect(rect, layer);
        if (!b || b.width === 0) continue;
        if (!run || Math.abs(b.top - run.y) > 0.1) {
          flush();
          run = { str: "", x: b.x, y: b.y, h: b.height, endX: b.right };
        }
        const glyph =
          /\s/.test(ch) && s.whiteSpace !== "pre" && s.whiteSpace !== "pre-wrap" ? " " : ch;
        run.str += glyph;
        run.endX = b.right;
      }
      flush();
    }
    const defs = svgNode("defs");
    svg.insertBefore(defs, svg.firstChild);
    let nextId = 0;

    function corners(b, s) {
      const r = parseFloat(s.borderTopLeftRadius);
      const rx = s.borderTopLeftRadius.includes("%") ? (b.width * r) / 100 : r;
      return Math.max(0, Math.min(rx || 0, b.width / 2, b.height / 2));
    }
    function geometry(b, s) {
      return { x: b.x, y: b.y, width: b.width, height: b.height, rx: corners(b, s) };
    }
    function clipped(b, s) {
      const clip = svgNode("clipPath", {
        id: "owned-clip-" + nextId++,
        clipPathUnits: "userSpaceOnUse",
      });
      clip.append(svgNode("rect", geometry(b, s)));
      defs.append(clip);
      return "url(#" + clip.id + ")";
    }
    function blurFilter(bounds, sigma) {
      const f = svgNode("filter", {
        id: "owned-blur-" + nextId++,
        filterUnits: "userSpaceOnUse",
        primitiveUnits: "userSpaceOnUse",
        "color-interpolation-filters": "sRGB",
        ...bounds,
      });
      f.append(svgNode("feGaussianBlur", { stdDeviation: sigma }));
      defs.append(f);
      return "url(#" + f.id + ")";
    }
    function canvasCast(b, s, color, dx, dy, blur, spread) {
      const d = devicePixelRatio,
        pad = Math.ceil(1.5 * blur) + 3;
      const sx = Math.round(b.left + scrollX) - scrollX,
        sy = Math.round(b.top + scrollY) - scrollY;
      const sw = Math.round(b.right + scrollX) - scrollX - sx,
        sh = Math.round(b.bottom + scrollY) - scrollY - sy;
      const left = Math.floor((sx + Math.min(0, dx) - Math.max(0, spread) - pad) * d) / d;
      const top = Math.floor((sy + Math.min(0, dy) - Math.max(0, spread) - pad) * d) / d;
      const right = Math.ceil((sx + sw + Math.max(0, dx) + Math.max(0, spread) + pad) * d) / d;
      const bottom = Math.ceil((sy + sh + Math.max(0, dy) + Math.max(0, spread) + pad) * d) / d;
      const bitmap = document.createElement("canvas");
      bitmap.width = Math.round((right - left) * d);
      bitmap.height = Math.round((bottom - top) * d);
      const g = bitmap.getContext("2d");
      g.scale(d, d);
      g.translate(-left, -top);
      g.save();
      g.beginPath();
      g.rect(left, top, right - left, bottom - top);
      g.roundRect(sx, sy, sw, sh, corners(b, s));
      g.clip("evenodd");
      g.shadowColor = color;
      g.shadowBlur = blur * d;
      g.shadowOffsetX = dx * d;
      g.shadowOffsetY = dy * d;
      g.fillStyle = "#000";
      g.beginPath();
      g.roundRect(
        sx - spread,
        sy - spread,
        sw + 2 * spread,
        sh + 2 * spread,
        Math.max(0, corners(b, s) + spread),
      );
      g.fill();
      g.restore();
      const marker = svgNode("g", { "data-owned-cast": "" });
      if (paint === svg) {
        canvasCasts.set(marker, { bitmap, left, top });
        paint.append(marker);
      } else {
        paint.append(
          svgNode("image", {
            x: left,
            y: top,
            width: bitmap.width / d,
            height: bitmap.height / d,
            href: bitmap.toDataURL(),
          }),
        );
        bitmap.width = bitmap.height = 1;
      }
    }

    function drawOuterShadows(b, s) {
      if (s.boxShadow === "none") return;
      const list = s.boxShadow.split(/,(?![^()]*\))/).reverse();
      for (const one of list) {
        if (/\binset\b/.test(one)) continue;
        const color = one.match(/(?:rgba?|color|hsla?)\([^()]*\)/)?.[0];
        const v = [
          ...one.replace(/(?:rgba?|color|hsla?)\([^()]*\)/g, "").matchAll(/(-?[\d.]+)px/g),
        ].map((x) => Number(x[1]));
        if (!color || v.length < 2) {
          throw new UnsupportedPaint();
        }
        const [dx, dy, blur = 0, spread = 0] = v,
          pad = Math.ceil(1.5 * blur) + 3;
        if (blur > 0 && spread === 0) {
          canvasCast(b, s, color, dx, dy, blur, spread);
          continue;
        }
        const caster = {
          x: b.x + dx - spread,
          y: b.y + dy - spread,
          width: b.width + 2 * spread,
          height: b.height + 2 * spread,
          rx: Math.max(0, corners(b, s) + spread),
        };
        const bounds = {
          x: caster.x - pad,
          y: caster.y - pad,
          width: caster.width + 2 * pad,
          height: caster.height + 2 * pad,
        };
        const mask = svgNode("mask", {
          id: "owned-shadow-" + nextId++,
          maskUnits: "userSpaceOnUse",
          ...bounds,
        });
        mask.append(
          svgNode("rect", { ...bounds, fill: "white" }),
          svgNode("rect", { ...geometry(b, s), fill: "black" }),
        );
        defs.append(mask);
        const group = svgNode("g", { mask: "url(#" + mask.id + ")" }),
          rect = svgNode("rect", { ...caster, fill: color });
        if (blur) rect.setAttribute("filter", blurFilter(bounds, blur / 2));
        group.append(rect);
        paint.append(group);
      }
    }
    function drawBackdrop(b, s) {
      if (s.backdropFilter === "none") return;
      const matched = /^blur\(([\d.]+)px\)((?: (?:contrast|brightness|saturate)\([\d.]+\))*)$/.exec(
        s.backdropFilter,
      );
      if (!matched) {
        throw new UnsupportedPaint();
      }
      const sigma = Number(matched[1]),
        pad = Math.ceil(3 * sigma) + 2;
      if (
        inOpticalReach(b) &&
        (scrollPath.length ||
          [...scrolls.values()].some(
            ({ box }) =>
              box.left < b.right + pad &&
              box.right > b.left - pad &&
              box.top < b.bottom + pad &&
              box.bottom > b.top - pad,
          ))
      )
        throw new UnsupportedPaint();
      const g = svgNode("g", { id: "owned-under-" + nextId++ });
      function copyPaint(node) {
        const cast = canvasCasts.get(node);
        if (cast)
          return svgNode("image", {
            x: cast.left,
            y: cast.top,
            width: cast.bitmap.width / density,
            height: cast.bitmap.height / density,
            href: cast.bitmap.toDataURL(),
          });
        const copy = node.cloneNode(false);
        for (const child of node.childNodes) copy.append(copyPaint(child));
        return copy;
      }
      for (const n of [...svg.children]) if (n !== css && n !== defs) g.append(copyPaint(n));
      defs.append(g);
      const layer = svgNode("g", { "clip-path": clipped(b, s) });
      const use = svgNode("use", {
        href: "#" + g.id,
        filter: blurFilter(
          { x: b.x - pad, y: b.y - pad, width: b.width + 2 * pad, height: b.height + 2 * pad },
          sigma,
        ),
      });
      layer.append(use);
      if (matched[2]) {
        const tone = svgNode("g");
        tone.style.filter = matched[2].trim();
        tone.append(layer);
        paint.append(tone);
      } else paint.append(layer);
    }
    function drawLinearGradient(b, s) {
      const value = s.backgroundImage.replace(/(?:,\s*none)+\s*$/, "");
      if (!value.startsWith("linear-gradient(")) return false;
      const parts = value
        .slice(16, -1)
        .split(/,(?![^()]*\))/)
        .map((x) => x.trim());
      let deg = 180;
      if (/^-?[\d.]+deg$/.test(parts[0])) deg = parseFloat(parts.shift());
      const stops = parts.map((item) => {
        const m = /^(rgba?\([^()]*\))(?:\s+(-?[\d.]+)%)?$/.exec(item);
        return m ? { color: m[1], offset: m[2] === undefined ? null : Number(m[2]) / 100 } : null;
      });
      if (stops.length < 2 || stops.some((t) => !t)) return false;
      if (stops[0].offset === null) stops[0].offset = 0;
      if (stops.at(-1).offset === null) stops.at(-1).offset = 1;
      for (let i = 1; i < stops.length; i++) {
        if (stops[i].offset !== null) continue;
        let k = i;
        while (k < stops.length && stops[k].offset === null) k++;
        const base = stops[i - 1].offset;
        for (let j = i; j < k; j++)
          stops[j].offset = base + ((stops[k].offset - base) * (j - i + 1)) / (k - i + 1);
        i = k;
      }
      const theta = (deg * Math.PI) / 180,
        dx = Math.sin(theta),
        dy = -Math.cos(theta);
      // The CSS painter snaps the two edges of an untransformed background box in document space.
      const left = Math.round(b.left + scrollX) - scrollX,
        top = Math.round(b.top + scrollY) - scrollY;
      const right = Math.round(b.right + scrollX) - scrollX,
        bottom = Math.round(b.bottom + scrollY) - scrollY;
      if (s.transform === "none") b = new DOMRect(left, top, right - left, bottom - top);
      const w = b.width,
        h = b.height,
        len = Math.abs(w * dx) + Math.abs(h * dy),
        cx = b.x + w / 2,
        cy = b.y + h / 2;
      const grad = svgNode("linearGradient", {
        id: "owned-gradient-" + nextId++,
        gradientUnits: "userSpaceOnUse",
        x1: cx - (dx * len) / 2,
        y1: cy - (dy * len) / 2,
        x2: cx + (dx * len) / 2,
        y2: cy + (dy * len) / 2,
        "color-interpolation": "sRGB",
      });
      let last = 0;
      for (const t of stops) {
        last = Math.max(last, t.offset);
        grad.append(svgNode("stop", { offset: last, "stop-color": t.color }));
      }
      defs.append(grad);
      paint.append(svgNode("rect", { ...geometry(b, s), fill: "url(#" + grad.id + ")" }));
      return true;
    }

    function drawBackgroundImage(b, s) {
      if (/^none(?:,\s*none)*$/.test(s.backgroundImage) || drawLinearGradient(b, s)) return;
      const href = /^url\(["']?(data:image\/png;base64,[\w+/=]+)["']?\)$/.exec(
        s.backgroundImage.replace(/(?:,\s*none)+\s*$/, ""),
      )?.[1];
      if (!href) {
        throw new UnsupportedPaint();
      }
      const image = svgNode("image", {
        ...geometry(b, s),
        href,
        preserveAspectRatio: "none",
        "clip-path": clipped(b, s),
      });
      paint.append(image);
    }
    function drawIcon(el, b) {
      const copy = el.cloneNode(true);
      copy.setAttribute("x", String(b.x));
      copy.setAttribute("y", String(b.y));
      copy.setAttribute("width", String(b.width));
      copy.setAttribute("height", String(b.height));
      copy.setAttribute("color", getComputedStyle(el).color);
      copy.removeAttribute("class");
      paint.append(copy);
    }
    function paintScope(b, s, movingForeground = false) {
      let group;
      if (s.maskImage !== "none") {
        const href = paintMask(document, s, b.width, b.height, density);
        if (!href) throw new UnsupportedPaint();
        const mask = svgNode("mask", {
          id: "owned-mask-" + nextId++,
          maskUnits: "userSpaceOnUse",
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          "mask-type": "alpha",
        });
        mask.append(svgNode("image", { x: b.x, y: b.y, width: b.width, height: b.height, href }));
        defs.append(mask);
        group = svgNode("g", { mask: "url(#" + mask.id + ")" });
      }
      if (s.clipPath !== "none") {
        const clip = svgNode("clipPath", {
          id: "owned-path-" + nextId++,
          clipPathUnits: "userSpaceOnUse",
        });
        const path = /^path\((?:(evenodd|nonzero),\s*)?["'](.*)["']\)$/.exec(s.clipPath);
        const inset = /^inset\(([\d.]+)px round ([\d.]+)px\)$/.exec(s.clipPath);
        if (path)
          clip.append(
            svgNode("path", {
              d: path[2],
              "clip-rule": path[1] ?? "nonzero",
              transform: `translate(${b.x} ${b.y})`,
            }),
          );
        else if (inset) {
          const pad = Number(inset[1]);
          clip.append(
            svgNode("rect", {
              x: b.x + pad,
              y: b.y + pad,
              width: Math.max(0, b.width - 2 * pad),
              height: Math.max(0, b.height - 2 * pad),
              rx: Number(inset[2]),
            }),
          );
        } else throw new UnsupportedPaint();
        defs.append(clip);
        const clipped = svgNode("g", { "clip-path": "url(#" + clip.id + ")" });
        if (group) {
          group.append(clipped);
          paint.append(group);
        }
        group = clipped;
      }
      if (!group && ((!movingForeground && Number(s.opacity) !== 1) || s.mixBlendMode !== "normal"))
        group = svgNode("g");
      if (group) {
        group.setAttribute("opacity", movingForeground ? "1" : s.opacity);
        group.style.mixBlendMode = s.mixBlendMode;
        if (s.mixBlendMode === "overlay") group.setAttribute("data-owned-overlay", "");
        if (!group.parentNode) paint.append(group);
        paint = group;
      }
    }

    // A mask can remove ink but cannot add it. A plain label whose full glyph ink lies
    // outside the optical neighborhood cannot contribute to this registered source.
    function maskedLabelOutside(el, style) {
      if (
        el.childElementCount ||
        style.backgroundImage !== "none" ||
        style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        style.boxShadow !== "none" ||
        style.textShadow !== "none" ||
        style.textDecorationLine !== "none" ||
        style.transform !== "none" ||
        style.filter !== "none" ||
        style.backdropFilter !== "none" ||
        style.outlineStyle !== "none" ||
        ["Top", "Right", "Bottom", "Left"].some(
          (side) => parseFloat(style["border" + side + "Width"]) > 0,
        ) ||
        ["::before", "::after"].some(
          (pseudo) => !["none", "normal"].includes(view.getComputedStyle(el, pseudo).content),
        )
      )
        return false;
      const ascent = font(style);
      for (const node of el.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = range.getClientRects();
        if (rects.length !== 1) return false;
        const rect = localRect(rects[0]),
          glyphs = ctx.measureText(node.textContent);
        const baseline = Math.round(rect.y + ascent + scrollY) - scrollY;
        const ink = {
          left: Math.min(rect.left, rect.left - glyphs.actualBoundingBoxLeft) - 1,
          top: Math.min(rect.top, baseline - glyphs.actualBoundingBoxAscent) - 1,
          right: Math.max(rect.right, rect.left + glyphs.actualBoundingBoxRight) + 1,
          bottom: Math.max(rect.bottom, baseline + glyphs.actualBoundingBoxDescent) + 1,
        };
        if (!Object.values(ink).every(Number.isFinite) || inOpticalReach(ink)) return false;
      }
      return true;
    }

    let overlay = false,
      owner;
    // Record foreground in its unscaled coordinate system; stack motion is applied when composing.
    function localRect(rect, layer = owner) {
      if (!layer) return rect;
      const origin = origins.get(layer),
        current = layer.foreground.getBoundingClientRect();
      return new DOMRect(
        origin.x + ((rect.x - current.x) * layer.foreground.offsetWidth) / current.width,
        origin.y + ((rect.y - current.y) * layer.foreground.offsetHeight) / current.height,
        (rect.width * layer.foreground.offsetWidth) / current.width,
        (rect.height * layer.foreground.offsetHeight) / current.height,
      );
    }
    // A bounded plain-text viewport can repaint synchronously, without an SVG decode.
    // Complex ink remains on the existing SVG capture/fallback path.
    function labelTint(style, box) {
      if (style.boxShadow === "none") return;
      const shadow = style.boxShadow.match(/^(.*?) 0px 0px 0px ([\d.]+)px inset$/);
      if (!shadow || Number(shadow[2]) < Math.max(box.width, box.height))
        throw new UnsupportedPaint();
      return shadow[1];
    }
    function textContent(element, leaf = false) {
      const entries = [];
      let characters = 0;
      function visit(el, label = false) {
        if (entries.length >= 256) throw new UnsupportedPaint();
        const s = view.getComputedStyle(el);
        if (
          (!label &&
            !["div", "p", "ul", "ol", "li", "span", "pre", "code"].includes(el.localName)) ||
          ![
            "block",
            "list-item",
            "inline",
            ...(label ? ["inline-block", "flex", "inline-flex"] : []),
          ].includes(s.display) ||
          s.visibility !== "visible" ||
          s.opacity !== "1" ||
          s.backgroundImage !== "none" ||
          (!label && s.boxShadow !== "none") ||
          s.textShadow !== "none" ||
          s.textDecorationLine !== "none" ||
          s.filter !== "none" ||
          s.backdropFilter !== "none" ||
          s.maskImage !== "none" ||
          s.clipPath !== "none" ||
          s.mixBlendMode !== "normal" ||
          s.transform !== "none" ||
          s.translate !== "none" ||
          s.rotate !== "none" ||
          s.scale !== "none" ||
          !(label ? ["static", "relative"] : ["static"]).includes(s.position) ||
          s.direction !== "ltr" ||
          s.writingMode !== "horizontal-tb" ||
          s.textTransform !== "none" ||
          s.fontFeatureSettings !== "normal" ||
          s.fontVariationSettings !== "normal" ||
          !["normal", "100%"].includes(s.fontStretch) ||
          s.fontVariant !== "normal" ||
          s.overflowX !== "visible" ||
          s.overflowY !== "visible" ||
          (s.display === "list-item" && s.listStyleType !== "none") ||
          (!label &&
            ["TopLeft", "TopRight", "BottomLeft", "BottomRight"].some(
              (corner) => parseFloat(s["border" + corner + "Radius"]) !== 0,
            )) ||
          (label &&
            (s.backgroundColor !== "rgba(0, 0, 0, 0)" ||
              s.outlineStyle !== "none" ||
              ["TopRight", "BottomLeft", "BottomRight"].some(
                (corner) => s["border" + corner + "Radius"] !== s.borderTopLeftRadius,
              ) ||
              ["Top", "Right", "Bottom", "Left"].some(
                (side) => parseFloat(s["border" + side + "Width"]) !== 0,
              ))) ||
          ["::before", "::after"].some(
            (pseudo) => !["none", "normal"].includes(view.getComputedStyle(el, pseudo).content),
          )
        )
          throw new UnsupportedPaint();
        const rects = [...el.getClientRects()];
        // Multiline inline backgrounds require individual fragments, not a union box.
        if (rects.length !== 1) throw new UnsupportedPaint();
        const b = rects[0];
        if (label) labelTint(s, b);
        for (const side of ["Top", "Right", "Bottom", "Left"])
          if (parseFloat(s["border" + side + "Width"]) && s["border" + side + "Style"] !== "solid")
            throw new UnsupportedPaint();
        entries.push({ element: el, style: s, box: b });
        for (const node of el.childNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (label) throw new UnsupportedPaint();
            visit(node);
          } else if (node.nodeType === Node.TEXT_NODE) {
            characters += node.textContent.length;
            if (characters > 32768) throw new UnsupportedPaint();
            entries.push({ node, style: s });
          } else if (node.nodeType !== Node.COMMENT_NODE) throw new UnsupportedPaint();
        }
      }
      if (leaf) {
        visit(element, true);
        return entries;
      }
      for (const child of element.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) visit(child);
        else if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent.trim()) throw new UnsupportedPaint();
        } else if (child.nodeType !== Node.COMMENT_NODE) throw new UnsupportedPaint();
      }
      return entries;
    }
    function repaintText(record) {
      const current = record.element.getBoundingClientRect();
      const entries = textContent(record.element, record.leaf);
      if (record.leaf) {
        const next = scene.getBoundingClientRect();
        record.box = new DOMRect(
          current.x - next.x + origin.x - 4,
          current.y - next.y + origin.y - 4,
          current.width + 8,
          current.height + 8,
        );
        if (record.box.width * density > 1024 || record.box.height * density > 512)
          throw new UnsupportedPaint();
        // A moving label must stay wholly inside every clip, rather than reusing a stale mask.
        for (let parent = record.element.parentElement; parent; parent = parent.parentElement) {
          const style = view.getComputedStyle(parent),
            rect = parent.getBoundingClientRect();
          if (style.rotate !== "none" || style.scale !== "none" || style.perspective !== "none")
            throw new UnsupportedPaint();
          if (style.transform !== "none") {
            const matrix = new DOMMatrixReadOnly(style.transform);
            if (!matrix.is2D || matrix.a !== 1 || matrix.b || matrix.c || matrix.d !== 1)
              throw new UnsupportedPaint();
          }
          const inset = corners(rect, style);
          if (
            (style.overflowX !== "visible" &&
              (current.left - 4 < rect.left + inset || current.right + 4 > rect.right - inset)) ||
            (style.overflowY !== "visible" &&
              (current.top - 4 < rect.top + inset || current.bottom + 4 > rect.bottom - inset))
          )
            throw new UnsupportedPaint();
        }
      }
      const key = JSON.stringify([
        record.element.innerHTML,
        current.x,
        current.y,
        current.width,
        current.height,
        ...entries
          .filter((entry) => entry.element)
          .map(({ style, box }) => [
            paintKey(style),
            ...["Top", "Right", "Bottom", "Left"].map((side) => style["border" + side + "Color"]),
            box,
          ]),
      ]);
      if (record.previous === key) return;
      if (record.leaf) {
        const width = Math.ceil(record.box.width * density),
          height = Math.ceil(record.box.height * density);
        const pixels = width * height;
        if (scrollPixels + pixels - (record.allocatedPixels ?? 0) > 4194304)
          throw new UnsupportedPaint();
        scrollPixels += pixels - (record.allocatedPixels ?? 0);
        record.allocatedPixels = pixels;
        if (record.pixels.width !== width) record.pixels.width = width;
        if (record.pixels.height !== height) record.pixels.height = height;
      }
      const context = record.pixels.getContext("2d");
      context.clearRect(0, 0, record.pixels.width, record.pixels.height);
      context.save();
      context.scale(density, density);
      context.translate(-current.x + (record.leaf ? 4 : 0), -current.y + (record.leaf ? 4 : 0));
      const previousBox = paintBox;
      paintBox = current;
      try {
        for (const { node, style: s, box: b } of entries) {
          if (node) {
            text(
              node,
              s,
              (value, x, y) => {
                context.font =
                  s.fontStyle + " " + s.fontWeight + " " + s.fontSize + " " + s.fontFamily;
                context.fontKerning = s.fontKerning;
                context.letterSpacing = s.letterSpacing === "normal" ? "0px" : s.letterSpacing;
                context.wordSpacing = s.wordSpacing;
                context.textRendering = s.textRendering;
                context.fillStyle = s.color;
                if (record.leaf) {
                  const ink = context.measureText(value);
                  if (
                    x - ink.actualBoundingBoxLeft < current.left - 4 ||
                    x + ink.actualBoundingBoxRight > current.right + 4 ||
                    y - ink.actualBoundingBoxAscent < current.top - 4 ||
                    y + ink.actualBoundingBoxDescent > current.bottom + 4
                  )
                    throw new UnsupportedPaint();
                }
                context.fillText(value, x, y);
              },
              null,
            );
          } else {
            context.fillStyle = s.backgroundColor;
            context.fillRect(b.x, b.y, b.width, b.height);
            if (record.leaf) {
              const tint = labelTint(s, b);
              if (tint) {
                context.fillStyle = tint;
                context.beginPath();
                context.roundRect(b.x, b.y, b.width, b.height, corners(b, s));
                context.fill();
              }
            }
            for (const [side, x, y, width, height] of [
              ["Top", b.x, b.y, b.width, parseFloat(s.borderTopWidth)],
              [
                "Bottom",
                b.x,
                b.bottom - parseFloat(s.borderBottomWidth),
                b.width,
                parseFloat(s.borderBottomWidth),
              ],
              ["Left", b.x, b.y, parseFloat(s.borderLeftWidth), b.height],
              [
                "Right",
                b.right - parseFloat(s.borderRightWidth),
                b.y,
                parseFloat(s.borderRightWidth),
                b.height,
              ],
            ]) {
              context.fillStyle = s["border" + side + "Color"];
              context.fillRect(x, y, width, height);
            }
          }
        }
      } finally {
        paintBox = previousBox;
        context.restore();
      }
      if (record.mask && !record.leaf) {
        context.globalCompositeOperation = "destination-in";
        context.drawImage(record.mask, 0, 0);
        context.globalCompositeOperation = "source-over";
      }
      record.previous = key;
      record.revision++;
    }
    async function walk(el) {
      const parent = paint;
      try {
        await walkElement(el);
      } finally {
        paint = parent;
      }
    }
    async function walkElement(el) {
      await budget();
      if (!overlay && exclude?.(el)) return;
      if (overlay && el.matches('[data-lenso-slot="menu-popup"]')) return;
      const b = localRect(el.getBoundingClientRect());
      const movingForeground = el === owner?.foreground;
      const anchor = {
        element: el,
        box: b,
        painted: false,
        style: "",
        svg: "",
        owner,
        liveOutline: !!owner && el instanceof HTMLElement,
        scrollPath: [...scrollPath],
      };
      anchors.push(anchor);
      if (
        b.width > 0 &&
        b.height > 0 &&
        (b.right < paintBox.left - 128 ||
          b.left > paintBox.right + 128 ||
          b.bottom < paintBox.top - 128 ||
          b.top > paintBox.bottom + 128)
      )
        return;
      const s = getComputedStyle(el);
      if (
        s.display === "none" ||
        s.visibility !== "visible" ||
        (!movingForeground && Number(s.opacity) === 0) ||
        s.contentVisibility === "hidden" ||
        s.clipPath === "inset(50%)"
      )
        return;
      anchor.painted = visible(b);
      anchor.style = paintKey(s, movingForeground, anchor.liveOutline);
      if (
        !owner &&
        !scrollPath.length &&
        visible(b) &&
        inOpticalReach(b) &&
        el instanceof HTMLElement &&
        el.childNodes.length &&
        [...el.childNodes].every(
          (node) => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE,
        )
      ) {
        const record = {
          element: el,
          box: b,
          pixels: document.createElement("canvas"),
          leaf: true,
          revision: 0,
          previous: "",
        };
        try {
          repaintText(record);
          const marker = svgNode("g", { "data-owned-text": "" });
          scrollCanvases.add(record.pixels);
          textRegions.set(marker, record);
          anchor.liveText = true;
          paint.append(marker);
          return;
        } catch (error) {
          scrollPixels -= record.allocatedPixels ?? 0;
          record.pixels.width = record.pixels.height = 1;
          if (!(error instanceof UnsupportedPaint)) throw error;
        }
      }
      if (visible(b)) {
        if (s.maskImage !== "none" && maskedLabelOutside(el, s)) return;
        if (anchor.liveOutline) outline(s);
        if (
          inOpticalReach(b) &&
          (s.filter !== "none" ||
            (!anchor.liveOutline && s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) ||
            ![
              "normal",
              "lighten",
              "darken",
              "luminosity",
              "plus-darker",
              "plus-lighter",
              "overlay",
            ].includes(s.mixBlendMode))
        )
          throw new UnsupportedPaint();
        paintScope(b, s, movingForeground);
        if (el instanceof SVGSVGElement) {
          if (el.querySelector("image,foreignObject,script,use")) throw new UnsupportedPaint();
          anchor.svg = el.outerHTML;
          drawIcon(el, b);
          return;
        }
        if (["img", "canvas", "video", "iframe"].includes(el.localName) && inOpticalReach(b))
          throw new UnsupportedPaint();
        drawOuterShadows(b, s);
        drawBackdrop(b, s);
        for (const r of [...el.getClientRects()].map((rect) => localRect(rect))) {
          if (!visible(r)) continue;
          if (s.backgroundColor !== "rgba(0, 0, 0, 0)") {
            const bg = svgNode("rect", { ...geometry(r, s), fill: s.backgroundColor });
            paint.append(bg);
          }
          drawBackgroundImage(r, s);
          const bw = parseFloat(s.borderTopWidth);
          if (bw > 0 && s.borderTopStyle === "solid" && r.width >= bw && r.height >= bw) {
            paint.append(
              svgNode("rect", {
                x: r.x + bw / 2,
                y: r.y + bw / 2,
                width: r.width - bw,
                height: r.height - bw,
                rx: Math.max(0, (parseFloat(s.borderTopLeftRadius) || 0) - bw / 2),
                fill: "none",
                stroke: s.borderTopColor,
                "stroke-width": bw,
              }),
            );
          }
        }
      }
      const children = [...el.childNodes];
      if (s.display === "flex" || s.display === "inline-flex") {
        const key = (child) => {
          if (child.nodeType !== Node.ELEMENT_NODE) return [0, 0, 0];
          const cs = getComputedStyle(child),
            z = cs.zIndex === "auto" ? 0 : Number(cs.zIndex),
            own =
              cs.position !== "static" ||
              cs.isolation === "isolate" ||
              cs.transform !== "none" ||
              cs.filter !== "none" ||
              Number(cs.opacity) < 1 ||
              cs.zIndex !== "auto";
          return [z < 0 ? -1 : z > 0 ? 2 : own ? 1 : 0, z, Number(cs.order) || 0];
        };
        const order = new Map(children.map((child) => [child, key(child)]));
        children.sort((a, b) => {
          const A = order.get(a),
            B = order.get(b);
          return A[0] - B[0] || A[1] - B[1] || A[2] - B[2];
        });
      }
      if (visible(b) && (s.overflowX !== "visible" || s.overflowY !== "visible")) {
        const left = s.overflowX === "visible" ? paintBox.left : b.left,
          top = s.overflowY === "visible" ? paintBox.top : b.top;
        const right = s.overflowX === "visible" ? paintBox.right : b.right,
          bottom = s.overflowY === "visible" ? paintBox.bottom : b.bottom;
        const group = svgNode("g", {
          "clip-path": clipped(new DOMRect(left, top, right - left, bottom - top), s),
        });
        paint.append(group);
        paint = group;
      }
      if (
        !overlay &&
        !scrollPath.length &&
        visible(b) &&
        /^(auto|scroll)$/.test(s.overflowY) &&
        s.direction === "ltr" &&
        s.writingMode === "horizontal-tb" &&
        Math.abs(b.width - el.offsetWidth) <= 0.5 &&
        Math.abs(b.height - el.offsetHeight) <= 0.5 &&
        b.width * density <= 8192 &&
        b.height * density <= 8192 &&
        scrollPixels + Math.ceil(b.width * density) * Math.ceil(b.height * density) <= 4194304
      ) {
        try {
          textContent(el);
          for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
            const style = view.getComputedStyle(ancestor);
            if (style.rotate !== "none" || style.scale !== "none" || style.perspective !== "none")
              throw new UnsupportedPaint();
            if (style.transform !== "none") {
              const matrix = new DOMMatrixReadOnly(style.transform);
              if (!matrix.is2D || matrix.a !== 1 || matrix.b || matrix.c || matrix.d !== 1)
                throw new UnsupportedPaint();
            }
          }
          const marker = svgNode("g", { "data-owned-text": "" });
          const pixels = document.createElement("canvas");
          pixels.width = Math.ceil(b.width * density);
          pixels.height = Math.ceil(b.height * density);
          scrollPixels += pixels.width * pixels.height;
          scrollCanvases.add(pixels);
          const record = { element: el, box: b, pixels, revision: 0, previous: "" };
          repaintText(record);
          textRegions.set(marker, record);
          paint.append(marker);
          return;
        } catch (error) {
          if (!(error instanceof UnsupportedPaint)) throw error;
        }
      }
      const scrolling =
        visible(b) &&
        inOpticalReach(b) &&
        ((/^(auto|scroll)$/.test(s.overflowX) && el.scrollWidth > el.clientWidth) ||
          (/^(auto|scroll)$/.test(s.overflowY) && el.scrollHeight > el.clientHeight));
      const previousBox = paintBox;
      if (scrolling) {
        const width = Math.ceil(el.scrollWidth * density),
          height = Math.ceil(el.scrollHeight * density);
        scrollPixels += width * height;
        if (
          s.direction !== "ltr" ||
          s.writingMode !== "horizontal-tb" ||
          Math.abs(b.width - el.offsetWidth) > 0.01 ||
          Math.abs(b.height - el.offsetHeight) > 0.01 ||
          width > 8192 ||
          height > 8192 ||
          scrollPixels > 4194304 ||
          (s.backgroundImage !== "none" && s.backgroundAttachment !== "scroll")
        )
          throw new UnsupportedPaint();
        for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
          const style = ancestor === el ? s : view.getComputedStyle(ancestor);
          if (
            !["none", "0deg"].includes(style.rotate) ||
            (style.scale !== "none" &&
              !style.scale.split(/\s+/).every((axis) => Number(axis) === 1)) ||
            style.perspective !== "none"
          )
            throw new UnsupportedPaint();
          if (style.transform !== "none") {
            const matrix = new DOMMatrixReadOnly(style.transform);
            if (!matrix.is2D || matrix.a !== 1 || matrix.b || matrix.c || matrix.d !== 1)
              throw new UnsupportedPaint();
          }
        }
        const marker = svgNode("g", { "data-owned-scroll": "" });
        paint.append(marker);
        const recorded = {
          element: el,
          box: b,
          left: el.scrollLeft,
          top: el.scrollTop,
          width: el.scrollWidth,
          height: el.scrollHeight,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight,
          content: svgNode("g"),
          steps: [],
          revision: 0,
          previous: "",
        };
        recorded.bounds = new DOMRect(
          b.x + el.clientLeft - recorded.left,
          b.y + el.clientTop - recorded.top,
          el.scrollWidth,
          el.scrollHeight,
        );
        scrolls.set(marker, recorded);
        scrollPath.push(recorded);
        paintBox = recorded.bounds;
        paint = recorded.content;
      }
      try {
        for (const child of children) {
          if (child.nodeType === Node.TEXT_NODE) text(child, s);
          else if (child.nodeType === Node.ELEMENT_NODE) await walk(child);
        }
      } finally {
        paintBox = previousBox;
        if (scrolling) scrollPath.pop();
      }
    }
    const materials = new Map(),
      owners = new Map(),
      foregrounds = new Map(),
      origins = new Map(layers.map((layer) => [layer, layer.foreground.getBoundingClientRect()]));
    try {
      if (!base) await walk(scene);
      overlay = true;
      for (const layer of layers) {
        owner = layer;
        const before = new Set(svg.children);
        const { foreground, element } = layer;
        const bounds = localRect(element.getBoundingClientRect());
        const edge = view.getComputedStyle(element, "::after");
        anchors.push({
          element,
          box: bounds,
          painted: true,
          style: paintKey(view.getComputedStyle(element)),
          edge: paintKey(edge),
          svg: "",
          owner,
        });
        const outer = new DOMRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2);
        drawOuterShadows(bounds, view.getComputedStyle(element));
        const marker = svgNode("g");
        materials.set(marker, layer);
        paint.append(marker);
        drawBackgroundImage(outer, edge);
        const ink = svgNode("g", { "data-owned-foreground": "" });
        paint.append(ink);
        paint = ink;
        foregrounds.set(ink, {
          bounds: localRect(foreground.getBoundingClientRect()),
          steps: [],
          owner: layer,
        });
        await walk(foreground);
        paint = svg;
        for (const node of svg.children) if (!before.has(node)) owners.set(node, layer);
      }
    } catch (e) {
      if (e instanceof UnsupportedPaint) return;
      throw e;
    }
    const wrap = (node, ancestors) => {
      for (const ancestor of [...ancestors].reverse()) {
        const group = ancestor.cloneNode(false);
        group.append(node);
        node = group;
      }
      return node;
    };
    async function rasterize(nodes, bounds) {
      await budget();
      const layer = svgNode("svg", {
        width: Math.ceil(bounds.width * density),
        height: Math.ceil(bounds.height * density),
        viewBox: [bounds.x, bounds.y, bounds.width, bounds.height].join(" "),
      });
      layer.append(css.cloneNode(true), defs.cloneNode(true), ...nodes);
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(layer)], { type: "image/svg+xml" }),
      );
      const img = new Image();
      images.add(img);
      img.src = url;
      try {
        await img.decode();
        await budget();
        return img;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    function drawSteps(context, recorded, bounds, shift) {
      for (const step of recorded) {
        if (step.material) {
          const box = step.material.element.getBoundingClientRect();
          context.drawImage(
            step.bitmap,
            0,
            0,
            Math.ceil(box.width * density),
            Math.ceil(box.height * density),
            (box.x - bounds.x) * density,
            (box.y - bounds.y) * density,
            box.width * density,
            box.height * density,
          );
          continue;
        }
        const offset = shift(step);
        const rect = step.content?.leaf ? step.content.box : step;
        context.save();
        context.translate((offset.x - bounds.x) * density, (offset.y - bounds.y) * density);
        context.scale(offset.scaleX ?? 1, offset.scaleY ?? 1);
        if (step.foreground) context.globalAlpha = offset.opacity ?? 1;
        if (step.blend) context.globalCompositeOperation = step.blend;
        context.drawImage(
          step.bitmap,
          rect.x * density,
          rect.y * density,
          rect.width * density,
          rect.height * density,
        );
        context.restore();
      }
    }
    function repaintScroll(record) {
      const x = record.left - record.element.scrollLeft,
        y = record.top - record.element.scrollTop;
      const key = JSON.stringify([x, y, ...record.steps.map((step) => step.scroll?.revision)]);
      if (record.previous === key) return;
      const context = record.pixels.getContext("2d");
      context.clearRect(0, 0, record.pixels.width, record.pixels.height);
      drawSteps(context, record.steps, record.box, () => ({ x, y }));
      context.globalCompositeOperation = "destination-in";
      context.drawImage(record.mask, 0, 0);
      context.globalCompositeOperation = "source-over";
      record.previous = key;
      record.revision++;
    }
    // Split at live inputs and blend steps. Other SVG groups retain their masks and painter order.
    const stepBoundary =
      "[data-owned-scroll], [data-owned-text], [data-owned-cast], [data-owned-foreground], [data-owned-overlay]";
    async function compile(nodes, bounds, output) {
      let part = [],
        partOwner;
      const flush = async () => {
        if (!part.length) return;
        output.push({
          bitmap: await rasterize(part, bounds),
          ...bounds.toJSON(),
          owner: partOwner,
        });
        part = [];
      };
      async function visit(node, ancestors, owner) {
        if (owner !== partOwner) await flush();
        partOwner = owner;
        const scroll = scrolls.get(node),
          content = textRegions.get(node),
          cast = canvasCasts.get(node),
          material = materials.get(node),
          foreground = foregrounds.get(node);
        if (node.hasAttribute("data-owned-overlay")) {
          if (
            node.querySelector(stepBoundary) ||
            ancestors.some(
              (group) =>
                group.hasAttribute("mask") ||
                group.hasAttribute("filter") ||
                (group.hasAttribute("opacity") && Number(group.getAttribute("opacity")) !== 1) ||
                !["", "normal"].includes(group.style.mixBlendMode),
            )
          )
            throw new UnsupportedPaint();
          await flush();
          // Blend against the accumulated canvas, including paint in earlier raster steps.
          const source = node.cloneNode(true);
          source.style.removeProperty("mix-blend-mode");
          output.push({
            bitmap: await rasterize([wrap(source, ancestors)], bounds),
            ...bounds.toJSON(),
            owner,
            blend: "overlay",
          });
          return;
        }
        if (scroll || content || cast || material || foreground) {
          await flush();
          if (content) {
            if (
              ancestors.some(
                (group) =>
                  group.hasAttribute("mask") ||
                  group.hasAttribute("filter") ||
                  group.hasAttribute("opacity") ||
                  group.style.mixBlendMode,
              )
            )
              throw new UnsupportedPaint();
            content.mask = await rasterize(
              [wrap(svgNode("rect", { ...content.box.toJSON(), fill: "white" }), ancestors)],
              content.box,
            );
            content.previous = "";
            repaintText(content);
            output.push({ bitmap: content.pixels, ...content.box.toJSON(), content, owner });
          } else if (foreground) {
            await compile([...node.children], foreground.bounds, foreground.steps);
            foreground.pixels = document.createElement("canvas");
            foreground.pixels.width = Math.ceil(foreground.bounds.width * density);
            foreground.pixels.height = Math.ceil(foreground.bounds.height * density);
            scrollCanvases.add(foreground.pixels);
            output.push({
              bitmap: foreground.pixels,
              ...foreground.bounds.toJSON(),
              owner,
              foreground: true,
            });
          } else if (scroll) {
            if (
              ancestors.some(
                (group) =>
                  group.hasAttribute("mask") ||
                  group.hasAttribute("filter") ||
                  (group.hasAttribute("opacity") && Number(group.getAttribute("opacity")) !== 1) ||
                  (group.style.mixBlendMode && group.style.mixBlendMode !== "normal"),
              )
            )
              throw new UnsupportedPaint();
            await compile([...scroll.content.children], scroll.bounds, scroll.steps);
            scroll.mask = await rasterize(
              [
                wrap(
                  svgNode("rect", {
                    ...scroll.box.toJSON(),
                    fill: "white",
                  }),
                  ancestors,
                ),
              ],
              scroll.box,
            );
            scroll.pixels = document.createElement("canvas");
            scroll.pixels.width = Math.ceil(scroll.box.width * density);
            scroll.pixels.height = Math.ceil(scroll.box.height * density);
            scrollCanvases.add(scroll.pixels);
            repaintScroll(scroll);
            output.push({ bitmap: scroll.pixels, ...scroll.box.toJSON(), scroll, owner });
          } else if (material) {
            output.push({ bitmap: material.pixels, material });
          } else {
            output.push({
              bitmap: cast.bitmap,
              x: cast.left,
              y: cast.top,
              width: cast.bitmap.width / density,
              height: cast.bitmap.height / density,
              owner,
            });
          }
        } else if (node.querySelector(stepBoundary)) {
          for (const child of node.children) await visit(child, [...ancestors, node], owner);
        } else {
          part.push(wrap(node.cloneNode(true), ancestors));
        }
      }
      for (const node of nodes) await visit(node, [], owners.get(node));
      await flush();
    }
    try {
      await compile(
        [...svg.children].filter((node) => node !== css && node !== defs),
        box,
        steps,
      );
    } catch (error) {
      if (error instanceof UnsupportedPaint) return;
      throw error;
    }
    const paintPage = (x, y, shifts) => {
      for (const foreground of foregrounds.values()) {
        const key = JSON.stringify([
          ...foreground.steps.map((step) => step.scroll?.revision),
          outlineKey(),
        ]);
        if (foreground.previous === key) continue;
        const context = foreground.pixels.getContext("2d");
        context.clearRect(0, 0, foreground.pixels.width, foreground.pixels.height);
        drawSteps(context, foreground.steps, foreground.bounds, () => ({ x: 0, y: 0 }));
        context.save();
        context.scale(density, density);
        context.translate(-foreground.bounds.x, -foreground.bounds.y);
        for (const anchor of anchors) {
          if (!anchor.liveOutline || !anchor.painted || anchor.owner !== foreground.owner) continue;
          const style = view.getComputedStyle(anchor.element);
          const ring = outline(style);
          if (!ring) continue;
          const { box } = anchor;
          context.beginPath();
          context.roundRect(
            box.x + ring.inset,
            box.y + ring.inset,
            Math.max(0, box.width - 2 * ring.inset),
            Math.max(0, box.height - 2 * ring.inset),
            Math.max(0, corners(box, style) - ring.inset),
          );
          context.lineWidth = ring.width;
          context.strokeStyle = ring.color;
          context.stroke();
        }
        context.restore();
        foreground.previous = key;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (opaquePage) {
        ctx.fillStyle = pageColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (base)
        ctx.drawImage(
          base.pixels,
          (base.bounds.x - box.x - x) * density,
          (base.bounds.y - box.y - y) * density,
        );
      drawSteps(
        ctx,
        steps,
        new DOMRect(box.x + x, box.y + y, box.width, box.height),
        (step) => shifts.get(step.owner) ?? { x, y },
      );
    };
    const layerShifts = () =>
      new Map(
        layers.map((layer) => {
          const current = layer.foreground.getBoundingClientRect(),
            initial = origins.get(layer);
          const scaleX = current.width / layer.foreground.offsetWidth,
            scaleY = current.height / layer.foreground.offsetHeight;
          const style = view.getComputedStyle(layer.foreground);
          if (
            ![scaleX, scaleY].every((scale) => Number.isFinite(scale) && scale > 0) ||
            !["none", "0deg"].includes(style.rotate) ||
            style.perspective !== "none" ||
            (style.scale !== "none" &&
              !style.scale.split(/\s+/).every((scale) => Number(scale) > 0))
          )
            throw new UnsupportedPaint();
          if (style.transform !== "none") {
            const matrix = new DOMMatrixReadOnly(style.transform);
            if (!matrix.is2D || matrix.b || matrix.c || matrix.a <= 0 || matrix.d <= 0)
              throw new UnsupportedPaint();
          }
          return [
            layer,
            {
              x: current.x - initial.x * scaleX,
              y: current.y - initial.y * scaleY,
              scaleX,
              scaleY,
              opacity: Number(style.opacity),
            },
          ];
        }),
      );
    paintPage(0, 0, layerShifts());

    let revision = 0,
      previous = "";
    retained = true;
    return {
      pixels: canvas,
      opaque: opaquePage,
      fontCss: css.textContent,
      get revision() {
        return revision;
      },
      dispose: release,
      mutate(records) {
        if (base) return base.mutate(records);
        return records.every((record) => {
          if (
            exclude?.(record.target) ||
            [...textRegions.values()].some((region) => region.element.contains(record.target)) ||
            record.type === "attributes" ||
            (record.type === "childList" &&
              [...record.addedNodes, ...record.removedNodes].every((node) => exclude?.(node)))
          )
            return true;
          const element =
            record.target instanceof Element ? record.target : record.target.parentElement;
          // Only a culled subtree has no old pixels to remove. Track its new descendants too.
          const anchor = anchors.find((entry) => entry.element === element);
          if (
            !anchor ||
            anchor.owner ||
            anchor.scrollPath.length ||
            anchor.box.width <= 0 ||
            anchor.box.height <= 0 ||
            !outsideCapture(anchor.box)
          )
            return false;
          changedOutside.add(element);
          return true;
        });
      },
      relocate(lens) {
        if (canvas.width <= 1) return;
        const next = scene.getBoundingClientRect();
        // Height-only reflow is certified per painted anchor below, including the scene itself.
        if (next.width !== origin.width) return;
        const x = next.x - origin.x,
          y = next.y - origin.y;
        for (const root of changedOutside) {
          if (!root.isConnected) continue;
          for (const element of [root, ...root.querySelectorAll("*")]) {
            const b = element.getBoundingClientRect();
            if (
              b.width > 0 &&
              b.height > 0 &&
              !outsideCapture(new DOMRect(b.x - x, b.y - y, b.width, b.height))
            )
              return;
          }
        }
        if (
          layers.some((layer) => !layer.pixels.isConnected || !layer.update()) ||
          (base && !base.relocate(lens))
        )
          return;
        for (const scroll of scrolls.values()) {
          const element = scroll.element;
          if (
            element.scrollWidth !== scroll.width ||
            element.scrollHeight !== scroll.height ||
            element.clientWidth !== scroll.clientWidth ||
            element.clientHeight !== scroll.clientHeight
          )
            return;
        }
        const shifts = layerShifts();
        for (const anchor of anchors) {
          const world = anchor.element.getBoundingClientRect();
          const b = anchor.owner ? localRect(world, anchor.owner) : world;
          const shift = anchor.owner ? { x: 0, y: 0 } : { x, y };
          for (const scroll of anchor.scrollPath ?? []) {
            shift.x += scroll.left - scroll.element.scrollLeft;
            shift.y += scroll.top - scroll.element.scrollTop;
          }
          if (
            world.right < lens.left - halo ||
            world.left > lens.right + halo ||
            world.bottom < lens.top - halo ||
            world.top > lens.bottom + halo
          )
            continue;
          const style = view.getComputedStyle(anchor.element);
          if (
            !anchor.painted &&
            (style.display === "none" ||
              style.visibility !== "visible" ||
              Number(style.opacity) === 0 ||
              style.contentVisibility === "hidden" ||
              style.clipPath === "inset(50%)")
          )
            continue;
          if (anchor.liveText) {
            if (!anchor.element.isConnected) return;
            continue;
          }
          const sameBox =
            Math.abs(b.x - anchor.box.x - shift.x) <= 0.01 &&
            Math.abs(b.y - anchor.box.y - shift.y) <= 0.01 &&
            Math.abs(b.width - anchor.box.width) <= 0.01 &&
            Math.abs(b.height - anchor.box.height) <= 0.01;
          // Reflow of a paintless wrapper cannot change pixels; children certify their own ink.
          const flat =
            !sameBox &&
            anchor.element instanceof HTMLElement &&
            ![...anchor.element.childNodes].some(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
            ) &&
            ["::before", "::after"].every((pseudo) =>
              ["none", "normal"].includes(view.getComputedStyle(anchor.element, pseudo).content),
            ) &&
            !anchor.owner &&
            !anchor.scrollPath.length &&
            style.backgroundImage === "none" &&
            style.boxShadow === "none" &&
            style.outlineStyle === "none" &&
            style.filter === "none" &&
            style.backdropFilter === "none" &&
            style.opacity === "1" &&
            style.maskImage === "none" &&
            style.clipPath === "none" &&
            style.mixBlendMode === "normal" &&
            style.textDecorationLine === "none" &&
            (style.display !== "list-item" || style.listStyleType === "none") &&
            ["Top", "Right", "Bottom", "Left"].every(
              (side) => parseFloat(style["border" + side + "Width"]) === 0,
            );
          const empty =
            flat &&
            style.backgroundColor === "rgba(0, 0, 0, 0)" &&
            style.overflowX === "visible" &&
            style.overflowY === "visible";
          const inset = corners(b, style);
          const unchangedEdges =
            flat &&
            inset === corners(anchor.box, style) &&
            [
              [anchor.box.left + shift.x, b.left, lens.left, lens.right],
              [anchor.box.right + shift.x, b.right, lens.left, lens.right],
              [anchor.box.top + shift.y, b.top, lens.top, lens.bottom],
              [anchor.box.bottom + shift.y, b.bottom, lens.top, lens.bottom],
            ].every(
              ([before, after, low, high]) =>
                Math.abs(before - after) <= 0.01 ||
                Math.max(before, after) + inset < low - halo ||
                Math.min(before, after) - inset > high + halo,
            );
          if (
            !anchor.element.isConnected ||
            !anchor.painted ||
            (!sameBox && !empty && !unchangedEdges) ||
            (anchor.svg && anchor.element.outerHTML !== anchor.svg) ||
            (anchor.edge &&
              paintKey(view.getComputedStyle(anchor.element, "::after")) !== anchor.edge) ||
            paintKey(style, anchor.element === anchor.owner?.foreground, anchor.liveOutline) !==
              anchor.style
          )
            return;
        }
        for (const content of textRegions.values()) repaintText(content);
        if (base || scrolls.size || textRegions.size || layers.length) {
          for (const scroll of [...scrolls.values()].reverse()) repaintScroll(scroll);
          const key = JSON.stringify([
            x,
            y,
            base?.revision,
            ...[...textRegions.values()].map((content) => content.revision),
            ...[...scrolls.values()].map((scroll) => scroll.revision),
            outlineKey(),
            ...layers.map((layer) => [
              shifts.get(layer),
              layer.pixels.getAttribute("data-glass-frame"),
            ]),
          ]);
          if (key !== previous) {
            paintPage(x, y, shifts);
            previous = key;
            revision++;
          }
        }
        return { x, y };
      },
    };
  } finally {
    if (!retained) release();
    else if (!base && !scrolls.size && !textRegions.size && !layers.length) {
      for (const image of images) image.src = "";
      for (const { bitmap } of canvasCasts.values()) bitmap.width = bitmap.height = 1;
    }
  }
}
