/* Text tools. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  function area(id, ph) {
    return '<div class="field"><label for="' + id + '">Your text</label>' +
      '<textarea id="' + id + '" placeholder="' + ph + '"></textarea></div>';
  }
  function stat(id, label) {
    return '<div class="stat"><b id="' + id + '">0</b><span>' + label + '</span></div>';
  }
  function count(t) {
    var words = t.trim() ? t.trim().split(/\s+/).length : 0;
    var sentences = (t.match(/[^.!?…]+[.!?…]+/g) || []).length || (t.trim() ? 1 : 0);
    var paras = t.trim() ? t.trim().split(/\n\s*\n/).length : 0;
    return { words: words, sentences: sentences, paras: paras,
             chars: t.length, noSpace: t.replace(/\s/g, "").length,
             minutes: Math.max(words ? 1 : 0, Math.round(words / 225)) };
  }

  window.TOOL_IMPL["word-counter"] = {
    html: area("t", "Paste or type. Everything is counted as you go.") +
      '<div class="stats">' + stat("w", "Words") + stat("c", "Characters") + stat("s", "Sentences") +
      stat("p", "Paragraphs") + stat("r", "Minutes to read") + '</div>' +
      '<div class="out" id="top">The ten words you use most will appear here.</div>',
    init: function (root) {
      var t = $("#t", root);
      function run() {
        var c = count(t.value);
        $("#w", root).textContent = c.words; $("#c", root).textContent = c.chars;
        $("#s", root).textContent = c.sentences; $("#p", root).textContent = c.paras;
        $("#r", root).textContent = c.minutes;
        var freq = {};
        (t.value.toLowerCase().match(/[a-z\u00C0-\u024F']{3,}/g) || []).forEach(function (w) { freq[w] = (freq[w] || 0) + 1; });
        var top = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 10);
        $("#top", root).textContent = top.length
          ? top.map(function (w) { return w + " × " + freq[w]; }).join("\n")
          : "The ten words you use most will appear here.";
      }
      t.addEventListener("input", run); run();
    }
  };

  window.TOOL_IMPL["character-counter"] = {
    html: area("t", "Type here to count characters.") +
      '<div class="stats">' + stat("c", "Characters") + stat("n", "Without spaces") +
      stat("w", "Words") + stat("l", "Lines") + '</div>' +
      '<div class="note">Limits worth knowing: 60 characters for a page title, 160 for a meta description, ' +
      '280 for a post on X, 2,200 for an Instagram caption.</div>',
    init: function (root) {
      var t = $("#t", root);
      function run() {
        var c = count(t.value);
        $("#c", root).textContent = c.chars; $("#n", root).textContent = c.noSpace;
        $("#w", root).textContent = c.words;
        $("#l", root).textContent = t.value ? t.value.split("\n").length : 0;
      }
      t.addEventListener("input", run); run();
    }
  };

  window.TOOL_IMPL["case-converter"] = {
    html: area("t", "Paste the text you want to re-case.") +
      '<div class="btns">' +
      ["UPPER CASE", "lower case", "Sentence case", "Title Case", "aLtErNaTiNg", "camelCase", "snake_case", "kebab-case"]
        .map(function (l, i) { return '<button class="btn ghost" data-m="' + i + '">' + l + '</button>'; }).join("") +
      '</div><div class="out" id="out">The converted text appears here.</div>' +
      '<div class="btns"><button class="btn" id="copy">Copy the result</button></div>',
    init: function (root) {
      var out = $("#out", root);
      var fns = [
        function (s) { return s.toUpperCase(); },
        function (s) { return s.toLowerCase(); },
        function (s) { return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, function (m) { return m.toUpperCase(); }); },
        function (s) { return s.toLowerCase().replace(/\b\w/g, function (m) { return m.toUpperCase(); }); },
        function (s) { var i = 0; return s.replace(/[a-z]/gi, function (c) { return (i++ % 2) ? c.toUpperCase() : c.toLowerCase(); }); },
        function (s) { return s.toLowerCase().replace(/[^a-z0-9]+(.)?/g, function (m, c) { return c ? c.toUpperCase() : ""; }); },
        function (s) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); },
        function (s) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
      ];
      $$("[data-m]", root).forEach(function (b) {
        b.addEventListener("click", function () { out.textContent = fns[+b.dataset.m]($("#t", root).value); });
      });
      $("#copy", root).addEventListener("click", function (e) { copyText(out.textContent, e.target); });
    }
  };

  window.TOOL_IMPL["grammar-checker"] = {
    html: area("t", "Paste a draft. It is checked here in your browser, so nothing is uploaded.") +
      '<div class="btns"><button class="btn" id="go">Check the text</button></div>' +
      '<div class="out" id="out">Findings appear here.</div>' +
      '<div class="note"><strong>What this does.</strong> It flags repeated words, double spaces, ' +
      'missing capitals, unspaced punctuation, very long sentences and a list of common padding words. ' +
      'It is a proofreading aid, not a full grammar engine.</div>',
    init: function (root) {
      var padding = ["very", "really", "actually", "basically", "just", "quite", "in order to", "at this point in time"];
      $("#go", root).addEventListener("click", function () {
        var t = $("#t", root).value, found = [];
        (t.match(/\b(\w+)\s+\1\b/gi) || []).forEach(function (m) { found.push("Repeated word: " + m); });
        if (/ {2,}/.test(t)) found.push("Double spaces between words.");
        if (/[,.!?][A-Za-z]/.test(t)) found.push("Punctuation with no space after it.");
        (t.match(/(^|[.!?]\s+)[a-z]/g) || []).forEach(function () {}); 
        if (/(^|[.!?]\s+)[a-z]/.test(t)) found.push("A sentence starts with a lower-case letter.");
        (t.split(/[.!?]/) || []).forEach(function (s) {
          var n = s.trim() ? s.trim().split(/\s+/).length : 0;
          if (n > 35) found.push("Long sentence (" + n + " words): " + s.trim().slice(0, 60) + "…");
        });
        padding.forEach(function (w) {
          var n = (t.toLowerCase().match(new RegExp("\\b" + w + "\\b", "g")) || []).length;
          if (n) found.push('Padding word "' + w + '" used ' + n + " time(s).");
        });
        if (/\bi\b/.test(t)) found.push('Lower-case "i" where "I" is likely meant.');
        $("#out", root).textContent = found.length ? found.join("\n") : "Nothing flagged. That does not guarantee it is correct.";
      });
    }
  };

  window.TOOL_IMPL["text-to-speech"] = {
    html: area("t", "Type what you want read aloud.") +
      '<div class="row"><div class="field"><label for="v">Voice</label><select id="v"></select></div>' +
      '<div class="field"><label for="rate">Speed: <b id="rv">1.0</b>x</label>' +
      '<input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" style="width:100%"></div>' +
      '<div class="field"><label for="pitch">Pitch: <b id="pv">1.0</b></label>' +
      '<input type="range" id="pitch" min="0" max="2" step="0.1" value="1" style="width:100%"></div></div>' +
      '<div class="btns"><button class="btn" id="play">Read it aloud</button>' +
      '<button class="btn ghost" id="stop">Stop</button></div><div class="out" id="out"></div>',
    init: function (root) {
      var synth = window.speechSynthesis, out = $("#out", root);
      if (!synth) { out.textContent = "This browser has no speech synthesis. Try Chrome, Edge or Safari."; return; }
      function fill() {
        var vs = synth.getVoices();
        $("#v", root).innerHTML = vs.map(function (v, i) {
          return '<option value="' + i + '">' + v.name + " (" + v.lang + ")</option>";
        }).join("");
      }
      fill(); synth.onvoiceschanged = fill;
      $("#rate", root).addEventListener("input", function (e) { $("#rv", root).textContent = (+e.target.value).toFixed(1); });
      $("#pitch", root).addEventListener("input", function (e) { $("#pv", root).textContent = (+e.target.value).toFixed(1); });
      $("#play", root).addEventListener("click", function () {
        synth.cancel();
        var u = new SpeechSynthesisUtterance($("#t", root).value);
        var v = synth.getVoices()[+$("#v", root).value];
        if (v) u.voice = v;
        u.rate = +$("#rate", root).value; u.pitch = +$("#pitch", root).value;
        u.onend = function () { out.textContent = "Finished."; };
        out.textContent = "Speaking…"; synth.speak(u);
      });
      $("#stop", root).addEventListener("click", function () { synth.cancel(); out.textContent = "Stopped."; });
    }
  };

  window.TOOL_IMPL["speech-to-text"] = {
    html: '<div class="btns"><button class="btn" id="rec">Start dictating</button>' +
      '<button class="btn ghost" id="stop">Stop</button>' +
      '<button class="btn ghost" id="copy">Copy the text</button></div>' +
      '<div class="field" style="margin-top:14px"><label for="t">Transcript (you can edit it)</label>' +
      '<textarea id="t"></textarea></div><div class="out" id="out">Your browser will ask for microphone permission.</div>',
    init: function (root) {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition, out = $("#out", root);
      if (!SR) { out.textContent = "This browser has no speech recognition. Chrome and Edge support it."; return; }
      var r = new SR(); r.continuous = true; r.interimResults = true; r.lang = navigator.language || "en-US";
      var base = "";
      r.onresult = function (e) {
        var interim = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) base += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        $("#t", root).value = base + interim;
      };
      r.onerror = function (e) { out.textContent = "Recognition stopped: " + e.error; };
      r.onend = function () { out.textContent = "Not listening."; };
      $("#rec", root).addEventListener("click", function () {
        base = $("#t", root).value; try { r.start(); out.textContent = "Listening…"; } catch (e) {}
      });
      $("#stop", root).addEventListener("click", function () { r.stop(); });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#t", root).value, e.target); });
    }
  };

  window.TOOL_IMPL["url-encoder-decoder"] = {
    html: area("t", "Paste a URL or some text.") +
      '<div class="btns"><button class="btn" id="enc">Encode</button>' +
      '<button class="btn" id="dec">Decode</button>' +
      '<button class="btn ghost" id="comp">Encode whole URL</button>' +
      '<button class="btn ghost" id="copy">Copy the result</button></div>' +
      '<div class="out" id="out"></div>',
    init: function (root) {
      var out = $("#out", root), v = function () { return $("#t", root).value; };
      function set(fn) { try { out.textContent = fn(v()); } catch (e) { out.textContent = "That string is not valid encoded text."; } }
      $("#enc", root).addEventListener("click", function () { set(encodeURIComponent); });
      $("#dec", root).addEventListener("click", function () { set(decodeURIComponent); });
      $("#comp", root).addEventListener("click", function () { set(encodeURI); });
      $("#copy", root).addEventListener("click", function (e) { copyText(out.textContent, e.target); });
    }
  };

  window.TOOL_IMPL["fancy-text-generator"] = {
    html: '<div class="field"><label for="t">Your text</label><input type="text" id="t" value="Toolbench"></div>' +
      '<div id="list"></div>',
    init: function (root) {
      function map(start, target) {
        return function (s) {
          return s.replace(/[A-Za-z0-9]/g, function (c) {
            var sets = [["A", "Z"], ["a", "z"], ["0", "9"]];
            for (var i = 0; i < sets.length; i++) {
              if (c >= sets[i][0] && c <= sets[i][1] && target[i] !== null) {
                return String.fromCodePoint(target[i] + (c.codePointAt(0) - sets[i][0].codePointAt(0)));
              }
            }
            return c;
          });
        };
      }
      var flipMap = "abcdefghijklmnopqrstuvwxyz".split("");
      var flipped = "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz".split("");
      var styles = [
        ["Bold", map(0, [0x1D400, 0x1D41A, 0x1D7CE])],
        ["Italic", map(0, [0x1D434, 0x1D44E, null])],
        ["Script", map(0, [0x1D49C, 0x1D4B6, null])],
        ["Monospace", map(0, [0x1D670, 0x1D68A, 0x1D7F6])],
        ["Double-struck", map(0, [0x1D538, 0x1D552, 0x1D7D8])],
        ["Circled", map(0, [0x24B6, 0x24D0, null])],
        ["Full width", map(0, [0xFF21, 0xFF41, 0xFF10])],
        ["Upside down", function (s) {
          return s.toLowerCase().split("").reverse().map(function (c) {
            var i = flipMap.indexOf(c); return i > -1 ? flipped[i] : c;
          }).join("");
        }],
        ["Spaced", function (s) { return s.split("").join(" "); }],
        ["Strikethrough", function (s) { return s.split("").map(function (c) { return c + "\u0336"; }).join(""); }]
      ];
      function run() {
        var s = $("#t", root).value;
        $("#list", root).innerHTML = styles.map(function (st, i) {
          var v = st[1](s);
          return '<div class="stat" style="margin-top:10px;display:flex;justify-content:space-between;gap:12px;align-items:center">' +
            '<span style="font-size:1.1rem;word-break:break-word">' + v + '</span>' +
            '<button class="btn ghost" data-i="' + i + '">Copy</button></div>';
        }).join("");
        $$("[data-i]", root).forEach(function (b) {
          b.addEventListener("click", function () { copyText(styles[+b.dataset.i][1]($("#t", root).value), b); });
        });
      }
      $("#t", root).addEventListener("input", run); run();
    }
  };

  window.TOOL_IMPL["random-text-generator"] = {
    html: '<div class="row"><div class="field"><label for="kind">Style</label>' +
      '<select id="kind"><option value="lorem">Lorem ipsum</option><option value="en">Plain English</option></select></div>' +
      '<div class="field"><label for="unit">Generate</label>' +
      '<select id="unit"><option value="p">Paragraphs</option><option value="s">Sentences</option><option value="w">Words</option></select></div>' +
      '<div class="field"><label for="n">How many</label><input type="number" id="n" value="3" min="1" max="200"></div></div>' +
      '<div class="btns"><button class="btn" id="go">Generate</button><button class="btn ghost" id="copy">Copy</button></div>' +
      '<div class="out" id="out"></div>',
    init: function (root) {
      var lorem = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur".split(" ");
      var eng = "time person year way day thing man world life hand part child eye woman place work week case point government company number group problem fact water light story example paper music market road summer letter answer question reason plan river garden window winter moment".split(" ");
      function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
      function sentence(src) {
        var n = 6 + Math.floor(Math.random() * 12), w = [];
        for (var i = 0; i < n; i++) w.push(pick(src));
        var s = w.join(" ");
        return s.charAt(0).toUpperCase() + s.slice(1) + ".";
      }
      $("#go", root).addEventListener("click", function () {
        var src = $("#kind", root).value === "lorem" ? lorem : eng;
        var n = Math.min(200, Math.max(1, +$("#n", root).value || 1)), u = $("#unit", root).value, out = [];
        if (u === "w") { for (var i = 0; i < n; i++) out.push(pick(src)); $("#out", root).textContent = out.join(" "); return; }
        for (var j = 0; j < n; j++) {
          if (u === "s") out.push(sentence(src));
          else { var p = []; for (var k = 0; k < 3 + Math.floor(Math.random() * 3); k++) p.push(sentence(src)); out.push(p.join(" ")); }
        }
        $("#out", root).textContent = out.join(u === "s" ? " " : "\n\n");
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };
})();
