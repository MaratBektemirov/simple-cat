const { 
  getNGrams, 
  getMatchVector, 
  getVectorCosineDistance, 
  getNGramsCosineDistance, 
  VectorFindVacantIndex,
  VectorShiftRight,
  standartTextModel,
  standartWeightFunction,
} = require('../index.js');

test('check grams 1', () => {
  const { grams } = getNGrams(['проверка'], 3);

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
  const { grams } = getNGrams(['парампампам'], 3);

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
  const { grams } = getNGrams(['проверка'], 2);

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
  const { grams } = getNGrams(['парампампампам'], 3);

  expect(grams).toStrictEqual({
    'амп': {positions: [new Int16Array([0,3]), new Int16Array([0,6]), new Int16Array([0,9])], indexes: [3,6,9]},
    'ара': {positions: [new Int16Array([0,1])], indexes: [1]},
    'мпа': {positions: [new Int16Array([0,4]), new Int16Array([0,7]), new Int16Array([0,10])], indexes: [4,7,10]},
    'пам': {positions: [new Int16Array([0,5]), new Int16Array([0,8]), new Int16Array([0,11])], indexes: [5,8,11]},
    'пар': {positions: [new Int16Array([0,0])], indexes: [0]},
    'рам': {positions: [new Int16Array([0,2])], indexes: [2]},
  });
})

test('check grams vector 1', () => { 
  expect(standartTextModel('размышление').vector).toStrictEqual(new Int8Array([1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('check grams vector 2', () => { 
  expect(standartTextModel('парампампампам').vector).toStrictEqual(new Int8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('check match vector 1', () => {
  const checkMatchVector = () => {
    const templateModel = standartTextModel('размышление');
    const searchModel = standartTextModel('размышляющий');

    return getMatchVector(templateModel, searchModel, standartWeightFunction);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, -1, -1, -1, -1]));
});

test('check match vector 2', () => {
  const checkMatchVector = () => {
    const templateModel = standartTextModel('размышление');
    const searchModel = standartTextModel('размышления');

    return getMatchVector(templateModel, searchModel, standartWeightFunction);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, -1]));
});

test('check match vector 3', () => {
  const checkMatchVector = () => {
    const templateModel = standartTextModel('парампампампам');
    const searchModel = standartTextModel('парампампампам');

    return getMatchVector(templateModel, searchModel, standartWeightFunction);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('cosine distance 1', () => {
  expect(getVectorCosineDistance([1, 2, 3, 4, 5],[1, 2, 3, 4, 5])).toBe(1)
})

test('cosine distance 2', () => {
  const templateModel = standartTextModel('парампампамляля');
  const searchModel = standartTextModel('парампампам');

  expect(getNGramsCosineDistance(templateModel, searchModel, standartWeightFunction)).toBe(0.3846153846153847)
})

test('cosine distance 3', () => {
  const templateModel = standartTextModel('парампампампам');
  const searchModel = standartTextModel('парампампампам');

  expect(getNGramsCosineDistance(templateModel, searchModel, standartWeightFunction)).toBe(1.0000000000000002)
})

test('cosine distance 4', () => {
  const templateModel = standartTextModel('парампампампам');
  const searchModel = standartTextModel('слово');

  expect(getNGramsCosineDistance(templateModel, searchModel, standartWeightFunction)).toBe(-1.0000000000000002)
})

test('cosine distance 5', () => {
  expect(getVectorCosineDistance([0,0],[0,1])).toBe(NaN)
})

test('vector find vacant index 1', () => {
  expect(VectorFindVacantIndex(new Float32Array([5,4,3,2,1]), 5)).toBe(1)
})

test('vector find vacant index 2', () => {
  expect(VectorFindVacantIndex(new Float32Array([5,4,3,2,1]), 3.5)).toBe(2)
})

test('vector find vacant index 3', () => {
  expect(VectorFindVacantIndex(new Float32Array([5,4,3,2,1]), 0.8)).toBe(-1)
})

test('vector find vacant index 4', () => {
  expect(VectorFindVacantIndex(new Float32Array([5,4,3,2,1]), 5.2)).toBe(0)
})

test('vector shift right 1', () => {
  expect(VectorShiftRight(new Float32Array([5,4,3,2,1]), 5.5, 0)).toStrictEqual(new Float32Array([5.5,5,4,3,2]))
})

test('vector shift right 2', () => {
  expect(VectorShiftRight(new Float32Array([5,4,3,2,1]), 4.4, 1)).toStrictEqual(new Float32Array([5,4.4,4,3,2]))
})

test('vector shift right 3', () => {
  expect(VectorShiftRight(new Float32Array([5,4,3,2,1]), 1.4, 4)).toStrictEqual(new Float32Array([5,4,3,2,1.4]))
})