let words;
var request = new XMLHttpRequest();
request.open('GET', './data.json');
request.responseType = 'json';
request.send();
request.onload = function() {
  words = request.response;
  init();
};

const lyricsWrapper = document.getElementById('lyricsWrapper');

const _getRandFromArr = arr => arr[Math.floor(Math.random() * arr.length)];
const _randPass = prob => Math.random() < prob;
const _wrap = (val, c) => `<span class="${c}">${val}</span>`;

let swap = true;
let rhymeProbability = 0.5;
let levenProbability = 0.5;

const _clone = obj => JSON.parse(JSON.stringify(obj));

function doIt() {
  lyricsWrapper.innerHTML = _clone(words)
    .map(w => {
      if (!w.mutated && swap && w.swapWords && w.swapWords.length > 0) {
        console.log('swap ' + w.val);
        w.originalVal = w.val;
        w.mutated = true;
        w.val = _wrap(_getRandFromArr(w.swapWords), 'swap');
      }
      return w;
    })
    .map(w => {
      if (
        !w.mutated &&
        w.rhymeCandidates &&
        w.rhymeCandidates.length > 0 &&
        _randPass(rhymeProbability)
      ) {
        console.log('rhyme ' + w.val);
        w.originalVal = w.val;
        w.mutated = true;
        w.val = _wrap(_getRandFromArr(w.rhymeCandidates), 'rhyme');
      }
      return w;
    })
    .map(w => {
      if (
        !w.mutated &&
        w.levenCandidates &&
        w.levenCandidates.length > 0 &&
        _randPass(levenProbability)
      ) {
        console.log('leven ' + w.val);
        w.originalVal = w.val;
        w.mutated = true;
        w.val = _wrap(_getRandFromArr(w.levenCandidates), 'leven');
      }
      return w;
    })
    .map(w => w.val)
    .join('');
}

function init() {
  doIt();

  document.getElementById('btnRhyme').addEventListener('input', function(e) {
    console.log('btnRhyme: ', rhymeProbability);
    rhymeProbability = e.target.value / 100;
    doIt();
  });

  document.getElementById('btnLeven').addEventListener('input', function(e) {
    console.log('btnLeven: ', levenProbability);
    levenProbability = e.target.value / 100;
    doIt();
  });

  document.getElementById('btnSwap').addEventListener('click', function(e) {
    console.log('btnSwap: ', swap);
    swap = e.target.checked;
    doIt();
  });
}
