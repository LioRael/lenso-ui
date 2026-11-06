import { copyBackdrop, findBackdrop } from "./backdrop.js";
import { lightLabel, lightStrength } from "./press-highlight.js";
import { appleShade } from "./apple-material.js";
import { paintFusionContour } from "./fusion-contour.js";
import { paintMaterialBackdrop } from "./backdrop-paints.js";
import {
  createGeometryLens,
  createMaterialLens,
  maps,
  readLens,
  refractsBackdrop,
} from "./refraction.js";
import { fusionGeometry, fusionOutline } from "./fusion-geometry.js";
import { fusionMasks, type FusionShape } from "./fusion.js";
import * as stylex from "@stylexjs/stylex";
import { glassContainerStyles } from "@lenso/tokens/glass-container";

type GeometryLens = Awaited<ReturnType<typeof createGeometryLens>>;
interface Frame {
  width: number;
  height: number;
  shapes: FusionShape[];
  spacing: number;
  members: HTMLElement[];
  outline: string;
  revision: number;
  grouped: boolean;
}

function outlineClip(outline: string) {
  const path = decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(
    / d="([^"]*)"/,
  )![1]!;
  return `path("${path}")`;
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
  const fills = members.map((member) =>
    getComputedStyle(member).getPropertyValue("--lenso-glass-material-fill"),
  );
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
  let running = false;
  let ready = false;
  let previousLight = "";
  let lightState: { shapes: FusionShape[]; members: HTMLElement[]; spacing: number } | undefined;
  let sharedMaterial = false;
  let bootstrap: ReturnType<typeof createMaterialLens> | undefined;
  let bootstrapRecipe = "";
  let materialGeneration = 0;
  let base: HTMLElement | undefined;
  let stopBase: (() => void) | undefined;
  let stopped = false;
  let current: GeometryLens[] = [];
  let retired: GeometryLens[] = [];
  const styled = new Set<HTMLElement>();
  let wanted = new Set<HTMLElement>();
  let revision = 0;
  let stopCopy: (() => void) | undefined;
  let stopPaint: (() => void) | undefined;
  const clearMember = (member: HTMLElement) => {
    member.removeAttribute("data-lenso-glass-fused");
    member.style.removeProperty("--lenso-glass-interaction-fill");
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
      member.setAttribute("data-lenso-glass-fused", "");
      member.style.setProperty("--lenso-glass-interaction-fill", "transparent");
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
      const radius = parseFloat(pointer.getPropertyValue("--lg-light-radius")) || 150;
      lights.push({ x, y, radius, opacity });
      const color = (strength: number) =>
        `color-mix(in srgb, ${style.backgroundColor} ${opacity * strength * 100}%, transparent)`;
      layers.push(
        `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${color(1)}, ${color(0.88)} 35%, ${color(0.45)} 65%, transparent)`,
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
      if (current.length) surface.style.removeProperty("--lenso-fusion-opacity");
      edge.style.removeProperty("visibility");
      if (sharedMaterial) hideMembers([...wanted]);
      paintLight();
    };
    if (backdrop) {
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
        stopBase = copyBackdrop(base, backdrop, true, reveal);
      }
      stopCopy ??= copyBackdrop(surface, backdrop, true, undefined, 80);
    } else if (refractsBackdrop()) reveal();
    else stopPaint ??= paintMaterialBackdrop(surface, true, true, reveal);
  };
  const render = async ({
    width,
    height,
    shapes,
    spacing,
    members,
    outline,
    grouped,
    revision: renderedRevision,
  }: Frame) => {
    const sample = fusionGeometry(shapes, spacing, grouped);
    const settings = members.map((member) => readLens(member));
    const baseline = settings.find(Boolean);
    if (!baseline) return;
    const recipe = JSON.stringify(settings.map((setting) => setting?.shape));
    const material = getComputedStyle(surface);
    const tint = material.getPropertyValue("--lenso-glass-container-tint").trim();
    const thickness = Math.max(
      ...shapes.map((s) => Math.min(24, Math.max(8, Math.min(s.width, s.height) * 0.2))),
    );
    const bridgeShape = {
      ...baseline.shape,
      thickness,
      materialTint: tint || baseline.shape.materialTint,
    };
    const unified = sharesFusionMaterial(surface, members, settings);
    const fields = await maps(width, height, 0, false, bridgeShape, sample);
    if (stopped) return;
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
    const masks = fusionMasks(width, height, shapes, spacing, outline);
    if (renderedRevision === revision) {
      surface.style.maskImage = unified ? "none" : masks.bridge;
      surface.style.clipPath = unified ? outlineClip(outline) : "none";
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
      edge.style.maskImage = unified ? "none" : masks.bridge;
      pressLight.style.maskImage = unified ? "none" : masks.bridge;
      pressLight.style.clipPath = unified ? outlineClip(outline) : "none";
    }
    pressLight.style.zIndex = unified ? "-1" : "2";
    edge.style.zIndex = unified ? "-1" : "1";
    members.forEach((member, index) => {
      const result = results[index + 1];
      const lens = result?.status === "fulfilled" ? result.value : undefined;
      if (!member.isConnected || !wanted.has(member)) return;
      if (unified && ready) {
        member.setAttribute("data-lenso-glass-fused", "");
        member.style.setProperty("--lenso-glass-interaction-fill", "transparent");
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
  return {
    restore() {
      const delayed = [...styled].some(
        (member) => member.hasAttribute("data-copy") || member.hasAttribute("data-material-paints"),
      );
      wanted.clear();
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
      const outline = fusionOutline(width, height, shapes, 0);
      surface.style.maskImage = "none";
      surface.style.clipPath = outlineClip(outline);
      if (base) {
        base.style.width = `${width}px`;
        base.style.height = `${height}px`;
        base.style.maskImage = "none";
        base.style.clipPath = outlineClip(outline);
      }
      paintFusionContour(
        edge,
        width,
        height,
        outline,
        fusionGeometry(shapes, 0),
        members[0] ? readLens(members[0])?.shape : undefined,
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
      if (getComputedStyle(surface).getPropertyValue("--lg-material").trim() !== "apple") return;
      const outline = fusionOutline(width, height, shapes, spacing, grouped);
      pending = { width, height, shapes, spacing, members, outline, grouped, revision: ++revision };
      const masks = fusionMasks(width, height, shapes, spacing, outline);

      const settings = members.map((member) => readLens(member));
      const baseline = settings.find(Boolean);
      const wasShared = sharedMaterial;
      sharedMaterial = sharesFusionMaterial(surface, members, settings);
      const sample = fusionGeometry(shapes, spacing, grouped);
      paintFusionContour(edge, width, height, outline, sample, baseline?.shape);
      if (!sharedMaterial && wasShared) {
        for (const member of styled) clearMember(member);
        stopBase?.();
        stopBase = undefined;
        base?.remove();
        base = undefined;
        bootstrapRecipe = "";
        ready = false;
      }
      const recipe = baseline && JSON.stringify(baseline.shape);
      if (baseline && sharedMaterial && recipe !== bootstrapRecipe) {
        bootstrapRecipe = recipe!;
        const generation = ++materialGeneration;
        const shape = baseline.shape;
        void appleShade(
          width,
          height,
          2,
          {
            mode: shape.appleMode ?? "light",
            version: shape.materialVersion,
            profile: shape.materialProfile,
            tint: shape.materialTint,
          },
          (x, y) => {
            const point = sample(x, y);
            return { y: point.localY ?? y, height: point.localHeight ?? height };
          },
        )
          .then(async (shade) => {
            const image = new Image();
            image.src = shade;
            await image.decode();
            if (
              stopped ||
              generation !== materialGeneration ||
              !sharedMaterial ||
              bootstrapRecipe !== recipe
            )
              return;
            const previous = bootstrap;
            bootstrap = createMaterialLens(shape, shade);
            if (base) base.style.setProperty("--lg-filter", bootstrap.filter);
            if (previous)
              requestAnimationFrame(() => requestAnimationFrame(() => previous.destroy()));
            if (!current.length) surface.style.setProperty("--lg-filter", bootstrap.filter);
            surface.setAttribute("data-material-filter", "");
            surface.style.zIndex = "-1";
            surface.style.removeProperty("visibility");
            startBackdrop();
          })
          .catch((error) => {
            if (!stopped) console.error(error);
          });
      }
      if (base) {
        base.style.width = `${width}px`;
        base.style.height = `${height}px`;
        base.style.maskImage = "none";
        base.style.clipPath = outlineClip(outline);
      }
      surface.style.maskImage = sharedMaterial ? "none" : masks.bridge;
      surface.style.clipPath = sharedMaterial ? outlineClip(outline) : "none";
      pressLight.style.maskImage = sharedMaterial ? "none" : masks.bridge;
      pressLight.style.clipPath = sharedMaterial ? outlineClip(outline) : "none";
      pressLight.style.zIndex = sharedMaterial ? "-1" : "2";
      edge.style.zIndex = sharedMaterial ? "-1" : "1";
      if (ready && sharedMaterial) hideMembers(members);
      if (!running) void drain();
    },
    destroy() {
      stopped = true;
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
      surface.style.removeProperty("visibility");
      surface.style.removeProperty("z-index");
      surface.style.removeProperty("clip-path");
      surface.removeAttribute("data-material-filter");
    },
  };
}
