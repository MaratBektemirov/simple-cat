<div align="center">
  <a href="http://typeorm.io/">
    <img src="https://github.com/MaratBektemirov/simple-cat/raw/master/logo.svg" width="225" height="49">
  </a>
  <br>
  <br>
	<a href="https://badge.fury.io/js/simple-cat">
		<img src="https://badge.fury.io/js/simple-cat.svg">
	</a>
  <br>
  <br>
</div>

Simple-cat это простой инструмент для классификации текста
который может быть запущен в NodeJS или браузере и может быть использован с TypeScript и JavaScript.
Возможный спектр задач от систем поиска до классификации текстов (пользовательских отзывов, комментариев)

Simple-cat в основе своей использует [N-грамм](https://ru.wikipedia.org/wiki/N-%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B0), используются последовательности символов n-длины

Zero-dependency, 1.7Kb в сжатом виде

## Установка

```
npm install simple-cat
```

## Примеры использования

```typescript
class SimpleCat<D> {
    constructor(texts: ITextOption<D>[], textToModel: TextToModel, weightFunction: WeightFunction);
    match(text: string, top: number): {
        scores: Int16Array;
        indexes: Int16Array;
    };
}
```

Нечеткий поиск текста:

```typescript
import { SimpleCat, standartTextModel, standartWeightFunction } from "simple-cat"

const getItems = () => {
  return [
    {
      options: ['итальянская пицца','пицца','обед','ужин'],
      descriptor: {id: 1},
    },
        {
      options: ['пицца 4 сыра','пицца','ужин'],
      descriptor: {id: 1},
    },
    {
      options: ['макароны по итальянски','спаггети','обед','ужин'],
      descriptor: {id: 2},
    },
    {
      options: ['чиабатта испанская','хлеб'],
      descriptor: {id: 3},
    },
    {
      options: ['лосось с авокадом и рукколой','завтрак'],
      descriptor: {id: 4},
    },
    {
      options: ['стейк из лопатки теленка','обед','ужин'],
      descriptor: {id: 5},
    },      
  ]
}

const items = getItems();
const simpleCat = new SimpleCat(menuItems, standartTextModel, standartWeightFunction);

simpleCat.match('италия', 5);
-> {
    "scores": {
        "0": 30,
        "1": 26,
        "2": 0,
        "3": 0,
        "4": 0
    },
    "indexes": {
        "0": 0,
        "1": 2,
        "2": -1,
        "3": -1,
        "4": -1
    }
}
simpleCat.match('макароны', 5)
-> {
    "scores": {
        "0": 90,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0
    },
    "indexes": {
        "0": 2,
        "1": -1,
        "2": -1,
        "3": -1,
        "4": -1
    }
}
simpleCat.match('обед', 5)
-> {
    "scores": {
        "0": 30,
        "1": 30,
        "2": 30,
        "3": 0,
        "4": 0
    },
    "indexes": {
        "0": 0,
        "1": 2,
        "2": 5,
        "3": -1,
        "4": -1
    }
}
```