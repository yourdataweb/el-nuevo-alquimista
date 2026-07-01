#!/usr/bin/env python3
"""
process_sprite.py  —  Remove the checkerboard background from the player sprite tile.

The source image (public/walking/player-sprite-tile-border.png) was generated with a grey/white
checkerboard background around each character frame. This script uses a per-frame
flood-fill from the cell corners to detect and remove that connected background region,
setting those pixels to alpha=0. White/grey pixels inside the character (hair, teeth, etc.)
are preserved because they are surrounded by non-background pixels and are not reached
by the fill.

Usage:
    python3 scripts/process_sprite.py
    # Reads:  public/walking/player-sprite-tile-border.png
    # Writes: public/walking/player-sprite-tile.png

Frame layout: 5 cols × 10 rows
    Rows 0-4:  Trump  (run, jump, shoot, fall, standup)
    Rows 5-9:  Ramos  (run, jump, shoot, fall, standup)
"""

import sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
SRC = REPO_ROOT / "public" / "walking" / "player-sprite-tile-border.png"
DESTINATION = REPO_ROOT / "public" / "walking" / "player-sprite-tile.png"

COLS = 5
ROWS = 10

# Background detection: low saturation (near-grey) AND not very dark (dark outlines are kept)
BG_SAT_THRESHOLD = 30   # max(R,G,B) - min(R,G,B)  <  this → near-grey
BG_MIN_BRIGHTNESS = 60  # avg(R,G,B)  >  this        → not a dark character outline


def is_background(r: int, g: int, b: int) -> bool:
    return (max(r, g, b) - min(r, g, b)) < BG_SAT_THRESHOLD and (r + g + b) // 3 > BG_MIN_BRIGHTNESS


def flood_fill_background(cell: np.ndarray) -> np.ndarray:
    """
    Given a cell (H×W×4 RGBA array), flood-fill from all border pixels that match
    is_background(), mark those pixels alpha=0, and return the modified array.
    """
    h, w = cell.shape[:2]
    visited = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(y: int, x: int) -> None:
        if not visited[y, x]:
            r, g, b = int(cell[y, x, 0]), int(cell[y, x, 1]), int(cell[y, x, 2])
            if is_background(r, g, b):
                visited[y, x] = True
                queue.append((y, x))

    # Seed from all four edges
    for x in range(w):
        enqueue(0, x)
        enqueue(h - 1, x)
    for y in range(h):
        enqueue(y, 0)
        enqueue(y, w - 1)

    # 4-connected flood fill
    while queue:
        y, x = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                enqueue(ny, nx)

    result = cell.copy()
    result[visited, 3] = 0
    return result


def compute_frame_boundaries(total: int, count: int) -> list[int]:
    """Return count+1 pixel boundaries, evenly distributed (may vary by 1px)."""
    return [round(i * total / count) for i in range(count + 1)]


def main() -> None:
    if not SRC.exists():
        print(f"ERROR: {SRC} not found", file=sys.stderr)
        sys.exit(1)

    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img, dtype=np.uint8)
    W, H = img.size
    print(f"Loaded {SRC.name}  ({W}×{H} px, {COLS}×{ROWS} grid)")

    xs = compute_frame_boundaries(W, COLS)
    ys = compute_frame_boundaries(H, ROWS)
    print(f"Column boundaries (px): {xs}")
    print(f"Row boundaries (px):    {ys}")
    print(f"Frame sizes: cols {[xs[i+1]-xs[i] for i in range(COLS)]}, "
          f"rows {[ys[i+1]-ys[i] for i in range(ROWS)]}")

    out = arr.copy()
    total_bg = 0

    for row in range(ROWS):
        for col in range(COLS):
            y0, y1 = ys[row], ys[row + 1]
            x0, x1 = xs[col], xs[col + 1]
            cell = arr[y0:y1, x0:x1].copy()

            processed = flood_fill_background(cell)
            removed = int((processed[:, :, 3] == 0).sum() - (cell[:, :, 3] == 0).sum())
            total_bg += removed
            out[y0:y1, x0:x1] = processed

            char = "Trump" if row < 5 else "Ramos"
            actions = ["run", "jump", "shoot", "fall", "standup"]
            action = actions[row % 5]
            print(f"  [{char} {action} frame {col}]  cell ({x0},{y0})-({x1},{y1})  "
                  f"bg removed: {removed} px")

    print(f"\nTotal background pixels removed: {total_bg}")

    # Back up original then write
    bak = SRC.with_suffix(".png.bak")
    if not bak.exists():
        import shutil
        shutil.copy2(SRC, bak)
        print(f"Backup saved: {bak.name}")

    result_img = Image.fromarray(out, "RGBA")
    result_img.save(DESTINATION, optimize=False)
    print(f"Saved: {DESTINATION}")


if __name__ == "__main__":
    main()
