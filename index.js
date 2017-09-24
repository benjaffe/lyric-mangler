const fs = require('fs');
const rhyme = require('rhyme-plus');
const Tokenizer = require('tokenize-text');
const tokenize = new Tokenizer();
const {englishUsa, englishUsaNoSwears} = require('word-list-google');

const allowSwears = true;
const commonWordList = allowSwears ? englishUsa : englishUsaNoSwears;

const _mostCommonWords = commonWordList
  .map(w => w.toLowerCase())
  .filter(w => w.length > 3);

const lyrics = fs.readFileSync('./data/lyrics-with-speaker.txt', 'utf-8');

const whereToStart = 0;
const wordsToProcess = 1000;
const SEARCH_RADIUS = 100;
const MIN_REPLACEMENT_CANDIDATE_LENGTH = 4;
const wordsNotToProcess = commonWordList
  .slice(0, 100)
  .concat(['though', 'through'])
  .map(s => s.toLowerCase());

const wordsNotToReplaceWith = commonWordList
  .slice(0, 100)
  .concat(['though', 'through'])
  .map(s => s.toLowerCase());

const _wordsTokenized = tokenize.words()(lyrics);
const _wordsTokenizedShort = _wordsTokenized.slice(
  whereToStart,
  whereToStart + wordsToProcess
);
const _wordsIsolatedSanitized = _wordsTokenized.map(token => token.value);
const _wordsIsolatedSanitizedShort = _wordsIsolatedSanitized.slice(
  whereToStart,
  whereToStart + wordsToProcess
);

const _rand = num => Math.floor(num * Math.random());
const _randFromArray = arr => arr[_rand(arr.length)];

let r;
rhyme(_r => {
  r = _r;
  doHam();
});

const _isTitle = s => _isUpperCase(s);

const _isUpperCase = s =>
  s === s.toUpperCase() && s.length > 2 && isNaN(Number(s));

const _isCommonEnoughWord = w => {
  return _mostCommonWords.indexOf(w.toLowerCase()) !== -1;
};

const _isValidReplacement = w => wordsNotToReplaceWith.indexOf(w) === -1;

function doHam(config) {
  let swapsCount = 0;
  let randomRhymesCount = 0;
  const result = _wordsIsolatedSanitizedShort.reduce((acc, val, i, arr) => {
    let token = _wordsTokenizedShort[i];
    let nextToken = _wordsTokenizedShort[i + 1] || _wordsTokenizedShort[i];
    console.log(`${i}/${wordsToProcess}: ${val} - ${token.value}`);
    let matches = arr
      .slice(i - SEARCH_RADIUS, i + SEARCH_RADIUS)
      .filter(r.doRhyme.bind(null, val))
      .filter(val => !_isUpperCase(val))
      .filter(val => val.length >= MIN_REPLACEMENT_CANDIDATE_LENGTH);

    if (_isTitle(val)) {
      acc.push({originalVal: val, val: `${i === 0 ? '' : '\n\n'}${val}\n`});
      return acc;
    }

    let wordObj = {val: val};

    if (wordsNotToProcess.indexOf(val.toLowerCase()) === -1 && val.length > 2) {
      // get swap words
      if (matches.length) {
        wordObj.swapWords = matches.filter(_isValidReplacement);
        swapsCount++;
      }

      // get randomRhymes
      const rhymeCandidates = _getRhymes(val);
      if (rhymeCandidates.length > 0) {
        randomRhymesCount++;
        wordObj.rhymeCandidates = rhymeCandidates.filter(_isValidReplacement);
      }
    }
    acc.push(wordObj);
    acc.push(_getInterstitial(token, nextToken, lyrics));
    return acc;
  }, []);

  function _getInterstitial(t1, t2, original) {
    let val = original.slice(t1.index + t1.offset, t2.index);
    return {isInterstitial: true, val: val};
  }

  fs.writeFileSync('./public/data.json', JSON.stringify(result, null, 2));
  console.log(
    `Processed ${wordsToProcess}, performed ${swapsCount} swaps, and ${randomRhymesCount} random rhyme replacements`
  );
}

function _getRhymes(word) {
  let randomCandidates = r
    .rhyme(word)
    .map(s => s.toLowerCase())
    .filter(_isCommonEnoughWord);
  if (randomCandidates.length > 0) {
    console.log(`for word "${word}", found candidates "${randomCandidates}"`);
  }
  return randomCandidates;
}
