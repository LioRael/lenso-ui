"""Build a held-out photo backdrop from the existing public demo assets."""

from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[2]
image = Image.new("RGB", (1290, 5400))
for row, number in enumerate([0, 2, 4, 6, 8, 10]):
    with Image.open(root / f"apps/docs/public/assets/demo/photos/{number}.jpg") as photo:
        tile = ImageOps.fit(photo.convert("RGB"), (1290, 900), method=Image.Resampling.LANCZOS)
        image.paste(tile, (0, row * 900))
image.save(Path(__file__).with_name("photo.png"))
