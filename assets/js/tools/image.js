/* Image tools — every conversion happens on a <canvas> in the browser. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  function loadScript(src, cb, fail) {
    var s = document.createElement("script");
    s.src = src; s.onload = cb; s.onerror = fail || function () {};
    document.head.appendChild(s);
  }

  function picker(label, multiple) {
    return '<div class="field"><label for="file">' + label + '</label>' +
      '<input type="file" id="file" accept="image/*"' + (multiple ? " multiple" : "") + '></div>';
  }

  /* Generic "open an image, re-encode it, download it" tool. */
  function converter(opts) {
    return {
      html: picker("Choose an image") +
        (opts.quality ? '<div class="field"><label for="q">Quality: <b id="qv">85</b>%</label>' +
          '<input type="range" id="q" min="10" max="100" value="85" style="width:100%"></div>' : "") +
        '<div class="btns"><button class="btn" id="go" disabled>Convert and download</button></div>' +
        '<div class="out" id="out">Your image stays on this device. Nothing is uploaded.</div>' +
        '<div id="prev" style="margin-top:14px"></div>',
      init: function (root) {
        var file = $("#file", root), go = $("#go", root), out = $("#out", root),
            prev = $("#prev", root), q = $("#q", root), img = null, name = "image";
        if (q) q.addEventListener("input", function () { $("#qv", root).textContent = q.value; });
        file.addEventListener("change", function () {
          var f = file.files[0]; if (!f) return;
          name = f.name.replace(/\.[^.]+$/, "");
          readImage(f, function (i) {
            img = i; go.disabled = false;
            out.textContent = f.name + " — " + i.width + "x" + i.height + ", " + fmtBytes(f.size);
            prev.innerHTML = ""; i.style.maxHeight = "260px"; i.style.borderRadius = "8px"; prev.appendChild(i);
          });
        });
        go.addEventListener("click", function () {
          if (!img) return;
          var c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          var ctx = c.getContext("2d");
          if (opts.mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0);
          c.toBlob(function (b) {
            download(b, name + opts.ext);
            out.textContent = "Saved " + name + opts.ext + " — " + fmtBytes(b.size);
          }, opts.mime, q ? q.value / 100 : undefined);
        });
      }
    };
  }

  window.TOOL_IMPL["image-to-png"] = converter({ mime: "image/png", ext: ".png" });
  window.TOOL_IMPL["webp-to-png"] = converter({ mime: "image/png", ext: ".png" });
  window.TOOL_IMPL["image-to-jpg"] = converter({ mime: "image/jpeg", ext: ".jpg", quality: true });
  window.TOOL_IMPL["image-compressor"] = converter({ mime: "image/jpeg", ext: ".jpg", quality: true });

  window.TOOL_IMPL["image-resizer"] = {
    html: picker("Choose an image") +
      '<div class="row"><div class="field"><label for="w">Width (px)</label><input type="number" id="w" min="1"></div>' +
      '<div class="field"><label for="h">Height (px)</label><input type="number" id="h" min="1"></div>' +
      '<div class="field"><label for="p">Or scale to (%)</label><input type="number" id="p" min="1" value="100"></div></div>' +
      '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="lock" checked> Keep the original proportions</label>' +
      '<div class="btns" style="margin-top:14px"><button class="btn" id="go" disabled>Resize and download</button></div>' +
      '<div class="out" id="out">Pick an image to see its size.</div>',
    init: function (root) {
      var img = null, name = "image", ratio = 1;
      var w = $("#w", root), h = $("#h", root), p = $("#p", root), lock = $("#lock", root), out = $("#out", root);
      $("#file", root).addEventListener("change", function (e) {
        var f = e.target.files[0]; if (!f) return;
        name = f.name.replace(/\.[^.]+$/, "");
        readImage(f, function (i) {
          img = i; ratio = i.naturalWidth / i.naturalHeight;
          w.value = i.naturalWidth; h.value = i.naturalHeight;
          $("#go", root).disabled = false;
          out.textContent = "Original: " + i.naturalWidth + " x " + i.naturalHeight + " px";
        });
      });
      w.addEventListener("input", function () { if (lock.checked && w.value) h.value = Math.round(w.value / ratio); });
      h.addEventListener("input", function () { if (lock.checked && h.value) w.value = Math.round(h.value * ratio); });
      p.addEventListener("input", function () {
        if (!img) return;
        w.value = Math.max(1, Math.round(img.naturalWidth * p.value / 100));
        h.value = Math.max(1, Math.round(img.naturalHeight * p.value / 100));
      });
      $("#go", root).addEventListener("click", function () {
        if (!img) return;
        var c = document.createElement("canvas");
        c.width = Math.max(1, +w.value); c.height = Math.max(1, +h.value);
        var ctx = c.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) {
          download(b, name + "-" + c.width + "x" + c.height + ".png");
          out.textContent = "Saved at " + c.width + " x " + c.height + " px — " + fmtBytes(b.size);
        }, "image/png");
      });
    }
  };

  window.TOOL_IMPL["image-cropper"] = {
    html: picker("Choose an image") +
      '<p style="font-size:.9rem;color:var(--ink-2)">Drag a rectangle over the image, then save the selection.</p>' +
      '<canvas id="cv" style="max-width:100%;border:1px solid var(--line);border-radius:8px;cursor:crosshair"></canvas>' +
      '<div class="btns" style="margin-top:14px"><button class="btn" id="go" disabled>Save the selection</button>' +
      '<button class="btn ghost" id="reset">Clear selection</button></div>' +
      '<div class="out" id="out">No image open yet.</div>',
    init: function (root) {
      var cv = $("#cv", root), ctx = cv.getContext("2d"), img = null, name = "crop";
      var sel = null, start = null, drawing = false;
      function redraw() {
        if (!img) return;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        if (sel) {
          ctx.fillStyle = "rgba(23,26,31,.45)";
          ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.drawImage(img, sel.x * img.naturalWidth / cv.width, sel.y * img.naturalHeight / cv.height,
            sel.w * img.naturalWidth / cv.width, sel.h * img.naturalHeight / cv.height, sel.x, sel.y, sel.w, sel.h);
          ctx.strokeStyle = "#E0A500"; ctx.lineWidth = 2; ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
        }
      }
      function pos(e) {
        var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
        return { x: (t.clientX - r.left) * cv.width / r.width, y: (t.clientY - r.top) * cv.height / r.height };
      }
      $("#file", root).addEventListener("change", function (e) {
        var f = e.target.files[0]; if (!f) return;
        name = f.name.replace(/\.[^.]+$/, "");
        readImage(f, function (i) {
          img = i;
          var scale = Math.min(1, 760 / i.naturalWidth);
          cv.width = Math.round(i.naturalWidth * scale); cv.height = Math.round(i.naturalHeight * scale);
          sel = null; redraw();
          $("#out", root).textContent = "Drag on the image to choose an area.";
        });
      });
      function down(e) { if (!img) return; drawing = true; start = pos(e); sel = null; e.preventDefault(); }
      function move(e) {
        if (!drawing) return;
        var p = pos(e);
        sel = { x: Math.min(p.x, start.x), y: Math.min(p.y, start.y),
                w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
        redraw(); e.preventDefault();
      }
      function up() {
        drawing = false;
        if (sel && sel.w > 4 && sel.h > 4) {
          $("#go", root).disabled = false;
          var sx = img.naturalWidth / cv.width;
          $("#out", root).textContent = "Selection: " + Math.round(sel.w * sx) + " x " +
            Math.round(sel.h * img.naturalHeight / cv.height) + " px";
        }
      }
      cv.addEventListener("mousedown", down); cv.addEventListener("touchstart", down);
      window.addEventListener("mousemove", move); cv.addEventListener("touchmove", move);
      window.addEventListener("mouseup", up); cv.addEventListener("touchend", up);
      $("#reset", root).addEventListener("click", function () { sel = null; $("#go", root).disabled = true; redraw(); });
      $("#go", root).addEventListener("click", function () {
        if (!sel || !img) return;
        var sx = img.naturalWidth / cv.width, sy = img.naturalHeight / cv.height;
        var c = document.createElement("canvas");
        c.width = Math.round(sel.w * sx); c.height = Math.round(sel.h * sy);
        c.getContext("2d").drawImage(img, sel.x * sx, sel.y * sy, c.width, c.height, 0, 0, c.width, c.height);
        c.toBlob(function (b) { download(b, name + "-cropped.png"); }, "image/png");
      });
    }
  };

  window.TOOL_IMPL["image-to-base64"] = {
    html: picker("Choose an image") +
      '<div class="btns"><button class="btn ghost" id="copy">Copy the data URI</button>' +
      '<button class="btn ghost" id="copycss">Copy as CSS background</button></div>' +
      '<div class="out" id="out">The encoded string appears here. Files over about 100&nbsp;KB make very long strings.</div>',
    init: function (root) {
      var uri = "";
      $("#file", root).addEventListener("change", function (e) {
        var f = e.target.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          uri = r.result;
          $("#out", root).textContent = uri.length > 20000 ? uri.slice(0, 20000) + "\n… truncated for display; copying still gives you the whole string." : uri;
        };
        r.readAsDataURL(f);
      });
      $("#copy", root).addEventListener("click", function (e) { copyText(uri, e.target); });
      $("#copycss", root).addEventListener("click", function (e) {
        copyText("background-image: url(\"" + uri + "\");", e.target);
      });
    }
  };

  window.TOOL_IMPL["gif-maker"] = {
    html: picker("Choose two or more images, in order", true) +
      '<div class="row"><div class="field"><label for="delay">Frame delay (ms)</label>' +
      '<input type="number" id="delay" value="400" min="20"></div>' +
      '<div class="field"><label for="width">Output width (px)</label><input type="number" id="width" value="480" min="16"></div></div>' +
      '<div class="btns"><button class="btn" id="go" disabled>Build the GIF</button></div>' +
      '<div class="out" id="out">Pick your frames to start.</div><div id="prev" style="margin-top:14px"></div>',
    init: function (root) {
      var files = [], ready = false, out = $("#out", root);
      loadScript("https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.js",
        function () { ready = true; },
        function () { out.textContent = "The GIF encoder could not be loaded. Check your connection and reload."; });
      $("#file", root).addEventListener("change", function (e) {
        files = Array.prototype.slice.call(e.target.files);
        $("#go", root).disabled = files.length < 2;
        out.textContent = files.length + " frame(s) selected.";
      });
      $("#go", root).addEventListener("click", function () {
        if (!ready) return (out.textContent = "The encoder is still loading — try again in a second.");
        out.textContent = "Encoding…";
        var w = Math.max(16, +$("#width", root).value), delay = Math.max(20, +$("#delay", root).value);
        var imgs = [], loaded = 0;
        files.forEach(function (f, i) {
          readImage(f, function (img) {
            imgs[i] = img;
            if (++loaded === files.length) encode(imgs, w, delay);
          });
        });
      });
      function encode(imgs, w, delay) {
        var h = Math.round(w * imgs[0].naturalHeight / imgs[0].naturalWidth);
        var gif = new GIF({ workers: 2, quality: 10, width: w, height: h,
          workerScript: "https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.worker.js" });
        imgs.forEach(function (img) {
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var ctx = c.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          gif.addFrame(ctx, { copy: true, delay: delay });
        });
        gif.on("finished", function (blob) {
          $("#out", root).textContent = "Done — " + fmtBytes(blob.size);
          var url = URL.createObjectURL(blob);
          $("#prev", root).innerHTML = '<img src="' + url + '" alt="Your animation" style="border-radius:8px">';
          download(blob, "animation.gif");
        });
        gif.render();
      }
    }
  };

  window.TOOL_IMPL["qr-code-generator"] = {
    html: '<div class="field"><label for="txt">Link or text</label>' +
      '<input type="text" id="txt" value="https://example.com" placeholder="https://example.com"></div>' +
      '<div class="row"><div class="field"><label for="size">Size (px)</label>' +
      '<input type="number" id="size" value="260" min="80" max="1000"></div>' +
      '<div class="field"><label for="fg">Foreground</label><input type="color" id="fg" value="#171A1F" style="height:42px;width:100%"></div>' +
      '<div class="field"><label for="bg">Background</label><input type="color" id="bg" value="#ffffff" style="height:42px;width:100%"></div></div>' +
      '<div class="btns"><button class="btn" id="go">Make the QR code</button>' +
      '<button class="btn ghost" id="dl">Download PNG</button></div>' +
      '<div id="qr" style="margin-top:18px"></div>',
    init: function (root) {
      var ready = false;
      loadScript("https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js", function () { ready = true; draw(); },
        function () { $("#qr", root).textContent = "The QR library could not be loaded. Check your connection and reload."; });
      function draw() {
        if (!ready) return;
        var host = $("#qr", root); host.innerHTML = "";
        var size = Math.min(1000, Math.max(80, +$("#size", root).value || 260));
        new QRCode(host, { text: $("#txt", root).value || " ", width: size, height: size,
          colorDark: $("#fg", root).value, colorLight: $("#bg", root).value });
      }
      $("#go", root).addEventListener("click", draw);
      $("#txt", root).addEventListener("change", draw);
      $("#dl", root).addEventListener("click", function () {
        var c = $("#qr canvas", root), i = $("#qr img", root);
        if (c) download(c.toDataURL("image/png"), "qr-code.png");
        else if (i) download(i.src, "qr-code.png");
      });
    }
  };

  window.TOOL_IMPL["images-to-pdf"] = {
    html: picker("Choose screenshots or photos, in order", true) +
      '<div class="row"><div class="field"><label for="size">Page size</label>' +
      '<select id="size"><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit each image</option></select></div>' +
      '<div class="field"><label for="orient">Orientation</label>' +
      '<select id="orient"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div></div>' +
      '<div class="btns"><button class="btn" id="go" disabled>Build the PDF</button></div>' +
      '<div class="out" id="out">One image becomes one page.</div>',
    init: function (root) {
      var files = [], ready = false, out = $("#out", root);
      loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", function () { ready = true; },
        function () { out.textContent = "The PDF library could not be loaded. Check your connection and reload."; });
      $("#file", root).addEventListener("change", function (e) {
        files = Array.prototype.slice.call(e.target.files);
        $("#go", root).disabled = !files.length;
        out.textContent = files.length + " image(s) ready.";
      });
      $("#go", root).addEventListener("click", function () {
        if (!ready) return (out.textContent = "The PDF library is still loading — try again in a second.");
        var imgs = [], loaded = 0;
        files.forEach(function (f, i) {
          readImage(f, function (img, uri) { imgs[i] = { img: img, uri: uri }; if (++loaded === files.length) build(imgs); });
        });
      });
      function build(imgs) {
        var jsPDF = window.jspdf.jsPDF, size = $("#size", root).value, orient = $("#orient", root).value;
        var doc = null;
        imgs.forEach(function (it, i) {
          var iw = it.img.naturalWidth, ih = it.img.naturalHeight;
          if (size === "fit") {
            var fmt = [iw * 0.75, ih * 0.75];
            if (!doc) doc = new jsPDF({ unit: "pt", format: fmt, orientation: iw > ih ? "landscape" : "portrait" });
            else doc.addPage(fmt, iw > ih ? "landscape" : "portrait");
            doc.addImage(it.uri, 0, 0, fmt[0], fmt[1]);
          } else {
            if (!doc) doc = new jsPDF({ unit: "pt", format: size, orientation: orient });
            else doc.addPage(size, orient);
            var pw = doc.internal.pageSize.getWidth() - 40, ph = doc.internal.pageSize.getHeight() - 40;
            var r = Math.min(pw / iw, ph / ih), w = iw * r, h = ih * r;
            doc.addImage(it.uri, 20 + (pw - w) / 2, 20 + (ph - h) / 2, w, h);
          }
        });
        doc.save("images.pdf");
        $("#out", root).textContent = "Saved images.pdf with " + imgs.length + " page(s).";
      }
    }
  };
})();
