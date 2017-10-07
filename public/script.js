let rhymeProbability = 0.1;
let levenProbability = 0.5;
let swap = true;
let favorRhymes = false;

let words;
var request = new XMLHttpRequest();
request.open('GET', './data.json');
request.responseType = 'json';
request.send();
request.onload = function() {
  words = request.response;
  init();
};

const lyricsWrapperElem = document.getElementById('lyricsWrapper');
const btnWrapperElem = document.getElementById('buttons');
const btnRhymeElem = document.getElementById('btnRhyme');
const btnLevenElem = document.getElementById('btnLeven');
const btnSwapElem = document.getElementById('btnSwap');
const btnFavorRhymesElem = document.getElementById('btnFavorRhymes');

function recalculateLyrics() {
  lyricsWrapperElem.innerHTML = _clone(words)
    .map(_wordSwapper)
    .map(favorRhymes ? _rhymeSwapper : _levenSwapper)
    .map(favorRhymes ? _levenSwapper : _rhymeSwapper)
    .map(w => w.val)
    .join('');
}

function init() {
  btnWrapperElem.style.visibility = 'visible';
  btnRhymeElem.value = rhymeProbability * 100;
  btnLevenElem.value = levenProbability * 100;
  btnSwapElem.checked = swap;
  btnFavorRhymesElem.checked = favorRhymes;

  btnRhymeElem.addEventListener('input', function(e) {
    console.log('btnRhyme: ', rhymeProbability);
    rhymeProbability = e.target.value / 100;
    recalculateLyrics();
  });

  btnLevenElem.addEventListener('input', function(e) {
    console.log('btnLeven: ', levenProbability);
    levenProbability = e.target.value / 100;
    recalculateLyrics();
  });

  btnSwapElem.addEventListener('click', function(e) {
    console.log('btnSwap: ', swap);
    swap = e.target.checked;
    recalculateLyrics();
  });

  btnFavorRhymesElem.addEventListener('click', function(e) {
    console.log('btnFavorRhymesElem: ', favorRhymes);
    favorRhymes = e.target.checked;
    recalculateLyrics();
  });

  recalculateLyrics();
}

/* === Utils === */
const _randomVal = num => Math.floor(Math.random() * num);
const _isNotPlural = (str1, str2) => str1 !== str2 + 's' && str2 !== str1 + 's';
const _randomValueFromArr = (origArr, val) => {
  const arr = origArr.filter(_isNotPlural.bind(null, val));
  return arr.length > 0 ? arr[_randomVal(arr.length)] : val;
};
const _resolveProbability = prob => Math.random() < prob;
const _wrapInSpan = (val, c) => `<span class="${c}">${val}</span>`;
const _clone = obj => JSON.parse(JSON.stringify(obj));

const _wordSwapper = w => {
  if (!w.mutated && swap && w.swapWords) {
    // console.log('swap ' + w.val);
    let replacement = _randomValueFromArr(w.swapWords, w.val);
    if (replacement !== w.val) {
      w.originalVal = w.val;
      w.mutated = true;
      w.val = _wrapInSpan(replacement, 'swap');
    }
  }
  return w;
};

const _rhymeSwapper = w => {
  if (
    !w.mutated &&
    w.rhymeCandidates &&
    w.rhymeCandidates.length > 0 &&
    _resolveProbability(rhymeProbability)
  ) {
    // console.log('rhyme ' + w.val);
    let replacement = _randomValueFromArr(w.rhymeCandidates, w.val);
    if (replacement !== w.val) {
      w.originalVal = w.val;
      w.mutated = true;
      w.val = _wrapInSpan(replacement, 'rhyme');
    }
  }
  return w;
};

const _levenSwapper = w => {
  if (
    !w.mutated &&
    w.levenCandidates &&
    w.levenCandidates.length > 0 &&
    _resolveProbability(levenProbability)
  ) {
    // console.log('leven ' + w.val);
    let replacement = _randomValueFromArr(w.levenCandidates, w.val);
    if (replacement !== w.val) {
      w.originalVal = w.val;
      w.mutated = true;
      w.val = _wrapInSpan(replacement, 'leven');
    }
  }
  return w;
};
