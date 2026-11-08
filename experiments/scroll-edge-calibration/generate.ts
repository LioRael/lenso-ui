import {
  softEdgeBands,
  softEdgeMask,
  softEdgeTintMask,
} from "../../packages/ui/src/utils/materials/soft-edge.js";

// Capture the shipped recipe, then change only incremental filter radii.
const baseline = [0.5, 1, 2, 4, 8, 16].map((blur, index) => ({
  blur,
  mask: softEdgeMask(60 - index * 12, 100 - index * 12),
}));
const variance = baseline.map((band, index) => ({
  ...band,
  blur: Math.sqrt(band.blur ** 2 - (baseline[index - 1]?.blur ?? 0) ** 2),
}));
const calibrated = variance.map((band) => ({ ...band, blur: band.blur * 0.28 }));
const refined = variance.map((band, index) => ({
  blur: band.blur * (3.4 / 16),
  mask: softEdgeMask(12.5 - index * 2.5, 100 - index * 2.5),
}));
const trials = Object.fromEntries(
  (
    [
      ["A", 4.2, 2.2, false],
      ["B", 4.2, 2.5, true],
      ["C", 4.0, 2.0, true],
      ["D", 4.0, 1.9, false],
    ] as const
  ).map(([name, peak, power, topOnly]) => {
    const levels = [0.10625, 0.2125, 0.425, 0.85, 1.7, 3.4].map((r, i) =>
      topOnly ? (i === 5 ? peak : r) : (r * peak) / 3.4,
    );
    return [
      name,
      levels.map((r, i) => ({
        blur: Math.sqrt(r * r - (levels[i - 1] ?? 0) ** 2),
        mask: softEdgeMask(12.5 - i * 2.5, 100 - i * 2.5, !topOnly || i === 5 ? power : 1),
      })),
    ];
  }),
);
for (const [name, peak, extent] of [
  ["E", 4.2, 25],
  ["F", 4.2, 35],
  ["G", 4.0, 25],
] as const) {
  // Merge the two subpixel tail levels to reserve a filter for the bar shoulder.
  trials[name] = [refined[0]!, ...refined.slice(2)].map((band, index) => ({
    ...band,
    blur: index === 0 ? 0.2125 : band.blur,
  }));
  trials[name].push({ blur: Math.sqrt(peak ** 2 - 3.4 ** 2), mask: softEdgeMask(0, extent) });
}
trials.H = [0.1384375, 0.276875, 0.55375, 1.1075, 2.215, 4.43].map((hi, index, levels) => {
  const lo = levels[index - 1] ?? 0;
  const start = 100 * (1 - (hi / 4.43) ** (1 / 1.41));
  const end = 100 * (1 - (lo / 4.43) ** (1 / 1.41));
  const stops = Array.from({ length: 17 }, (_, i) => {
    const position = start + ((end - start) * i) / 16;
    const desired = 4.43 * Math.max(0, 1 - position / 100) ** 1.41;
    const alpha = Math.max(0, Math.min(1, (desired ** 2 - lo ** 2) / (hi ** 2 - lo ** 2)));
    return `rgb(0 0 0 / ${alpha.toFixed(5)}) ${position}%`;
  });
  return {
    blur: Math.sqrt(hi ** 2 - lo ** 2),
    mask: `linear-gradient(var(--material-edge-direction), ${stops.join(", ")})`,
  };
});
trials.current = softEdgeBands;
await Bun.write(
  new URL("web.html", import.meta.url),
  `<!doctype html>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;height:100%;overflow:hidden}
#viewport{position:absolute;inset:0;overflow:auto;scrollbar-width:none}
img{display:block;width:100%;height:1800px}
#edge{position:absolute;inset:0 0 auto;height:96px;pointer-events:none}
#edge span{position:absolute;inset:0}
</style>
<div id="viewport"><img src="pattern.png"></div><div id="edge"></div>
<script>
const q=new URLSearchParams(location.search),dark=q.get('dark')==='1';
document.body.style.background=dark?'black':'white';
document.documentElement.style.setProperty('--material-edge-direction','to bottom');
const bands=${JSON.stringify({ baseline, variance, calibrated, refined })};
const trials=${JSON.stringify(trials)},trial=q.get('trial'),tuning=q.get('mode')==='refined'&&trials[trial];
for(const {blur,mask} of tuning||bands[q.get('mode')||'baseline']){
 const layer=document.createElement('span');layer.style.backdropFilter='blur('+blur+'px)';
 layer.style.webkitBackdropFilter=layer.style.backdropFilter;layer.style.maskImage=mask;edge.append(layer);
}
const tint=document.createElement('span');tint.style.background=dark?'rgb(0 0 0 / .55)':'rgb(255 255 255 / .85)';
tint.style.opacity=q.get('mode')==='refined'?(dark?'.81':'.42'):q.get('mode')==='calibrated'?(dark?'.84':'.45'):'.22';
if(tuning&&(trial==='C'||trial==='D'||trial==='G'))tint.style.opacity=dark?'.83':'.435';
tint.style.maskImage=q.get('mode')==='refined'?${JSON.stringify(softEdgeTintMask)}:${JSON.stringify(softEdgeMask())};edge.append(tint);
document.querySelector('img').src=q.get('image')==='photo'?'photo.png':'pattern.png';
document.querySelector('#viewport').scrollTop=Number(q.get('y')||128);
</script>`,
);
