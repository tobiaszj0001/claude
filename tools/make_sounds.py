#!/usr/bin/env python3
"""Buduje sounds/manifest.json z nagrań w sounds/ i w razie potrzeby konwertuje je na mp3.

Nazwa pliku: <id postaci>_<zdarzenie>[numer].<rozszerzenie>
  np. cypis_intro.m4a, cypis_obrywa.mp3, cypis_obrywa2.mp3, krol_pala_wygrana.ogg
Zdarzenia: intro (przed walką), cios (gdy trafia), obrywa (gdy dostaje), blok,
           ko (gdy pada), wygrana (gdy wygrywa), wybor (kliknięcie w menu wyboru)
Kilka wariantów tego samego zdarzenia = losowanie w grze.

Użycie:  python3 tools/make_sounds.py\n(konwersja z m4a/ogg/wav wymaga ffmpeg albo: pip install imageio-ffmpeg)
"""
import json
import os
import re
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOUNDS = os.path.join(ROOT, 'sounds')
EVENTS = ['intro', 'cios', 'obrywa', 'blok', 'ko', 'wygrana', 'wybor', 'moc']
CONVERT = ('.m4a', '.ogg', '.wav', '.aac', '.opus', '.webm', '.mp4', '.caf', '.3gp', '.amr')
PAT = re.compile(r'^(?P<id>[a-z0-9_]+?)_(?P<ev>' + '|'.join(EVENTS) + r')(?P<n>\d*)$')


def slug(name):
    n = name.lower()
    for a, b in zip('śłóąężźćń', 'sloaezzcn'):
        n = n.replace(a, b)
    return re.sub(r'[^a-z0-9_]+', '_', n).strip('_')


def main():
    manifest = {}
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        try:
            import imageio_ffmpeg  # pip install imageio-ffmpeg
            ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception:
            ffmpeg = None
    for f in sorted(os.listdir(SOUNDS)):
        base, ext = os.path.splitext(f)
        ext = ext.lower()
        if ext == '.json':
            continue
        src = os.path.join(SOUNDS, f)
        if ext in CONVERT:
            if not ffmpeg:
                print(f'  ! {f}: brak ffmpeg, nie mogę skonwertować na mp3'); continue
            out = os.path.join(SOUNDS, slug(base) + '.mp3')
            if not os.path.exists(out):
                print(f'{f} -> {os.path.basename(out)}')
                subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '44100',
                                '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-b:a', '96k', out], check=True)
            os.remove(src)
            f, base, ext = os.path.basename(out), slug(base), '.mp3'
        elif ext != '.mp3':
            print(f'  ! pomijam {f} (nieznany format)'); continue
        m = PAT.match(base)
        if not m:
            print(f'  ! {f}: zła nazwa, ma być <id>_<zdarzenie>[numer].mp3, np. cypis_obrywa2.mp3'); continue
        manifest.setdefault(m['id'], {}).setdefault(m['ev'], []).append(f)
    with open(os.path.join(SOUNDS, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=1, ensure_ascii=False)
    print(json.dumps(manifest, indent=1, ensure_ascii=False) if manifest else 'brak nagrań, manifest pusty')


if __name__ == '__main__':
    main()
