// app.js — state, navigation, r1 hardware hooks, rendering
(function () {
  var state = { inst: 'guitar', root: 0, qual: 0, voice: 0, sel: 'root', theme: 'dark' };
  var SELS = ['root', 'qual', 'voice'];
  var canvas = document.getElementById('diagram');
  var ctx = canvas.getContext('2d');
  var voicings = [];

  try { if (matchMedia('(prefers-color-scheme: light)').matches) state.theme = 'light'; } catch (e) {}

  function colors() {
    var cs = getComputedStyle(document.documentElement);
    var light = state.theme === 'light';
    return {
      accent: cs.getPropertyValue('--accent').trim(),
      text: cs.getPropertyValue('--text').trim(),
      text2: cs.getPropertyValue('--text-secondary').trim(),
      line2: light ? '#7c828c' : '#3a3a3a',
      white: light ? '#e6e8ec' : '#e6e8ec',
      black: light ? '#111111' : '#222222',
      keyLine: light ? '#6b7280' : '#000000',
      onAccent: '#ffffff',
      font: cs.getPropertyValue('--font').trim() || 'Helvetica'
    };
  }

  function rebuild() {
    var root = ROOTS[state.root], q = QUALITIES[state.qual];
    voicings = state.inst === 'guitar' ? guitarVoicings(root, q) : pianoVoicings(root, q);
    if (state.voice >= voicings.length) state.voice = 0;
    if (state.voice < 0) state.voice = Math.max(0, voicings.length - 1);
    render();
    persist();
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function render() {
    var root = ROOTS[state.root], q = QUALITIES[state.qual];
    document.getElementById('instBtn').textContent = state.inst;
    document.getElementById('rootVal').textContent = chordSymbol(root, q);
    document.getElementById('qualVal').textContent = q[1];
    document.getElementById('themeBtn').textContent = state.theme === 'light' ? '☀' : '☾';
    document.documentElement.dataset.theme = state.theme;
    SELS.forEach(function (s) {
      var el = document.querySelector('[data-sel="' + s + '"]');
      el.classList.toggle('active', state.sel === s);
    });
    var c = colors();
    if (!voicings.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = c.text2; ctx.font = '300 14px ' + c.font; ctx.textAlign = 'center';
      ctx.fillText('_ _ nothing here _ _', canvas.width / 2, canvas.height / 2);
      document.getElementById('vName').textContent = '—';
      document.getElementById('vCount').textContent = '00 / 00';
      document.getElementById('notesLine').textContent = chordTones(root, q).join(' · ');
      return;
    }
    var v = voicings[state.voice];
    if (state.inst === 'guitar') drawGuitar(ctx, canvas.width, canvas.height, v, c);
    else drawPiano(ctx, canvas.width, canvas.height, v, c);
    document.getElementById('vName').textContent = v.label;
    document.getElementById('vCount').textContent = pad(state.voice + 1) + ' / ' + pad(voicings.length);
    document.getElementById('notesLine').textContent = chordTones(root, q).join(' · ');
  }

  function step(sel, dir) {
    if (sel === 'root') { state.root = (state.root + dir + ROOTS.length) % ROOTS.length; state.voice = 0; }
    else if (sel === 'qual') { state.qual = (state.qual + dir + QUALITIES.length) % QUALITIES.length; state.voice = 0; }
    else { state.voice = voicings.length ? (state.voice + dir + voicings.length) % voicings.length : 0; }
    rebuild();
  }

  function select(sel) { state.sel = sel; render(); }

  // touch / click — use pointer events with preventDefault for the r1 webview
  document.querySelectorAll('.arrow').forEach(function (b) {
    var sel = b.closest('[data-sel]').getAttribute('data-sel');
    b.addEventListener('click', function (e) { e.preventDefault(); select(sel); step(sel, +b.getAttribute('data-dir')); });
  });
  document.querySelectorAll('[data-sel] .val, [data-sel] .vinfo').forEach(function (el) {
    var sel = el.closest('[data-sel]').getAttribute('data-sel');
    el.addEventListener('click', function () { select(sel); });
  });
  document.getElementById('instBtn').addEventListener('click', function () {
    state.inst = state.inst === 'guitar' ? 'piano' : 'guitar'; state.voice = 0; rebuild();
  });
  document.getElementById('themeBtn').addEventListener('click', function () {
    state.theme = state.theme === 'light' ? 'dark' : 'light'; render(); persist();
  });
  // tap the diagram to step through positions
  canvas.addEventListener('click', function () { select('voice'); step('voice', 1); });

  // r1 hardware: scroll wheel steps the active selector, side button moves to next selector,
  // long press swaps instrument
  window.addEventListener('scrollUp', function () { step(state.sel, -1); });
  window.addEventListener('scrollDown', function () { step(state.sel, 1); });
  window.addEventListener('sideClick', function () {
    select(SELS[(SELS.indexOf(state.sel) + 1) % SELS.length]);
  });
  window.addEventListener('longPressStart', function () {
    state.inst = state.inst === 'guitar' ? 'piano' : 'guitar'; state.voice = 0; rebuild();
  });
  // keyboard fallback for desktop testing
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(state.sel, -1);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(state.sel, 1);
    else if (e.key === 'Enter' || e.key === ' ') select(SELS[(SELS.indexOf(state.sel) + 1) % SELS.length]);
    else if (e.key === 'i') { state.inst = state.inst === 'guitar' ? 'piano' : 'guitar'; state.voice = 0; rebuild(); }
  });

  // persistence via creationStorage when present (falls back silently)
  function persist() {
    try {
      if (window.creationStorage && window.creationStorage.plain) {
        window.creationStorage.plain.setItem('chords_state', btoa(JSON.stringify(state)));
      }
    } catch (e) {}
  }
  function restore(cb) {
    try {
      if (window.creationStorage && window.creationStorage.plain) {
        window.creationStorage.plain.getItem('chords_state').then(function (s) {
          if (s) { var o = JSON.parse(atob(s)); ['inst','root','qual','voice','theme'].forEach(function (k) { if (o[k] !== undefined) state[k] = o[k]; }); }
          cb();
        }).catch(cb);
        return;
      }
    } catch (e) {}
    cb();
  }
  restore(rebuild);
})();
