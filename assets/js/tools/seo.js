/* SEO tools that can run without a server. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  window.TOOL_IMPL["meta-tag-generator"] = {
    html: '<div class="field"><label for="title">Page title</label><input type="text" id="title" value="Free online tools that run in your browser"></div>' +
      '<div class="field"><label for="desc">Meta description</label><textarea id="desc" style="min-height:80px">Eighty small tools for images, text, code and numbers. Nothing you paste is uploaded.</textarea></div>' +
      '<div class="row"><div class="field"><label for="url">Canonical URL</label><input type="text" id="url" value="https://example.com/"></div>' +
      '<div class="field"><label for="img">Social share image</label><input type="text" id="img" value="https://example.com/share.png"></div></div>' +
      '<div class="row"><div class="field"><label for="author">Author</label><input type="text" id="author" value="Example"></div>' +
      '<div class="field"><label for="robots">Robots</label><select id="robots">' +
      '<option>index, follow</option><option>noindex, follow</option><option>index, nofollow</option><option>noindex, nofollow</option></select></div>' +
      '<div class="field"><label for="type">Open Graph type</label><select id="type"><option>website</option><option>article</option><option>product</option></select></div></div>' +
      '<div class="stats"><div class="stat"><b id="tl">0</b><span>Title characters</span></div>' +
      '<div class="stat"><b id="dl">0</b><span>Description characters</span></div></div>' +
      '<div class="out" id="out"></div><div class="btns"><button class="btn" id="copy">Copy the tags</button></div>' +
      '<div class="note">Google usually shows about 60 characters of a title and 155 of a description. ' +
      'Longer is not penalised; it is just cut off.</div>',
    init: function (root) {
      function run() {
        var g = function (id) { return esc($("#" + id, root).value.trim()); };
        var t = g("title"), d = g("desc"), u = g("url"), i = g("img");
        $("#tl", root).textContent = $("#title", root).value.length;
        $("#dl", root).textContent = $("#desc", root).value.length;
        $("#out", root).textContent = [
          "<title>" + t + "</title>",
          '<meta name="description" content="' + d + '">',
          '<meta name="author" content="' + g("author") + '">',
          '<meta name="robots" content="' + g("robots") + '">',
          '<link rel="canonical" href="' + u + '">',
          "",
          '<meta property="og:type" content="' + g("type") + '">',
          '<meta property="og:title" content="' + t + '">',
          '<meta property="og:description" content="' + d + '">',
          '<meta property="og:url" content="' + u + '">',
          '<meta property="og:image" content="' + i + '">',
          "",
          '<meta name="twitter:card" content="summary_large_image">',
          '<meta name="twitter:title" content="' + t + '">',
          '<meta name="twitter:description" content="' + d + '">',
          '<meta name="twitter:image" content="' + i + '">'
        ].join("\n");
      }
      $$("input,textarea,select", root).forEach(function (e) { e.addEventListener("input", run); });
      run();
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["keyword-density-checker"] = {
    html: '<div class="field"><label for="t">Paste your page copy</label><textarea id="t" style="min-height:190px"></textarea></div>' +
      '<div class="row"><div class="field"><label for="n">Phrase length</label>' +
      '<select id="n"><option value="1">Single words</option><option value="2">Two-word phrases</option>' +
      '<option value="3">Three-word phrases</option></select></div>' +
      '<div class="field"><label for="stop">Ignore common words</label>' +
      '<select id="stop"><option value="1">Yes</option><option value="0">No</option></select></div></div>' +
      '<div class="stats"><div class="stat"><b id="total">0</b><span>Words</span></div>' +
      '<div class="stat"><b id="uniq">0</b><span>Unique words</span></div></div>' +
      '<table class="data"><thead><tr><th>Phrase</th><th>Count</th><th>Density</th></tr></thead><tbody id="rows"></tbody></table>',
    init: function (root) {
      var stop = ("the a an and or but of to in on for with is are was were be been it its this that these those " +
        "as at by from up out if then than so we you your our their his her they i not no do does did have has had " +
        "will would can could should about into over more most other some such only own same very").split(" ");
      function run() {
        var raw = $("#t", root).value.toLowerCase().match(/[a-z\u00C0-\u024F'-]+/g) || [];
        var words = +$("#stop", root).value ? raw.filter(function (w) { return stop.indexOf(w) < 0 && w.length > 2; }) : raw;
        var n = +$("#n", root).value, grams = {}, list = n === 1 ? words : [];
        if (n > 1) for (var i = 0; i + n <= words.length; i++) list.push(words.slice(i, i + n).join(" "));
        list.forEach(function (g) { grams[g] = (grams[g] || 0) + 1; });
        $("#total", root).textContent = raw.length;
        $("#uniq", root).textContent = Object.keys(grams).length;
        var rows = Object.keys(grams).sort(function (a, b) { return grams[b] - grams[a]; }).slice(0, 25);
        $("#rows", root).innerHTML = rows.map(function (g) {
          var pct = list.length ? (grams[g] / list.length * 100).toFixed(2) : "0";
          return "<tr><td>" + g + "</td><td>" + grams[g] + "</td><td>" + pct + "%</td></tr>";
        }).join("") || '<tr><td colspan="3">Paste some text to see its keyword mix.</td></tr>';
      }
      $$("textarea,select", root).forEach(function (e) { e.addEventListener("input", run); }); run();
    }
  };

  window.TOOL_IMPL["sitemap-generator"] = {
    html: '<div class="field"><label for="t">One URL per line</label>' +
      '<textarea id="t" style="min-height:170px">https://example.com/\nhttps://example.com/about\nhttps://example.com/contact</textarea></div>' +
      '<div class="row"><div class="field"><label for="freq">Change frequency</label>' +
      '<select id="freq"><option value="">Leave it out</option><option>daily</option><option selected>weekly</option>' +
      '<option>monthly</option><option>yearly</option></select></div>' +
      '<div class="field"><label for="pri">Priority</label><input type="number" id="pri" value="0.8" step="0.1" min="0" max="1"></div>' +
      '<div class="field"><label for="mod">Last modified</label><input type="date" id="mod"></div></div>' +
      '<div class="btns"><button class="btn" id="go">Build the sitemap</button>' +
      '<button class="btn ghost" id="copy">Copy</button>' +
      '<button class="btn ghost" id="dl">Download sitemap.xml</button></div><div class="out" id="out"></div>',
    init: function (root) {
      $("#mod", root).value = new Date().toISOString().slice(0, 10);
      function build() {
        var urls = $("#t", root).value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        var freq = $("#freq", root).value, pri = $("#pri", root).value, mod = $("#mod", root).value;
        var body = urls.map(function (u) {
          return "  <url>\n    <loc>" + esc(u) + "</loc>" +
            (mod ? "\n    <lastmod>" + mod + "</lastmod>" : "") +
            (freq ? "\n    <changefreq>" + freq + "</changefreq>" : "") +
            (pri ? "\n    <priority>" + pri + "</priority>" : "") + "\n  </url>";
        }).join("\n");
        return '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>";
      }
      $("#go", root).addEventListener("click", function () { $("#out", root).textContent = build(); });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent || build(), e.target); });
      $("#dl", root).addEventListener("click", function () {
        download(new Blob([$("#out", root).textContent || build()], { type: "application/xml" }), "sitemap.xml");
      });
      $("#go", root).click();
    }
  };

  window.TOOL_IMPL["robots-txt-generator"] = {
    html: '<div class="row"><div class="field"><label for="mode">Default rule</label>' +
      '<select id="mode"><option value="all">Allow every crawler</option>' +
      '<option value="none">Block every crawler</option></select></div>' +
      '<div class="field"><label for="delay">Crawl delay (seconds, optional)</label><input type="number" id="delay" min="0"></div></div>' +
      '<div class="field"><label for="dis">Paths to block, one per line</label>' +
      '<textarea id="dis" style="min-height:110px">/admin/\n/cart\n/*?sort=</textarea></div>' +
      '<div class="field"><label for="map">Sitemap URL</label><input type="text" id="map" value="https://example.com/sitemap.xml"></div>' +
      '<div class="btns"><button class="btn" id="copy">Copy</button>' +
      '<button class="btn ghost" id="dl">Download robots.txt</button></div><div class="out" id="out"></div>' +
      '<div class="note">robots.txt asks crawlers not to fetch a page; it does not keep the page out of search ' +
      'results or hide it from people. Use a noindex meta tag or a password for that.</div>',
    init: function (root) {
      function build() {
        var lines = ["User-agent: *"];
        if ($("#mode", root).value === "none") lines.push("Disallow: /");
        else {
          var paths = $("#dis", root).value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
          if (!paths.length) lines.push("Disallow:");
          paths.forEach(function (p) { lines.push("Disallow: " + p); });
        }
        var d = $("#delay", root).value;
        if (d) lines.push("Crawl-delay: " + d);
        var m = $("#map", root).value.trim();
        if (m) lines.push("", "Sitemap: " + m);
        $("#out", root).textContent = lines.join("\n");
      }
      $$("input,select,textarea", root).forEach(function (e) { e.addEventListener("input", build); }); build();
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
      $("#dl", root).addEventListener("click", function () {
        download(new Blob([$("#out", root).textContent], { type: "text/plain" }), "robots.txt");
      });
    }
  };

  window.TOOL_IMPL["xml-sitemap-validator"] = {
    html: '<div class="field"><label for="t">Paste the contents of your sitemap.xml</label>' +
      '<textarea id="t" style="min-height:190px" spellcheck="false"></textarea></div>' +
      '<div class="btns"><button class="btn" id="go">Check it</button></div>' +
      '<div class="out" id="out">Findings appear here.</div>' +
      '<div class="note">This checks structure, URL formatting, duplicates and the 50,000-URL limit. ' +
      'It cannot tell you whether each URL actually loads — that needs a crawler.</div>',
    init: function (root) {
      $("#go", root).addEventListener("click", function () {
        var src = $("#t", root).value.trim(), notes = [];
        if (!src) return ($("#out", root).textContent = "Paste a sitemap first.");
        var doc = new DOMParser().parseFromString(src, "application/xml");
        if (doc.querySelector("parsererror")) {
          return ($("#out", root).textContent = "Not valid XML:\n" + doc.querySelector("parsererror").textContent.trim());
        }
        var rootEl = doc.documentElement, isIndex = rootEl.nodeName === "sitemapindex";
        if (rootEl.nodeName !== "urlset" && !isIndex) notes.push("The root element should be <urlset> or <sitemapindex>, not <" + rootEl.nodeName + ">.");
        if (rootEl.namespaceURI !== "http://www.sitemaps.org/schemas/sitemap/0.9")
          notes.push("Missing or wrong namespace. It should be http://www.sitemaps.org/schemas/sitemap/0.9");
        var locs = Array.prototype.map.call(doc.getElementsByTagName("loc"), function (n) { return n.textContent.trim(); });
        if (!locs.length) notes.push("No <loc> elements found.");
        if (locs.length > 50000) notes.push("More than 50,000 URLs. Split the file and use a sitemap index.");
        var seen = {}, dupes = 0, relative = 0;
        locs.forEach(function (u) {
          if (seen[u]) dupes++; seen[u] = 1;
          if (!/^https?:\/\//i.test(u)) relative++;
        });
        if (dupes) notes.push(dupes + " duplicate URL(s).");
        if (relative) notes.push(relative + " URL(s) are not absolute. Every <loc> needs the full https:// address.");
        Array.prototype.forEach.call(doc.getElementsByTagName("lastmod"), function (n) {
          if (!/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(n.textContent.trim()))
            notes.push("lastmod is not a W3C date: " + n.textContent.trim());
        });
        Array.prototype.forEach.call(doc.getElementsByTagName("priority"), function (n) {
          var v = parseFloat(n.textContent);
          if (!(v >= 0 && v <= 1)) notes.push("priority must be between 0.0 and 1.0, found " + n.textContent);
        });
        var head = (isIndex ? "Sitemap index" : "Sitemap") + " with " + locs.length + " entr" + (locs.length === 1 ? "y" : "ies") +
          " (" + new Blob([src]).size + " bytes).";
        $("#out", root).textContent = head + "\n\n" + (notes.length ? notes.join("\n") : "No problems found.");
      });
    }
  };

  window.TOOL_IMPL["mobile-friendly-test"] = {
    html: '<div class="field"><label for="u">Page address</label><input type="url" id="u" value="https://example.com"></div>' +
      '<div class="btns">' + [["Phone", 390, 844], ["Tablet", 820, 1180], ["Desktop", 1280, 800]].map(function (d, i) {
        return '<button class="btn' + (i ? " ghost" : "") + '" data-w="' + d[1] + '" data-h="' + d[2] + '">' +
          d[0] + " (" + d[1] + "×" + d[2] + ")</button>";
      }).join("") + '</div>' +
      '<div id="frame" style="margin-top:18px;overflow:auto"></div>' +
      '<div class="note"><strong>How this works.</strong> The page is loaded in a frame at the chosen width so ' +
      'you can see the layout respond. Many sites send a header that forbids framing, and those will stay blank — ' +
      'that is a security setting, not a mobile problem. For a verdict from Google, use Search Console\'s URL ' +
      'inspection tool, which needs access to the site.</div>',
    init: function (root) {
      function show(w, h) {
        var u = $("#u", root).value.trim();
        if (!/^https?:\/\//i.test(u)) { $("#frame", root).textContent = "Enter an address that starts with https://"; return; }
        $("#frame", root).innerHTML = '<iframe src="' + u.replace(/"/g, "") + '" width="' + w + '" height="' + h +
          '" style="border:1px solid var(--line);border-radius:10px;background:#fff;max-width:100%" ' +
          'referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>' +
          '<p style="font-size:.85rem;color:var(--ink-2);margin-top:8px">Viewing at ' + w + " × " + h + " px.</p>";
      }
      $$("[data-w]", root).forEach(function (b) {
        b.addEventListener("click", function () { show(+b.dataset.w, +b.dataset.h); });
      });
    }
  };
})();
