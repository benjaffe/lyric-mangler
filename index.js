const fs = require('fs');
const rhyme = require('rhyme-plus');
const Tokenizer = require('tokenize-text');
const tokenize = new Tokenizer();
const wordListGoogle = require('word-list-google');
console.log(Object.keys(wordListGoogle));
const _mostCommonWords = wordListGoogle.englishUsa
  .map(w => w.toLowerCase())
  .filter(w => w.length > 3);

const words = fs.readFileSync('./data/lyrics-with-speaker.txt', 'utf-8');

const whereToStart = 0;
const wordsToProcess = 2001;
const SEARCH_RADIUS = 100;
const MIN_REPLACEMENT_CANDIDATE_LENGTH = 4;
const PROBABILITY_OF_RANDOM_RHYME = 0.2;
const forbiddenWords = ['the', 'and', 'a', 'I', 'in', 'at'].map(s =>
  s.toLowerCase()
);

const _wordsTokenized = tokenize.words()(words);
const _wordsIsolatedSanitized = _wordsTokenized.map(token => token.value);
const _wordsIsolatedSanitizedShort = _wordsIsolatedSanitized.slice(
  whereToStart,
  whereToStart + wordsToProcess
);

const _rand = num => Math.floor(num * Math.random());
const _randFromArray = arr => arr[_rand(arr.length)];

rhyme(r => {
  doHam({r});
});

const _isUpperCase = s =>
  s === s.toUpperCase() && s.length > 2 && isNaN(Number(s));

const _isCommonEnoughWord = w => {
  return _mostCommonWords.indexOf(w.toLowerCase()) !== -1;
};

let waitingForMatch = false;
function doHam(config) {
  let swapsCount = 0;
  let randomRhymesCount = 0;
  const r = config.r;
  const result = _wordsIsolatedSanitizedShort.reduce((acc, val, i, arr) => {
    if (i % 10 === 0) console.log(`processed ${i} words`);
    var matches = arr
      .slice(i - SEARCH_RADIUS, i + SEARCH_RADIUS)
      .filter(r.doRhyme.bind(null, val))
      .filter(val => !_isUpperCase(val))
      .filter(val => val.length >= MIN_REPLACEMENT_CANDIDATE_LENGTH);

    if (_isUpperCase(val)) {
      acc.push(`\n\n${val}\n`);
    } else if (
      forbiddenWords.indexOf(val.toLowerCase()) === -1 &&
      val.length > 2
    ) {
      if (matches.length) {
        acc.push(
          '<span class="sub">' + matches[_rand(matches.length)] + '</span>'
        );
        swapsCount++;
        return acc;
      } else if (
        waitingForMatch ||
        Math.random() <
          PROBABILITY_OF_RANDOM_RHYME * Math.min(1, (val.length - 3) / 4)
      ) {
        let randomCandidates = r
          .rhyme(val)
          .map(s => s.toLowerCase())
          .filter(_isCommonEnoughWord);
        if (randomCandidates.length > 0) {
          waitingForMatch = false;
          console.log(`replacing ${val} with ${randomCandidates}`);
          let randomRhyme =
            randomCandidates.length > 0
              ? `<span class="randoRhyme">${_randFromArray(
                  randomCandidates
                )}</span>`
              : val;
          acc.push(randomRhyme);
          randomRhymesCount++;
          return acc;
        } else {
          waitingForMatch = true;
        }
      }
    }
    acc.push(val);
    return acc;
  }, []);

  const css =
    '<head><style>body {white-space: pre-line;font-family: sans-serif;line-height: 1.5;} .randoRhyme {background: #9FD;} .sub {font-weight: normal; background: #FCC;}</style></head>';
  fs.writeFileSync(
    'index.html',
    css + result.slice(0, wordsToProcess).join(' ')
  );
  console.log(
    `Processed ${wordsToProcess}, performed ${swapsCount} swaps, and ${randomRhymesCount} random rhyme replacements`
  );
}
