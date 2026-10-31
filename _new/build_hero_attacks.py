"""Build clean 3x3 playable-hero attack atlases from the approved sheets.

Rows: side, front, back. Columns: prepare, strike, recover.
Detached islands from adjacent cells are discarded so a neighboring pose's
weapon, hair or effect cannot appear in a frame.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, label


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "_new" / "hero_attack_sources"
OUTPUT = ROOT / "a" / "hero_attack"
HEROES = ("zhenji", "wenji", "wangyi", "daqiao", "shangxiang", "yinping", "yueying")
FRAME_W, FRAME_H = 484, 362


def clean_frame(image: Image.Image, col: int, row: int) -> tuple[Image.Image, float]:
    w, h = image.size
    box = (
        round(col * w / 3), round(row * h / 3),
        round((col + 1) * w / 3), round((row + 1) * h / 3),
    )
    rgba = np.array(image.crop(box).convert("RGBA"), dtype=np.uint8)
    alpha = rgba[:, :, 3]
    components, count = label(alpha > 24, structure=np.ones((3, 3), dtype=np.uint8))
    if not count:
        raise ValueError(f"Empty attack frame at {row},{col}")
    counts = np.bincount(components.ravel())
    counts[0] = 0
    largest = int(counts.argmax())
    # A 2px halo preserves the original soft antialiasing without retaining
    # disconnected slivers from the next character/row.
    keep = binary_dilation(components == largest, iterations=2)
    removed = int(np.count_nonzero((alpha > 24) & ~keep))
    total = int(np.count_nonzero(alpha > 24))
    if total < 15000 or (total - removed) / total < 0.75:
        raise ValueError(f"Unreliable frame segmentation at {row},{col}")
    rgba[~keep, :] = 0
    frame = Image.fromarray(rgba, "RGBA")
    assert frame.width <= FRAME_W and frame.height <= FRAME_H
    return frame, removed / total


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for hero in HEROES:
        image = Image.open(SOURCE / f"{hero}.png").convert("RGBA")
        if image.size != (1448, 1086):
            raise ValueError(f"Unexpected source grid: {hero}: {image.size}")
        atlas = Image.new("RGBA", (FRAME_W * 3, FRAME_H * 3))
        fractions = []
        for row in range(3):
            for col in range(3):
                frame, removed = clean_frame(image, col, row)
                atlas.paste(frame, (col * FRAME_W, row * FRAME_H))
                fractions.append(removed)
        atlas.save(OUTPUT / f"{hero}.webp", "WEBP", lossless=True, method=6)
        print(f"{hero}: 9 clean frames; max discarded stray pixels {max(fractions):.1%}")


if __name__ == "__main__":
    main()
