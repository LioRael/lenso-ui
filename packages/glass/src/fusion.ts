import { createFusionOptics, sharesFusionMaterial } from "./fusion-optics.js";
import { groupedGeometry } from "./fusion-geometry.js";

export interface FusionShape {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  corners?: readonly [number, number, number, number];
}

function layoutSize(element: HTMLElement, style: CSSStyleDeclaration, axis: "width" | "height") {
  const size = parseFloat(style[axis]);
  if (!Number.isFinite(size)) return axis === "width" ? element.offsetWidth : element.offsetHeight;
  if (style.boxSizing === "border-box") return size;
  const sides =
    axis === "width"
      ? [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
      : [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth];
  return size + sides.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
}

function gapBetween(a: FusionShape, b: FusionShape) {
  return Math.hypot(
    Math.max(a.x - b.x - b.width, b.x - a.x - a.width, 0),
    Math.max(a.y - b.y - b.height, b.y - a.y - a.height, 0),
  );
}

/** Cover only the contact rim; the rest of each control stays outside the bridge mask. */
export function fusionMasks(
  width: number,
  height: number,
  shapes: FusionShape[],
  spacing: number,
  silhouette?: string,
) {
  const rects = shapes
    .map(({ x, y, width, height, radius, corners }) => {
      if (!corners)
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/>`;
      const [tl, tr, br, bl] = corners;
      return `<path d="M${x + tl},${y}H${x + width - tr}A${tr},${tr} 0 0 1 ${x + width},${y + tr}V${y + height - br}A${br},${br} 0 0 1 ${x + width - br},${y + height}H${x + bl}A${bl},${bl} 0 0 1 ${x},${y + height - bl}V${y + tl}A${tl},${tl} 0 0 1 ${x + tl},${y}Z"/>`;
    })
    .join("");
  // Two blurred half-planes meet at alpha .45 when their gap is about 1.51 sigma.
  // Bound the blur so a small participant cannot dissolve under a large spacing value.
  const blur = Math.min(
    spacing / 1.51,
    ...shapes.map((shape) => Math.min(shape.width, shape.height) / 2.5),
  );
  const filter =
    spacing > 0
      ? `<filter id="goo" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${blur}"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter>`
      : "";
  const corridors: string[] = [];
  for (const [index, a] of shapes.entries()) {
    for (const b of shapes.slice(index + 1)) {
      if (gapBetween(a, b) >= spacing) continue;
      const ax = a.x + a.width / 2,
        ay = a.y + a.height / 2;
      const bx = b.x + b.width / 2,
        by = b.y + b.height / 2;
      const length = Math.hypot(bx - ax, by - ay);
      if (!length) continue;
      const half = Math.min(a.width, a.height, b.width, b.height) / 2;
      const nx = ((ay - by) / length) * half,
        ny = ((bx - ax) / length) * half;
      corridors.push(
        `<polygon points="${ax + nx},${ay + ny} ${bx + nx},${by + ny} ${bx - nx},${by - ny} ${ax - nx},${ay - ny}"/>`,
      );
    }
  }
  const union = silhouette
    ? `<image href="${silhouette}" width="${width}" height="${height}"/>`
    : `<g fill="white"${spacing > 0 ? ' filter="url(#goo)"' : ""}>${rects}</g>`;
  const image = (cutout: boolean) => {
    const mask = cutout
      ? `<mask id="bridge" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><g fill="white">${corridors.join("")}</g><g fill="black">${rects}</g></mask>`
      : "";
    const contact = cutout
      ? `<filter id="contact" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><feMorphology operator="dilate" radius="2"/></filter><mask id="outline" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">${union}</mask>`
      : "";
    const shape = `<g${cutout ? ' mask="url(#bridge)"' : ""}>${union}</g>`;
    // Whole CSS pixels avoid WebKit rounding away part of the contact coverage.
    // Expand into the 2px contact rim while keeping the outer contour fixed.
    const body = cutout
      ? `<g mask="url(#outline)"><g filter="url(#contact)">${shape}</g></g>`
      : shape;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${filter}${mask}${contact}</defs>${body}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };
  return { bridge: image(true), outline: image(false) };
}

export interface FusionGroup {
  members: Set<HTMLElement>;
  update: () => void;
}

/** Follows presentation geometry, including CSS scale and elastic spring updates. */
export function attachFusion(
  root: HTMLElement,
  surface: HTMLElement,
  group: FusionGroup,
  spacing: number,
) {
  let frame = 0;
  let still = 0;
  let lastChange = performance.now();
  let previous = "";
  let visible = true;
  let destroyed = false;
  let retire = 0;
  const observed = new Set<HTMLElement>();
  const grouped = root.hasAttribute("data-lenso-glass-group");
  let optics: ReturnType<typeof createFusionOptics> | undefined;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const contrast = matchMedia("(forced-colors: active)");
  const transparency = matchMedia("(prefers-reduced-transparency: reduce)");
  const measure = () => {
    frame = 0;
    if (destroyed || !visible || document.hidden) return;
    const box = root.getBoundingClientRect();
    const rootStyle = getComputedStyle(root);
    const width = layoutSize(root, rootStyle, "width");
    const height = layoutSize(root, rootStyle, "height");
    const unitX = box.width / width || 1;
    const unitY = box.height / height || 1;
    const all = [...group.members];
    for (const member of all) {
      if (!observed.has(member)) {
        resize.observe(member);
        observed.add(member);
      }
    }
    for (const member of observed) {
      if (!group.members.has(member)) {
        resize.unobserve(member);
        observed.delete(member);
      }
    }
    const members = all.filter((member) => member.isConnected);
    let shapes: FusionShape[] = [];
    const shownMembers: HTMLElement[] = [];
    const recipes: string[] = [];
    const opaque =
      contrast.matches ||
      transparency.matches ||
      root.closest('[data-contrast="increased"]') !== null;
    for (const member of members) {
      const at = member.getBoundingClientRect();
      const style = getComputedStyle(member);
      const shown =
        at.width > 0 &&
        at.height > 0 &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0;
      if (!shown) continue;
      shownMembers.push(member);
      recipes.push(
        [
          member.getAttribute("data-variant"),
          member.getAttribute("data-pressed"),
          ...[
            "--lg-material",
            "--apple-material-profile",
            "--lg-bezel",
            "--lg-refraction",
            "--lg-light-intensity",
            "--lg-light-angle",
            "--lg-bevel",
            "--lg-splay",
            "--lg-saturation",
            "--lg-dispersion",
            "--lg-blur",
            "--lenso-glass-material-fill",
            "--lenso-glass-preference-paint",
          ].map((name) => style.getPropertyValue(name)),
        ].join("|"),
      );
      const w = at.width / unitX;
      const h = at.height / unitY;
      const cornerRadius = (corner: string) =>
        Math.min(
          w / 2,
          h / 2,
          corner.endsWith("%")
            ? (Math.min(w, h) * parseFloat(corner)) / 100
            : (parseFloat(corner) || 0) * (w / layoutSize(member, style, "width") || 1),
        );
      const corners = [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ].map(cornerRadius) as [number, number, number, number];
      const radius = corners[0];
      shapes.push({
        x: (at.left - box.left) / unitX + root.scrollLeft - root.clientLeft,
        y: (at.top - box.top) / unitY + root.scrollTop - root.clientTop,
        width: w,
        height: h,
        radius,
        ...(corners.some((corner) => corner !== radius) ? { corners } : {}),
      });
    }
    // Presentation transforms can extend beyond the layout box in every direction.
    // Keep the hit area fixed and move all optical layers into the expanded paint plane.
    const margin = grouped ? 0 : Math.min(12, spacing / 2);
    const left = Math.floor(Math.min(0, ...shapes.map((shape) => shape.x)) - margin);
    const top = Math.floor(Math.min(0, ...shapes.map((shape) => shape.y)) - margin);
    const paintWidth =
      Math.ceil(Math.max(width, ...shapes.map((shape) => shape.x + shape.width)) + margin) - left;
    const paintHeight =
      Math.ceil(Math.max(height, ...shapes.map((shape) => shape.y + shape.height)) + margin) - top;
    shapes = shapes.map((shape) => ({ ...shape, x: shape.x - left, y: shape.y - top }));
    const joining = grouped && (groupedGeometry(shapes)?.progress ?? 1) < 1;
    const connected = shapes.map(
      (shape, index) =>
        !opaque &&
        (!motion.matches || grouped) &&
        spacing > 0 &&
        (joining ||
          shapes.some((other, otherIndex) => {
            if (index === otherIndex) return false;
            return gapBetween(shape, other) < spacing;
          })),
    );
    const continuous =
      !opaque &&
      (!motion.matches || grouped) &&
      spacing > 0 &&
      shownMembers.length > 1 &&
      sharesFusionMaterial(surface, shownMembers);
    const fused = continuous ? shapes : shapes.filter((_, index) => connected[index]);
    const fusedMembers = continuous
      ? shownMembers
      : shownMembers.filter((_, index) => connected[index]);
    const disconnected = !fused.length || !width || !height;
    if (disconnected) {
      surface.style.left = `${left}px`;
      surface.style.top = `${top}px`;
      surface.style.width = `${paintWidth}px`;
      surface.style.height = `${paintHeight}px`;
      optics?.retiring(paintWidth, paintHeight, shapes, shownMembers);
      if (!retire) {
        const delay = optics?.restore() ?? 0;
        if (delay) {
          // Backdrop copies read restored opacity in the next frame. Keep the
          // shared face until those writes land, then retire it underneath them.
          retire = requestAnimationFrame(() => {
            const started = performance.now();
            const finish = () => {
              if (performance.now() - started < delay) {
                retire = requestAnimationFrame(finish);
                return;
              }
              retire = 0;
              optics?.destroy();
              optics = undefined;
              surface.hidden = true;
            };
            retire = requestAnimationFrame(finish);
          });
        } else {
          optics?.destroy();
          optics = undefined;
          surface.hidden = true;
        }
      }
    } else {
      if (retire) cancelAnimationFrame(retire);
      retire = 0;
      surface.hidden = false;
    }
    const material = getComputedStyle(surface);
    const next = JSON.stringify([
      left,
      top,
      paintWidth,
      paintHeight,
      fused,
      recipes.filter((_, index) => continuous || connected[index]),
      motion.matches,
      opaque,
      material.getPropertyValue("--lenso-material-action-mode"),
      material.getPropertyValue("--lenso-glass-container-tint"),
      material.getPropertyValue("--lenso-glass-refraction"),
    ]);
    if (next !== previous) {
      previous = next;
      still = 0;
      lastChange = performance.now();
      // Optical preparation may retain the preceding plane between updates.
      // Do not overwrite that plane on otherwise unchanged tracking frames.
      surface.style.left = `${left}px`;
      surface.style.top = `${top}px`;
      surface.style.width = `${paintWidth}px`;
      surface.style.height = `${paintHeight}px`;
      if (!disconnected) {
        if (!optics || material.getPropertyValue("--lg-material").trim() !== "apple")
          surface.style.maskImage = fusionMasks(paintWidth, paintHeight, fused, spacing).bridge;
        optics ??= createFusionOptics(surface);
        optics.update(paintWidth, paintHeight, fused, spacing, fusedMembers, grouped);
      }
    } else still++;
    if (!disconnected) optics?.lighting(fused, fusedMembers, spacing);
    // A CSS/WAAPI delay can exceed the idle grace period.
    const animated = root
      .getAnimations({ subtree: true })
      .some((animation) => animation.playState === "running" || animation.pending);
    if (still < 12 || performance.now() - lastChange < 300 || animated)
      frame = requestAnimationFrame(measure);
  };
  const wake = () => {
    still = 0;
    lastChange = performance.now();
    if (!frame && visible && !document.hidden && !destroyed) frame = requestAnimationFrame(measure);
  };
  group.update = wake;
  const resize = new ResizeObserver(wake);
  resize.observe(root);
  const mutations = new MutationObserver((records) => {
    if (
      records.some(
        ({ target }) =>
          target !== surface &&
          !surface.contains(target) &&
          !(target instanceof Element && target.closest("[data-lenso-glass-optics]")),
      )
    )
      wake();
  });
  mutations.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "style",
      "class",
      "hidden",
      "data-theme",
      "data-contrast",
      "data-pressed",
      "data-variant",
      "data-tint",
      "data-disabled",
      "data-pending",
      "data-lenso-light-pressed",
      "data-lenso-key-pressed",
      "data-lenso-glass-state",
    ],
  });
  for (let ancestor = root.parentElement; ancestor; ancestor = ancestor.parentElement)
    mutations.observe(ancestor, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-contrast"],
    });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) wake();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  intersection.observe(root);
  const events = [
    "pointerdown",
    "pointerup",
    "pointercancel",
    "keydown",
    "keyup",
    "pointermove",
    "transitionrun",
    "animationstart",
    "scroll",
  ];
  for (const event of events) root.addEventListener(event, wake, true);
  window.addEventListener("resize", wake);
  document.addEventListener("visibilitychange", wake);
  for (const query of [motion, contrast, transparency]) query.addEventListener("change", wake);
  wake();
  return () => {
    destroyed = true;
    cancelAnimationFrame(retire);
    group.update = () => {};
    cancelAnimationFrame(frame);
    resize.disconnect();
    mutations.disconnect();
    intersection.disconnect();
    for (const event of events) root.removeEventListener(event, wake, true);
    window.removeEventListener("resize", wake);
    document.removeEventListener("visibilitychange", wake);
    for (const query of [motion, contrast, transparency]) query.removeEventListener("change", wake);
    surface.style.removeProperty("mask-image");
    optics?.destroy();
    surface.hidden = true;
  };
}
