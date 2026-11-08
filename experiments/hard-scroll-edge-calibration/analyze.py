"""Compare physical-device hard-edge screenshots; requires Pillow."""

import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

output = Path(sys.argv[1] if len(sys.argv) > 1 else "output/hard-scroll-edge-device")
modes = ["previous", "mygo", "trial"]
rows = []
for content, offsets in [("pattern", [0, 128, 384]), ("photo", [128])]:
    for dark in [0, 1]:
        for y in offsets:
            native = Image.open(output / f"{content}-native-{dark}-{y}.png").convert("RGB")
            assert native.size == (1290, 2796)
            row = {"content": content, "dark": dark, "y": y}
            for mode in modes:
                candidate = Image.open(output / f"{content}-{mode}-{dark}-{y}.png").convert("RGB")
                assert candidate.size == native.size
                delta = ImageChops.difference(native, candidate)
                edge = sum(ImageStat.Stat(delta.crop((0, 0, 1290, 288))).mean) / 3
                control = sum(ImageStat.Stat(delta.crop((0, 360, 1290, 1800))).mean) / 3
                assert control < 0.5, (content, mode, dark, y, control)
                row[mode] = {"edge_mae": edge, "control_mae": control}
            rows.append(row)

means = {mode: sum(row[mode]["edge_mae"] for row in rows) / len(rows) for mode in modes}
result = {
    "rows": rows,
    "mean": means,
    "reduction_from_mygo": 1 - means["trial"] / means["mygo"],
    "reduction_from_previous": 1 - means["trial"] / means["previous"],
    "note": "Offsets 0 and 384 repeat the pattern phase. Photos are held out from parameter fitting.",
}
(output / "metrics.json").write_text(json.dumps(result, indent=2) + "\n")

font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 24)
for content in ["pattern", "photo"]:
    canvas = Image.new("RGB", (1935, 570), "#ededed")
    draw = ImageDraw.Draw(canvas)
    for column, (mode, label) in enumerate(
        [("native", "iOS native hard"), ("mygo", "MyGo recipe"), ("trial", "Device-calibrated Lenso")]
    ):
        for row, dark in enumerate([0, 1]):
            shot = Image.open(output / f"{content}-{mode}-{dark}-128.png").convert("RGB")
            canvas.paste(shot.crop((0, 0, 1290, 480)).resize((645, 240)), (column * 645, row * 285 + 40))
            draw.text(
                (column * 645 + 12, row * 285 + 6),
                label + (" - Dark" if dark else " - Light"),
                fill="#111",
                font=font,
            )
    canvas.save(output / f"comparison-{content}.png")

print(json.dumps({key: value for key, value in result.items() if key != "rows"}, indent=2))
