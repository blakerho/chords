// guitar.js — movable shape library + voicing generation + drawing
// shapes: frets relative to the root fret (x = muted), fingers with 1 = index (barre when repeated)
// rootStr: string number carrying the root (6 = low E). Standard tuning.
var OPEN_PC = {6:4, 5:9, 4:2, 3:7, 2:11, 1:4}; // pitch classes of open strings
var X = 'x';
var SHAPES = {
  maj: [
    {n:'E', rs:6, f:[0,2,2,1,0,0], g:[1,3,4,2,1,1]},
    {n:'A', rs:5, f:[X,0,2,2,2,0], g:[0,1,2,3,4,1]},
    {n:'D', rs:4, f:[X,X,0,2,3,2], g:[0,0,1,2,4,3]},
    {n:'C', rs:5, f:[X,0,-1,-3,-2,-3], g:[0,4,3,1,2,1]},
    {n:'G', rs:6, f:[0,-1,-3,-3,-3,0], g:[3,2,1,1,1,4]}
  ],
  min: [
    {n:'E', rs:6, f:[0,2,2,0,0,0], g:[1,3,4,1,1,1]},
    {n:'A', rs:5, f:[X,0,2,2,1,0], g:[0,1,3,4,2,1]},
    {n:'D', rs:4, f:[X,X,0,2,3,1], g:[0,0,1,3,4,2]}
  ],
  '7': [
    {n:'E', rs:6, f:[0,2,0,1,0,0], g:[1,3,1,2,1,1]},
    {n:'A', rs:5, f:[X,0,2,0,2,0], g:[0,1,3,1,4,1]},
    {n:'D', rs:4, f:[X,X,0,2,1,2], g:[0,0,1,3,2,4]},
    {n:'C', rs:5, f:[X,0,-1,0,-2,-3], g:[0,3,2,4,1,1]}
  ],
  maj7: [
    {n:'E', rs:6, f:[0,X,1,1,0,X], g:[1,0,3,4,2,0]},
    {n:'A', rs:5, f:[X,0,2,1,2,0], g:[0,1,3,2,4,1]},
    {n:'D', rs:4, f:[X,X,0,2,2,2], g:[0,0,1,2,3,4]},
    {n:'C', rs:5, f:[X,0,-1,-3,-3,-3], g:[0,4,3,1,1,1]}
  ],
  m7: [
    {n:'E', rs:6, f:[0,2,0,0,0,0], g:[1,3,1,1,1,1]},
    {n:'A', rs:5, f:[X,0,2,0,1,0], g:[0,1,3,1,2,1]},
    {n:'D', rs:4, f:[X,X,0,2,1,1], g:[0,0,1,4,2,3]}
  ],
  '6': [
    {n:'E', rs:6, f:[0,2,2,1,2,0], g:[1,3,3,2,4,1]},
    {n:'A', rs:5, f:[X,0,2,2,2,2], g:[0,1,3,3,3,3]},
    {n:'D', rs:4, f:[X,X,0,2,0,2], g:[0,0,1,3,1,4]}
  ],
  m6: [
    {n:'E', rs:6, f:[0,2,2,0,2,0], g:[1,2,3,1,4,1]},
    {n:'A', rs:5, f:[X,0,2,2,1,2], g:[0,1,3,3,2,4]},
    {n:'D', rs:4, f:[X,X,0,2,0,1], g:[0,0,1,4,1,2]}
  ],
  '9': [
    {n:'E', rs:6, f:[0,2,0,1,0,2], g:[1,3,1,2,1,4]},
    {n:'C', rs:5, f:[X,0,-1,0,0,0], g:[0,2,1,3,3,3]}
  ],
  sus2: [
    {n:'E', rs:6, f:[0,2,4,4,0,0], g:[1,2,3,4,1,1]},
    {n:'A', rs:5, f:[X,0,2,2,0,0], g:[0,1,3,4,1,1]},
    {n:'D', rs:4, f:[X,X,0,2,3,0], g:[0,0,1,2,4,1]}
  ],
  sus4: [
    {n:'E', rs:6, f:[0,2,2,2,0,0], g:[1,2,3,4,1,1]},
    {n:'A', rs:5, f:[X,0,2,2,3,0], g:[0,1,2,3,4,1]},
    {n:'D', rs:4, f:[X,X,0,2,3,3], g:[0,0,1,2,3,4]}
  ],
  add9: [
    {n:'E', rs:6, f:[0,X,2,1,0,2], g:[1,0,3,2,1,4]},
    {n:'A', rs:5, f:[X,0,2,4,2,0], g:[0,1,2,4,3,1]},
    {n:'C', rs:5, f:[X,0,-1,-3,0,-3], g:[0,3,2,1,4,1]}
  ],
  dim: [
    {n:'E', rs:6, f:[0,1,2,0,X,X], g:[1,2,3,1,0,0]},
    {n:'A', rs:5, f:[X,0,1,2,1,X], g:[0,1,2,4,3,0]},
    {n:'D', rs:4, f:[X,X,0,1,3,1], g:[0,0,1,2,4,3]}
  ],
  dim7: [
    {n:'E', rs:6, f:[0,1,2,0,2,0], g:[1,2,3,1,4,1]},
    {n:'D', rs:4, f:[X,X,0,1,0,1], g:[0,0,1,2,1,3]},
    {n:'A', rs:5, f:[X,0,1,-1,1,X], g:[0,2,3,1,4,0]}
  ],
  m7b5: [
    {n:'E', rs:6, f:[0,1,0,0,X,X], g:[1,2,1,1,0,0]},
    {n:'A', rs:5, f:[X,0,1,0,1,X], g:[0,1,2,1,3,0]},
    {n:'D', rs:4, f:[X,X,0,1,1,1], g:[0,0,1,2,3,4]}
  ],
  aug: [
    {n:'E', rs:6, f:[0,3,2,1,1,0], g:[1,4,3,2,1,1]},
    {n:'A', rs:5, f:[X,0,3,2,2,X], g:[0,1,4,2,3,0]},
    {n:'D', rs:4, f:[X,X,0,3,3,2], g:[0,0,1,3,4,2]}
  ],
  '5': [
    {n:'E', rs:6, f:[0,2,2,X,X,X], g:[1,3,4,0,0,0]},
    {n:'A', rs:5, f:[X,0,2,2,X,X], g:[0,1,3,4,0,0]},
    {n:'D', rs:4, f:[X,X,0,2,3,X], g:[0,0,1,3,4,0]}
  ]
};
var MAX_FRET = 15;

function guitarVoicings(rootName, q) {
  var pc = SHARP_NAMES.indexOf(noteName(rootName, 0));
  if (pc < 0) pc = FLAT_NAMES.indexOf(noteName(rootName, 0));
  var shapes = SHAPES[q[0]] || [];
  var out = [];
  shapes.forEach(function (s) {
    var base = ((pc - OPEN_PC[s.rs]) % 12 + 12) % 12;
    [base, base + 12].forEach(function (rf) {
      var frets = [], fingers = [], min = 99, max = -1, ok = true;
      for (var i = 0; i < 6; i++) {
        if (s.f[i] === X) { frets.push(X); fingers.push(0); continue; }
        var fr = rf + s.f[i];
        if (fr < 0 || fr > MAX_FRET) { ok = false; break; }
        frets.push(fr); fingers.push(s.g[i]);
        if (fr > 0) { if (fr < min) min = fr; if (fr > max) max = fr; }
      }
      if (!ok) return;
      if (min === 99) min = 0;
      var hasOpen = frets.some(function (f) { return f === 0; });
      if (hasOpen) {
        // open chord: no barre; renumber remaining fingers compactly
        var used = [];
        for (var k = 0; k < 6; k++) {
          if (frets[k] === X || frets[k] === 0) fingers[k] = 0;
          else if (used.indexOf(fingers[k]) < 0) used.push(fingers[k]);
        }
        used.sort();
        for (k = 0; k < 6; k++) if (fingers[k]) fingers[k] = used.indexOf(fingers[k]) + 1;
      }
      var label = hasOpen && min <= 4 ? 'open · ' + s.n + ' shape' : s.n + ' shape · ' + min + 'fr';
      var barre = null;
      if (!hasOpen) {
        var idx = [];
        for (k = 0; k < 6; k++) if (fingers[k] === 1) idx.push(k);
        if (idx.length > 1) barre = {fret: frets[idx[0]], from: idx[0], to: idx[idx.length - 1]};
      }
      out.push({label: label, frets: frets, fingers: fingers, min: min, max: max, barre: barre, notes: fretsToNotes(frets, rootName)});
    });
  });
  out.sort(function (a, b) { return a.min - b.min || a.max - b.max; });
  return out;
}

function fretsToNotes(frets, rootName) {
  var names = [];
  for (var i = 0; i < 6; i++) {
    if (frets[i] === X) continue;
    var pcv = (OPEN_PC[6 - i] + frets[i]) % 12;
    var ri = ROOTS.indexOf(rootName);
    names.push(noteName(rootName, (pcv - ri + 12) % 12));
  }
  return names;
}

function drawGuitar(ctx, W, H, v, colors) {
  ctx.clearRect(0, 0, W, H);
  var strings = 6, nFrets = 5;
  var left = 60, top = 24, width = 120, height = 80;
  var sx = width / (strings - 1), fy = height / nFrets;
  var start = v.min <= 1 ? 1 : v.min;
  if (v.max - start >= nFrets) start = Math.max(1, v.max - nFrets + 1);
  ctx.lineWidth = 1; ctx.strokeStyle = colors.line2; ctx.fillStyle = colors.text;
  ctx.font = '300 14px ' + colors.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // frets
  for (var f = 0; f <= nFrets; f++) {
    var y = top + f * fy;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + width, y); ctx.stroke();
  }
  // nut
  if (start === 1) { ctx.fillStyle = colors.text; ctx.fillRect(left - 1, top - 3, width + 2, 4); }
  else { ctx.fillStyle = colors.text2; ctx.textAlign = 'right'; ctx.fillText(start + 'fr', left - 12, top + fy / 2); ctx.textAlign = 'center'; }
  // strings
  ctx.strokeStyle = colors.text2;
  for (var s = 0; s < strings; s++) {
    var x = left + s * sx;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + height); ctx.stroke();
  }
  // barre
  if (v.barre) {
    var by = top + (v.barre.fret - start + 0.5) * fy;
    ctx.strokeStyle = colors.accent; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(left + v.barre.from * sx, by); ctx.lineTo(left + v.barre.to * sx, by); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineWidth = 1;
  }
  // dots, open / muted markers
  for (s = 0; s < strings; s++) {
    x = left + s * sx;
    var fr = v.frets[s];
    ctx.fillStyle = colors.text;
    if (fr === X) { ctx.fillStyle = colors.text2; ctx.fillText('×', x, top - 12); continue; }
    if (fr === 0) { ctx.strokeStyle = colors.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, top - 12, 5, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1; continue; }
    var y2 = top + (fr - start + 0.5) * fy;
    ctx.fillStyle = colors.accent; ctx.beginPath(); ctx.arc(x, y2, 7, 0, Math.PI * 2); ctx.fill();
    if (v.fingers[s]) { ctx.fillStyle = colors.onAccent; ctx.fillText(String(v.fingers[s]), x, y2 + 1); }
  }
  // note names under strings
  ctx.fillStyle = colors.text2; ctx.font = '300 14px ' + colors.font;
  var ni = 0;
  for (s = 0; s < strings; s++) {
    x = left + s * sx;
    if (v.frets[s] === X) continue;
    ctx.fillText(v.notes[ni++], x, top + height + 11);
  }
}
