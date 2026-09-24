// piano.js — inversions/voicings + keyboard drawing with right-hand fingering
// right-hand fingering tables by chord size and inversion
var RH_FINGERS = {
  2: [[1,5],[1,5]],
  3: [[1,3,5],[1,2,5],[1,3,5]],
  4: [[1,2,3,5],[1,2,3,5],[1,2,4,5],[1,2,3,5]],
  5: [[1,2,3,4,5]]
};

function pianoVoicings(rootName, q) {
  var ri = ROOTS.indexOf(rootName);
  var iv = q[3].slice();
  var n = iv.length;
  var out = [];
  var invNames = ['root pos', '1st inv', '2nd inv', '3rd inv'];
  var invCount = n >= 5 ? 1 : n;
  for (var inv = 0; inv < invCount; inv++) {
    var v = [];
    for (var i = 0; i < n; i++) {
      var idx = (i + inv) % n;
      var semi = iv[idx] + (i + inv >= n ? 12 : 0);
      v.push(semi);
    }
    var base = v[0]; v = v.map(function (s) { return s - base; });
    var startPc = (ri + iv[inv % n]) % 12;
    // absolute midi-ish offsets from C: place lowest note in a convenient octave
    var lo = startPc; if (lo + v[v.length - 1] > 23 && inv === 0) lo = startPc; // keep in 2-octave window
    var keys = v.map(function (s) { return lo + s; });
    var fing = (RH_FINGERS[n] || [[1,2,3,4,5]])[Math.min(inv, (RH_FINGERS[n] || [1]).length - 1)];
    var names = keys.map(function (k) { return noteName(rootName, (k - ri + 24) % 12); });
    out.push({label: invNames[inv] || 'voicing ' + (inv + 1), keys: keys, fingers: fing, notes: names, lh: false});
  }
  // an open / spread voicing: root in left hand, upper structure in right
  if (n >= 3) {
    var upper = iv.slice(1).map(function (s) { return s - iv[1]; });
    var lhRoot = ri; var rhLo = ri + iv[1];
    var keys2 = [lhRoot].concat(upper.map(function (s) { return rhLo + s; }));
    var rf = upper.length === 2 ? [1,3,5] : upper.length === 3 ? [1,2,3,5] : [1,2,3,4,5];
    var names2 = keys2.map(function (k) { return noteName(rootName, (k - ri + 24) % 12); });
    out.push({label: 'spread · lh', keys: keys2, fingers: [5].concat(rf.slice(0, upper.length)), notes: names2, lh: true});
  }
  return out;
}

// draw two octaves C..B C..B (14 white keys)
var WHITE_PCS = [0,2,4,5,7,9,11];
function drawPiano(ctx, W, H, v, colors) {
  ctx.clearRect(0, 0, W, H);
  var octaves = 2, whites = 7 * octaves;
  var left = 4, top = 16, ww = (W - 8) / whites, wh = 90, bw = ww * 0.62, bh = wh * 0.6;
  var pressed = {}; for (var i = 0; i < v.keys.length; i++) pressed[v.keys[i]] = v.fingers[i];
  ctx.font = '300 13px ' + colors.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // whites
  for (var w = 0; w < whites; w++) {
    var pc = WHITE_PCS[w % 7] + 12 * Math.floor(w / 7);
    var x = left + w * ww;
    ctx.fillStyle = pressed[pc] !== undefined ? colors.accent : colors.white;
    ctx.fillRect(x, top, ww, wh);
    ctx.strokeStyle = colors.keyLine; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, top + 0.5, ww - 1, wh - 1);
    if (pressed[pc] !== undefined) { ctx.fillStyle = colors.onAccent; ctx.fillText(String(pressed[pc]), x + ww / 2, top + wh - 10); }
  }
  // blacks
  for (w = 0; w < whites; w++) {
    var wp = WHITE_PCS[w % 7];
    if (wp === 4 || wp === 11) continue;
    var bpc = wp + 1 + 12 * Math.floor(w / 7);
    var bx = left + (w + 1) * ww - bw / 2;
    ctx.fillStyle = pressed[bpc] !== undefined ? colors.accent : colors.black;
    ctx.fillRect(bx, top, bw, bh);
    if (pressed[bpc] !== undefined) { ctx.fillStyle = colors.onAccent; ctx.fillText(String(pressed[bpc]), bx + bw / 2, top + bh - 9); }
  }
  // note names above pressed keys
  ctx.fillStyle = colors.text2;
  var placed = [];
  for (i = 0; i < v.keys.length; i++) {
    var k = v.keys[i], oct = Math.floor(k / 12), kpc = k % 12, wi = WHITE_PCS.indexOf(kpc), cx;
    if (wi >= 0) cx = left + (oct * 7 + wi) * ww + ww / 2;
    else { var below = WHITE_PCS.indexOf(kpc - 1); cx = left + (oct * 7 + below + 1) * ww; }
    ctx.fillText(v.notes[i], cx, top - 8);
  }
  // hand hint
  ctx.fillStyle = colors.text2; ctx.textAlign = 'left';
  ctx.fillText(v.lh ? 'lh 5 · rh fingering' : 'right hand', left + 2, top + wh + 12);
}
