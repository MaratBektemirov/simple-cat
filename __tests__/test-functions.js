const { 
  SimpleCat,
} = require('../index.js');

const simpleCat = new SimpleCat([]);

test('check grams 1', () => {
  const { grams } = simpleCat.getNGramsModel('проверка', 3, []);

  expect(grams).toStrictEqual({
    'про': {positions: [new Int16Array([0,0])], indexes: [0]},
    'ров': {positions: [new Int16Array([0,1])], indexes: [1]},
    'ове': {positions: [new Int16Array([0,2])], indexes: [2]},
    'вер': {positions: [new Int16Array([0,3])], indexes: [3]},
    'ерк': {positions: [new Int16Array([0,4])], indexes: [4]},
    'рка': {positions: [new Int16Array([0,5])], indexes: [5]},
  });
});

test('check grams 2', () => {
  const { grams } = simpleCat.getNGramsModel('парампампам', 3, []);

  expect(grams).toStrictEqual({
    'пар': {positions: [new Int16Array([0,0])], indexes: [0]},
    'ара': {positions: [new Int16Array([0,1])], indexes: [1]},
    'рам': {positions: [new Int16Array([0,2])], indexes: [2]},
    'амп': {positions: [new Int16Array([0,3]), new Int16Array([0,6])], indexes: [3,6]},
    'мпа': {positions: [new Int16Array([0,4]),new Int16Array([0,7])], indexes: [4,7]},
    'пам': {positions: [new Int16Array([0,5]), new Int16Array([0,8])], indexes: [5,8]},
  });
});

test('check grams 3', () => {
  const { grams } = simpleCat.getNGramsModel('проверка', 2, []);

  expect(grams).toStrictEqual({
    'пр': {positions: [new Int16Array([0,0])], indexes: [0]},
    'ро': {positions: [new Int16Array([0,1])], indexes: [1]},
    'ов': {positions: [new Int16Array([0,2])], indexes: [2]},
    'ве': {positions: [new Int16Array([0,3])], indexes: [3]},
    'ер': {positions: [new Int16Array([0,4])], indexes: [4]},
    'рк': {positions: [new Int16Array([0,5])], indexes: [5]},
    'ка': {positions: [new Int16Array([0,6])], indexes: [6]},
  });
});

test('check grams 4', () => {
  const { grams } = simpleCat.getNGramsModel('парампампампам', 3, []);

  expect(grams).toStrictEqual({
    'амп': {positions: [new Int16Array([0,3]), new Int16Array([0,6]), new Int16Array([0,9])], indexes: [3,6,9]},
    'ара': {positions: [new Int16Array([0,1])], indexes: [1]},
    'мпа': {positions: [new Int16Array([0,4]), new Int16Array([0,7]), new Int16Array([0,10])], indexes: [4,7,10]},
    'пам': {positions: [new Int16Array([0,5]), new Int16Array([0,8]), new Int16Array([0,11])], indexes: [5,8,11]},
    'пар': {positions: [new Int16Array([0,0])], indexes: [0]},
    'рам': {positions: [new Int16Array([0,2])], indexes: [2]},
  });
})

test('check match score 1', () => {
  const checkMatchScore = () => {
    const templateModel = simpleCat.getNGramsModel('размышление', 3, []);
    const searchModel = simpleCat.getNGramsModel('размышляющий', 3, []);

    return simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction);
  }
 
  expect(checkMatchScore()).toStrictEqual(new Int16Array([15,15,15,15,15]));
});

test('check match score 2', () => {
  const checkMatchScore = () => {
    const templateModel = simpleCat.getNGramsModel('размышление', 3, []);
    const searchModel = simpleCat.getNGramsModel('размышления', 3, []);

    return simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction);
  }
 
  expect(checkMatchScore()).toStrictEqual(new Int16Array([15,15,15,15,15,15,15,15]));
});

test('check match score 3', () => {
  const checkMatchScore = () => {
    const templateModel = simpleCat.getNGramsModel('парампампампам', 3, []);
    const searchModel = simpleCat.getNGramsModel('парампампампам', 3, []);

    return simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction);
  }
 
  expect(checkMatchScore()).toStrictEqual(new Int16Array([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]));
});

test('check match score 4', () => {
  const templateModel = simpleCat.getNGramsModel('парампампамляля', 3, []);
  const searchModel = simpleCat.getNGramsModel('парампампам', 3, []);

  expect(simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction)).toStrictEqual(new Int16Array([15, 15, 15, 15, 15, 15, 15, 15, 15]))
})

test('check match score 5', () => {
  const templateModel = simpleCat.getNGramsModel('парампампампам', 3, []);
  const searchModel = simpleCat.getNGramsModel('парампампампам', 3, []);

  expect(simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction)).toStrictEqual(new Int16Array([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]))
})

test('check match score 6', () => {
  const templateModel = simpleCat.getNGramsModel('парампампампам', 3, []);
  const searchModel = simpleCat.getNGramsModel('слово', 3, []);

  expect(simpleCat.getMatchWeights(templateModel, searchModel, simpleCat.weightFunction)).toStrictEqual(new Int16Array([]))
})

test('vector find vacant index 1', () => {
  expect(simpleCat.vectorFindVacantIndex(new Int16Array([5,4,3,2,1]), 5)).toBe(1)
})

test('vector find vacant index 2', () => {
  expect(simpleCat.vectorFindVacantIndex(new Int16Array([5,4,3,2,1]), 3.5)).toBe(2)
})

test('vector find vacant index 3', () => {
  expect(simpleCat.vectorFindVacantIndex(new Int16Array([5,4,3,2,1]), 0.8)).toBe(-1)
})

test('vector find vacant index 4', () => {
  expect(simpleCat.vectorFindVacantIndex(new Int16Array([5,4,3,2,1]), 5.2)).toBe(0)
})

test('vector shift right 1', () => {
  expect(simpleCat.vectorShiftRight(new Int16Array([5,4,3,2,1]), 5.5, 0)).toStrictEqual(new Int16Array([5.5,5,4,3,2]))
})

test('vector shift right 2', () => {
  expect(simpleCat.vectorShiftRight(new Int16Array([5,4,3,2,1]), 4.4, 1)).toStrictEqual(new Int16Array([5,4.4,4,3,2]))
})

test('vector shift right 3', () => {
  expect(simpleCat.vectorShiftRight(new Int16Array([5,4,3,2,1]), 1.4, 4)).toStrictEqual(new Int16Array([5,4,3,2,1.4]))
})