import { fontFaceForImage } from "./paint-fonts.js";

class UnsupportedPaint extends Error {}

/** Records the static, owned Menu Docs example as an uploadable texture. */
export async function captureMenuTexture(
  scene,
  box,
  surface,
  density,
  radius,
  reach,
  blur,
  checkpoint,
) {
  const document = scene.ownerDocument,
    view = document.defaultView;
  const { scrollX, scrollY } = view;
  const budget = async () => {
    if (!(await checkpoint())) throw new DOMException("Source capture cancelled", "AbortError");
  };
  const halo = Math.ceil(reach + 3 * blur + 4);
  const inOpticalReach = (b) => {
    const dx = Math.max(surface.left + radius - b.right, b.left - (surface.right - radius), 0);
    const dy = Math.max(surface.top + radius - b.bottom, b.top - (surface.bottom - radius), 0);
    return Math.hypot(dx, dy) <= radius + halo;
  };
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(box.width * density);
  canvas.height = Math.ceil(box.height * density);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const canvasCasts = new Map();
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
    const css = svgNode("style"),
      rules = [];
    const collect = async (list) => {
      for (const r of list) {
        await budget();
        if (r instanceof CSSFontFaceRule) rules.push(await fontFaceForImage(document, r));
        else if (r.cssRules) await collect(r.cssRules);
      }
    };
    for (const ss of document.styleSheets) await collect(ss.cssRules);
    css.textContent = rules.join("\n");
    svg.append(
      css,
      svgNode("rect", {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        fill: getComputedStyle(document.body).backgroundColor,
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
    const visible = (b) =>
      b.width > 0 &&
      b.height > 0 &&
      b.left < box.right &&
      b.right > box.left &&
      b.top < box.bottom &&
      b.bottom > box.top;
    function text(node, s) {
      if (!node.textContent.trim()) return;
      const whole = document.createRange();
      whole.selectNodeContents(node);
      if (![...whole.getClientRects()].some(visible)) return;
      const baseline = font(s);
      let run,
        index = 0;
      function flush() {
        if (!run || !run.str.trim()) return;
        if (
          run.endX >= box.left &&
          run.x <= box.right &&
          run.y < box.bottom &&
          run.y + run.h > box.top
        ) {
          const t = svgNode("text", {
            x: run.x,
            y: Math.round(run.y + baseline + scrollY) - scrollY,
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
          svg.append(t);
        }
      }
      for (const ch of node.textContent) {
        const r = document.createRange();
        r.setStart(node, index);
        index += ch.length;
        r.setEnd(node, index);
        const b = r.getClientRects()[0];
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
      canvasCasts.set(marker, { bitmap, left, top });
      svg.append(marker);
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
        svg.append(group);
      }
    }
    function drawBackdrop(b, s) {
      if (s.backdropFilter === "none") return;
      const matched = /^blur\(([\d.]+)px\)$/.exec(s.backdropFilter);
      if (!matched) {
        throw new UnsupportedPaint();
      }
      const sigma = Number(matched[1]),
        pad = Math.ceil(3 * sigma) + 2;
      const g = svgNode("g", { id: "owned-under-" + nextId++ });
      for (const n of [...svg.children]) if (n !== css && n !== defs) g.append(n);
      svg.append(g);
      const layer = svgNode("g", { "clip-path": clipped(b, s) });
      layer.append(
        svgNode("use", {
          href: "#" + g.id,
          filter: blurFilter(
            { x: b.x - pad, y: b.y - pad, width: b.width + 2 * pad, height: b.height + 2 * pad },
            sigma,
          ),
        }),
      );
      svg.append(layer);
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
      svg.append(svgNode("rect", { ...geometry(b, s), fill: "url(#" + grad.id + ")" }));
      return true;
    }

    function drawBackgroundImage(b, s) {
      if (s.backgroundImage === "none" || drawLinearGradient(b, s)) return;
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
      svg.append(image);
    }
    function drawIcon(el, b) {
      const copy = el.cloneNode(true);
      copy.setAttribute("x", String(b.x));
      copy.setAttribute("y", String(b.y));
      copy.setAttribute("width", String(b.width));
      copy.setAttribute("height", String(b.height));
      copy.setAttribute("color", getComputedStyle(el).color);
      copy.removeAttribute("class");
      svg.append(copy);
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
        const rect = rects[0],
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

    async function walk(el) {
      await budget();
      const b = el.getBoundingClientRect();
      if (
        b.width > 0 &&
        b.height > 0 &&
        (b.right < box.left - 128 ||
          b.left > box.right + 128 ||
          b.bottom < box.top - 128 ||
          b.top > box.bottom + 128)
      )
        return;
      const s = getComputedStyle(el);
      if (
        s.display === "none" ||
        s.visibility !== "visible" ||
        Number(s.opacity) === 0 ||
        s.contentVisibility === "hidden"
      )
        return;
      if (visible(b)) {
        if (s.maskImage !== "none" && maskedLabelOutside(el, s)) return;
        if (
          inOpticalReach(b) &&
          (s.maskImage !== "none" ||
            s.clipPath !== "none" ||
            s.filter !== "none" ||
            Number(s.opacity) !== 1 ||
            !["normal", "lighten", "darken", "luminosity"].includes(s.mixBlendMode))
        )
          throw new UnsupportedPaint();
        if (el instanceof SVGSVGElement) {
          if (el.querySelector("image,foreignObject,script,use")) throw new UnsupportedPaint();
          drawIcon(el, b);
          return;
        }
        if (["img", "canvas", "video", "iframe"].includes(el.localName) && inOpticalReach(b))
          throw new UnsupportedPaint();
        drawOuterShadows(b, s);
        drawBackdrop(b, s);
        for (const r of [...el.getClientRects()]) {
          if (!visible(r)) continue;
          if (s.backgroundColor !== "rgba(0, 0, 0, 0)") {
            const bg = svgNode("rect", { ...geometry(r, s), fill: s.backgroundColor });
            if (s.mixBlendMode !== "normal") bg.style.mixBlendMode = s.mixBlendMode;
            svg.append(bg);
          }
          drawBackgroundImage(r, s);
          const bw = parseFloat(s.borderTopWidth);
          if (bw > 0 && s.borderTopStyle === "solid" && r.width >= bw && r.height >= bw) {
            svg.append(
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
      for (const child of children) {
        if (child.nodeType === Node.TEXT_NODE) text(child, s);
        else if (child.nodeType === Node.ELEMENT_NODE) await walk(child);
      }
    }
    try {
      await walk(scene);
    } catch (e) {
      if (e instanceof UnsupportedPaint) return;
      throw e;
    }
    const ctxFinal = ctx;
    ctxFinal.resetTransform();
    ctxFinal.clearRect(0, 0, canvas.width, canvas.height);
    const visibleNodes = [...svg.children].filter((n) => n !== css && n !== defs);
    let part = [];
    async function flushPart() {
      if (!part.length) return;
      await budget();
      const layer = svg.cloneNode(false);
      layer.append(
        css.cloneNode(true),
        defs.cloneNode(true),
        ...part.map((n) => n.cloneNode(true)),
      );
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(layer)], { type: "image/svg+xml" }),
      );
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
        await budget();
        ctxFinal.drawImage(img, 0, 0);
      } finally {
        URL.revokeObjectURL(url);
      }
      part = [];
    }
    for (const paint of visibleNodes) {
      const cast = canvasCasts.get(paint);
      if (cast) {
        await flushPart();
        ctxFinal.drawImage(
          cast.bitmap,
          (cast.left - box.left) * density,
          (cast.top - box.top) * density,
        );
        cast.bitmap.width = cast.bitmap.height = 1;
      } else {
        if (paint.querySelector("[data-owned-cast]")) return;
        part.push(paint);
      }
    }
    await flushPart();

    retained = true;
    return canvas;
  } finally {
    for (const { bitmap } of canvasCasts.values()) {
      if (bitmap.width > 1 || bitmap.height > 1) bitmap.width = bitmap.height = 1;
    }
    if (!retained) canvas.width = canvas.height = 1;
  }
}
