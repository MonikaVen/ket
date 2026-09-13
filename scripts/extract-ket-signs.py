#!/usr/bin/env python3
"""Crop official KET 2026 sign samples from the rules PDF into public/signs/."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF_CANDIDATES = [
    Path("/home/ubuntu/.cursor/projects/workspace/uploads/ket-2026_a613.pdf"),
    ROOT / "ket-2026.pdf",
]
OUT = ROOT / "public" / "signs"
ZOOM = 5
NEEDED = {
    "101",
    "105",
    "111",
    "127",
    "128",
    "129",
    "137",
    "151",
    "201",
    "202",
    "203",
    "204",
    "301",
    "302",
    "325",
    "329",
    "332",
    "333",
    "340",
    "401",
    "402",
    "407",
    "410",
    "411",
    "412",
    "501",
    "528",
    "533",
    "552",
    "801",
    "805",
}


def find_pdf() -> Path:
    for p in PDF_CANDIDATES:
        if p.exists():
            return p
    raise SystemExit("KET 2026 PDF not found")


def trim_white(im: Image.Image, threshold: int = 248, pad: int = 10) -> Image.Image:
    rgb = im.convert("RGB")
    pixels = rgb.load()
    w, h = rgb.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r < threshold or g < threshold or b < threshold:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if max_x <= min_x or max_y <= min_y:
        return im
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w, max_x + pad + 1)
    max_y = min(h, max_y + pad + 1)
    return im.crop((min_x, min_y, max_x, max_y))


def collect(doc: pymupdf.Document) -> dict[str, tuple[int, pymupdf.Rect]]:
    found: dict[str, tuple[int, pymupdf.Rect]] = {}
    start = 111  # 1 priedas, page 112
    end = min(169, doc.page_count)
    for i in range(start, end):
        page = doc[i]
        blocks = page.get_text("dict")["blocks"]
        imgs: list[pymupdf.Rect] = []
        nums: list[tuple[str, pymupdf.Rect]] = []
        for b in blocks:
            if b.get("type") == 1:
                imgs.append(pymupdf.Rect(b["bbox"]))
            elif b.get("type") == 0:
                for line in b.get("lines", []):
                    text = "".join(s["text"] for s in line["spans"]).replace("\u200b", "").strip()
                    if re.fullmatch(r"\d{3}", text):
                        rect = pymupdf.Rect(line["bbox"])
                        if rect.y0 > 770:
                            continue
                        nums.append((text, rect))
        for code, nrect in nums:
            if code not in NEEDED or code in found:
                continue
            nd = (nrect.y0 + nrect.y1) / 2
            best: tuple[float, pymupdf.Rect] | None = None
            for ir in imgs:
                dy = abs((ir.y0 + ir.y1) / 2 - nd)
                if dy < 55 and (best is None or dy < best[0]):
                    best = (dy, ir)
            if best:
                found[code] = (i, best[1])
    return found


def main() -> None:
    pdf = find_pdf()
    doc = pymupdf.open(pdf)
    OUT.mkdir(parents=True, exist_ok=True)
    found = collect(doc)
    missing = sorted(NEEDED - set(found))
    if missing:
        print("missing", missing, file=sys.stderr)
        sys.exit(1)
    mat = pymupdf.Matrix(ZOOM, ZOOM)
    for code, (page_i, box) in sorted(found.items()):
        page = doc[page_i]
        clip = pymupdf.Rect(box) + pymupdf.Rect(-1.5, -1.5, 1.5, 1.5)
        pix = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        im = trim_white(im)
        dest = OUT / f"{code}.png"
        im.save(dest, "PNG", optimize=True)
        print(f"{code} -> {dest.name} {im.size} page {page_i + 1}")


if __name__ == "__main__":
    main()
