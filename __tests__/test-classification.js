const { 
  SimpleCat,
  standartTextModel,
  standartWeightFunction,
} = require('../index.js');

const classificator_test_1 = new SimpleCat([
  {options: ['покажи мне'], descriptor: {}}, 
  {options: ['показать'], descriptor: {}}, 
  {options: ['выбрать'], descriptor: {}}
], standartTextModel, standartWeightFunction);

test('classificator test 1 1', () => {
  expect(classificator_test_1.match('покажи мне', 3).indexes[0]).toStrictEqual(0)
})

const classificator_test_2 = new SimpleCat([
  {options: ['макароны по польски'], descriptor: {}}, 
  {options: ['макаронная каша по итальянски'], descriptor: {}}, 
  {options: ['итальянский суп десерт, а потом макароны'], descriptor: {}},
  {options: ['макароны в италии'], descriptor: {}},
], standartTextModel, standartWeightFunction);

test('classificator test 2 1', () => {
  expect(classificator_test_2.match('макароны по итальянски', 4).indexes[0]).toStrictEqual(1)
})

const classificator_test_3 = new SimpleCat([
  {options: ['Мне очень понравился торт. Очень вкусный, состав хороший. Будем покупать, рекомендую!'], descriptor: {}}, 
  {options: ['Какой-то странный, но вкусный торт с привкусом манго'], descriptor: {}}, 
  {options: ['Ваш магазин выручил меня, это был сногсшибательный торт'], descriptor: {}},
], standartTextModel, standartWeightFunction);

test('classificator test 3 1', () => {
  expect(classificator_test_3.match('Нам торт понравился, будем покупать больше', 3).indexes[0]).toStrictEqual(0)
})

const chehov = [
  {options: ['В человеке должно быть всё прекрасно: и лицо, и одежда, и душа, и мысли. «Дядя Ваня»'], descriptor: {}},

  {options: ['Дело не в пессимизме и не в оптимизме, а в том, что у девяноста девяти из ста нет ума. «Дама с собачкой»'], descriptor: {}},

  {options: ['Болезнь моя только в том, что за двадцать лет я нашел во всем городе только одного умного человека, да и тот сумасшедший! «Палата № 6»'], descriptor: {}},

  {options: ['Хорошее воспитание не в том, что ты не прольешь соуса на скатерть, а в том, что ты не заметишь, если это сделает кто-нибудь другой. «Дом с мезонином»'], descriptor: {}},

  {options: ['Если против какой-нибудь болезни предлагается очень много средств, то это значит, что болезнь неизлечима. «Вишневый сад»'], descriptor: {}},

  {options: ['Русский человек любит вспоминать, но не любит жить... «Степь»'], descriptor: {}},

  {options: ['Трудно понять человеческую душу, но душу свою собственную понять ещё трудней. «Драма на охоте»'], descriptor: {}},

  {options: ['Нет ничего хуже, когда знаешь чужую тайну и не можешь помочь. «Дядя Ваня»'], descriptor: {}},

  {options: ['А разве то, что мы живем в городе в духоте, в тесноте, пишем ненужные бумаги, играем в винт — разве это не футляр? А то, что мы проводим всю жизнь среди бездельников, сутяг, глупых, праздных женщин, говорим и слушаем разный вздор — разве это не футляр? «Человек в футляре»'], descriptor: {}},

  {options: ['Мужчина должен увлекаться, безумствовать, делать ошибки, страдать! Женщина простит вам и дерзость и наглость, но она никогда не простит этой вашей рассудительности. «Ариадна»'], descriptor: {}},

  {options: ['Жена — это самая ужасная, самая придирчивая цензура. «Безотцовщина»'], descriptor: {}},

  {options: ['Если тебе когда-нибудь понадобится моя жизнь, то приди и возьми её. «Чайка»'], descriptor: {}},

  {options: ['Тля ест траву, ржа железо, а лжа душу. «Моя жизнь»'], descriptor: {}},

  {options: ['Думает он об овсе, сене, о погоде... Про сына, когда один, думать он не может... Поговорить с кем-нибудь о нем можно, но самому думать и рисовать себе его образ невыносимо жутко... «Тоска»'], descriptor: {}},

  {options: ['Счастлив тот, кто не замечает, лето теперь или зима. «Три сестры»'], descriptor: {}},

  {options: ['Когда нет настоящей жизни, то живут миражами. Все-таки лучше, чем ничего. «Дядя Ваня»'], descriptor: {}},

  {options: ['Здоровы и нормальны только заурядные, стадные люди. «Черный монах»'], descriptor: {}},

  {options: ['Это правда. Надо прямо говорить, жизнь у нас дурацкая... «Вишневый сад»'], descriptor: {}},

  {options: ['Нельзя требовать от грязи, чтобы она не была грязью. «Драма на охоте»'], descriptor: {}},
];

const classificator_test_4 = new SimpleCat(chehov, standartTextModel, standartWeightFunction)

test('classificator test 4 1', () => {
  expect(classificator_test_4.match('Душа человека - прекрасна', 5).indexes[0]).toStrictEqual(0)
})

const classificator_test_5 = new SimpleCat([
  {options: ['Мы ехали на белом мотоциклете или велосипеде'], descriptor: {}}, 
  {options: ['Мы ехали на зеленом мотоциклете или велосипеде'], descriptor: {}}, 
  {options: ['Мы ехали на синем мотоциклете или велосипеде'], descriptor: {}},
], standartTextModel, standartWeightFunction);

test('classificator test 5 1', () => {
  expect(classificator_test_5.match('Мы ехали на велосипеде', 3)).toStrictEqual(
    {
      scores: new Int16Array([
        174,
        171,
        171,
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
      indexes: new Int16Array([0,1,2])
    }
  )
})

const classificator_test_6 = new SimpleCat([
  {options: ['покажи мне что там творится'], descriptor: {}}, 
  {options: ['давай же наконец покажи мне что там творится'], descriptor: {}}, 
  {options: ['выбрать'], descriptor: {}}
], standartTextModel, standartWeightFunction);

test('classificator test 6 1', () => {
  expect(classificator_test_6.match('покажи мне', 3)).toStrictEqual({
    scores: new Int16Array([
      75,
      60,
      0,
    ]),
    indexes: new Int16Array([0,1,-1])
  })
})