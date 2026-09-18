/* Calculators. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function money(n) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  window.TOOL_IMPL["percentage-calculator"] = {
    html: '<h3>What is X% of Y?</h3><div class="row"><div class="field"><label for="a1">Percent</label>' +
      '<input type="number" id="a1" value="15"></div><div class="field"><label for="a2">Of</label>' +
      '<input type="number" id="a2" value="200"></div></div><div class="out" id="r1"></div>' +
      '<h3 style="margin-top:24px">X is what percent of Y?</h3><div class="row">' +
      '<div class="field"><label for="b1">Number</label><input type="number" id="b1" value="30"></div>' +
      '<div class="field"><label for="b2">Of</label><input type="number" id="b2" value="200"></div></div>' +
      '<div class="out" id="r2"></div>' +
      '<h3 style="margin-top:24px">Change from X to Y</h3><div class="row">' +
      '<div class="field"><label for="c1">From</label><input type="number" id="c1" value="200"></div>' +
      '<div class="field"><label for="c2">To</label><input type="number" id="c2" value="250"></div></div>' +
      '<div class="out" id="r3"></div>',
    init: function (root) {
      function run() {
        var a = num($("#a1", root).value) / 100 * num($("#a2", root).value);
        $("#r1", root).textContent = a.toLocaleString();
        var b2 = num($("#b2", root).value);
        $("#r2", root).textContent = b2 ? (num($("#b1", root).value) / b2 * 100).toFixed(2) + "%" : "Divide by zero.";
        var c1 = num($("#c1", root).value), c2 = num($("#c2", root).value);
        $("#r3", root).textContent = c1
          ? (c2 >= c1 ? "Increase of " : "Decrease of ") + Math.abs((c2 - c1) / c1 * 100).toFixed(2) +
            "% (" + (c2 - c1).toLocaleString() + ")"
          : "Divide by zero.";
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); }); run();
    }
  };

  window.TOOL_IMPL["age-calculator"] = {
    html: '<div class="row"><div class="field"><label for="dob">Date of birth</label><input type="date" id="dob"></div>' +
      '<div class="field"><label for="on">Age on</label><input type="date" id="on"></div></div>' +
      '<div class="stats"><div class="stat"><b id="y">0</b><span>Years</span></div>' +
      '<div class="stat"><b id="m">0</b><span>Months</span></div><div class="stat"><b id="d">0</b><span>Days</span></div>' +
      '<div class="stat"><b id="td">0</b><span>Days lived</span></div></div><div class="out" id="out"></div>',
    init: function (root) {
      var on = $("#on", root); on.value = new Date().toISOString().slice(0, 10);
      function run() {
        var a = $("#dob", root).value, b = on.value;
        if (!a || !b) return;
        var d1 = new Date(a), d2 = new Date(b);
        if (d2 < d1) { $("#out", root).textContent = "The second date is before the date of birth."; return; }
        var y = d2.getFullYear() - d1.getFullYear(), m = d2.getMonth() - d1.getMonth(), dd = d2.getDate() - d1.getDate();
        if (dd < 0) { m--; dd += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var total = Math.floor((d2 - d1) / 86400000);
        $("#y", root).textContent = y; $("#m", root).textContent = m; $("#d", root).textContent = dd;
        $("#td", root).textContent = total.toLocaleString();
        var next = new Date(d2.getFullYear(), d1.getMonth(), d1.getDate());
        if (next < d2) next.setFullYear(next.getFullYear() + 1);
        $("#out", root).textContent = "That is about " + Math.floor(total / 7).toLocaleString() + " weeks and " +
          (total * 24).toLocaleString() + " hours.\nNext birthday: " + next.toDateString() +
          " — " + Math.ceil((next - d2) / 86400000) + " day(s) away.";
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); });
    }
  };

  window.TOOL_IMPL["bmi-calculator"] = {
    html: '<div class="field"><label for="u">Units</label><select id="u">' +
      '<option value="m">Metric (kg, cm)</option><option value="i">Imperial (lb, ft/in)</option></select></div>' +
      '<div class="row" id="metric"><div class="field"><label for="kg">Weight (kg)</label><input type="number" id="kg" value="70"></div>' +
      '<div class="field"><label for="cm">Height (cm)</label><input type="number" id="cm" value="175"></div></div>' +
      '<div class="row" id="imp" style="display:none"><div class="field"><label for="lb">Weight (lb)</label><input type="number" id="lb" value="154"></div>' +
      '<div class="field"><label for="ft">Height (ft)</label><input type="number" id="ft" value="5"></div>' +
      '<div class="field"><label for="in">and (in)</label><input type="number" id="in" value="9"></div></div>' +
      '<div class="stats"><div class="stat"><b id="bmi">0</b><span>BMI</span></div>' +
      '<div class="stat"><b id="cat" style="font-size:1rem">—</b><span>Category</span></div></div>' +
      '<div class="note">BMI is a rough population measure. It ignores muscle, build and age, so treat it as one ' +
      'signal among many rather than a verdict on your health. A doctor can put it in context.</div>',
    init: function (root) {
      function run() {
        var metric = $("#u", root).value === "m", kg, m;
        $("#metric", root).style.display = metric ? "flex" : "none";
        $("#imp", root).style.display = metric ? "none" : "flex";
        if (metric) { kg = num($("#kg", root).value); m = num($("#cm", root).value) / 100; }
        else { kg = num($("#lb", root).value) * 0.45359237; m = (num($("#ft", root).value) * 12 + num($("#in", root).value)) * 0.0254; }
        if (!m) return;
        var b = kg / (m * m);
        $("#bmi", root).textContent = b.toFixed(1);
        $("#cat", root).textContent = b < 18.5 ? "Underweight" : b < 25 ? "Healthy range" : b < 30 ? "Overweight" : "Obese";
      }
      $$("input,select", root).forEach(function (i) { i.addEventListener("input", run); }); run();
    }
  };

  window.TOOL_IMPL["loan-emi-calculator"] = {
    html: '<div class="row"><div class="field"><label for="p">Loan amount</label><input type="number" id="p" value="250000"></div>' +
      '<div class="field"><label for="r">Interest rate (% a year)</label><input type="number" id="r" value="9.5" step="0.01"></div>' +
      '<div class="field"><label for="n">Term (years)</label><input type="number" id="n" value="15"></div></div>' +
      '<div class="stats"><div class="stat"><b id="emi">0</b><span>Per month</span></div>' +
      '<div class="stat"><b id="int">0</b><span>Total interest</span></div>' +
      '<div class="stat"><b id="tot">0</b><span>Total paid</span></div></div>' +
      '<div class="btns" style="margin-top:14px"><button class="btn ghost" id="sched">Show the yearly schedule</button></div>' +
      '<div id="tbl"></div>',
    init: function (root) {
      var last = null;
      function run() {
        var P = num($("#p", root).value), r = num($("#r", root).value) / 1200, n = num($("#n", root).value) * 12;
        if (!P || !n) return;
        var emi = r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
        $("#emi", root).textContent = money(emi);
        $("#tot", root).textContent = money(emi * n);
        $("#int", root).textContent = money(emi * n - P);
        last = { P: P, r: r, n: n, emi: emi };
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); }); run();
      $("#sched", root).addEventListener("click", function () {
        if (!last) return;
        var bal = last.P, rows = [], year = 0, pi = 0, pp = 0;
        for (var i = 1; i <= last.n; i++) {
          var interest = bal * last.r, principal = last.emi - interest;
          bal -= principal; pi += interest; pp += principal;
          if (i % 12 === 0 || i === last.n) {
            year++;
            rows.push("<tr><td>" + year + "</td><td>" + money(pp) + "</td><td>" + money(pi) + "</td><td>" +
              money(Math.max(0, bal)) + "</td></tr>");
            pi = pp = 0;
          }
        }
        $("#tbl", root).innerHTML = '<table class="data"><thead><tr><th>Year</th><th>Principal</th>' +
          '<th>Interest</th><th>Balance</th></tr></thead><tbody>' + rows.join("") + "</tbody></table>";
      });
    }
  };

  window.TOOL_IMPL["discount-calculator"] = {
    html: '<div class="row"><div class="field"><label for="p">Original price</label><input type="number" id="p" value="120"></div>' +
      '<div class="field"><label for="d">Discount (%)</label><input type="number" id="d" value="25"></div>' +
      '<div class="field"><label for="t">Tax added after (%)</label><input type="number" id="t" value="0"></div></div>' +
      '<div class="stats"><div class="stat"><b id="final">0</b><span>You pay</span></div>' +
      '<div class="stat"><b id="save">0</b><span>You save</span></div></div>',
    init: function (root) {
      function run() {
        var p = num($("#p", root).value), d = num($("#d", root).value), t = num($("#t", root).value);
        var after = p * (1 - d / 100), withTax = after * (1 + t / 100);
        $("#final", root).textContent = money(withTax);
        $("#save", root).textContent = money(p - after);
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); }); run();
    }
  };

  window.TOOL_IMPL["tip-calculator"] = {
    html: '<div class="row"><div class="field"><label for="b">Bill</label><input type="number" id="b" value="48.50"></div>' +
      '<div class="field"><label for="t">Tip (%)</label><input type="number" id="t" value="15"></div>' +
      '<div class="field"><label for="n">Split between</label><input type="number" id="n" value="2" min="1"></div></div>' +
      '<div class="btns">' + [10, 15, 18, 20, 25].map(function (p) {
        return '<button class="btn ghost" data-t="' + p + '">' + p + "%</button>"; }).join("") + '</div>' +
      '<div class="stats"><div class="stat"><b id="tip">0</b><span>Tip</span></div>' +
      '<div class="stat"><b id="tot">0</b><span>Total</span></div>' +
      '<div class="stat"><b id="each">0</b><span>Each</span></div></div>',
    init: function (root) {
      function run() {
        var b = num($("#b", root).value), t = num($("#t", root).value), n = Math.max(1, num($("#n", root).value));
        var tip = b * t / 100;
        $("#tip", root).textContent = money(tip);
        $("#tot", root).textContent = money(b + tip);
        $("#each", root).textContent = money((b + tip) / n);
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); });
      $$("[data-t]", root).forEach(function (btn) {
        btn.addEventListener("click", function () { $("#t", root).value = btn.dataset.t; run(); });
      });
      run();
    }
  };

  window.TOOL_IMPL["binary-to-decimal"] = {
    html: '<div class="row">' +
      ["bin,Binary,2", "oct,Octal,8", "dec,Decimal,10", "hex,Hexadecimal,16"].map(function (s) {
        var p = s.split(",");
        return '<div class="field"><label for="' + p[0] + '">' + p[1] + '</label>' +
          '<input type="text" id="' + p[0] + '" data-base="' + p[2] + '"></div>';
      }).join("") + '</div><div class="out" id="out">Type in any box; the others follow.</div>',
    init: function (root) {
      var inputs = $$("[data-base]", root);
      inputs.forEach(function (el) {
        el.addEventListener("input", function () {
          var v = parseInt(el.value.replace(/\s/g, ""), +el.dataset.base);
          if (!isFinite(v)) { $("#out", root).textContent = "That is not a valid number in base " + el.dataset.base + "."; return; }
          inputs.forEach(function (o) { if (o !== el) o.value = v.toString(+o.dataset.base).toUpperCase(); });
          $("#out", root).textContent = v.toLocaleString() + " in decimal — " + v.toString(2).length + " bits.";
        });
      });
      $("#dec", root).value = "255";
      $("#dec", root).dispatchEvent(new Event("input"));
    }
  };

  window.TOOL_IMPL["scientific-calculator"] = {
    html: '<div class="field"><label for="exp">Expression</label>' +
      '<input type="text" id="exp" value="sin(pi/6) + 2^3" autocomplete="off"></div>' +
      '<div class="btns" style="flex-wrap:wrap">' +
      ["7", "8", "9", "/", "sqrt(", "4", "5", "6", "*", "^", "1", "2", "3", "-", "log(",
       "0", ".", "(", ")", "+", "sin(", "cos(", "tan(", "pi", "e"]
        .map(function (k) { return '<button class="btn ghost" data-k="' + k + '" style="min-width:52px;justify-content:center">' + k + "</button>"; }).join("") +
      '<button class="btn ghost" id="clr" style="min-width:52px">C</button></div>' +
      '<div class="btns"><button class="btn" id="go">Calculate</button></div>' +
      '<div class="out" id="out"></div>' +
      '<div class="note">Supported: + − × ÷, ^ for powers, brackets, sqrt, abs, ln, log, exp, ' +
      'sin, cos, tan, asin, acos, atan, and the constants pi and e. Angles are in radians.</div>',
    init: function (root) {
      var exp = $("#exp", root);
      function evaluate(src) {
        var s = src.toLowerCase().replace(/\s+/g, "");
        if (!/^[0-9+\-*/^().,a-z]*$/.test(s)) throw new Error("bad character");
        s = s.replace(/\bpi\b/g, "Math.PI").replace(/\be\b/g, "Math.E");
        ["sqrt", "abs", "sin", "cos", "tan", "asin", "acos", "atan", "exp", "round", "floor", "ceil"]
          .forEach(function (f) { s = s.replace(new RegExp("\\b" + f + "\\(", "g"), "Math." + f + "("); });
        s = s.replace(/\blog\(/g, "@LOG10@(").replace(/\bln\(/g, "Math.log(").replace(/@LOG10@\(/g, "Math.log10(");
        while (/\^/.test(s)) {
          s = s.replace(/(\([^()]*\)|[\w.]+)\^(\([^()]*\)|[\w.]+)/, "Math.pow($1,$2)");
        }
        if (/[a-z]/.test(s.replace(/Math\.\w+/g, ""))) throw new Error("unknown name");
        /* eslint-disable no-new-func */
        return Function('"use strict";return (' + s + ")")();
      }
      function run() {
        try {
          var v = evaluate(exp.value);
          $("#out", root).textContent = (typeof v === "number" && isFinite(v)) ? v : "That does not evaluate to a number.";
        } catch (e) { $("#out", root).textContent = "Check the expression — " + e.message + "."; }
      }
      $$("[data-k]", root).forEach(function (b) {
        b.addEventListener("click", function () { exp.value += b.dataset.k; exp.focus(); });
      });
      $("#clr", root).addEventListener("click", function () { exp.value = ""; $("#out", root).textContent = ""; });
      $("#go", root).addEventListener("click", run);
      exp.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
      run();
    }
  };

  window.TOOL_IMPL["currency-converter"] = {
    html: '<div class="row"><div class="field"><label for="amt">Amount</label><input type="number" id="amt" value="100"></div>' +
      '<div class="field"><label for="from">From</label><input type="text" id="from" value="USD"></div>' +
      '<div class="field"><label for="to">To</label><input type="text" id="to" value="EUR"></div></div>' +
      '<div class="field"><label for="rate">Rate (1 from = ? to)</label><input type="number" id="rate" value="0.92" step="0.000001"></div>' +
      '<div class="btns"><button class="btn ghost" id="fetch">Fetch today\'s rate</button>' +
      '<button class="btn ghost" id="swap">Swap the currencies</button></div>' +
      '<div class="stats"><div class="stat"><b id="res" style="font-size:1.3rem">0</b><span>Converted</span></div></div>' +
      '<div class="out" id="note">Rates are entered by hand unless you fetch them. Fetching calls the public ' +
      'exchangerate.host API from your browser.</div>',
    init: function (root) {
      function run() {
        var v = num($("#amt", root).value) * num($("#rate", root).value);
        $("#res", root).textContent = money(v) + " " + $("#to", root).value.toUpperCase();
      }
      $$("input", root).forEach(function (i) { i.addEventListener("input", run); }); run();
      $("#swap", root).addEventListener("click", function () {
        var f = $("#from", root).value, r = num($("#rate", root).value);
        $("#from", root).value = $("#to", root).value; $("#to", root).value = f;
        if (r) $("#rate", root).value = (1 / r).toFixed(6);
        run();
      });
      $("#fetch", root).addEventListener("click", function () {
        var f = $("#from", root).value.toUpperCase(), t = $("#to", root).value.toUpperCase();
        $("#note", root).textContent = "Fetching…";
        fetch("https://api.exchangerate.host/latest?base=" + f + "&symbols=" + t)
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.rates && d.rates[t]) {
              $("#rate", root).value = d.rates[t];
              $("#note", root).textContent = "Rate for " + (d.date || "today") + ": 1 " + f + " = " + d.rates[t] + " " + t;
              run();
            } else { $("#note", root).textContent = "No rate came back for that pair. Check the currency codes."; }
          })
          .catch(function () { $("#note", root).textContent = "The rate service could not be reached. Enter a rate by hand."; });
      });
    }
  };

  window.TOOL_IMPL["time-zone-converter"] = {
    html: '<div class="row"><div class="field"><label for="when">Date and time</label>' +
      '<input type="datetime-local" id="when" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px"></div>' +
      '<div class="field"><label for="base">In this zone</label><select id="base"></select></div></div>' +
      '<div class="field"><label for="add">Add a city</label><select id="add"></select></div>' +
      '<table class="data"><thead><tr><th>Zone</th><th>Local time</th><th>Offset</th></tr></thead><tbody id="rows"></tbody></table>',
    init: function (root) {
      var zones = ["UTC", "America/Los_Angeles", "America/New_York", "America/Sao_Paulo", "Europe/London",
        "Europe/Berlin", "Africa/Lagos", "Asia/Dubai", "Asia/Karachi", "Asia/Kathmandu", "Asia/Kolkata",
        "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland"];
      var local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zones.indexOf(local) < 0) zones.unshift(local);
      var shown = [local, "UTC", "Europe/London", "America/New_York"].filter(function (z, i, a) { return a.indexOf(z) === i; });
      var opts = zones.map(function (z) { return '<option value="' + z + '">' + z.replace(/_/g, " ") + "</option>"; }).join("");
      $("#base", root).innerHTML = opts; $("#add", root).innerHTML = opts;
      $("#base", root).value = local;
      var when = $("#when", root);
      var now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
      when.value = now.toISOString().slice(0, 16);

      function offset(date, zone) {
        var s = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).format(date);
        return (s.match(/GMT[+-]?\d*(:\d+)?/) || ["GMT"])[0];
      }
      /* Interpret the entered wall-clock time as a time in the chosen base zone. */
      function instant() {
        var v = when.value; if (!v) return new Date();
        var guess = new Date(v + ":00Z");
        var zone = $("#base", root).value;
        var asZone = new Date(new Intl.DateTimeFormat("en-US", {
          timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).format(guess).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, "$3-$1-$2T$4:$5:$6Z"));
        return new Date(guess.getTime() + (guess - asZone));
      }
      function run() {
        var d = instant();
        $("#rows", root).innerHTML = shown.map(function (z) {
          var t = new Intl.DateTimeFormat(undefined, { timeZone: z, dateStyle: "medium", timeStyle: "short" }).format(d);
          return "<tr><td>" + z.replace(/_/g, " ") + "</td><td>" + t + "</td><td>" + offset(d, z) + "</td></tr>";
        }).join("");
      }
      $("#add", root).addEventListener("change", function (e) {
        if (shown.indexOf(e.target.value) < 0) shown.push(e.target.value);
        run();
      });
      when.addEventListener("input", run); $("#base", root).addEventListener("change", run);
      run();
    }
  };
})();
