"""Compare selected recipes on matched pattern and photo captures."""

import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageStat

output = Path(sys.argv[1] if len(sys.argv) > 1 else "output/scroll-edge-refinement")
before_mode = sys.argv[2] if len(sys.argv) > 2 else "calibrated"
after_mode = sys.argv[3] if len(sys.argv) > 3 else "refined"
rows = []
for prefix in ["", "photo-"]:
    for dark in [0, 1]:
        for y in [0, 128, 384]:
            native = Image.open(output / f"{prefix}ios-native-{dark}-{y}.png").convert("RGB")
            assert native.size == (1290, 2796)
            row = {"image": "photo" if prefix else "pattern", "dark": dark, "y": y}
            for mode in [before_mode, after_mode]:
                candidate = Image.open(output / f"{prefix}ios-{mode}-{dark}-{y}.png").convert("RGB")
                assert candidate.size == native.size
                delta = ImageChops.difference(native, candidate)
                edge = sum(ImageStat.Stat(delta.crop((0, 0, 1290, 288))).mean) / 3
                outside = sum(ImageStat.Stat(delta.crop((0, 360, 1290, 1800))).mean) / 3
                assert outside < 0.5, (prefix, mode, dark, y, outside)
                row[mode] = {"mae": edge, "outside": outside}
            rows.append(row)

canvas = Image.new("RGB", (1290, 840), "white")
draw = ImageDraw.Draw(canvas)
for row, (prefix, dark, y) in enumerate([("", 0, 0), ("", 1, 0), ("photo-", 0, 128), ("photo-", 1, 128)]):
    for column, mode in enumerate(["native", before_mode, after_mode]):
        capture = Image.open(output / f"{prefix}ios-{mode}-{dark}-{y}.png").convert("RGB")
        canvas.paste(capture.crop((0, 0, 1290, 540)).resize((430, 180)), (column * 430, row * 210 + 30))
        draw.text((column * 430 + 10, row * 210 + 8), mode + (" dark" if dark else " light"), fill="black")
canvas.save(output / "comparison.png")
(output / "metrics.json").write_text(json.dumps(rows, indent=2) + "\n")
for image in ["pattern", "photo"]:
    group = [row for row in rows if row["image"] == image]
    before = sum(row[before_mode]["mae"] for row in group) / len(group)
    after = sum(row[after_mode]["mae"] for row in group) / len(group)
    print(json.dumps({"image": image, "before": before, "after": after, "reduction": 1 - after / before}))
