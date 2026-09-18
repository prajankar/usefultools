/* Developer tools. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  function io(label, ph, buttons) {
    return '<div class="field"><label for="in">' + label + '</label>' +
      '<textarea id="in" placeholder="' + ph + '" spellcheck="false"></textarea></div>' +
      '<div class="btns">' + buttons + '<button class="btn ghost" id="copy">Copy the result</button></div>' +
      '<div class="out" id="out"></div>';
  }

  window.TOOL_IMPL["json-formatter"] = {
    html: io("JSON", '{"name":"Toolbench","tools":80}',
      '<button class="btn" id="pretty">Format</button><button class="btn" id="min">Minify</button>' +
      '<button class="btn ghost" id="check">Validate only</button>') +
      '<div class="row" style="margin-top:12px"><div class="field"><label for="indent">Indent</label>' +
      '<select id="indent"><option>2</option><option>4</option><option value="tab">Tab</option></select></div></div>',
    init: function (root) {
      var out = $("#out", root);
      function parse() {
        try { return { ok: true, v: JSON.parse($("#in", root).value) }; }
        catch (e) { out.textContent = "Invalid JSON — " + e.message; return { ok: false }; }
      }
      $("#pretty", root).addEventListener("click", function () {
        var r = parse(); if (!r.ok) return;
        var i = $("#indent", root).value;
        out.textContent = JSON.stringify(r.v, null, i === "tab" ? "\t" : +i);
      });
      $("#min", root).addEventListener("click", function () {
        var r = parse(); if (!r.ok) return;
        out.textContent = JSON.stringify(r.v);
      });
      $("#check", root).addEventListener("click", function () {
        var r = parse(); if (r.ok) out.textContent = "Valid JSON. Top level is " +
          (Array.isArray(r.v) ? "an array of " + r.v.length + " item(s)." : typeof r.v + ".");
      });
      $("#copy", root).addEventListener("click", function (e) { copyText(out.textContent, e.target); });
    }
  };

  window.TOOL_IMPL["css-minifier"] = {
    html: io("CSS", "body { color: #333; /* comment */ }", '<button class="btn" id="go">Minify</button>') +
      '<div class="stats"><div class="stat"><b id="before">0</b><span>Bytes in</span></div>' +
      '<div class="stat"><b id="after">0</b><span>Bytes out</span></div>' +
      '<div class="stat"><b id="saved">0%</b><span>Smaller</span></div></div>',
    init: function (root) {
      $("#go", root).addEventListener("click", function () {
        var css = $("#in", root).value;
        var min = css.replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\s+/g, " ")
          .replace(/\s*([{}:;,>~+])\s*/g, "$1")
          .replace(/;}/g, "}")
          .replace(/(^|[{;])0\.(\d)/g, "$1.$2")
          .trim();
        $("#out", root).textContent = min;
        $("#before", root).textContent = css.length;
        $("#after", root).textContent = min.length;
        $("#saved", root).textContent = css.length ? Math.round((1 - min.length / css.length) * 100) + "%" : "0%";
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["js-minifier"] = {
    html: io("JavaScript", "function hello(name) {\n  // greet\n  return 'hi ' + name;\n}",
      '<button class="btn" id="go">Minify</button>') +
      '<div class="note"><strong>Conservative on purpose.</strong> This strips comments and unnecessary ' +
      'whitespace but never renames variables, so it cannot break your code. For real build output use ' +
      'Terser or esbuild — expect roughly a third more saving there.</div>',
    init: function (root) {
      $("#go", root).addEventListener("click", function () {
        var src = $("#in", root).value, out = "", i = 0, mode = "code";
        while (i < src.length) {
          var c = src[i], n = src[i + 1];
          if (mode === "code") {
            if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
            if (c === "/" && n === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
            if (c === '"' || c === "'" || c === "`") { mode = c; out += c; i++; continue; }
            if (/\s/.test(c)) {
              var j = i; while (j < src.length && /\s/.test(src[j])) j++;
              var prev = out[out.length - 1] || "", next = src[j] || "";
              if (/[A-Za-z0-9_$]/.test(prev) && /[A-Za-z0-9_$]/.test(next)) out += " ";
              else if ((prev === "+" && next === "+") || (prev === "-" && next === "-")) out += " ";
              i = j; continue;
            }
            out += c; i++;
          } else {
            if (c === "\\") { out += c + (n || ""); i += 2; continue; }
            out += c; if (c === mode) mode = "code";
            i++;
          }
        }
        $("#out", root).textContent = out.trim();
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["sql-formatter"] = {
    html: io("SQL", "select id, name from users u join orders o on o.user_id = u.id where u.active = 1 order by name",
      '<button class="btn" id="go">Format</button>'),
    init: function (root) {
      var majors = ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "INSERT INTO",
        "VALUES", "UPDATE", "SET", "DELETE FROM", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "JOIN",
        "UNION ALL", "UNION", "ON", "AND", "OR"];
      $("#go", root).addEventListener("click", function () {
        var s = $("#in", root).value.replace(/\s+/g, " ").trim();
        majors.forEach(function (k) {
          s = s.replace(new RegExp("\\b" + k.replace(/ /g, "\\s+") + "\\b", "gi"), "\n" + k);
        });
        s = s.replace(/\n(AND|OR|ON)\b/g, "\n  $1").replace(/,\s*/g, ",\n  ").replace(/\n{2,}/g, "\n").trim();
        $("#out", root).textContent = s;
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["base64-encoder-decoder"] = {
    html: io("Text or Base64", "Hello world",
      '<button class="btn" id="enc">Encode</button><button class="btn" id="dec">Decode</button>'),
    init: function (root) {
      var out = $("#out", root);
      function enc(s) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(s))); }
      function dec(s) {
        var bin = atob(s.trim());
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
      }
      $("#enc", root).addEventListener("click", function () {
        try { out.textContent = enc($("#in", root).value); } catch (e) { out.textContent = "That text could not be encoded."; }
      });
      $("#dec", root).addEventListener("click", function () {
        try { out.textContent = dec($("#in", root).value); } catch (e) { out.textContent = "That is not valid Base64."; }
      });
      $("#copy", root).addEventListener("click", function (e) { copyText(out.textContent, e.target); });
    }
  };

  /* --- tiny Markdown <-> HTML pair --- */
  function mdToHtml(md) {
    var blocks = md.replace(/\r/g, "").split(/\n{2,}/), html = [];
    var inline = function (s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|\W)\*([^*]+)\*/g, "$1<em>$2</em>")
        .replace(/~~([^~]+)~~/g, "<del>$1</del>");
    };
    blocks.forEach(function (b) {
      b = b.trim(); if (!b) return;
      var m;
      if ((m = b.match(/^(#{1,6})\s+(.*)$/))) { html.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); return; }
      if (/^```/.test(b)) { html.push("<pre><code>" + b.replace(/^```\w*\n?/, "").replace(/```$/, "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</code></pre>"); return; }
      if (/^>\s/.test(b)) { html.push("<blockquote><p>" + inline(b.replace(/^>\s?/gm, "")) + "</p></blockquote>"); return; }
      if (/^[-*+]\s/.test(b)) {
        html.push("<ul>" + b.split("\n").map(function (l) { return "<li>" + inline(l.replace(/^[-*+]\s/, "")) + "</li>"; }).join("") + "</ul>"); return;
      }
      if (/^\d+\.\s/.test(b)) {
        html.push("<ol>" + b.split("\n").map(function (l) { return "<li>" + inline(l.replace(/^\d+\.\s/, "")) + "</li>"; }).join("") + "</ol>"); return;
      }
      if (/^(-{3,}|\*{3,})$/.test(b)) { html.push("<hr>"); return; }
      html.push("<p>" + inline(b).replace(/\n/g, "<br>") + "</p>");
    });
    return html.join("\n");
  }

  function htmlToMd(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    function walk(node) {
      return Array.prototype.map.call(node.childNodes, function (n) {
        if (n.nodeType === 3) return n.textContent.replace(/\s+/g, " ");
        if (n.nodeType !== 1) return "";
        var t = n.tagName.toLowerCase(), inner = walk(n);
        if (/^h[1-6]$/.test(t)) return "\n\n" + "#".repeat(+t[1]) + " " + inner.trim() + "\n\n";
        if (t === "p") return "\n\n" + inner.trim() + "\n\n";
        if (t === "br") return "  \n";
        if (t === "strong" || t === "b") return "**" + inner.trim() + "**";
        if (t === "em" || t === "i") return "*" + inner.trim() + "*";
        if (t === "del" || t === "s") return "~~" + inner.trim() + "~~";
        if (t === "code" && n.parentNode.tagName !== "PRE") return "`" + inner + "`";
        if (t === "pre") return "\n\n```\n" + n.textContent.trim() + "\n```\n\n";
        if (t === "a") return "[" + inner.trim() + "](" + (n.getAttribute("href") || "") + ")";
        if (t === "img") return "![" + (n.getAttribute("alt") || "") + "](" + (n.getAttribute("src") || "") + ")";
        if (t === "blockquote") return "\n\n> " + inner.trim().replace(/\n/g, "\n> ") + "\n\n";
        if (t === "hr") return "\n\n---\n\n";
        if (t === "li") {
          var ol = n.parentNode.tagName === "OL";
          var i = Array.prototype.indexOf.call(n.parentNode.children, n) + 1;
          return (ol ? i + ". " : "- ") + inner.trim() + "\n";
        }
        if (t === "ul" || t === "ol") return "\n" + inner + "\n";
        return inner;
      }).join("");
    }
    return walk(doc.body).replace(/\n{3,}/g, "\n\n").trim();
  }

  window.TOOL_IMPL["markdown-to-html"] = {
    html: io("Markdown", "# Title\n\nSome **bold** text and a [link](https://example.com).",
      '<button class="btn" id="go">Convert</button><button class="btn ghost" id="prevbtn">Preview</button>') +
      '<div id="prev" class="panel" style="margin-top:16px;display:none"></div>',
    init: function (root) {
      $("#go", root).addEventListener("click", function () { $("#out", root).textContent = mdToHtml($("#in", root).value); });
      $("#prevbtn", root).addEventListener("click", function () {
        var p = $("#prev", root);
        p.innerHTML = mdToHtml($("#in", root).value);
        p.style.display = p.style.display === "none" ? "block" : "none";
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["html-to-markdown"] = {
    html: io("HTML", "<h1>Title</h1><p>Some <strong>bold</strong> text.</p>", '<button class="btn" id="go">Convert</button>'),
    init: function (root) {
      $("#go", root).addEventListener("click", function () { $("#out", root).textContent = htmlToMd($("#in", root).value); });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["htaccess-redirect-generator"] = {
    html: '<div class="row"><div class="field"><label for="kind">What do you need?</label>' +
      '<select id="kind">' +
      '<option value="single">Redirect one page to another</option>' +
      '<option value="www">Force www</option><option value="nowww">Remove www</option>' +
      '<option value="https">Force HTTPS</option><option value="domain">Move the whole domain</option>' +
      '<option value="trailing">Remove trailing slashes</option>' +
      '</select></div></div>' +
      '<div class="row"><div class="field"><label for="a">From (path or domain)</label>' +
      '<input type="text" id="a" value="/old-page" ></div>' +
      '<div class="field"><label for="b">To</label><input type="text" id="b" value="/new-page"></div></div>' +
      '<div class="out" id="out"></div><div class="btns"><button class="btn" id="copy">Copy the rules</button></div>' +
      '<div class="note">Paste these into the <code>.htaccess</code> file in your site root. ' +
      'Back the file up first — a bad rule can take a site offline. Apache only; nginx uses different syntax.</div>',
    init: function (root) {
      function build() {
        var k = $("#kind", root).value, a = $("#a", root).value.trim(), b = $("#b", root).value.trim();
        var head = "RewriteEngine On\n";
        var map = {
          single: 'Redirect 301 ' + a + ' ' + b,
          www: head + 'RewriteCond %{HTTP_HOST} !^www\\. [NC]\nRewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]',
          nowww: head + 'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]\nRewriteRule ^(.*)$ https://%1/$1 [L,R=301]',
          https: head + 'RewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
          domain: head + 'RewriteCond %{HTTP_HOST} ^' + (a || "old.com").replace(/\./g, "\\.") + ' [NC]\n' +
                  'RewriteRule ^(.*)$ https://' + (b || "new.com") + '/$1 [L,R=301]',
          trailing: head + 'RewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^(.*)/$ /$1 [L,R=301]'
        };
        $("#out", root).textContent = map[k];
      }
      $$("select,input", root).forEach(function (el) { el.addEventListener("input", build); });
      build();
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["color-code-picker"] = {
    html: '<div class="row"><div class="field"><label for="c">Pick a colour</label>' +
      '<input type="color" id="c" value="#0F6E6E" style="width:100%;height:56px"></div>' +
      '<div class="field"><label for="hex">Or type a HEX value</label><input type="text" id="hex" value="#0F6E6E"></div></div>' +
      '<div id="sw" class="swatch" style="background:#0F6E6E"></div>' +
      '<table class="data"><tbody id="rows"></tbody></table>' +
      '<h3 style="margin-top:22px">Shades</h3><div id="shades" style="display:grid;grid-template-columns:repeat(9,1fr);gap:4px"></div>',
    init: function (root) {
      function toRgb(h) {
        h = h.replace("#", "");
        if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      function toHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2, d = max - min;
        if (!d) { h = s = 0; }
        else {
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h *= 60;
        }
        return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
      }
      function lum(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
      function show(hex) {
        var rgb = toRgb(hex), hsl = toHsl(rgb[0], rgb[1], rgb[2]);
        var L = 0.2126 * lum(rgb[0]) + 0.7152 * lum(rgb[1]) + 0.0722 * lum(rgb[2]);
        var onWhite = (1.05) / (L + 0.05), onBlack = (L + 0.05) / 0.05;
        $("#sw", root).style.background = hex;
        var rows = [
          ["HEX", hex.toUpperCase()],
          ["RGB", "rgb(" + rgb.join(", ") + ")"],
          ["HSL", "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)"],
          ["Contrast on white", onWhite.toFixed(2) + ":1" + (onWhite >= 4.5 ? " — passes AA for body text" : " — too low for body text")],
          ["Contrast on black", onBlack.toFixed(2) + ":1" + (onBlack >= 4.5 ? " — passes AA for body text" : " — too low for body text")]
        ];
        $("#rows", root).innerHTML = rows.map(function (r) {
          return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>";
        }).join("");
        $("#shades", root).innerHTML = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(function (l) {
          var col = "hsl(" + hsl[0] + "," + hsl[1] + "%," + l + "%)";
          return '<div title="' + col + '" style="height:44px;border-radius:6px;background:' + col + '"></div>';
        }).join("");
      }
      $("#c", root).addEventListener("input", function (e) { $("#hex", root).value = e.target.value; show(e.target.value); });
      $("#hex", root).addEventListener("input", function (e) {
        var v = e.target.value.trim();
        if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
          if (v[0] !== "#") v = "#" + v;
          $("#c", root).value = v.length === 4 ? "#" + v.slice(1).split("").map(function (c) { return c + c; }).join("") : v;
          show(v);
        }
      });
      show("#0F6E6E");
    }
  };
})();
