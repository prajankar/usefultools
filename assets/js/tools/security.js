/* Security tools. Hashing runs locally; nothing you type leaves the page. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  /* --- compact MD5 (RFC 1321) --- */
  function md5(str) {
    function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
    function add(x, y) {
      var l = (x & 0xFFFF) + (y & 0xFFFF), m = (x >> 16) + (y >> 16) + (l >> 16);
      return (m << 16) | (l & 0xFFFF);
    }
    function cmn(q, a, b, x, s, t) { return add(rl(add(add(a, q), add(x, t)), s), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
    function toBlocks(s) {
      var bytes = new TextEncoder().encode(s), n = bytes.length;
      var words = [], i;
      for (i = 0; i < n; i++) words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << ((i % 4) * 8));
      words[n >> 2] = (words[n >> 2] || 0) | (0x80 << ((n % 4) * 8));
      var len = (((n + 8) >> 6) + 1) * 16;
      for (i = 0; i < len; i++) words[i] = words[i] || 0;
      words[len - 2] = n * 8;
      return words;
    }
    var x = toBlocks(str), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    var S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    for (var i = 0; i < x.length; i += 16) {
      var oa = a, ob = b, oc = c, od = d;
      a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
      a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222);
      c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
      void S;
    }
    return [a, b, c, d].map(function (n) {
      var s = "";
      for (var j = 0; j < 4; j++) s += ("0" + ((n >> (j * 8)) & 255).toString(16)).slice(-2);
      return s;
    }).join("");
  }

  window.TOOL_IMPL["md5-hash-generator"] = {
    html: '<div class="field"><label for="t">Text to hash</label><textarea id="t">hello world</textarea></div>' +
      '<div class="btns"><button class="btn" id="go">Generate the hash</button>' +
      '<button class="btn ghost" id="copy">Copy</button></div><div class="out" id="out"></div>' +
      '<div class="note"><strong>Do not use MD5 for passwords.</strong> It has been broken since 2004 and ' +
      'collisions are cheap to produce. It is still fine as a quick checksum for file integrity. ' +
      'For anything security-related, use SHA-256, or bcrypt and argon2 for passwords.</div>',
    init: function (root) {
      function run() { $("#out", root).textContent = md5($("#t", root).value); }
      $("#go", root).addEventListener("click", run);
      $("#t", root).addEventListener("input", run);
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
      run();
    }
  };

  window.TOOL_IMPL["sha256-hash-generator"] = {
    html: '<div class="field"><label for="t">Text to hash</label><textarea id="t">hello world</textarea></div>' +
      '<div class="field"><label for="alg">Algorithm</label><select id="alg">' +
      '<option>SHA-256</option><option>SHA-1</option><option>SHA-384</option><option>SHA-512</option></select></div>' +
      '<div class="btns"><button class="btn" id="go">Generate the hash</button>' +
      '<button class="btn ghost" id="copy">Copy</button></div><div class="out" id="out"></div>' +
      '<div class="note">Hashing uses your browser\'s built-in Web Crypto. SHA-1 is listed for legacy checks only; ' +
      'it is no longer considered safe against deliberate collisions.</div>',
    init: function (root) {
      function run() {
        var data = new TextEncoder().encode($("#t", root).value);
        crypto.subtle.digest($("#alg", root).value, data).then(function (buf) {
          $("#out", root).textContent = Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return ("0" + b.toString(16)).slice(-2);
          }).join("");
        });
      }
      $("#go", root).addEventListener("click", run);
      $("#t", root).addEventListener("input", run);
      $("#alg", root).addEventListener("change", run);
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
      run();
    }
  };

  function rand(n) {
    var a = new Uint32Array(n); crypto.getRandomValues(a); return a;
  }

  window.TOOL_IMPL["password-generator"] = {
    html: '<div class="row"><div class="field"><label for="len">Length: <b id="lv">20</b></label>' +
      '<input type="range" id="len" min="6" max="64" value="20" style="width:100%"></div>' +
      '<div class="field"><label for="count">How many</label><input type="number" id="count" value="5" min="1" max="50"></div></div>' +
      '<div class="btns" style="margin-bottom:8px">' +
      [["low", "a-z", 1], ["up", "A-Z", 1], ["dig", "0-9", 1], ["sym", "!@#$…", 1], ["amb", "Avoid look-alikes (l, 1, O, 0)", 1]]
        .map(function (o) {
          return '<label style="display:flex;gap:7px;align-items:center;margin:0 10px 0 0;font-size:.9rem">' +
            '<input type="checkbox" id="' + o[0] + '" checked> ' + o[1] + "</label>";
        }).join("") + '</div>' +
      '<div class="btns"><button class="btn" id="go">Generate</button>' +
      '<button class="btn ghost" id="phrase">Generate passphrases instead</button></div>' +
      '<div class="out" id="out"></div><div class="stats"><div class="stat"><b id="bits">0</b><span>Bits of entropy</span></div>' +
      '<div class="stat"><b id="strength" style="font-size:1rem">—</b><span>Strength</span></div></div>' +
      '<div class="note">Passwords are generated with your browser\'s cryptographic random source and never ' +
      'leave this page. A password manager is still the safest place to keep them.</div>',
    init: function (root) {
      var words = ("anchor amber bishop candle cobalt dagger ember fabric garnet harbor indigo jasper kernel " +
        "lantern marble nickel orchid pewter quarry ribbon saddle timber umber velvet walnut yonder zephyr " +
        "bramble cinder driftwood falcon granite hollow ivory juniper").split(" ");
      $("#len", root).addEventListener("input", function (e) { $("#lv", root).textContent = e.target.value; });
      function alphabet() {
        var s = "";
        if ($("#low", root).checked) s += "abcdefghijklmnopqrstuvwxyz";
        if ($("#up", root).checked) s += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if ($("#dig", root).checked) s += "0123456789";
        if ($("#sym", root).checked) s += "!@#$%^&*()-_=+[]{};:,.?";
        if ($("#amb", root).checked) s = s.replace(/[lI1O0o]/g, "");
        return s || "abcdefghijklmnopqrstuvwxyz";
      }
      function show(list, bits) {
        $("#out", root).textContent = list.join("\n");
        $("#bits", root).textContent = Math.round(bits);
        $("#strength", root).textContent = bits < 45 ? "Weak" : bits < 70 ? "Reasonable" : bits < 100 ? "Strong" : "Very strong";
      }
      $("#go", root).addEventListener("click", function () {
        var set = alphabet(), len = +$("#len", root).value, n = Math.min(50, +$("#count", root).value || 1), list = [];
        for (var i = 0; i < n; i++) {
          var r = rand(len), p = "";
          for (var j = 0; j < len; j++) p += set[r[j] % set.length];
          list.push(p);
        }
        show(list, len * Math.log2(set.length));
      });
      $("#phrase", root).addEventListener("click", function () {
        var n = Math.min(50, +$("#count", root).value || 1), list = [];
        for (var i = 0; i < n; i++) {
          var r = rand(5), w = [];
          for (var j = 0; j < 4; j++) w.push(words[r[j] % words.length]);
          list.push(w.join("-") + "-" + (r[4] % 100));
        }
        show(list, 4 * Math.log2(words.length) + Math.log2(100));
      });
      $("#go", root).click();
    }
  };

  window.TOOL_IMPL["random-string-generator"] = {
    html: '<div class="row"><div class="field"><label for="len">Length</label><input type="number" id="len" value="16" min="1" max="512"></div>' +
      '<div class="field"><label for="count">How many</label><input type="number" id="count" value="10" min="1" max="500"></div>' +
      '<div class="field"><label for="set">Alphabet</label><select id="set">' +
      '<option value="hex">Hexadecimal</option><option value="alnum">Letters and digits</option>' +
      '<option value="alpha">Letters only</option><option value="num">Digits only</option>' +
      '<option value="uuid">UUID v4</option><option value="custom">Custom…</option></select></div></div>' +
      '<div class="field" id="cwrap" style="display:none"><label for="chars">Characters to pick from</label>' +
      '<input type="text" id="chars" value="ABCDEF0123456789"></div>' +
      '<div class="btns"><button class="btn" id="go">Generate</button><button class="btn ghost" id="copy">Copy all</button></div>' +
      '<div class="out" id="out"></div>',
    init: function (root) {
      var sets = { hex: "0123456789abcdef", alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", num: "0123456789" };
      $("#set", root).addEventListener("change", function (e) {
        $("#cwrap", root).style.display = e.target.value === "custom" ? "block" : "none";
      });
      $("#go", root).addEventListener("click", function () {
        var kind = $("#set", root).value, n = Math.min(500, +$("#count", root).value || 1);
        var len = Math.min(512, +$("#len", root).value || 1), list = [];
        for (var i = 0; i < n; i++) {
          if (kind === "uuid") { list.push(crypto.randomUUID ? crypto.randomUUID() : uuid()); continue; }
          var set = kind === "custom" ? ($("#chars", root).value || "abc") : sets[kind];
          var r = rand(len), s = "";
          for (var j = 0; j < len; j++) s += set[r[j] % set.length];
          list.push(s);
        }
        $("#out", root).textContent = list.join("\n");
      });
      function uuid() {
        var r = rand(4);
        return ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(/[xy]/g, function (c) {
          var v = Math.floor(Math.random() * 16);
          return (c === "x" ? v : (v & 0x3 | 0x8)).toString(16);
        }) + (void r, "");
      }
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
      $("#go", root).click();
    }
  };

  window.TOOL_IMPL["privacy-policy-generator"] = {
    html: '<div class="row"><div class="field"><label for="site">Site name</label><input type="text" id="site" value="Example"></div>' +
      '<div class="field"><label for="url">Site address</label><input type="text" id="url" value="https://example.com"></div>' +
      '<div class="field"><label for="mail">Contact email</label><input type="text" id="mail" value="hello@example.com"></div></div>' +
      '<div class="row"><div class="field"><label for="country">Governing country</label><input type="text" id="country" value="Nepal"></div>' +
      '<div class="field"><label for="date">Effective date</label><input type="date" id="date"></div></div>' +
      '<div class="btns" style="margin-bottom:10px">' +
      [["ads", "Shows ads"], ["analytics", "Uses analytics"], ["cookies", "Sets cookies"],
       ["accounts", "Has user accounts"], ["forms", "Collects form submissions"], ["gdpr", "Has EU visitors"]]
        .map(function (o) {
          return '<label style="display:flex;gap:7px;align-items:center;margin-right:12px;font-size:.9rem">' +
            '<input type="checkbox" id="' + o[0] + '" checked> ' + o[1] + "</label>";
        }).join("") + '</div>' +
      '<div class="btns"><button class="btn" id="go">Write the policy</button>' +
      '<button class="btn ghost" id="copy">Copy</button>' +
      '<button class="btn ghost" id="dl">Download as HTML</button></div>' +
      '<div class="out" id="out"></div>' +
      '<div class="note"><strong>This is a starting draft, not legal advice.</strong> If you handle payments, ' +
      'health data or children\'s data, or you have users in the EU, California or the UK, have a lawyer review it.</div>',
    init: function (root) {
      $("#date", root).value = new Date().toISOString().slice(0, 10);
      function build() {
        var v = function (id) { return $("#" + id, root).value; };
        var on = function (id) { return $("#" + id, root).checked; };
        var p = [];
        p.push("Privacy policy for " + v("site"));
        p.push("Effective " + v("date") + ".");
        p.push("\n1. Who we are\n" + v("site") + " operates " + v("url") + ". You can reach us at " + v("mail") + ".");
        p.push("\n2. What we collect");
        var items = ["Server logs, which record your IP address, browser and the pages you open."];
        if (on("forms")) items.push("Anything you type into a form on the site, and the email address you send it from.");
        if (on("accounts")) items.push("Account details: your email address, a hashed password and your settings.");
        if (on("analytics")) items.push("Usage statistics collected by our analytics provider.");
        if (on("cookies")) items.push("Cookies and similar storage, described in section 4.");
        p.push(items.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n"));
        p.push("\n3. Why we use it\nTo run and secure the site, answer your messages, and understand which " +
          "pages are useful." + (on("ads") ? " Advertising partners use it to choose which adverts to show." : ""));
        if (on("cookies")) p.push("\n4. Cookies\nWe set cookies that keep the site working and remember your " +
          "preferences." + (on("ads") ? " Our advertising partners, including Google, may set their own cookies to " +
          "serve adverts based on your visits to this and other sites. You can opt out of personalised Google " +
          "advertising at google.com/settings/ads." : "") + " You can clear or block cookies in your browser settings.");
        p.push("\n5. Who we share it with\nWe do not sell your personal information. We share it only with the " +
          "providers who host the site" + (on("analytics") ? ", measure traffic" : "") +
          (on("ads") ? " and serve adverts" : "") + ", and when the law requires it.");
        p.push("\n6. How long we keep it\nLogs are kept for up to 12 months. " +
          (on("accounts") ? "Account data is kept until you delete your account." : "Messages are kept until they are answered and archived."));
        p.push("\n7. Your rights\nYou can ask us for a copy of your data, ask us to correct it, or ask us to " +
          "delete it. Write to " + v("mail") + " and we will reply within 30 days." +
          (on("gdpr") ? " If you are in the EU or the UK, you may also complain to your national data protection authority." : ""));
        p.push("\n8. Children\nThis site is not aimed at children under 13 and we do not knowingly collect their data.");
        p.push("\n9. Changes\nWe will post any changes on this page and update the effective date above.");
        p.push("\n10. Governing law\nThis policy is governed by the laws of " + v("country") + ".");
        return p.join("\n");
      }
      $("#go", root).addEventListener("click", function () { $("#out", root).textContent = build(); });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
      $("#dl", root).addEventListener("click", function () {
        var body = ($("#out", root).textContent || build()).split("\n").map(function (l) {
          return /^\d+\./.test(l.trim()) && l.indexOf("\n") < 0 && l.length < 60 ? "<h2>" + l + "</h2>" : "<p>" + l + "</p>";
        }).join("\n");
        download(new Blob(["<!doctype html><meta charset=utf-8><title>Privacy policy</title>" + body],
          { type: "text/html" }), "privacy-policy.html");
      });
      $("#go", root).click();
    }
  };
})();
