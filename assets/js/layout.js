/* Shared layout: injects the header and footer into every page, wires the
   search box, and exposes a few helpers the tool scripts reuse. */
(function () {
  "use strict";

  var inTools = /\/tools\//.test(location.pathname);
  var BASE = inTools ? "../" : "./";
  window.BASE = BASE;

  var HEADER = '' +
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="site-head"><div class="wrap head-row">' +
      '<a class="brand" href="' + BASE + 'index.html">' +
        '<span class="brand-mark" aria-hidden="true">&#9881;</span> Toolbench</a>' +
      '<div class="head-search">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<input id="navSearch" type="search" placeholder="Search 80 tools" ' +
        'autocomplete="off" aria-label="Search tools" role="combobox" aria-expanded="false" aria-controls="navSuggest">' +
        '<div class="suggest" id="navSuggest" role="listbox"></div>' +
      '</div>' +
      '<nav class="nav" aria-label="Categories">' +
        '<a href="' + BASE + 'index.html#image">Image</a>' +
        '<a href="' + BASE + 'index.html#seo">SEO</a>' +
        '<a href="' + BASE + 'index.html#text">Text</a>' +
        '<a href="' + BASE + 'index.html#dev">Developer</a>' +
        '<a href="' + BASE + 'index.html#math">Calculators</a>' +
        '<a href="' + BASE + 'index.html#unit">Converters</a>' +
      '</nav>' +
    '</div></header>';

  function footerLinks(cat, n) {
    return (window.TOOLS_DATA || []).filter(function (t) { return t.cat === cat; })
      .slice(0, n).map(function (t) {
        return '<li><a href="' + BASE + 'tools/' + t.slug + '.html">' + t.name + '</a></li>';
      }).join("");
  }

  function footerHTML() {
    return '' +
    '<footer class="site-foot"><div class="wrap">' +
      '<div class="foot-grid">' +
        '<div><h3>Toolbench</h3><p style="font-size:.89rem;color:var(--ink-2)">' +
          'Eighty small tools that run in your browser. Nothing you paste or open is sent to a server.</p>' +
          '<div class="social">' +
            '<a href="#" aria-label="X">X</a><a href="#" aria-label="GitHub">GitHub</a>' +
            '<a href="#" aria-label="Mastodon">Mastodon</a></div></div>' +
        '<div><h3>Popular</h3><ul>' + footerLinks("text", 4) + footerLinks("image", 2) + '</ul></div>' +
        '<div><h3>Developer</h3><ul>' + footerLinks("dev", 5) + '</ul></div>' +
        '<div><h3>Site</h3><ul>' +
          '<li><a href="' + BASE + 'about.html">About</a></li>' +
          '<li><a href="' + BASE + 'contact.html">Contact</a></li>' +
          '<li><a href="' + BASE + 'privacy.html">Privacy</a></li>' +
          '<li><a href="' + BASE + 'tools/privacy-policy-generator.html">Policy generator</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="foot-note"><span>&copy; ' + new Date().getFullYear() + ' Toolbench</span>' +
      '<span>hello@example.com</span></div>' +
    '</div></footer>';
  }

  /* Insert header/footer. Tries the standalone partials first so they can be
     edited in one place; falls back to the markup above when the page is opened
     straight off disk (file:// blocks fetch). */
  function mount(id, url, fallback, after) {
    var host = document.getElementById(id);
    if (!host) return;
    var done = function (html) { host.innerHTML = html; if (after) after(); };
    if (location.protocol === "file:") return done(fallback);
    fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (html) { done(html.replace(/\{\{BASE\}\}/g, BASE)); })
      .catch(function () { done(fallback); });
  }

  /* ---------- search ---------- */
  function wireSearch() {
    var input = document.getElementById("navSearch");
    var box = document.getElementById("navSuggest");
    if (!input || !box) return;
    var items = [], idx = -1;

    function close() { box.classList.remove("open"); input.setAttribute("aria-expanded", "false"); idx = -1; }

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) return close();
      items = window.searchTools(q).slice(0, 8);
      if (!items.length) { box.innerHTML = '<a href="#" onclick="return false">No tool matches that word</a>'; }
      else {
        box.innerHTML = items.map(function (t) {
          return '<a role="option" href="' + BASE + 'tools/' + t.slug + '.html">' + t.name +
                 ' <small>&nbsp;' + catLabel(t.cat) + '</small></a>';
        }).join("");
      }
      box.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("input", run);
    input.addEventListener("keydown", function (e) {
      var links = box.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!links.length) return;
        idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.classList.toggle("active", i === idx); });
      } else if (e.key === "Enter" && idx > -1 && links[idx]) {
        location.href = links[idx].getAttribute("href");
      } else if (e.key === "Escape") { close(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".head-search")) close();
    });
  }

  function catLabel(id) {
    var c = (window.CATEGORIES || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.label : id;
  }
  window.catLabel = catLabel;

  /* Rank matches: name start > name contains > description contains. */
  window.searchTools = function (q) {
    q = q.toLowerCase();
    return (window.TOOLS_DATA || []).map(function (t) {
      var n = t.name.toLowerCase(), d = t.desc.toLowerCase(), s = 0;
      if (n.indexOf(q) === 0) s = 3;
      else if (n.indexOf(q) > -1) s = 2;
      else if (t.slug.indexOf(q) > -1) s = 2;
      else if (d.indexOf(q) > -1) s = 1;
      return { t: t, s: s };
    }).filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.t.name.localeCompare(b.t.name); })
      .map(function (r) { return r.t; });
  };

  /* ---------- small helpers used by tool scripts ---------- */
  window.$ = function (sel, root) { return (root || document).querySelector(sel); };
  window.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  window.copyText = function (text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent; btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && location.protocol !== "file:") {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  };
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  window.download = function (blobOrUrl, filename) {
    var url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    var a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    if (typeof blobOrUrl !== "string") setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  };

  window.fmtBytes = function (n) {
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(2) + " MB";
  };

  /* Read an uploaded image into an <img>. */
  window.readImage = function (file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () { cb(img, r.result); };
      img.onerror = function () { alert("That file could not be read as an image."); };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };

  /* Mount a tool on its page: renders its markup, then runs its init(). */
  window.mountTool = function (slug) {
    var root = document.getElementById("tool");
    var tool = (window.TOOLS_DATA || []).filter(function (t) { return t.slug === slug; })[0];
    var impl = (window.TOOL_IMPL || {})[slug];
    if (!root) return;
    if (!impl) {
      root.innerHTML = tool && tool.server === 2 ? notShipped(tool) : needsServer(tool);
      renderRelated(tool);
      return;
    }
    root.innerHTML = impl.html;
    if (impl.init) { try { impl.init(root); } catch (e) { console.error(slug, e); } }
    renderRelated(tool);
  };

  var NEEDS = {
    "google-index-checker": "a Google Search Console or SERP API account",
    "domain-authority-checker": "a Moz, Ahrefs or Semrush API key",
    "backlink-checker": "a backlink index such as Ahrefs, Majestic or Semrush",
    "page-speed-checker": "a Google PageSpeed Insights API key",
    "ip-address-lookup": "an IP intelligence API such as ipinfo or ipapi",
    "ip-geolocation-finder": "a geolocation database such as MaxMind GeoLite2",
    "ssl-certificate-checker": "a server that can open a TLS connection to the host",
    "whois-lookup": "a server that can query WHOIS or RDAP",
    "http-headers-checker": "a server to fetch the URL, because browsers block cross-site header reads",
    "url-shortener": "a database and a redirect route on your own domain",
    "youtube-tags-extractor": "a YouTube Data API key",
    "plagiarism-checker": "a search index or a plagiarism API such as Copyleaks"
  };

  function needsServer(tool) {
    var why = NEEDS[tool && tool.slug] || "a server-side component";
    return '<div class="panel"><h2>This one needs a back end</h2>' +
      '<p>' + (tool ? tool.desc + " " : "") + 'A browser cannot do it alone: it needs ' + why + '. ' +
      'The page is here so the route, layout and navigation are ready — wire your endpoint into ' +
      '<code>assets/js/tools/</code> and the form will drop straight in.</p>' +
      '<p style="font-size:.9rem;color:var(--ink-2)">Shipping a fake result would be worse than shipping nothing, ' +
      'so nothing is faked here.</p></div>';
  }

  function notShipped(tool) {
    return '<div class="panel"><h2>Not built, on purpose</h2>' +
      '<p>Downloading other people\'s posts and videos from ' +
      (tool.name.split(" ")[0]) + ' means scraping a private API, which breaks that platform\'s terms of ' +
      'service and usually copies work that someone else owns. Ad networks also refuse sites that host these ' +
      'tools, so the feature tends to cost more than it earns.</p>' +
      '<p>If you need media you have rights to, most platforms have an official export: your own posts can be ' +
      'downloaded from your account settings, and the public APIs cover licensed use.</p></div>';
  }

  function renderRelated(tool) {
    var host = document.getElementById("related");
    if (!host || !tool) return;
    var mates = (window.TOOLS_DATA || []).filter(function (t) {
      return t.cat === tool.cat && t.slug !== tool.slug;
    }).slice(0, 6);
    host.innerHTML = '<h3>More ' + catLabel(tool.cat).toLowerCase() + '</h3><ul>' +
      mates.map(function (t) {
        return '<li><a href="' + t.slug + '.html">' + t.name + '</a></li>';
      }).join("") + '</ul>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var h = document.createElement("div"); h.id = "site-header";
    document.body.insertBefore(h, document.body.firstChild);
    var f = document.createElement("div"); f.id = "site-footer";
    document.body.appendChild(f);
    mount("site-header", BASE + "header.html", HEADER, wireSearch);
    mount("site-footer", BASE + "footer.html", footerHTML());
    if (window.PAGE_TOOL) window.mountTool(window.PAGE_TOOL);
  });
})();
