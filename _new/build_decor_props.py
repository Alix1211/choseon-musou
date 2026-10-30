"""Cut approved, transparent six-object reference sheets into game sprites.

This is strictly mechanical cropping: pixels, palette, and alpha are preserved.
Original sheets are kept under a/decor_source for repeatable builds.
"""

from pathlib import Path
from PIL import Image


BASE = Path(__file__).resolve().parent.parent
SOURCE = BASE / "a" / "decor_source"
OUTPUT = BASE / "a" / "decor_props"

# (source sheet, output name, x0, y0, x1, y1), source images 1536 x 1024.
# Boundaries intentionally follow the actual art, not an assumed equal grid.
CUTS = [
    ("wei_sheet.png", "wei_flag", 0, 0, 505, 550),
    ("wei_sheet.png", "wei_tent", 505, 0, 1093, 570),
    ("wei_sheet.png", "wei_arms", 1093, 0, 1536, 552),
    ("wei_sheet.png", "wei_supply", 0, 552, 555, 1024),
    ("wei_sheet.png", "wei_palisade", 555, 552, 1090, 1024),
    ("wei_sheet.png", "wei_drum", 1090, 540, 1536, 1024),
    ("wu_shu_sheet.png", "wu_flag", 0, 0, 475, 500),
    ("wu_shu_sheet.png", "wu_tent", 475, 0, 1080, 500),
    ("wu_shu_sheet.png", "wu_naval", 1080, 0, 1536, 500),
    ("wu_shu_sheet.png", "shu_flag", 0, 500, 475, 1024),
    ("wu_shu_sheet.png", "shu_tent", 475, 500, 1100, 1024),
    ("wu_shu_sheet.png", "shu_gong", 1100, 500, 1536, 1024),
    ("interior_sheet.png", "han_bed", 0, 0, 565, 545),
    ("interior_sheet.png", "han_table", 565, 0, 1080, 545),
    ("interior_sheet.png", "han_jars", 1080, 0, 1536, 535),
    ("interior_sheet.png", "han_screen", 0, 535, 635, 1024),
    ("interior_sheet.png", "han_lanterns", 635, 535, 1150, 1024),
    ("interior_sheet.png", "han_incense", 1150, 535, 1536, 1024),
]


def main():
    OUTPUT.mkdir(exist_ok=True, parents=True)
    cache = {}
    for file, name, x0, y0, x1, y1 in CUTS:
        if file not in cache:
            cache[file] = Image.open(SOURCE / file).convert("RGBA")
        src = cache[file]
        if not (0 <= x0 < x1 <= src.width and 0 <= y0 < y1 <= src.height):
            raise ValueError(f"out of bounds: {name}")
        crop = src.crop((x0, y0, x1, y1))
        alpha = crop.getchannel("A")
        # Ignore the nearly invisible border noise when calculating bounds.
        box = alpha.point(lambda n: 255 if n > 24 else 0).getbbox()
        if not box:
            raise ValueError(f"empty image: {name}")
        pad = 6
        left, top, right, bottom = box
        box = (max(0, left-pad), max(0, top-pad),
               min(crop.width, right+pad), min(crop.height, bottom+pad))
        result = crop.crop(box)
        result.save(OUTPUT / f"{name}.png")
        print(name, f"{result.width}x{result.height}")


if __name__ == "__main__":
    main()
