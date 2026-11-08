function layers(value) {
  const result = [];
  let depth = 0,
    start = 0;
  for (let at = 0; at < value.length; at++) {
    if (value[at] === "(") depth++;
    else if (value[at] === ")") depth--;
    else if (value[at] === "," && depth === 0) {
      result.push(value.slice(start, at).trim());
      start = at + 1;
    }
  }
  result.push(value.slice(start).trim());
  return result;
}

function length(value, extent) {
  if (/^-?[\d.]+px$/.test(value)) return parseFloat(value);
  if (/^-?[\d.]+%$/.test(value)) return (parseFloat(value) * extent) / 100;
  if (value === "0") return 0;
  const calc = /^calc\((-?[\d.]+)% ([+-]) ([\d.]+)px\)$/.exec(value);
  if (calc) return (Number(calc[1]) * extent) / 100 + (calc[2] === "+" ? 1 : -1) * Number(calc[3]);
  throw new Error("Unsupported mask length");
}

/** Rasterize the resolved gradient masks used by Tabs and ScrollShadow. */
export function paintMask(document, style, width, height, density) {
  const canvas = document.createElement("canvas"),
    layer = document.createElement("canvas");
  canvas.width = layer.width = Math.ceil(width * density);
  canvas.height = layer.height = Math.ceil(height * density);
  const result = canvas.getContext("2d"),
    context = layer.getContext("2d");
  const images = layers(style.maskImage),
    sizes = layers(style.maskSize),
    positions = layers(style.maskPosition),
    composites = layers(style.maskComposite),
    repeats = layers(style.maskRepeat);
  try {
    for (let at = images.length - 1; at >= 0; at--) {
      const image = images[at];
      if (image === "none") continue;
      const size = sizes[at % sizes.length].split(/\s+/),
        position = positions[at % positions.length].split(/\s+/);
      if (size.length > 2 || position.length !== 2) return;
      const w = size[0] === "auto" ? width : length(size[0], width),
        h = !size[1] || size[1] === "auto" ? height : length(size[1], height),
        x = length(position[0], width - w),
        y = length(position[1], height - h);
      const repeat = repeats[at % repeats.length];
      if (
        repeat !== "no-repeat" &&
        !(repeat === "repeat" && w === width && h === height && x === 0 && y === 0)
      )
        return;
      context.resetTransform();
      context.clearRect(0, 0, layer.width, layer.height);
      context.scale(density, density);
      if (w > 0 && h > 0) {
        const match = /^(linear|radial)-gradient\((.*)\)$/.exec(image);
        if (!match) return;
        const parts = layers(match[2]);
        let gradient, extent;
        if (match[1] === "radial") {
          if (parts.shift() !== "circle closest-side") return;
          extent = Math.min(w, h) / 2;
          gradient = context.createRadialGradient(
            x + w / 2,
            y + h / 2,
            0,
            x + w / 2,
            y + h / 2,
            extent,
          );
        } else {
          const angle = /deg$/.test(parts[0]) ? parseFloat(parts.shift()) : 180;
          const theta = (angle * Math.PI) / 180,
            dx = Math.sin(theta),
            dy = -Math.cos(theta);
          extent = Math.abs(w * dx) + Math.abs(h * dy);
          gradient = context.createLinearGradient(
            x + w / 2 - (dx * extent) / 2,
            y + h / 2 - (dy * extent) / 2,
            x + w / 2 + (dx * extent) / 2,
            y + h / 2 + (dy * extent) / 2,
          );
        }
        for (const [index, stop] of parts.entries()) {
          const parsed = /^(rgba?\([^()]*\))(?:\s+(.*))?$/.exec(stop);
          if (!parsed) return;
          const offsets = parsed[2] ? parsed[2].match(/calc\([^()]*\)|-?[\d.]+(?:px|%)/g) : [];
          if (parsed[2] && !offsets?.length) return;
          for (const offset of offsets?.length ? offsets : [null])
            gradient.addColorStop(
              offset === null
                ? index / (parts.length - 1)
                : Math.max(0, Math.min(1, length(offset, extent) / extent)),
              parsed[1],
            );
        }
        context.fillStyle = gradient;
        context.fillRect(x, y, w, h);
      }
      const composite = composites[at % composites.length];
      const operations = {
        add: "source-over",
        subtract: "source-out",
        intersect: "source-in",
        exclude: "xor",
      };
      if (!operations[composite]) return;
      result.globalCompositeOperation = operations[composite];
      result.drawImage(layer, 0, 0);
    }
    return canvas.toDataURL();
  } catch {
    return;
  } finally {
    canvas.width = canvas.height = layer.width = layer.height = 1;
  }
}
