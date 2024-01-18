const { 
  SimpleCat,
} = require('../index.js');

const classificator_test_1 = new SimpleCat([
  {options: ['покажи мне'], data: {}}, 
  {options: ['показать'], data: {}}, 
  {options: ['выбрать'], data: {}}
]);

test('classificator test 1 1', () => {
  expect(classificator_test_1.match('покажи мне', 3).indexes[0]).toStrictEqual(0)
})

const classificator_test_2 = new SimpleCat([
  {options: ['макароны по польски'], data: {}}, 
  {options: ['макаронная каша по итальянски'], data: {}}, 
  {options: ['итальянский суп десерт, а потом макароны'], data: {}},
  {options: ['макароны в италии'], data: {}},
]);

test('classificator test 2 1', () => {
  expect(classificator_test_2.match('макароны по итальянски', 4).indexes[0]).toStrictEqual(1)
})

const classificator_test_3 = new SimpleCat([
  {options: ['Мне очень понравился торт. Очень вкусный, состав хороший. Будем покупать, рекомендую!'], data: {}}, 
  {options: ['Какой-то странный, но вкусный торт с привкусом манго'], data: {}}, 
  {options: ['Ваш магазин выручил меня, это был сногсшибательный торт'], data: {}},
]);

test('classificator test 3 1', () => {
  expect(classificator_test_3.match('Нам торт понравился, будем покупать больше', 3).indexes[0]).toStrictEqual(0)
})

const chehov = [
  {options: ['В человеке должно быть всё прекрасно: и лицо, и одежда, и душа, и мысли. «Дядя Ваня»'], data: {}},

  {options: ['Дело не в пессимизме и не в оптимизме, а в том, что у девяноста девяти из ста нет ума. «Дама с собачкой»'], data: {}},

  {options: ['Болезнь моя только в том, что за двадцать лет я нашел во всем городе только одного умного человека, да и тот сумасшедший! «Палата № 6»'], data: {}},

  {options: ['Хорошее воспитание не в том, что ты не прольешь соуса на скатерть, а в том, что ты не заметишь, если это сделает кто-нибудь другой. «Дом с мезонином»'], data: {}},

  {options: ['Если против какой-нибудь болезни предлагается очень много средств, то это значит, что болезнь неизлечима. «Вишневый сад»'], data: {}},

  {options: ['Русский человек любит вспоминать, но не любит жить... «Степь»'], data: {}},

  {options: ['Трудно понять человеческую душу, но душу свою собственную понять ещё трудней. «Драма на охоте»'], data: {}},

  {options: ['Нет ничего хуже, когда знаешь чужую тайну и не можешь помочь. «Дядя Ваня»'], data: {}},

  {options: ['А разве то, что мы живем в городе в духоте, в тесноте, пишем ненужные бумаги, играем в винт — разве это не футляр? А то, что мы проводим всю жизнь среди бездельников, сутяг, глупых, праздных женщин, говорим и слушаем разный вздор — разве это не футляр? «Человек в футляре»'], data: {}},

  {options: ['Мужчина должен увлекаться, безумствовать, делать ошибки, страдать! Женщина простит вам и дерзость и наглость, но она никогда не простит этой вашей рассудительности. «Ариадна»'], data: {}},

  {options: ['Жена — это самая ужасная, самая придирчивая цензура. «Безотцовщина»'], data: {}},

  {options: ['Если тебе когда-нибудь понадобится моя жизнь, то приди и возьми её. «Чайка»'], data: {}},

  {options: ['Тля ест траву, ржа железо, а лжа душу. «Моя жизнь»'], data: {}},

  {options: ['Думает он об овсе, сене, о погоде... Про сына, когда один, думать он не может... Поговорить с кем-нибудь о нем можно, но самому думать и рисовать себе его образ невыносимо жутко... «Тоска»'], data: {}},

  {options: ['Счастлив тот, кто не замечает, лето теперь или зима. «Три сестры»'], data: {}},

  {options: ['Когда нет настоящей жизни, то живут миражами. Все-таки лучше, чем ничего. «Дядя Ваня»'], data: {}},

  {options: ['Здоровы и нормальны только заурядные, стадные люди. «Черный монах»'], data: {}},

  {options: ['Это правда. Надо прямо говорить, жизнь у нас дурацкая... «Вишневый сад»'], data: {}},

  {options: ['Нельзя требовать от грязи, чтобы она не была грязью. «Драма на охоте»'], data: {}},
];

const classificator_test_4 = new SimpleCat(chehov)

test('classificator test 4 1', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', 5).indexes[0]).toStrictEqual(0)
})

const classificator_test_5 = new SimpleCat([
  {options: ['Мы ехали на белом мотоциклете или велосипеде'], data: {}}, 
  {options: ['Мы ехали на зеленом мотоциклете или велосипеде'], data: {}}, 
  {options: ['Мы ехали на синем мотоциклете или велосипеде'], data: {}},
]);

test('classificator test 5 1', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', 3)).toStrictEqual(
    {
      scores: new Int16Array([
        174,
        171,
        171,
      ]),
      options: new Int16Array([
        0,
        0,
        0,
      ]),
      indexes: new Int16Array([0,1,2])
    }
  )
})

test('classificator test 5 2', () => {
  expect(classificator_test_5.match('Мы ехали на мотоциклете', 3)).toStrictEqual(
    {
      scores: new Int16Array([
        201,
        201,
        201,
      ]),
      options: new Int16Array([
        0,
        0,
        0,
      ]),
      indexes: new Int16Array([0,1,2])
    }
  )
})

test('classificator test 5 3', () => {
  expect(classificator_test_5.match('Мы ехали на фиолетовом мотоциклете', 3)).toStrictEqual(
    {
      scores: new Int16Array([
        205,
        205,
        205,
      ]),
      options: new Int16Array([
        0,
        0,
        0,
      ]),
      indexes: new Int16Array([0,1,2])
    }
  )
})

const classificator_test_6 = new SimpleCat([
  {options: ['покажи мне что там творится'], data: {}}, 
  {options: ['давай же наконец покажи мне что там творится'], data: {}}, 
  {options: ['выбрать'], data: {}}
]);

test('classificator test 6 1', () => {
  expect(classificator_test_6.match('покажи мне', 3)).toStrictEqual({
    scores: new Int16Array([
      75,
      60,
    ]),
    options: new Int16Array([
      0,
      0,
    ]),
    indexes: new Int16Array([0,1])
  })
})

const classificator_test_7 = new SimpleCat([
  {options: ['вывести', 'показать', 'открыть', 'отобразить'], data: {}}, 
  {options: ['подсчитать', 'суммировать', 'подытожить'], data: {}},
]);

test('classificator test 7 1', () => {
  expect(classificator_test_7.match('покажи мне', 3)).toStrictEqual({
    scores: new Int16Array([
      30,
    ]),
    options: new Int16Array([
      1
    ]),
    indexes: new Int16Array([
      0
    ])
  })

  expect(classificator_test_7.match('подсчет', 3)).toStrictEqual({
    scores: new Int16Array([
      45,
      15,
    ]),
    options: new Int16Array([
      0,
      2
    ]),
    indexes: new Int16Array([
      1,
      1
    ])
  })
})