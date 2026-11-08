import { copyBackdrop, findBackdrop } from "./backdrop.js";
import { lightLabel, lightStrength } from "./press-highlight.js";
import { paintFusionContour } from "./fusion-contour.js";
import { paintMaterialBackdrop } from "./backdrop-paints.js";
import {
  createGeometryLens,
  createMaterialLens,
  readLens,
  refractsBackdrop,
  type Shape,
} from "./refraction.js";
import { fusionGeometry, fusionOutline } from "./fusion-geometry.js";
import { createFusionMask } from "./fusion-mask.js";
import { createFusionShadow } from "./fusion-shadow.js";
import { createFusionFieldRenderer } from "./fusion-field-renderer.js";
import { fusionMasks, type FusionShape } from "./fusion.js";
import * as stylex from "@stylexjs/stylex";
import { glassContainerStyles } from "@lenso/tokens/glass-container";

type GeometryLens = Awaited<ReturnType<typeof createGeometryLens>>;
interface Plane {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface Frame extends Plane {
  shapes: FusionShape[];
  spacing: number;
  members: HTMLElement[];
  outline: string;
  revision: number;
  grouped: boolean;
  settings: ReturnType<typeof readLens>[];
}

function groupMaterial(shape: Shape): Shape {
  if (
    shape.materialTint ||
    (shape.materialProfile && !["small", "clear"].includes(shape.materialProfile))
  )
    return shape;
  return { ...shape, materialSize: 1, materialSurface: "group" };
}

/** Compatible islands can stay on one material plane before their outlines meet. */
export function sharesFusionMaterial(
  surface: HTMLElement,
  members: HTMLElement[],
  settings = members.map((member) => readLens(member)),
) {
  if (getComputedStyle(surface).getPropertyValue("--lg-material").trim() !== "apple") return false;
  const baseline = settings.find(Boolean);
  if (
    !baseline ||
    baseline.shape.zoom !== 1 ||
    getComputedStyle(surface).getPropertyValue("--lenso-glass-container-tint").trim()
  )
    return false;
  const fills = members.map((member) => {
    const style = getComputedStyle(member);
    return [
      style.getPropertyValue("--lenso-glass-material-fill"),
      style.getPropertyValue("--lenso-glass-preference-paint"),
    ].join("|");
  });
  return (
    fills.every((fill) => fill === fills[0]) &&
    settings.every(
      (setting) =>
        setting &&
        Object.entries(baseline.shape).every(
          ([key, value]) =>
            key === "thickness" || value === setting.shape[key as keyof typeof setting.shape],
        ),
    )
  );
}

/** Use the native lens recipe for both the changing member edges and the neck. */
export function createFusionOptics(surface: HTMLElement) {
  const fieldsRenderer = createFusionFieldRenderer();
  const contourMask = createFusionMask(surface);
  const opticalMask = createFusionMask(surface);
  const shadow = createFusionShadow(surface);
  surface.style.visibility = "hidden";
  surface.style.setProperty("--lenso-fusion-opacity", "0");
  const edge = document.createElement("canvas");
  edge.className = stylex.props(glassContainerStyles.outline).className ?? "";
  edge.setAttribute("aria-hidden", "true");
  edge.setAttribute("data-lenso-glass-outline", "");
  edge.style.visibility = "hidden";
  edge.style.zIndex = "-1";
  const pressLight = document.createElement("div");
  pressLight.className = stylex.props(glassContainerStyles.rim).className ?? "";
  pressLight.setAttribute("aria-hidden", "true");
  pressLight.setAttribute("data-lenso-glass-union-light", "");
  pressLight.style.zIndex = "-1";
  surface.after(edge, pressLight);
  let pending: Frame | undefined;
  let latest: Frame | undefined;
  let committed: (Plane & { outline: string }) | undefined;
  let running = false;
  let ready = false;
  let previousLight = "";
  let lightState: { shapes: FusionShape[]; members: HTMLElement[]; spacing: number } | undefined;
  let sharedMaterial = false;
  let referenceContour = false;
  let bootstrap: ReturnType<typeof createMaterialLens> | undefined;
  let bootstrapRecipe = "";
  let base: HTMLElement | undefined;
  let stopBase: (() => void) | undefined;
  let stopped = false;
  let current: GeometryLens[] = [];
  let retired: GeometryLens[] = [];
  const styled = new Set<HTMLElement>();
  let wanted = new Set<HTMLElement>();
  let revision = 0;
  let stopCopy: (() => void) | undefined;
  let copyContour: boolean | undefined;
  let stopPaint: (() => void) | undefined;
  let sharedPaint = "none";
  const paintPreference = (paint: string) => {
    sharedPaint = paint;
    const value = ready && sharedMaterial ? paint : "none";
    for (const layer of [surface, base])
      if (layer && layer.style.getPropertyValue("--lenso-glass-preference-paint") !== value)
        layer.style.setProperty("--lenso-glass-preference-paint", value);
  };
  // A decoded field belongs to its original coordinate plane. Move the contour
  // immediately, but publish a new optical plane only with its decoded inputs.
  const placeOptics = () => {
    if (!committed || !latest) return;
    surface.style.left = `${committed.left}px`;
    surface.style.top = `${committed.top}px`;
    surface.style.width = `${committed.width}px`;
    surface.style.height = `${committed.height}px`;
    surface.style.maskImage = opticalMask.update(
      committed.width,
      committed.height,
      latest.outline,
      latest.left - committed.left,
      latest.top - committed.top,
      committed.outline,
    );
    surface.style.clipPath = "none";
  };
  const clearMember = (member: HTMLElement) => {
    member.removeAttribute("data-lenso-glass-fused");
    member.style.removeProperty("--lenso-glass-interaction-fill");
    member.style.removeProperty("--lenso-fusion-preference-paint");
    member.style.removeProperty("--lenso-fusion-filter");
    member.style.removeProperty("--lenso-fusion-rim");
    member.style.removeProperty("--lenso-fusion-source-reach");
    member.style.removeProperty("--lenso-fusion-rim-size");
    member.style.removeProperty("--lenso-fusion-rim-position");
    member.style.removeProperty("--lenso-fusion-opacity");
    member.style.removeProperty("--lenso-fusion-shadow");
    member.style.removeProperty("--lenso-fusion-local-light");
    lightLabel(member);
    styled.delete(member);
  };
  const hideMembers = (members: HTMLElement[]) => {
    for (const member of members) {
      if (!wanted.has(member) || !member.isConnected) continue;
      if (styled.has(member) && member.hasAttribute("data-lenso-glass-fused")) continue;
      member.setAttribute("data-lenso-glass-fused", "");
      member.style.setProperty("--lenso-glass-interaction-fill", "transparent");
      member.style.setProperty("--lenso-fusion-preference-paint", "none");
      member.style.setProperty("--lenso-fusion-local-light", "hidden");
      member.style.setProperty("--lenso-fusion-filter", "none");
      member.style.setProperty("--lenso-fusion-rim", "none");
      member.style.setProperty("--lenso-fusion-opacity", "0");
      member.style.setProperty("--lenso-fusion-shadow", "none");
      styled.add(member);
    }
  };
  const paintLight = () => {
    if (!lightState) return;
    const { shapes, members } = lightState;
    const layers: string[] = [];
    const lights: { x: number; y: number; radius: number; opacity: number }[] = [];
    members.forEach((member, index) => {
      const light = member.querySelector<HTMLElement>('[data-slot="glass-press-highlight"]');
      if (!light) return;
      const style = getComputedStyle(light);
      const opacity = Number(style.opacity);
      if (!opacity) return;
      const shape = shapes[index]!;
      const pointer = getComputedStyle(member);
      const x =
        shape.x +
        (shape.width * parseFloat(pointer.getPropertyValue("--lg-light-x") || "50%")) / 100;
      const y =
        shape.y +
        (shape.height * parseFloat(pointer.getPropertyValue("--lg-light-y") || "50%")) / 100;
      const radius = parseFloat(pointer.getPropertyValue("--lg-light-radius")) || 240;
      lights.push({ x, y, radius, opacity });
      const color = (strength: number) =>
        `color-mix(in srgb, ${style.backgroundColor} ${opacity * strength * 100}%, transparent)`;
      layers.push(
        `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${color(1)}, ${color(5 / 7)} 50%, transparent)`,
      );
    });
    members.forEach((member, index) => {
      const shape = shapes[index]!;
      const strength = Math.max(
        0,
        ...lights.map(
          ({ x, y, radius, opacity }) =>
            opacity *
            lightStrength(
              Math.hypot(shape.x + shape.width / 2 - x, shape.y + shape.height / 2 - y),
              radius,
            ),
        ),
      );
      lightLabel(member, lights.length ? strength : undefined);
    });
    const background = layers.join(", ") || "none";
    if (background !== previousLight) {
      previousLight = background;
      pressLight.style.backgroundImage = background;
    }
  };
  const startBackdrop = () => {
    const backdrop = findBackdrop(surface);
    const reveal = () => {
      if (stopped) return;
      ready = true;
      paintPreference(sharedPaint);
      if (current.length) surface.style.removeProperty("--lenso-fusion-opacity");
      edge.style.removeProperty("visibility");
      shadow.visible(referenceContour);
      if (sharedMaterial) hideMembers([...wanted]);
      paintLight();
    };
    if (backdrop) {
      if (copyContour !== referenceContour) {
        copyContour = referenceContour;
        stopCopy?.();
        stopCopy = undefined;
        stopBase?.();
        stopBase = undefined;
        base?.remove();
        base = undefined;
      }
      if (!base && bootstrap && sharedMaterial) {
        base = document.createElement("div");
        base.className = surface.className;
        base.setAttribute("aria-hidden", "true");
        base.setAttribute("data-lenso-glass-material-base", "");
        base.setAttribute("data-material-filter", "");
        base.style.cssText = surface.style.cssText;
        base.style.removeProperty("--lenso-fusion-opacity");
        base.style.setProperty("--lg-filter", bootstrap.filter);
        surface.before(base);
        stopBase = copyBackdrop(
          base,
          backdrop,
          true,
          reveal,
          0,
          false,
          referenceContour ? shadow.input : undefined,
        );
      }
      stopCopy ??= copyBackdrop(
        surface,
        backdrop,
        true,
        undefined,
        80,
        false,
        referenceContour ? shadow.input : undefined,
      );
    } else if (refractsBackdrop()) reveal();
    else stopPaint ??= paintMaterialBackdrop(surface, true, true, reveal);
  };
  const render = async ({
    left,
    top,
    width,
    height,
    shapes,
    spacing,
    members,
    outline,
    grouped,
    revision: renderedRevision,
    settings,
  }: Frame) => {
    const sample = fusionGeometry(shapes, spacing, grouped);
    const baseline = settings.find(Boolean);
    if (!baseline) return;
    const reference = members[settings.indexOf(baseline)]!;
    surface.style.setProperty("--lg-blur", `${baseline.shape.sourceBlur ?? 3}px`);
    surface.style.setProperty(
      "--lenso-glass-face-opacity",
      getComputedStyle(reference).getPropertyValue("--lenso-glass-face-opacity") || "1",
    );
    const recipe = JSON.stringify(settings.map((setting) => setting?.shape));
    const material = getComputedStyle(surface);
    const tint = material.getPropertyValue("--lenso-glass-container-tint").trim();
    const thickness = Math.max(
      ...shapes.map((s) => Math.min(24, Math.max(8, Math.min(s.width, s.height) * 0.2))),
    );
    const unified = sharesFusionMaterial(surface, members, settings);
    const bridgeShape = {
      ...(unified ? groupMaterial(baseline.shape) : baseline.shape),
      thickness,
      materialTint: tint || baseline.shape.materialTint,
    };
    // The live vector mask and exterior canvas already own these outputs for
    // a shared plane. Do not rasterize or encode fields that it never displays.
    const fields = await fieldsRenderer.render({
      width,
      height,
      shape: bridgeShape,
      shapes,
      spacing,
      grouped,
      unified,
    });
    if (stopped || !fields) return;
    surface.setAttribute("data-lenso-fusion-compute", fieldsRenderer.backend);
    surface.setAttribute("data-lenso-fusion-field", fields.accelerated ? "gpu" : "cpu");
    const bridge = createGeometryLens(
      width,
      height,
      bridgeShape,
      sample,
      unified ? { ...fields, contour: undefined } : fields,
    );
    const crops: ({ x: number; y: number; width: number; height: number } | undefined)[] = [];
    const tasks = settings.map((setting, index) => {
      if (!setting) return undefined;
      if (unified) return undefined;
      const at = shapes[index]!;
      const scaleX = at.width / setting.width;
      const scaleY = at.height / setting.height;
      const shared =
        baseline.shape.zoom === 1 &&
        Object.entries(baseline.shape).every(
          ([key, value]) =>
            key === "thickness" ||
            key === "materialTint" ||
            value === setting.shape[key as keyof typeof setting.shape],
        );
      crops[index] = shared
        ? { x: -at.x / scaleX, y: -at.y / scaleY, width: width / scaleX, height: height / scaleY }
        : undefined;
      return createGeometryLens(
        setting.width,
        setting.height,
        { ...setting.shape, thickness: thickness / Math.sqrt(scaleX * scaleY) },
        (x, y) => {
          const point = sample(at.x + x * scaleX, at.y + y * scaleY);
          return {
            ...point,
            distance: point.distance / Math.sqrt(scaleX * scaleY),
            thickness:
              point.thickness === undefined
                ? undefined
                : point.thickness / Math.sqrt(scaleX * scaleY),
            localY: point.localY === undefined ? undefined : point.localY / scaleY,
            localHeight: point.localHeight === undefined ? undefined : point.localHeight / scaleY,
          };
        },
        shared
          ? {
              ...fields,
              contour: setting.shape.materialTint ? undefined : fields.contour,
              silhouette: undefined,
              scale: fields.scale / Math.sqrt(scaleX * scaleY),
            }
          : undefined,
        crops[index],
      );
    });
    const results = await Promise.allSettled([bridge, ...tasks]);
    const generated = results.flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : [],
    );
    if (
      stopped ||
      unified !== sharedMaterial ||
      !members.some((member) => wanted.has(member)) ||
      recipe !== JSON.stringify(members.map((member) => readLens(member)?.shape)) ||
      results.some((result) => result.status === "rejected")
    ) {
      generated.forEach((lens) => lens.destroy());
      if (!stopped && results.some((result) => result.status === "rejected"))
        throw new Error("Unable to render the combined glass lens");
      return;
    }
    const neck = (results[0] as PromiseFulfilledResult<GeometryLens>).value;
    const bridgeMask = unified ? "" : fusionMasks(width, height, shapes, spacing, outline).bridge;
    if (unified) {
      committed = { left, top, width, height, outline };
      placeOptics();
    } else if (renderedRevision === revision) {
      surface.style.maskImage = bridgeMask;
      surface.style.clipPath = "none";
    }
    surface.style.zIndex = unified ? "-1" : "1";
    surface.style.setProperty("--lg-filter", neck.filter);
    surface.style.setProperty("--lg-source-reach", String(neck.sourceReach));
    surface.setAttribute("data-material-filter", "");
    surface.style.removeProperty("visibility");
    if (ready || !unified) edge.style.removeProperty("visibility");
    const rim = surface.firstElementChild as HTMLElement | null;
    if (rim) rim.style.backgroundImage = unified ? "none" : neck.rim;
    if (renderedRevision === revision) {
      const mask = unified ? contourMask.update(width, height, outline) : bridgeMask;
      edge.style.maskImage = referenceContour ? "none" : mask;
      pressLight.style.maskImage = mask;
      pressLight.style.clipPath = "none";
    }
    pressLight.style.zIndex = unified ? "-1" : "2";
    edge.style.zIndex = unified ? "-1" : "1";
    members.forEach((member, index) => {
      const result = results[index + 1];
      const lens = result?.status === "fulfilled" ? result.value : undefined;
      if (!member.isConnected || !wanted.has(member)) return;
      if (unified && ready) {
        if (styled.has(member) && member.hasAttribute("data-lenso-glass-fused")) return;
        member.setAttribute("data-lenso-glass-fused", "");
        member.style.setProperty("--lenso-glass-interaction-fill", "transparent");
        member.style.setProperty("--lenso-fusion-preference-paint", "none");
        member.style.setProperty("--lenso-fusion-filter", "none");
        member.style.setProperty("--lenso-fusion-rim", "none");
        member.style.setProperty("--lenso-fusion-opacity", "0");
        member.style.setProperty("--lenso-fusion-shadow", "none");
        member.style.setProperty("--lenso-fusion-local-light", "hidden");
        styled.add(member);
        return;
      }
      if (!lens) return;
      member.removeAttribute("data-lenso-glass-fused");
      member.style.removeProperty("--lenso-glass-interaction-fill");
      member.style.removeProperty("--lenso-fusion-preference-paint");
      member.style.removeProperty("--lenso-fusion-opacity");
      member.style.removeProperty("--lenso-fusion-shadow");
      member.style.removeProperty("--lenso-fusion-local-light");
      member.style.setProperty("--lenso-fusion-filter", lens.filter);
      member.style.setProperty("--lenso-fusion-rim", lens.rim);
      member.style.setProperty("--lenso-fusion-source-reach", String(lens.sourceReach));
      const crop = crops[index];
      if (crop) {
        member.style.setProperty("--lenso-fusion-rim-size", `${crop.width}px ${crop.height}px`);
        member.style.setProperty("--lenso-fusion-rim-position", `${crop.x}px ${crop.y}px`);
      } else {
        member.style.removeProperty("--lenso-fusion-rim-size");
        member.style.removeProperty("--lenso-fusion-rim-position");
      }
      styled.add(member);
    });
    if (ready) surface.style.removeProperty("--lenso-fusion-opacity");
    // Keep the preceding filter alive until copied backdrop layers have read the new URL.
    retired.forEach((lens) => lens.destroy());
    retired = current;
    current = generated;
    if (ready && sharedMaterial) hideMembers(members);
    startBackdrop();
  };
  const drain = async () => {
    running = true;
    try {
      while (pending && !stopped) {
        const frame = pending;
        pending = undefined;
        await render(frame);
      }
    } catch (error) {
      for (const member of styled) clearMember(member);
      surface.hidden = true;
      console.error(error);
    } finally {
      running = false;
    }
  };
  const positionLayers = (width: number, height: number) => {
    for (const layer of [edge, pressLight, base]) {
      if (!layer) continue;
      const padding = layer === edge && referenceContour ? 24 : 0;
      layer.style.left = `${(parseFloat(surface.style.left) || 0) - padding}px`;
      layer.style.top = `${(parseFloat(surface.style.top) || 0) - padding}px`;
      layer.style.width = `${width + padding * 2}px`;
      layer.style.height = `${height + padding * 2}px`;
    }
  };
  return {
    restore() {
      const delayed = [...styled].some(
        (member) => member.hasAttribute("data-copy") || member.hasAttribute("data-material-paints"),
      );
      wanted.clear();
      shadow.visible(false);
      paintPreference("none");
      pending = undefined;
      surface.style.setProperty("--lenso-fusion-opacity", "0");
      pressLight.style.backgroundImage = "none";
      previousLight = "none";
      lightState = undefined;
      for (const member of styled) clearMember(member);
      return delayed ? 32 : 0;
    },
    retiring(width: number, height: number, shapes: FusionShape[], members: HTMLElement[]) {
      if (
        !width ||
        !height ||
        getComputedStyle(surface).getPropertyValue("--lg-material").trim() !== "apple"
      )
        return;
      referenceContour = false;
      shadow.visible(false);
      positionLayers(width, height);
      const edgePixels = new Uint8Array(Math.ceil(width * 2) * Math.ceil(height * 2));
      const outline = fusionOutline(width, height, shapes, 0, false, edgePixels);
      surface.style.maskImage = contourMask.update(width, height, outline);
      surface.style.clipPath = "none";
      if (base) {
        base.style.width = `${width}px`;
        base.style.height = `${height}px`;
        base.style.maskImage = contourMask.update(width, height, outline);
        base.style.clipPath = "none";
      }
      paintFusionContour(
        edge,
        width,
        height,
        outline,
        fusionGeometry(shapes, 0),
        members[0] ? readLens(members[0])?.shape : undefined,
        edgePixels,
      );
    },
    lighting(shapes: FusionShape[], members: HTMLElement[], spacing: number) {
      lightState = { shapes, members, spacing };
      if (ready || !sharedMaterial) paintLight();
    },
    update(
      width: number,
      height: number,
      shapes: FusionShape[],
      spacing: number,
      members: HTMLElement[],
      grouped = false,
    ) {
      wanted = new Set(members);
      for (const member of styled) if (!members.includes(member)) clearMember(member);
      // Simulated DOM geometry checks have no material CSS or canvas renderer.
      if (getComputedStyle(surface).getPropertyValue("--lg-material").trim() !== "apple") {
        positionLayers(width, height);
        return;
      }
      const settings = members.map((member) => readLens(member));
      const baseline = settings.find(Boolean);
      const wasShared = sharedMaterial;
      sharedMaterial = sharesFusionMaterial(surface, members, settings);
      const contourShape: Shape | undefined =
        baseline && (sharedMaterial ? groupMaterial(baseline.shape) : baseline.shape);
      referenceContour = contourShape?.materialSurface === "group";
      // The group contour strokes a vector path; only the pixel contour uses
      // the raster support list produced alongside that path.
      const edgePixels = referenceContour
        ? undefined
        : new Uint8Array(Math.ceil(width * 2) * Math.ceil(height * 2));
      const outline = fusionOutline(width, height, shapes, spacing, grouped, edgePixels);
      latest = pending = {
        left: parseFloat(surface.style.left) || 0,
        top: parseFloat(surface.style.top) || 0,
        width,
        height,
        shapes,
        spacing,
        members,
        outline,
        grouped,
        revision: ++revision,
        settings,
      };
      const reference = members[settings.findIndex(Boolean)];
      paintPreference(
        sharedMaterial && reference
          ? getComputedStyle(reference).getPropertyValue("--lenso-glass-preference-paint").trim() ||
              "none"
          : "none",
      );
      const sample = fusionGeometry(shapes, spacing, grouped);
      if (referenceContour)
        shadow.update(width, height, outline, contourShape?.appleMode === "dark");
      shadow.visible(ready && referenceContour);
      positionLayers(width, height);
      paintFusionContour(edge, width, height, outline, sample, contourShape, edgePixels);
      const mask = sharedMaterial
        ? contourMask.update(width, height, outline)
        : fusionMasks(width, height, shapes, spacing, outline).bridge;
      edge.style.maskImage = referenceContour ? "none" : mask;
      if (!sharedMaterial && wasShared) {
        committed = undefined;
        for (const member of styled) clearMember(member);
        stopBase?.();
        stopBase = undefined;
        base?.remove();
        base = undefined;
        bootstrapRecipe = "";
        ready = false;
      }
      const materialShape = baseline && groupMaterial(baseline.shape);
      const recipe = materialShape && JSON.stringify(materialShape);
      if (baseline && sharedMaterial && recipe !== bootstrapRecipe) {
        bootstrapRecipe = recipe!;
        const previous = bootstrap;
        // The backing follows the live silhouette without stretching a shade image
        // from an earlier shape. The decoded optical plane supplies exact shading.
        bootstrap = createMaterialLens(materialShape!);
        if (base) base.style.setProperty("--lg-filter", bootstrap.filter);
        if (previous) requestAnimationFrame(() => requestAnimationFrame(() => previous.destroy()));
        if (!current.length) surface.style.setProperty("--lg-filter", bootstrap.filter);
        surface.setAttribute("data-material-filter", "");
        surface.style.zIndex = "-1";
        surface.style.removeProperty("visibility");
        startBackdrop();
      }
      if (base) {
        base.style.width = `${width}px`;
        base.style.height = `${height}px`;
        base.style.maskImage = mask;
        base.style.clipPath = "none";
      }
      surface.style.maskImage = mask;
      surface.style.clipPath = "none";
      if (sharedMaterial && committed) placeOptics();
      pressLight.style.maskImage = mask;
      pressLight.style.clipPath = "none";
      pressLight.style.zIndex = sharedMaterial ? "-1" : "2";
      edge.style.zIndex = sharedMaterial ? "-1" : "1";
      if (ready && sharedMaterial) hideMembers(members);
      if (!running) void drain();
    },
    destroy() {
      stopped = true;
      fieldsRenderer.destroy();
      surface.removeAttribute("data-lenso-fusion-compute");
      surface.removeAttribute("data-lenso-fusion-field");
      contourMask.destroy();
      opticalMask.destroy();
      shadow.destroy();
      edge.remove();
      pressLight.remove();
      pending = undefined;
      for (const member of styled) clearMember(member);
      stopCopy?.();
      stopBase?.();
      base?.remove();
      stopPaint?.();
      bootstrap?.destroy();
      current.forEach((lens) => lens.destroy());
      retired.forEach((lens) => lens.destroy());
      surface.style.removeProperty("--lenso-fusion-opacity");
      surface.style.removeProperty("--lg-filter");
      surface.style.removeProperty("--lg-source-reach");
      surface.style.removeProperty("--lenso-glass-preference-paint");
      surface.style.removeProperty("visibility");
      surface.style.removeProperty("z-index");
      surface.style.removeProperty("clip-path");
      surface.removeAttribute("data-material-filter");
    },
  };
}
