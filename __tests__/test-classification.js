const { 
  SimpleCat,
  standartTextModel,
  MatchFunctionType,
} = require('../index.js');

test('classificator test 1', () => {
  const classificator = new SimpleCat([
    {text: 'покажи мне', descriptor: {}}, 
    {text: 'показать', descriptor: {}}, 
    {text: 'выбрать', descriptor: {}}
  ], standartTextModel);

  expect(classificator.match('покаж мне', MatchFunctionType.space, 3)).toStrictEqual(
    {
      distances: new Float32Array([0.6000000238418579, -0.3333333432674408, -1]),
      top: {
        distances: new Float32Array([0.6000000238418579, -0.3333333432674408, -1]),
        indexes: new Int8Array([0,1,2]),
      }
    }
  )
})

const classificator_test_2 = new SimpleCat([
  {text: 'макароны по польски', descriptor: {}}, 
  {text: 'макаронная каша по итальянски', descriptor: {}}, 
  {text: 'итальянский суп десерт, а потом макароны', descriptor: {}},
  {text: 'макароны в италии', descriptor: {}},
], standartTextModel);

test('classificator test 2 1', () => {
  expect(classificator_test_2.match('макароны по итальянски', MatchFunctionType.space, 4)).toStrictEqual(
    {
      distances: new Float32Array([
        0.3333333432674408,
        0.4736842215061188,
        0.1666666716337204,
        0.4545454680919647
      ]),
      top: {
        distances: new Float32Array([
          0.4736842215061188,
          0.4545454680919647,
          0.3333333432674408,
          0.1666666716337204,
        ]),
        indexes: new Int8Array([1,3,0,2])
      }
    }
  )
})

const classificator_test_3 = new SimpleCat([
  {text: `Мне очень понравился торт. Очень вкусный, состав хороший. Будем покупать, рекомендую!`, descriptor: {}}, 
  {text: 'Какой-то странный, но вкусный торт с привкусом манго', descriptor: {}}, 
  {text: 'Ваш магазин выручил меня, это был сногсшибательный торт', descriptor: {}},
], standartTextModel);

test('classificator test 3 1', () => {
  expect(classificator_test_3.match('Нам торт понравился, будем покупать больше', MatchFunctionType.space, 3)).toStrictEqual(
    {
      distances: new Float32Array([
        -0.2083333283662796,
        -0.8666666746139526,
        -0.8709677457809448
      ]),
      top: {
        distances: new Float32Array([
          -0.2083333283662796,
          -0.8666666746139526,
          -0.8709677457809448
        ]),
        indexes: new Int8Array([0,1,2])
      }
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

const classificator_test_4 = new SimpleCat(chehov, standartTextModel)

test('classificator test 4 1', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', MatchFunctionType.space, 5).top.indexes[0] = 0).toStrictEqual(0)
})

test('classificator test 4 2', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', MatchFunctionType.position, 5).top.indexes[0] = 0).toStrictEqual(0)
})

const classificator_test_5 = new SimpleCat([
  {text: `Мы ехали на белом велосипеде`, descriptor: {}}, 
  {text: 'Мы ехали на зеленом велосипеде', descriptor: {}}, 
  {text: 'Мы ехали на синем велосипеде', descriptor: {}},
], standartTextModel);

test('classificator test 5 1', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', MatchFunctionType.space, 3)).toStrictEqual(
    {
      distances: new Float32Array([
        0.6681531071662903,
        0.4444444477558136,
        0.625
      ]),
      top: {
        distances: new Float32Array([
          0.6681531071662903,
          0.625,
          0.4444444477558136,
        ]),
        indexes: new Int8Array([0,2,1])
      }
    }
  )
})

test('classificator test 5 2', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', MatchFunctionType.position, 3)).toStrictEqual(
    {
      distances: new Float32Array([
        0.6848225593566895,
        0.6034448146820068,
        0.7240121364593506
      ]),
      top: {
        distances: new Float32Array([
          0.7240121364593506,
          0.6848225593566895,
          0.6034448146820068,
        ]),
        indexes: new Int8Array([2,0,1])
      }
    }
  )
})

const classificator_test_6 = new SimpleCat([
  {text: `Мы ехали на велосипеде`, descriptor: {}}, 
], standartTextModel);

test('classificator test 6', () => {
  const multiInput = () => {
    const input = [`Мы ехали на белом велосипеде`, 'Мы ехали на зеленом велосипеде', 'Мы ехали на синем велосипеде'];
    const results = [];

    for (let index = 0; index < input.length; index++) {
      const text = input[index];
      results.push(classificator_test_6.match(text, MatchFunctionType.space, 1).distances);
      results.push(classificator_test_6.match(text, MatchFunctionType.position, 1).distances);
    }

    return results;
  }

  expect(multiInput()).toStrictEqual(
    [
      new Float32Array([1]),
      new Float32Array([0.9954850077629089]),
      new Float32Array([1]),
      new Float32Array([0.9927337765693665]),
      new Float32Array([1]),
      new Float32Array([0.9964648485183716]),
    ]
  )
})

const classificator_test_7 = new SimpleCat([
  {text: `белка на едет белом велосипеде`, descriptor: {}}, 
], standartTextModel);

test('classificator test 7 1', () => {
  expect(classificator_test_7.match('на белом-белом велосипеде едет белка', MatchFunctionType.space, 1).distances).toStrictEqual(
    new Float32Array([
      1,
    ])
  )
})

test('classificator test 7 2', () => {
  expect(classificator_test_7.match('на белом-белом велосипеде едет белка', MatchFunctionType.position, 1).distances).toStrictEqual(
    new Float32Array([
      0.7704740166664124,
    ])
  )
})

const classificator_test_8 = new SimpleCat([
  {text: `Нам торт не понравился, не будем покупать больше`, descriptor: {}}, 
], standartTextModel);

test('classificator test 8 1', () => {
  expect(classificator_test_8.match('Нам торт понравился, будем покупать больше', MatchFunctionType.space, 1).distances).toStrictEqual(
    new Float32Array([
      0.8461538553237915,
    ])
  )
})

test('classificator test 8 2', () => {
  expect(classificator_test_8.match('Нам торт не понравился, не будем покупать больше', MatchFunctionType.space, 1).distances).toStrictEqual(
    new Float32Array([
      1,
    ])
  )
})