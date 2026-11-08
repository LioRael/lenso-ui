"""Compare matched physical-device captures; requires Pillow."""

import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageStat

output = Path(sys.argv[1] if len(sys.argv) > 1 else "output/scroll-edge-calibration")
rows = []
for dark in [0, 1]:
    for y in [0, 128, 384]:
        native = Image.open(output / f"ios-native-{dark}-{y}.png").convert("RGB")
        assert native.size == (1290, 2796)
        row = {"dark": dark, "y": y}
        for mode in ["baseline", "variance", "calibrated"]:
            candidate = Image.open(output / f"ios-{mode}-{dark}-{y}.png").convert("RGB")
            assert candidate.size == native.size
            delta = ImageChops.difference(native, candidate)
            edge = sum(ImageStat.Stat(delta.crop((0, 0, 1290, 288))).mean) / 3
            outside = sum(ImageStat.Stat(delta.crop((0, 360, 1290, 1800))).mean) / 3
            # A banner or mismatched offset invalidates this controlled comparison.
            assert outside < 0.5, (mode, dark, y, outside)
            row[mode] = {"edge_mae": edge, "outside_mae": outside}
        rows.append(row)

canvas = Image.new("RGB", (1290, 700), "white")
draw = ImageDraw.Draw(canvas)
for column, mode in enumerate(["native", "baseline", "calibrated"]):
    for dark, top in [(0, 30), (1, 380)]:
        capture = Image.open(output / f"ios-{mode}-{dark}-0.png").convert("RGB")
        canvas.paste(capture.crop((0, 0, 1290, 900)).resize((430, 300)), (column * 430, top))
        draw.text((column * 430 + 12, top - 20), mode + (" dark" if dark else ""), fill="black")
canvas.save(output / "comparison.png")
(output / "metrics.json").write_text(json.dumps(rows, indent=2) + "\n")
before = sum(row["baseline"]["edge_mae"] for row in rows) / len(rows)
after = sum(row["calibrated"]["edge_mae"] for row in rows) / len(rows)
print(json.dumps({"before": before, "after": after, "reduction": 1 - after / before}, indent=2))
