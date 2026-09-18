/* Social media tools. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  window.TOOL_IMPL["youtube-thumbnail-downloader"] = {
    html: '<div class="field"><label for="u">YouTube link or video ID</label>' +
      '<input type="text" id="u" value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div>' +
      '<div class="btns"><button class="btn" id="go">Show the thumbnails</button></div>' +
      '<div class="out" id="out"></div><div id="grid" class="grid" style="margin-top:16px"></div>' +
      '<div class="note">Thumbnails belong to the person who uploaded the video. Use them for reference, ' +
      'reviews or commentary — not to pass off as your own.</div>',
    init: function (root) {
      function id(s) {
        var m = s.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
        return m ? m[1] : null;
      }
      $("#go", root).addEventListener("click", function () {
        var v = id($("#u", root).value.trim());
        if (!v) { $("#out", root).textContent = "That does not look like a YouTube video link."; return; }
        $("#out", root).textContent = "Video ID: " + v;
        var sizes = [["maxresdefault", "Max (1280×720)"], ["sddefault", "Standard (640×480)"],
          ["hqdefault", "High (480×360)"], ["mqdefault", "Medium (320×180)"], ["default", "Small (120×90)"]];
        $("#grid", root).innerHTML = sizes.map(function (s) {
          var url = "https://img.youtube.com/vi/" + v + "/" + s[0] + ".jpg";
          return '<div class="tile" style="border-left-color:var(--amber)"><img src="' + url + '" alt="' + s[1] +
            '" style="border-radius:6px;margin-bottom:8px" onerror="this.style.display=\'none\'">' +
            '<span class="name">' + s[1] + '</span>' +
            '<a class="btn ghost" style="margin-top:8px" href="' + url + '" target="_blank" rel="noopener">Open full size</a></div>';
        }).join("");
      });
    }
  };

  window.TOOL_IMPL["hashtag-generator"] = {
    html: '<div class="field"><label for="t">What is the post about?</label>' +
      '<input type="text" id="t" value="street food in kathmandu"></div>' +
      '<div class="row"><div class="field"><label for="net">Network</label>' +
      '<select id="net"><option value="ig">Instagram</option><option value="x">X</option>' +
      '<option value="tt">TikTok</option><option value="li">LinkedIn</option></select></div>' +
      '<div class="field"><label for="n">How many</label><input type="number" id="n" value="15" min="1" max="30"></div></div>' +
      '<div class="btns"><button class="btn" id="go">Suggest hashtags</button>' +
      '<button class="btn ghost" id="copy">Copy</button></div><div class="out" id="out"></div>' +
      '<div class="note">These are built from your own words plus common modifiers. Check each one in the app ' +
      'before posting — volume and relevance change constantly, and a tag can pick up meanings you did not intend.</div>',
    init: function (root) {
      var mods = { ig: ["daily", "love", "life", "gram", "photography", "lover", "style", "vibes", "oftheday", "community"],
        x: ["news", "tips", "thread", "chat", "talk", "now"],
        tt: ["fyp", "foryou", "viral", "tutorial", "hack", "check"],
        li: ["career", "leadership", "hiring", "growth", "strategy", "insights"] };
      $("#go", root).addEventListener("click", function () {
        var words = ($("#t", root).value.toLowerCase().match(/[a-z0-9]+/g) || []).filter(function (w) { return w.length > 2; });
        if (!words.length) return ($("#out", root).textContent = "Describe the post first.");
        var net = $("#net", root).value, n = Math.min(30, +$("#n", root).value || 10);
        var tags = [], joined = words.join("");
        tags.push("#" + joined);
        words.forEach(function (w) { tags.push("#" + w); });
        words.forEach(function (w) { mods[net].forEach(function (m) { tags.push("#" + w + m); }); });
        mods[net].forEach(function (m) { tags.push("#" + joined.slice(0, 18) + m); });
        tags = tags.filter(function (t, i, a) { return a.indexOf(t) === i && t.length < 32; }).slice(0, n);
        $("#out", root).textContent = tags.join(" ");
      });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#out", root).textContent, e.target); });
    }
  };

  window.TOOL_IMPL["social-media-post-generator"] = {
    html: '<div class="field"><label for="msg">What do you want to say?</label>' +
      '<textarea id="msg" style="min-height:110px">We rebuilt our checkout and it is now three steps instead of seven.</textarea></div>' +
      '<div class="row"><div class="field"><label for="tone">Tone</label>' +
      '<select id="tone"><option value="plain">Plain</option><option value="warm">Warm</option>' +
      '<option value="direct">Direct</option><option value="curious">Curious</option></select></div>' +
      '<div class="field"><label for="cta">Call to action</label><input type="text" id="cta" value="Try it and tell us what breaks."></div>' +
      '<div class="field"><label for="tags">Hashtags (optional)</label><input type="text" id="tags" value="#product #design"></div></div>' +
      '<div class="btns"><button class="btn" id="go">Draft the posts</button></div><div id="cards"></div>' +
      '<div class="note">These are templates built from your own sentence — nothing is invented and no AI model ' +
      'is called. Edit before posting.</div>',
    init: function (root) {
      var nets = [["X", 280], ["LinkedIn", 3000], ["Instagram caption", 2200], ["Facebook", 63206], ["Threads", 500]];
      var openers = { plain: "", warm: "Small thing we are happy about: ", direct: "Straight to it: ", curious: "A question we kept asking: " };
      $("#go", root).addEventListener("click", function () {
        var msg = $("#msg", root).value.trim(), cta = $("#cta", root).value.trim(), tags = $("#tags", root).value.trim();
        var open = openers[$("#tone", root).value];
        $("#cards", root).innerHTML = nets.map(function (n, i) {
          var body = open + msg + (cta ? "\n\n" + cta : "") + (tags && n[0] !== "LinkedIn" ? "\n\n" + tags : "");
          if (body.length > n[1]) body = body.slice(0, n[1] - 1) + "…";
          return '<div class="panel" style="margin-top:14px"><h3>' + n[0] + '</h3>' +
            '<div class="out" style="margin-top:0">' + body.replace(/</g, "&lt;") + '</div>' +
            '<p style="font-size:.85rem;color:var(--ink-2);margin:8px 0 0">' + body.length + " of " + n[1] +
            ' characters <button class="btn ghost" data-i="' + i + '" style="margin-left:8px">Copy</button></p></div>';
        }).join("");
        $$("[data-i]", root).forEach(function (b) {
          b.addEventListener("click", function () {
            copyText(b.closest(".panel").querySelector(".out").textContent, b);
          });
        });
      });
      $("#go", root).click();
    }
  };

  window.TOOL_IMPL["twitter-character-counter"] = {
    html: '<div class="field"><label for="t">Your post</label><textarea id="t" style="min-height:130px"></textarea></div>' +
      '<div class="stats"><div class="stat"><b id="c">0</b><span>Counted characters</span></div>' +
      '<div class="stat"><b id="left">280</b><span>Left</span></div>' +
      '<div class="stat"><b id="links">0</b><span>Links</span></div>' +
      '<div class="stat"><b id="posts">1</b><span>Posts in a thread</span></div></div>' +
      '<div class="out" id="split">Anything over the limit is split into a thread below.</div>' +
      '<div class="note">X counts every link as 23 characters however long it is, and counts most CJK characters ' +
      'as two. Both rules are applied here.</div>',
    init: function (root) {
      function weigh(s) {
        var links = s.match(/https?:\/\/\S+/g) || [];
        var rest = s.replace(/https?:\/\/\S+/g, "");
        var n = 0;
        for (var ch of rest) n += /[\u1100-\u11FF\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1;
        return { n: n + links.length * 23, links: links.length };
      }
      var t = $("#t", root);
      function run() {
        var r = weigh(t.value);
        $("#c", root).textContent = r.n;
        $("#left", root).textContent = 280 - r.n;
        $("#links", root).textContent = r.links;
        var parts = [];
        if (r.n > 280) {
          var words = t.value.split(/\s+/), cur = "";
          words.forEach(function (w) {
            if (weigh(cur + " " + w).n > 265) { parts.push(cur.trim()); cur = w; }
            else cur += " " + w;
          });
          if (cur.trim()) parts.push(cur.trim());
          $("#split", root).textContent = parts.map(function (p, i) {
            return (i + 1) + "/" + parts.length + " " + p;
          }).join("\n\n");
        } else {
          $("#split", root).textContent = "Within the limit — no thread needed.";
        }
        $("#posts", root).textContent = parts.length || 1;
      }
      t.addEventListener("input", run); run();
    }
  };

  window.TOOL_IMPL["emoji-keyboard"] = {
    html: '<div class="field"><label for="q">Search</label><input type="text" id="q" placeholder="heart, food, flag…"></div>' +
      '<div class="field"><label for="picked">Your picks</label><input type="text" id="picked"></div>' +
      '<div class="btns"><button class="btn" id="copy">Copy the picks</button>' +
      '<button class="btn ghost" id="clear">Clear</button></div><div id="groups"></div>',
    init: function (root) {
      var data = [
        ["Faces", "😀 grin,😃 smile,😄 happy,😁 beam,😆 laugh,😅 sweat,🤣 rofl,😂 joy,🙂 slight,🙃 upside,😉 wink,😊 blush,😍 love,🤩 star,😘 kiss,😗 kiss,🤔 think,🤨 brow,😐 neutral,😑 expressionless,😴 sleep,😢 cry,😭 sob,😤 huff,😡 angry,🥳 party,🤯 mind,🥺 plead,😎 cool,🤗 hug"],
        ["Hands", "👍 thumbs up,👎 thumbs down,👌 ok,✌️ peace,🤞 fingers crossed,🤝 handshake,👏 clap,🙌 raise,🙏 pray,💪 strong,👋 wave,🤙 call,✍️ write,👉 point,👀 eyes"],
        ["Hearts", "❤️ red heart,🧡 orange,💛 yellow,💚 green,💙 blue,💜 purple,🖤 black,🤍 white,💔 broken,💕 two hearts,💖 sparkle heart,💗 growing,💘 arrow,💝 gift heart"],
        ["Nature", "🌞 sun,🌙 moon,⭐ star,🌟 glow,🔥 fire,💧 drop,🌈 rainbow,❄️ snow,⚡ lightning,🌊 wave,🌱 seedling,🌳 tree,🌸 blossom,🌻 sunflower,🍀 clover,🐶 dog,🐱 cat,🐦 bird,🐟 fish,🦋 butterfly"],
        ["Food", "🍎 apple,🍌 banana,🍇 grapes,🍓 strawberry,🍕 pizza,🍔 burger,🍟 fries,🌮 taco,🍜 noodles,🍣 sushi,🍚 rice,🍩 donut,🎂 cake,☕ coffee,🍵 tea,🍺 beer,🥂 cheers,🧊 ice"],
        ["Travel", "✈️ plane,🚗 car,🚕 taxi,🚌 bus,🚲 bike,🛵 scooter,🚂 train,🚀 rocket,⛵ boat,🏔️ mountain,🏖️ beach,🗺️ map,🧭 compass,🏕️ camp,🏠 home"],
        ["Objects", "💻 laptop,📱 phone,⌨️ keyboard,🖨️ printer,📷 camera,🎧 headphones,💡 idea,🔑 key,🔒 lock,📎 clip,📌 pin,📝 memo,📚 books,✏️ pencil,🗑️ bin,⏰ clock,💰 money,🎁 gift"],
        ["Symbols", "✅ check,❌ cross,⚠️ warning,❓ question,❗ exclamation,💯 hundred,🔁 repeat,➡️ right,⬅️ left,⬆️ up,⬇️ down,🔍 search,♻️ recycle,🆕 new,🔴 red,🟢 green,🔵 blue"]
      ];
      function render(filter) {
        $("#groups", root).innerHTML = data.map(function (g) {
          var items = g[1].split(",").map(function (s) {
            var p = s.trim().split(" ");
            return { e: p[0], n: p.slice(1).join(" ") };
          }).filter(function (it) { return !filter || it.n.indexOf(filter) > -1; });
          if (!items.length) return "";
          return "<h3 style=\"margin-top:20px\">" + g[0] + '</h3><div class="emoji-grid">' +
            items.map(function (it) {
              return '<button type="button" title="' + it.n + '" data-e="' + it.e + '">' + it.e + "</button>";
            }).join("") + "</div>";
        }).join("") || '<p style="color:var(--ink-2)">No emoji matches that word.</p>';
        $$("[data-e]", root).forEach(function (b) {
          b.addEventListener("click", function () {
            $("#picked", root).value += b.dataset.e;
            copyText(b.dataset.e, null);
          });
        });
      }
      $("#q", root).addEventListener("input", function (e) { render(e.target.value.trim().toLowerCase()); });
      $("#clear", root).addEventListener("click", function () { $("#picked", root).value = ""; });
      $("#copy", root).addEventListener("click", function (e) { copyText($("#picked", root).value, e.target); });
      render("");
    }
  };
})();
