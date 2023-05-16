const { 
  getNGrams, 
  getMatchVector, 
  getVectorCosineDistance, 
  getNGramsSpaceCosineDistance, 
  standartTextModel,
  VectorFindVacantIndex,
  VectorShiftRight,
} = require('../index.js');

test('check grams 1', () => {
  const { grams, negGrams } = getNGrams(['проверка'], 3);

  expect(grams).toStrictEqual({
    'про': new Int8Array([0]),
    'ров': new Int8Array([1]),
    'ове': new Int8Array([2]),
    'вер': new Int8Array([3]),
    'ерк': new Int8Array([4]),
    'рка': new Int8Array([5]),
  });

  expect(negGrams).toStrictEqual({
    'про': new Int8Array([-0]),
    'ров': new Int8Array([-1]),
    'ове': new Int8Array([-2]),
    'вер': new Int8Array([-3]),
    'ерк': new Int8Array([-4]),
    'рка': new Int8Array([-5]),
  });
});

test('check grams 2', () => {
  const { grams, negGrams } = getNGrams(['парампампам'], 3);

  expect(grams).toStrictEqual({
    'пар': new Int8Array([0]),
    'ара': new Int8Array([1]),
    'рам': new Int8Array([2]),
    'амп': new Int8Array([3,6]),
    'мпа': new Int8Array([4,7]),
    'пам': new Int8Array([5,8]),
  });

  expect(negGrams).toStrictEqual({
    'пар': new Int8Array([-0]),
    'ара': new Int8Array([-1]),
    'рам': new Int8Array([-2]),
    'амп': new Int8Array([-3,-6]),
    'мпа': new Int8Array([-4,-7]),
    'пам': new Int8Array([-5,-8]),
  });
});

test('check grams 3', () => {
  const { grams, negGrams } = getNGrams(['проверка'], 2);

  expect(grams).toStrictEqual({
    'пр': new Int8Array([0]),
    'ро': new Int8Array([1]),
    'ов': new Int8Array([2]),
    'ве': new Int8Array([3]),
    'ер': new Int8Array([4]),
    'рк': new Int8Array([5]),
    'ка': new Int8Array([6])
  });

  expect(negGrams).toStrictEqual({
    'пр': new Int8Array([-0]),
    'ро': new Int8Array([-1]),
    'ов': new Int8Array([-2]),
    'ве': new Int8Array([-3]),
    'ер': new Int8Array([-4]),
    'рк': new Int8Array([-5]),
    'ка': new Int8Array([-6])
  });
});

test('check grams 4', () => {
  const { grams, negGrams } = getNGrams(['парампампампам'], 3);

  expect(grams).toStrictEqual({
    'амп': new Int8Array([3,6,9]),
    'ара': new Int8Array([1]),
    'мпа': new Int8Array([4,7,10]),
    'пам': new Int8Array([5,8,11]),
    'пар': new Int8Array([0]),
    'рам': new Int8Array([2]),
  });

  expect(negGrams).toStrictEqual({
    'амп': new Int8Array([-3,-6,-9]),
    'ара': new Int8Array([-1]),
    'мпа': new Int8Array([-4,-7,-10]),
    'пам': new Int8Array([-5,-8,-11]),
    'пар': new Int8Array([0]),
    'рам': new Int8Array([-2]),
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

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, -1, -1, -1, -1]));
});

test('check match vector 2', () => {
  const checkMatchVector = () => {
    const templateModel = standartTextModel('размышление');
    const searchModel = standartTextModel('размышления');

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, -1]));
});

test('check match vector 3', () => {
  const checkMatchVector = () => {
    const templateModel = standartTextModel('парампампампам');
    const searchModel = standartTextModel('парампампампам');

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('cosine distance 1', () => {
  expect(getVectorCosineDistance([1, 2, 3, 4, 5],[1, 2, 3, 4, 5])).toBe(1)
})

test('cosine distance 2', () => {
  const templateModel = standartTextModel('парампампамляля');
  const searchModel = standartTextModel('парампампам');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(0.3846153846153847)
})

test('cosine distance 3', () => {
  const templateModel = standartTextModel('парампампампам');
  const searchModel = standartTextModel('парампампампам');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(1.0000000000000002)
})

test('cosine distance 4', () => {
  const templateModel = standartTextModel('парампампампам');
  const searchModel = standartTextModel('слово');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(-1.0000000000000002)
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