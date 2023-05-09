const { 
  getNGrams, 
  getMatchVector, 
  getVectorCosineDistance, 
  getNGramsSpaceCosineDistance, 
  SimpleCat,
  smallTextModel,
  MatchFunctionType,
} = require('./index.js');

test('check grams 1', () => {
  const { grams, negGrams } = getNGrams('проверка', 3);

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
  const { grams, negGrams } = getNGrams('парампампам', 3);

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
  const { grams, negGrams } = getNGrams('проверка', 2);

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
  const { grams, negGrams } = getNGrams('парампампампам', 3);

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
  expect(smallTextModel('размышление').vector).toStrictEqual(new Int8Array([1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('check grams vector 2', () => { 
  expect(smallTextModel('парампампампам').vector).toStrictEqual(new Int8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('check match vector 1', () => {
  const checkMatchVector = () => {
    const templateModel = smallTextModel('размышление');
    const searchModel = smallTextModel('размышляющий');

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, -1, -1, -1, -1]));
});

test('check match vector 2', () => {
  const checkMatchVector = () => {
    const templateModel = smallTextModel('размышление');
    const searchModel = smallTextModel('размышления');

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, -1]));
});

test('check match vector 3', () => {
  const checkMatchVector = () => {
    const templateModel = smallTextModel('парампампампам');
    const searchModel = smallTextModel('парампампампам');

    return getMatchVector(templateModel, searchModel);
  }
 
  expect(checkMatchVector()).toStrictEqual(new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
});

test('cosine distance 1', () => {
  expect(getVectorCosineDistance([1, 2, 3, 4, 5],[1, 2, 3, 4, 5])).toBe(1)
})

test('cosine distance 2', () => {
  const templateModel = smallTextModel('парампампамляля');
  const searchModel = smallTextModel('парампампам');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(0.3846153846153847)
})

test('cosine distance 3', () => {
  const templateModel = smallTextModel('парампампампам');
  const searchModel = smallTextModel('парампампампам');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(1.0000000000000002)
})

test('cosine distance 4', () => {
  const templateModel = smallTextModel('парампампампам');
  const searchModel = smallTextModel('слово');

  expect(getNGramsSpaceCosineDistance(templateModel, searchModel)).toBe(-1.0000000000000002)
})

test('classificator test 1', () => {
  const classificator = new SimpleCat([
    {text: 'покажи мне', descriptor: {}}, 
    {text: 'показать', descriptor: {}}, 
    {text: 'выбрать', descriptor: {}}
  ], smallTextModel);

  expect(classificator.match('покаж мне', MatchFunctionType.space)).toStrictEqual(
    {
      distances: new Float32Array([0.6000000238418579, -0.3333333432674408, -1]),
      maxCosIndex: 0
    }
  )
})

const classificator_test_2 = new SimpleCat([
  {text: 'макароны по польски', descriptor: {}}, 
  {text: 'макаронная каша по итальянски', descriptor: {}}, 
  {text: 'итальянский суп десерт, а потом макароны', descriptor: {}},
  {text: 'макароны в италии', descriptor: {}},
], smallTextModel);

test('classificator test 2', () => {
  expect(classificator_test_2.match('макароны по итальянски', MatchFunctionType.space)).toStrictEqual(
    {
      distances: new Float32Array([
        0.27272728085517883,
        0.4444444477558136,
        0.21739129722118378,
        0.6000000238418579
      ]),
      maxCosIndex: 3
    }
  )
})

const classificator_test_3 = new SimpleCat([
  {text: `Мне очень понравился торт. Очень вкусный, состав хороший. Будем покупать, рекомендую!`, descriptor: {}}, 
  {text: 'Какой-то странный, но вкусный торт с привкусом манго', descriptor: {}}, 
  {text: 'Ваш магазин выручил меня, это был сногсшибательный торт', descriptor: {}},
], smallTextModel);

test('classificator test 3', () => {
  expect(classificator_test_3.match('Нам торт понравился, будем покупать больше', MatchFunctionType.space)).toStrictEqual(
    {
      distances: new Float32Array([
        -0.2083333283662796,
        -0.8571428656578064,
        -0.8709677457809448
      ]),
      maxCosIndex: 0
    }
  )
})

const chehov = [
  {text: `В человеке должно быть всё прекрасно: и лицо, и одежда, и душа, и мысли. «Дядя Ваня»`, descriptor: {}},

  {text: `Дело не в пессимизме и не в оптимизме, а в том, что у девяноста девяти из ста нет ума. «Дама с собачкой»`, descriptor: {}},

  {text: `Болезнь моя только в том, что за двадцать лет я нашел во всем городе только одного умного человека, да и тот сумасшедший! «Палата № 6»`, descriptor: {}},

  {text: `Хорошее воспитание не в том, что ты не прольешь соуса на скатерть, а в том, что ты не заметишь, если это сделает кто-нибудь другой. «Дом с мезонином»`, descriptor: {}},

  {text: `Если против какой-нибудь болезни предлагается очень много средств, то это значит, что болезнь неизлечима. «Вишневый сад»`, descriptor: {}},

  {text: `Русский человек любит вспоминать, но не любит жить... «Степь»`, descriptor: {}},

  {text: `Трудно понять человеческую душу, но душу свою собственную понять ещё трудней. «Драма на охоте»`, descriptor: {}},

  {text: `Нет ничего хуже, когда знаешь чужую тайну и не можешь помочь. «Дядя Ваня»`, descriptor: {}},

  {text: `А разве то, что мы живем в городе в духоте, в тесноте, пишем ненужные бумаги, играем в винт — разве это не футляр? А то, что мы проводим всю жизнь среди бездельников, сутяг, глупых, праздных женщин, говорим и слушаем разный вздор — разве это не футляр? «Человек в футляре»`, descriptor: {}},

  {text: `Мужчина должен увлекаться, безумствовать, делать ошибки, страдать! Женщина простит вам и дерзость и наглость, но она никогда не простит этой вашей рассудительности. «Ариадна»`, descriptor: {}},

  {text: `Жена — это самая ужасная, самая придирчивая цензура. «Безотцовщина»`, descriptor: {}},

  {text: `Если тебе когда-нибудь понадобится моя жизнь, то приди и возьми её. «Чайка»`, descriptor: {}},

  {text: `Тля ест траву, ржа железо, а лжа душу. «Моя жизнь»`, descriptor: {}},

  {text: `Думает он об овсе, сене, о погоде... Про сына, когда один, думать он не может... Поговорить с кем-нибудь о нем можно, но самому думать и рисовать себе его образ невыносимо жутко... «Тоска»`, descriptor: {}},

  {text: `Счастлив тот, кто не замечает, лето теперь или зима. «Три сестры»`, descriptor: {}},

  {text: `Когда нет настоящей жизни, то живут миражами. Все-таки лучше, чем ничего. «Дядя Ваня»`, descriptor: {}},

  {text: `Здоровы и нормальны только заурядные, стадные люди. «Черный монах»`, descriptor: {}},

  {text: `Это правда. Надо прямо говорить, жизнь у нас дурацкая... «Вишневый сад»`, descriptor: {}},

  {text: `Нельзя требовать от грязи, чтобы она не была грязью. «Драма на охоте»`, descriptor: {}},
];

const classificator_test_4 = new SimpleCat(chehov, smallTextModel)

test('classificator test 4 1', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', MatchFunctionType.space).maxCosIndex).toStrictEqual(0)
})

test('classificator test 4 2', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', MatchFunctionType.position).maxCosIndex).toStrictEqual(0)
})

const classificator_test_5 = new SimpleCat([
  {text: `Мы ехали на белом велосипеде`, descriptor: {}}, 
  {text: 'Мы ехали на зеленом велосипеде', descriptor: {}}, 
  {text: 'Мы ехали на синем велосипеде', descriptor: {}},
], smallTextModel);

test('classificator test 5 1', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', MatchFunctionType.space)).toStrictEqual(
    {
      distances: new Float32Array([
        0.6172134280204773,
        0.375,
        0.5714285969734192
      ]),
      maxCosIndex: 0
    }
  )
})

test('classificator test 5 2', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', MatchFunctionType.position)).toStrictEqual(
    {
      distances: new Float32Array([
        0.6692464351654053,
        0.5572108030319214,
        0.685627818107605
      ]),
      maxCosIndex: 2
    }
  )
})

const classificator_test_6 = new SimpleCat([
  {text: `Мы ехали на велосипеде`, descriptor: {}}, 
], smallTextModel);

test('classificator test 6', () => {
  const multiInput = () => {
    const input = [`Мы ехали на белом велосипеде`, 'Мы ехали на зеленом велосипеде', 'Мы ехали на синем велосипеде'];
    const results = [];

    for (let index = 0; index < input.length; index++) {
      const text = input[index];
      results.push(classificator_test_6.match(text, MatchFunctionType.space));
      results.push(classificator_test_6.match(text, MatchFunctionType.position));
    }

    return results;
  }

  expect(multiInput()).toStrictEqual(
    [
      {
        distances: new Float32Array([1]),
        maxCosIndex: 0
      },
      {
        distances: new Float32Array([0.9937711954116821]),
        maxCosIndex: 0
      },
      {
        distances: new Float32Array([1]),
        maxCosIndex: 0
      },
      {
        distances: new Float32Array([0.988890528678894]),
        maxCosIndex: 0
      },
      {
        distances: new Float32Array([1]),
        maxCosIndex: 0
      },
      {
        distances: new Float32Array([0.9942685961723328]),
        maxCosIndex: 0
      },
    ]
  )
})

const classificator_test_7 = new SimpleCat([
  {text: `белка на едет белом велосипеде`, descriptor: {}}, 
], smallTextModel);

test('classificator test 7 1', () => {
  expect(classificator_test_7.match('на белом-белом велосипеде едет белка', MatchFunctionType.space)).toStrictEqual(
    {
      distances: new Float32Array([
        1,
      ]),
      maxCosIndex: 0
    }
  )
})

test('classificator test 7 2', () => {
  expect(classificator_test_7.match('на белом-белом велосипеде едет белка', MatchFunctionType.position)).toStrictEqual(
    {
      distances: new Float32Array([
        0.7549434900283813,
      ]),
      maxCosIndex: 0
    }
  )
})