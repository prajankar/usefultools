/* Unit converters. All linear ones share one factory; temperature has its own. */
window.TOOL_IMPL = window.TOOL_IMPL || {};
(function () {
  "use strict";

  /* units: [label, factor-to-base] */
  function linear(units, from, to, note) {
    return {
      html: '<div class="row"><div class="field"><label for="v">Value</label>' +
        '<input type="number" id="v" value="1" step="any"></div>' +
        '<div class="field"><label for="a">From</label><select id="a"></select></div>' +
        '<div class="field"><label for="b">To</label><select id="b"></select></div></div>' +
        '<div class="btns"><button class="btn ghost" id="swap">Swap</button></div>' +
        '<div class="stats"><div class="stat"><b id="res" style="font-size:1.4rem">0</b><span id="lbl">Result</span></div></div>' +
        '<h3 style="margin-top:22px">All units at once</h3>' +
        '<table class="data"><tbody id="rows"></tbody></table>' +
        (note ? '<div class="note">' + note + "</div>" : ""),
      init: function (root) {
        var opts = units.map(function (u, i) { return '<option value="' + i + '">' + u[0] + "</option>"; }).join("");
        var a = $("#a", root), b = $("#b", root);
        a.innerHTML = opts; b.innerHTML = opts;
        a.value = from; b.value = to;
        function fmt(n) {
          if (!isFinite(n)) return "—";
          var abs = Math.abs(n);
          if (abs !== 0 && (abs < 1e-4 || abs >= 1e9)) return n.toExponential(6);
          return parseFloat(n.toPrecision(10)).toLocaleString(undefined, { maximumFractionDigits: 8 });
        }
        function run() {
          var v = parseFloat($("#v", root).value) || 0;
          var base = v * units[+a.value][1];
          var out = base / units[+b.value][1];
          $("#res", root).textContent = fmt(out);
          $("#lbl", root).textContent = units[+b.value][0];
          $("#rows", root).innerHTML = units.map(function (u) {
            return "<tr><th>" + u[0] + "</th><td>" + fmt(base / u[1]) + "</td></tr>";
          }).join("");
        }
        $$("input,select", root).forEach(function (el) { el.addEventListener("input", run); });
        $("#swap", root).addEventListener("click", function () {
          var t = a.value; a.value = b.value; b.value = t; run();
        });
        run();
      }
    };
  }

  window.TOOL_IMPL["length-converter"] = linear([
    ["Millimetre", 0.001], ["Centimetre", 0.01], ["Metre", 1], ["Kilometre", 1000],
    ["Inch", 0.0254], ["Foot", 0.3048], ["Yard", 0.9144], ["Mile", 1609.344],
    ["Nautical mile", 1852], ["Micrometre", 1e-6]
  ], 4, 2);

  window.TOOL_IMPL["weight-converter"] = linear([
    ["Milligram", 1e-6], ["Gram", 0.001], ["Kilogram", 1], ["Tonne", 1000],
    ["Ounce", 0.028349523125], ["Pound", 0.45359237], ["Stone", 6.35029318], ["US ton", 907.18474]
  ], 5, 2);

  window.TOOL_IMPL["speed-converter"] = linear([
    ["Metre per second", 1], ["Kilometre per hour", 0.277777778], ["Mile per hour", 0.44704],
    ["Knot", 0.514444444], ["Foot per second", 0.3048], ["Mach (at sea level)", 340.29]
  ], 1, 2);

  window.TOOL_IMPL["volume-converter"] = linear([
    ["Millilitre", 0.001], ["Litre", 1], ["Cubic metre", 1000], ["US teaspoon", 0.00492892159],
    ["US tablespoon", 0.0147867648], ["US cup", 0.2365882365], ["US pint", 0.473176473],
    ["US quart", 0.946352946], ["US gallon", 3.785411784], ["Imperial pint", 0.56826125],
    ["Imperial gallon", 4.54609], ["US fluid ounce", 0.0295735296]
  ], 5, 1);

  window.TOOL_IMPL["data-storage-converter"] = linear([
    ["Bit", 1 / 8], ["Byte", 1], ["Kilobyte (1000 B)", 1e3], ["Megabyte (1000 KB)", 1e6],
    ["Gigabyte (1000 MB)", 1e9], ["Terabyte", 1e12], ["Petabyte", 1e15],
    ["Kibibyte (1024 B)", 1024], ["Mebibyte", 1048576], ["Gibibyte", 1073741824], ["Tebibyte", 1099511627776]
  ], 4, 9, "Drive makers count a gigabyte as 1,000,000,000 bytes; most operating systems show gibibytes. " +
     "That is why a 1&nbsp;TB drive shows up as about 931&nbsp;GB.");

  window.TOOL_IMPL["energy-converter"] = linear([
    ["Joule", 1], ["Kilojoule", 1000], ["Calorie (small)", 4.184], ["Kilocalorie (food calorie)", 4184],
    ["Watt-hour", 3600], ["Kilowatt-hour", 3.6e6], ["BTU", 1055.05585], ["Electronvolt", 1.602176634e-19],
    ["Foot-pound", 1.3558179483]
  ], 5, 1);

  window.TOOL_IMPL["pressure-converter"] = linear([
    ["Pascal", 1], ["Kilopascal", 1000], ["Bar", 100000], ["Millibar", 100],
    ["Atmosphere", 101325], ["psi", 6894.757293], ["Torr / mmHg", 133.322368], ["inHg", 3386.389]
  ], 5, 2);

  window.TOOL_IMPL["angle-converter"] = linear([
    ["Degree", 1], ["Radian", 57.29577951308232], ["Gradian", 0.9], ["Turn", 360],
    ["Arcminute", 1 / 60], ["Arcsecond", 1 / 3600], ["Milliradian", 0.05729577951]
  ], 0, 1);

  window.TOOL_IMPL["temperature-converter"] = {
    html: '<div class="row"><div class="field"><label for="c">Celsius</label><input type="number" id="c" value="20" step="any"></div>' +
      '<div class="field"><label for="f">Fahrenheit</label><input type="number" id="f" value="68" step="any"></div>' +
      '<div class="field"><label for="k">Kelvin</label><input type="number" id="k" value="293.15" step="any"></div></div>' +
      '<div class="out" id="out"></div>' +
      '<table class="data"><thead><tr><th>Reference point</th><th>°C</th><th>°F</th></tr></thead><tbody>' +
      "<tr><td>Water freezes</td><td>0</td><td>32</td></tr>" +
      "<tr><td>Room temperature</td><td>20</td><td>68</td></tr>" +
      "<tr><td>Body temperature</td><td>37</td><td>98.6</td></tr>" +
      "<tr><td>Water boils</td><td>100</td><td>212</td></tr>" +
      "<tr><td>Absolute zero</td><td>−273.15</td><td>−459.67</td></tr></tbody></table>",
    init: function (root) {
      var c = $("#c", root), f = $("#f", root), k = $("#k", root), lock = false;
      function set(cv) {
        lock = true;
        c.value = +cv.toFixed(4); f.value = +(cv * 9 / 5 + 32).toFixed(4); k.value = +(cv + 273.15).toFixed(4);
        $("#out", root).textContent = cv < -273.15 ? "That is below absolute zero." : "";
        lock = false;
      }
      c.addEventListener("input", function () { if (!lock) set(parseFloat(c.value) || 0); });
      f.addEventListener("input", function () { if (!lock) set(((parseFloat(f.value) || 0) - 32) * 5 / 9); });
      k.addEventListener("input", function () { if (!lock) set((parseFloat(k.value) || 0) - 273.15); });
    }
  };

  window.TOOL_IMPL["fuel-efficiency-converter"] = {
    html: '<div class="row"><div class="field"><label for="mpgus">Miles per US gallon</label><input type="number" id="mpgus" value="30" step="any"></div>' +
      '<div class="field"><label for="mpguk">Miles per imperial gallon</label><input type="number" id="mpguk" step="any"></div></div>' +
      '<div class="row"><div class="field"><label for="kml">Kilometres per litre</label><input type="number" id="kml" step="any"></div>' +
      '<div class="field"><label for="l100">Litres per 100 km</label><input type="number" id="l100" step="any"></div></div>' +
      '<div class="note">A US gallon is 3.785 litres; an imperial gallon is 4.546. Europe quotes ' +
      'consumption (lower is better), the US quotes economy (higher is better).</div>',
    init: function (root) {
      var lock = false;
      var el = { mpgus: $("#mpgus", root), mpguk: $("#mpguk", root), kml: $("#kml", root), l100: $("#l100", root) };
      function set(kml) {
        lock = true;
        el.kml.value = +kml.toFixed(4);
        el.mpgus.value = +(kml * 2.352145836).toFixed(4);
        el.mpguk.value = +(kml * 2.824810263).toFixed(4);
        el.l100.value = kml ? +(100 / kml).toFixed(4) : "";
        lock = false;
      }
      el.mpgus.addEventListener("input", function () { if (!lock) set((parseFloat(el.mpgus.value) || 0) / 2.352145836); });
      el.mpguk.addEventListener("input", function () { if (!lock) set((parseFloat(el.mpguk.value) || 0) / 2.824810263); });
      el.kml.addEventListener("input", function () { if (!lock) set(parseFloat(el.kml.value) || 0); });
      el.l100.addEventListener("input", function () {
        if (lock) return;
        var v = parseFloat(el.l100.value) || 0; set(v ? 100 / v : 0);
      });
      set(30 / 2.352145836);
    }
  };
})();
