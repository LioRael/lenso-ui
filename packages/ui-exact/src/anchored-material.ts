// Adapted from Lenso's AnchoredMaterial; retained shared material geometry.
const arrowPaths = {
  popover: {
    inset: 13,
    points: [
      [0, 0],
      [14, 0],
      [17, 3],
      [23, 10],
      [26, 14],
      [30, 14],
      [33, 10],
      [39, 3],
      [42, 0],
      [56, 0],
    ],
  },
  tooltip: {
    inset: 12,
    points: [
      [0, 0],
      [5.48483, 8],
      [6.5, 8],
      [12, 0],
    ],
  },
} as const;

export function anchoredMaterial(
  surface: HTMLElement,
  popup: HTMLElement,
  kind: keyof typeof arrowPaths = "popover",
) {
  const { inset, points } = arrowPaths[kind];
  const mask = surface.style.maskImage;
  const shaped = surface.getAttribute("data-material-shaped");
  const ownArrow = () =>
    [...popup.querySelectorAll<HTMLElement>(`[data-slot="${kind}-arrow-material"]`)].find(
      (node) => node.closest(`[data-slot="${kind}-popup"]`) === popup,
    );
  const update = () => {
    const style = getComputedStyle(popup);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    const box = popup.getBoundingClientRect();
    if (!width || !height || !box.width || !box.height) return;
    const radius = Math.min(parseFloat(style.borderTopLeftRadius), width / 2, height / 2);
    const arrow = ownArrow();
    let path = "";
    if (arrow && getComputedStyle(arrow.parentElement!).display !== "none") {
      const arrowStyle = getComputedStyle(arrow);
      const parentStyle = getComputedStyle(arrow.parentElement!);
      const angle =
        (((parseFloat(arrowStyle.rotate) || 0) + (parseFloat(parentStyle.rotate) || 0)) * Math.PI) /
        180;
      const cosine = Math.cos(angle),
        sine = Math.sin(angle);
      const arrowWidth = parseFloat(arrowStyle.width),
        arrowHeight = parseFloat(arrowStyle.height);
      const corners: [number, number][] = [
        [0, 0],
        [arrowWidth, 0],
        [0, arrowHeight],
        [arrowWidth, arrowHeight],
      ];
      const rotatedX = corners.map(([x, y]) => x * cosine - y * sine);
      const rotatedY = corners.map(([x, y]) => x * sine + y * cosine);
      const anchor = arrow.getBoundingClientRect();
      const x = ((anchor.left - box.left) * width) / box.width + inset - Math.min(...rotatedX);
      const y = ((anchor.top - box.top) * height) / box.height + inset - Math.min(...rotatedY);
      const transformed = points.map(
        ([px, py]) => `${x + px * cosine - py * sine} ${y + px * sine + py * cosine}`,
      );
      path = `M${transformed[0]}`;
      for (let i = 1; i < transformed.length; i += 3)
        path += ` C${transformed.slice(i, i + 3).join(" ")}`;
      path += " Z";
    }
    const right = width + inset,
      bottom = height + inset;
    const arc = `A${radius} ${radius} 0 0 0`;
    const panel = `M${inset + radius} ${inset} ${arc} ${inset} ${inset + radius} V${bottom - radius} ${arc} ${inset + radius} ${bottom} H${right - radius} ${arc} ${right} ${bottom - radius} V${inset + radius} ${arc} ${right - radius} ${inset} Z`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + inset * 2}" height="${height + inset * 2}"><path fill="white" d="${panel} ${path}"/></svg>`;
    surface.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    surface.setAttribute("data-material-shaped", "");
  };
  update();
  const resize = new ResizeObserver(update);
  resize.observe(popup);
  const observer = new MutationObserver((records) => {
    if (
      records.some(
        ({ target, type }) =>
          type === "childList" || target === popup || target === ownArrow()?.parentElement,
      )
    )
      update();
  });
  observer.observe(popup, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "class", "data-side", "data-direction"],
  });
  return () => {
    resize.disconnect();
    observer.disconnect();
    surface.style.maskImage = mask;
    if (shaped === null) surface.removeAttribute("data-material-shaped");
    else surface.setAttribute("data-material-shaped", shaped);
  };
}
