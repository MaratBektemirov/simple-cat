const { 
  SimpleCat,
} = require('../index.js');

const simpleCat = new SimpleCat([]);

const words = simpleCat.textToWords('машина Маши стояла заведенная в селе, около завода россельмаш');
const preparedText = simpleCat.getPreparedText(words);

test('text chars test 1 1', () => {
  expect(preparedText.chars['м']).toStrictEqual({"0":[1],"1":[1],"7":[8]})
})

test('text chars test 1 2', () => {
  expect(preparedText.chars['а']).toStrictEqual({"0":[2,6],"1":[2],"2":[6],"3":[2,9],"6":[2,6],"7":[9]})
})

const matchResultHash = simpleCat.getMatchResultHash('машина', preparedText);

test('matching test 1 1', () => {
  expect(matchResultHash['7']).toStrictEqual({"м":[[1],[8]],"а":[[2,6],[9,null]],"ш":[[3],[10]]})
})

const sequencesHash = simpleCat.getSequencesHash(matchResultHash);

test('sequences test 1 1', () => {
  expect(sequencesHash[0]).toStrictEqual([[1,2,3,4,5,6],[1,2,3,4,5,6]])
})

test('sequences test 1 2', () => {
  expect(sequencesHash[1]).toStrictEqual([[1,2,3,4,6],[1,2,3,4,null]])
})

test('sequences test 1 3', () => {
  expect(sequencesHash[3]).toStrictEqual([[2,5,6],[2,7,9]])
})

test('sequences test 1 4', () => {
  expect(sequencesHash[7]).toStrictEqual([[1,2,3,6],[8,9,10,null]])
})

const wordScores = simpleCat.getWordScores(sequencesHash);

test('word scores 1 1', () => {
  const w0 = wordScores.find((w) => w[0] === 0);
  const w1 = wordScores.find((w) => w[0] === 1);

  expect(w0[1] > w1[1]).toStrictEqual(true);
})

test('text scores 1 1', () => {
  const score_1 = simpleCat.getTextScore('Маша стояла', preparedText);
  const score_2 = simpleCat.getTextScore('Машина в селе', preparedText);
  const score_3 = simpleCat.getTextScore('Завод россельмаш', preparedText);

  expect(score_3 > score_2 && score_2 > score_1).toStrictEqual(true);
})

test('table scores 1 1', () => {
  const scoresTable = {};

  simpleCat.insertScoreToTable(scoresTable, [new Int16Array([1, 50]), new Int16Array([6, 30]), new Int16Array([2, 20])]);
  simpleCat.insertScoreToTable(scoresTable, [new Int16Array([1, 70]), new Int16Array([6, 40]), new Int16Array([2, 30])]);
  simpleCat.insertScoreToTable(scoresTable, [new Int16Array([1, 80]), new Int16Array([6, 50]), new Int16Array([2, 40])]);

  expect(scoresTable).toStrictEqual({
    2: [ new Int16Array([ 2, 20 ]) ],
    6: [ new Int16Array([ 6, 40 ]), new Int16Array([ 2, 30 ]) ],
    1: [
      new Int16Array([ 1, 80 ]),
      new Int16Array([ 6, 50 ]),
      new Int16Array([ 2, 40 ]),
    ],
  });
})

test('vector find vacant index 1', () => {
  expect(simpleCat.arrFindVacantIndex(new Int16Array([5,4,3,2,1]), 2)).toBe(4)
})

test('arr find vacant index 2', () => {
  expect(simpleCat.arrFindVacantIndex(new Int16Array([6,5,4,3,2,1]), 4)).toBe(3)
})

test('arr find vacant index 3', () => {
  expect(simpleCat.arrFindVacantIndex(new Int16Array([5,4,3,2,0]), 6)).toBe(0)
})

test('arr find vacant index 4', () => {
  expect(simpleCat.arrFindVacantIndex(new Int16Array([5,4,3,2,1]), 0)).toBe(-1)
})

test('arr shift right 1', () => {
  expect(simpleCat.arrShiftRight(new Int16Array([5,4,3,2,1]), 5.5, 0)).toStrictEqual(new Int16Array([5.5,5,4,3,2]))
})

test('arr shift right 2', () => {
  expect(simpleCat.arrShiftRight(new Int16Array([5,4,3,2,1]), 4.4, 1)).toStrictEqual(new Int16Array([5,4.4,4,3,2]))
})

test('arr shift right 3', () => {
  expect(simpleCat.arrShiftRight(new Int16Array([5,4,3,2,1]), 1.4, 4)).toStrictEqual(new Int16Array([5,4,3,2,1.4]))
})