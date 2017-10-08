let rhymeProbability = 0.1;
let levenProbability = 0.5;
let masterMultiplier = 1;
let swap = true;
let sfw = true;
let favorRhymes = false;
let banned = ['gmbh'];

let words, swears;
let wordRequest = new XMLHttpRequest();
wordRequest.open('GET', './data.json');
wordRequest.responseType = 'json';
wordRequest.send();
wordRequest.onload = function() {
  words = wordRequest.response;
  console.log(`loaded words`);

  let swearsRequest = new XMLHttpRequest();
  swearsRequest.open('GET', './swears.json');
  swearsRequest.responseType = 'json';
  swearsRequest.send();
  swearsRequest.onload = function() {
    swears = swearsRequest.response;
    console.log(`loaded ${swears.length} swears`);

    init();
  };
};

const lyricsWrapperElem = document.getElementById('lyricsWrapper');
const btnWrapperElem = document.getElementById('buttons');
const btnRhymeElem = document.getElementById('btnRhyme');
const btnLevenElem = document.getElementById('btnLeven');
const btnSwapElem = document.getElementById('btnSwap');
const btnFavorRhymesElem = document.getElementById('btnFavorRhymes');
const btnSFWElem = document.getElementById('btnSFW');
const btnMasterElem = document.getElementById('btnMaster');

function recalculateLyrics() {
  lyricsWrapperElem.innerHTML = _clone(words)
    .map(_wordSwapper)
    .map(favorRhymes ? _rhymeSwapper : _levenSwapper)
    .map(favorRhymes ? _levenSwapper : _rhymeSwapper)
    .map(w => w.val)
    .join('');
}

function init() {
  document.body.style.display = 'block';
  btnRhymeElem.value = rhymeProbability * 100;
  btnLevenElem.value = levenProbability * 100;
  btnMasterElem.value = masterMultiplier * 100;
  btnSwapElem.checked = swap;
  btnSFWElem.checked = sfw;
  btnFavorRhymesElem.checked = favorRhymes;

  btnRhymeElem.addEventListener('input', function(e) {
    rhymeProbability = e.target.value / 100;
    recalculateLyrics();
  });

  btnLevenElem.addEventListener('input', function(e) {
    levenProbability = e.target.value / 100;
    recalculateLyrics();
  });

  btnMasterElem.addEventListener('input', function(e) {
    masterMultiplier = e.target.value / 100;
    recalculateLyrics();
  });

  btnSwapElem.addEventListener('click', function(e) {
    swap = e.target.checked;
    recalculateLyrics();
  });

  btnSFWElem.addEventListener('click', function(e) {
    sfw = e.target.checked;
    btnSFWElem.parentElement.style.background = sfw ? '#CFC' : '#FAA';
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
const _isAppropriate = w => (sfw ? swears.indexOf(w) === -1 : w);
const _isNotBanned = w => banned.indexOf(w) === -1;
const _randomValueFromArr = (origArr, val) => {
  const arr = origArr
    .filter(_isAppropriate)
    .filter(_isNotBanned)
    .filter(_isNotPlural.bind(null, val));
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
    _resolveProbability(rhymeProbability * masterMultiplier)
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
    _resolveProbability(levenProbability * masterMultiplier)
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
