#!/usr/bin/env python3
"""Buduje jednoplikową wersję strony (herby jako data-URI) do publikacji.
Użycie: python3 build-single.py [plik_wyjściowy]"""
import base64, json, pathlib, re, sys
src = pathlib.Path(__file__).parent
out_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else src / "dist" / "coin-live.html"
html = (src / "index.html").read_text()
css = (src / "style.css").read_text()
data = (src / "data.js").read_text()
app = (src / "app.js").read_text()
crests = {p.stem: "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode() for p in sorted((src / "herby").glob("*.png"))}
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
scripts = "<script>\n" + data + "\n</script>\n<script>window.COIN_CRESTS = " + json.dumps(crests) + ";</script>\n<script>\n" + app + "\n</script>"
body = body.replace('<script src="data.js"></script>\n<script src="app.js"></script>', scripts)
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
         '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />')
fragment = "<title>Coin Live</title>\n" + fonts + "\n<style>\n" + css + "\n</style>\n" + body
if "--fragment" in sys.argv:
    out = fragment
else:
    out = '<!DOCTYPE html>\n<html lang="pl">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n' + fragment + "\n</html>"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(out)
print(f"zapisano {out_path} ({len(out)//1024} KB, {len(crests)} herbów)")
