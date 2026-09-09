#!/usr/bin/env python3
"""Wycina głowy ze zdjęć w photos/ i zapisuje owalne PNG do assets/heads/.

Użycie:
    pip install pillow numpy "opencv-python-headless<4.13"
    python3 tools/make_heads.py            # przetwarza wszystkie zdjęcia bez gotowej głowy
    python3 tools/make_heads.py --all      # przetwarza wszystko od nowa
    python3 tools/make_heads.py nowy.jpg   # tylko wskazane pliki

Nazwa pliku w photos/ (bez rozszerzenia, małe litery, bez polskich znaków)
musi być równa `id` postaci w ROSTER w game.js.
"""
import os
import re
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, 'photos')
HEADS = os.path.join(ROOT, 'assets', 'heads')
TARGET_W, TARGET_H = 320, 380
UP, SIDE, DOWN = 0.60, 0.34, 0.28  # ile dodać wokół wykrytej twarzy (włosy, uszy, broda)


def slug(name):
    n = os.path.splitext(name)[0].lower()
    for a, b in zip('śłóąężźćń', 'sloaezzcn'):
        n = n.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '_', n).strip('_')


def detect_face(im):
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    casc2 = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')
    scale = 800 / max(im.size)
    small = im.resize((int(im.width * scale), int(im.height * scale)))
    g = cv2.cvtColor(np.array(small), cv2.COLOR_RGB2GRAY)
    faces = list(casc.detectMultiScale(g, 1.1, 5, minSize=(60, 60)))
    if not faces:
        faces = list(casc2.detectMultiScale(g, 1.05, 3, minSize=(50, 50)))
    if not faces:
        return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    return [int(v / scale) for v in (x, y, w, h)]


def make_head(path, out_path):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    face = detect_face(im)
    if face is None:
        # brak twarzy: bierzemy środek górnej części zdjęcia
        w = int(im.width * 0.5)
        face = [im.width // 2 - w // 2, int(im.height * 0.15), w, w]
        print(f'  ! nie wykryto twarzy w {os.path.basename(path)}, biorę środek')
    x, y, w, h = face
    x0, x1 = x - w * SIDE, x + w * (1 + SIDE)
    y0, y1 = y - h * UP, y + h * (1 + DOWN)
    cw, ch = x1 - x0, y1 - y0
    want = TARGET_W / TARGET_H
    if cw / ch > want:
        nh = cw / want; y0 -= (nh - ch) / 2; y1 += (nh - ch) / 2
    else:
        nw = ch * want; x0 -= (nw - cw) / 2; x1 += (nw - cw) / 2
    pad = int(max(0, -x0, -y0, x1 - im.width, y1 - im.height)) + 2
    if pad > 2:
        im = ImageOps.expand(im, pad, fill=(0, 0, 0))
        x0 += pad; x1 += pad; y0 += pad; y1 += pad
    crop = im.crop((int(x0), int(y0), int(x1), int(y1))).resize((TARGET_W, TARGET_H), Image.LANCZOS)
    mask = Image.new('L', (TARGET_W, TARGET_H), 0)
    ImageDraw.Draw(mask).ellipse([6, 6, TARGET_W - 6, TARGET_H - 6], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    crop.putalpha(mask)
    crop.save(out_path, optimize=True)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--all' in sys.argv
    os.makedirs(HEADS, exist_ok=True)
    files = args or sorted(f for f in os.listdir(PHOTOS) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
    for f in files:
        src = f if os.path.isabs(f) else os.path.join(PHOTOS, f)
        s = slug(os.path.basename(f))
        out = os.path.join(HEADS, s + '.png')
        if os.path.exists(out) and not force and not args:
            continue
        print(f'{os.path.basename(f)} -> assets/heads/{s}.png')
        make_head(src, out)
    print('gotowe')


if __name__ == '__main__':
    main()
