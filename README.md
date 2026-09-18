# Toolbench — 80-tool site

Plain HTML, one stylesheet, vanilla JavaScript. No framework, no bundler, no tracking.

## Run it

```bash
cd multi-tools
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` straight off disk works too — the header and footer fall back to
built-in markup when `fetch()` is blocked by `file://`.

## Layout

```
index.html              home page: category grid + live search
header.html             injected into every page by layout.js
footer.html             same
about / contact / privacy.html
tools/<slug>.html       80 generated pages, one per tool
assets/css/style.css    the only stylesheet
assets/js/tools-data.js the catalogue — the single source of truth
assets/js/layout.js     header/footer injection, search, shared helpers
assets/js/tools/*.js    tool logic, one file per category
build.py                regenerates tools/*.html + sitemap.xml + robots.txt
```

## Adding a tool

1. Add a row to `window.TOOLS_LIST` in `assets/js/tools-data.js`:
   `["my-tool","My tool","dev","One line for the card and the meta description."]`
2. Add the implementation to the matching file in `assets/js/tools/`:
   ```js
   window.TOOL_IMPL["my-tool"] = {
     html: '<div class="field">…</div>',
     init: function (root) { /* wire it up */ }
   };
   ```
3. `python3 build.py`

Pages load only their own category script, so the catalogue can grow without slowing
any single page down.

## The twelve tools that need a back end

These ship as pages that explain what they need rather than as forms that never work:
Google index checker, domain authority, backlink checker, page speed, IP lookup,
IP geolocation, SSL checker, WHOIS, HTTP headers, URL shortener, YouTube tags,
plagiarism checker. Each needs an API key or a server socket a browser cannot open.
Wire your endpoint into the matching category file and the page picks it up.

## The four that are deliberately not built

Instagram, X, Facebook and TikTok video downloaders. They require scraping private
endpoints, which breaks each platform's terms of service and generally copies work
someone else owns. They are also a reliable way to get an ad account rejected. The
pages explain that instead.

## Before you turn ads on

The ad slots are marked-up placeholders (`.ad` in the stylesheet). Drop your AdSense
snippet in and the layout will not move. Two things to check first: AdSense needs real
policy pages (about, contact, privacy — all three are here, but rewrite the text as
your own), and it reviews sites that host downloader or plagiarism tools more harshly.

## Browser support

Modern evergreen browsers. Speech tools need Chrome, Edge or Safari; `crypto.subtle`
needs HTTPS or localhost; the GIF, QR and PDF tools load a small library from jsDelivr
on demand and say so if it fails.
