// theory.js — roots, chord qualities, spelling
var ROOTS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
var SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
// roots that spell with flats
var FLAT_ROOTS = {'F':1,'Bb':1,'Eb':1,'Ab':1,'Db':1};

// quality id, display name, symbol suffix, intervals (semitones from root)
var QUALITIES = [
  ['maj',  'major',      '',      [0,4,7]],
  ['min',  'minor',      'm',     [0,3,7]],
  ['7',    'dominant 7', '7',     [0,4,7,10]],
  ['maj7', 'major 7',    'maj7',  [0,4,7,11]],
  ['m7',   'minor 7',    'm7',    [0,3,7,10]],
  ['6',    'major 6',    '6',     [0,4,7,9]],
  ['m6',   'minor 6',    'm6',    [0,3,7,9]],
  ['9',    'dominant 9', '9',     [0,4,7,10,14]],
  ['sus2', 'sus2',       'sus2',  [0,2,7]],
  ['sus4', 'sus4',       'sus4',  [0,5,7]],
  ['add9', 'add9',       'add9',  [0,4,7,14]],
  ['dim',  'diminished', 'dim',   [0,3,6]],
  ['dim7', 'dim 7',      'dim7',  [0,3,6,9]],
  ['m7b5', 'half dim',   'm7b5',  [0,3,6,10]],
  ['aug',  'augmented',  'aug',   [0,4,8]],
  ['5',    'power',      '5',     [0,7]]
];

function noteName(rootName, semis) {
  var ri = ROOTS.indexOf(rootName);
  var useFlat = FLAT_ROOTS[rootName] || rootName === 'Eb' || rootName === 'Ab' || rootName === 'Bb';
  var names = useFlat ? FLAT_NAMES : SHARP_NAMES;
  return names[((ri + semis) % 12 + 12) % 12];
}
function chordSymbol(rootName, q) { return rootName + q[2]; }
function chordTones(rootName, q) {
  var out = [];
  for (var i = 0; i < q[3].length; i++) out.push(noteName(rootName, q[3][i]));
  return out;
}
