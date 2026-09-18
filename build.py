#!/usr/bin/env python3
"""Writes tools/<slug>.html for every entry in assets/js/tools-data.js.

Run it after editing the catalogue:  python3 build.py
Each page is a thin shell: shared CSS, the catalogue, the layout script and the
one category script that holds this tool's logic.
"""
import json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://example.com"

CAT_FILE = {
    "image": "image", "seo": "seo", "text": "text", "dev": "dev",
    "math": "math", "unit": "unit", "security": "security", "social": "social",
}
CAT_LABEL = {
    "image": "Image tools", "seo": "SEO tools", "text": "Text tools",
    "dev": "Developer tools", "math": "Calculators", "unit": "Unit converters",
    "security": "Security tools", "social": "Social media tools",
}

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{name} — Toolbench</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}/tools/{slug}.html">
<meta property="og:type" content="website">
<meta property="og:title" content="{name}">
<meta property="og:description" content="{desc}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
{{"@type":"ListItem","position":1,"name":"Home","item":"{site}/"}},
{{"@type":"ListItem","position":2,"name":"{cat_label}","item":"{site}/#{cat}"}},
{{"@type":"ListItem","position":3,"name":"{name}"}}]}}
</script>
</head>
<body>

<main id="main" class="wrap">
  <p class="crumb"><a href="../index.html">Home</a> / <a href="../index.html#{cat}">{cat_label}</a> / {name}</p>
  <div class="tool-head">
    <h1>{name}</h1>
    <p>{desc}</p>
  </div>

  <div class="layout">
    <div>
      <div class="panel" id="tool">
        <p>Loading the tool…</p>
      </div>
      <div class="ad ad-inline">Ad space — 336×280</div>
      <div class="related" id="related"></div>
    </div>
    <aside>
      <div class="ad ad-rail">Ad space — 300×600 skyscraper</div>
    </aside>
  </div>
</main>

<noscript><div class="wrap"><div class="note">This tool needs JavaScript, because the work happens in your
browser rather than on a server.</div></div></noscript>

<script src="../assets/js/tools-data.js"></script>
<script src="../assets/js/tools/{impl}.js"></script>
<script>window.PAGE_TOOL = "{slug}";</script>
<script src="../assets/js/layout.js"></script>
</body>
</html>
"""


def catalogue():
    src = open(os.path.join(ROOT, "assets/js/tools-data.js"), encoding="utf-8").read()
    body = src.split("window.TOOLS_LIST = [", 1)[1].split("\n];", 1)[0]
    rows = re.findall(r'\[("(?:[^"\\]|\\.)*".*?)\]\s*,?\s*(?://.*)?$', body, re.M)
    tools = []
    for row in rows:
        parts = json.loads("[" + row + "]")
        tools.append({
            "slug": parts[0], "name": parts[1], "cat": parts[2],
            "desc": parts[3], "server": parts[4] if len(parts) > 4 else 0,
        })
    return tools


def main():
    tools = catalogue()
    out = os.path.join(ROOT, "tools")
    os.makedirs(out, exist_ok=True)
    for t in tools:
        html = PAGE.format(
            site=SITE, slug=t["slug"], name=t["name"], desc=t["desc"].replace('"', "&quot;"),
            cat=t["cat"], cat_label=CAT_LABEL[t["cat"]], impl=CAT_FILE[t["cat"]],
        )
        open(os.path.join(out, t["slug"] + ".html"), "w", encoding="utf-8").write(html)

    # sitemap
    urls = ["%s/" % SITE] + ["%s/tools/%s.html" % (SITE, t["slug"]) for t in tools] + \
           ["%s/%s.html" % (SITE, p) for p in ("about", "contact", "privacy")]
    body = "\n".join("  <url><loc>%s</loc><changefreq>monthly</changefreq></url>" % u for u in urls)
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % body)
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(
        "User-agent: *\nDisallow:\n\nSitemap: %s/sitemap.xml\n" % SITE)
    print("wrote %d tool pages, sitemap.xml and robots.txt" % len(tools))


if __name__ == "__main__":
    main()
