<div align="center">
  <img src="https://github.com/MaratBektemirov/simple-cat/raw/master/logo.png" width="500" height="69">
  <br>
  <br>
	<a href="https://badge.fury.io/js/simple-cat">
		<img src="https://badge.fury.io/js/simple-cat.svg">
	</a>
  <br>
  <br>
</div>

Simple-cat это простой инструмент для нечеткого поиска, поиска с опечатками, приблизительного совпадения строк.

Zero-dependency, меньше 2Kb в сжатом виде

Simple-cat is a simple tool for fuzzy earch, and approximate string matching.

Zero-dependency, less than 2Kb in compressed form

## Установка

```
npm install simple-cat
```

<font size = 7>[Демо](https://maratbektemirov.github.io/simple-cat/)</font>

## Примеры
```typescript
import { SimpleCat } from "simple-cat"

const items = [
    {
      options: ['Премудрый пескарь'],
      data: {id: 1},
    },
    {
      options: ['Ясная погода'],
      data: {id: 2},
    },
    {
      options: ['Ромео и Джульетта'],
      data: {id: 3},
    },
    {
      options: ['Соколиная охота'],
      data: {id: 4},
    },
    {
      options: ['Ясный код'],
      data: {id: 5},
    },
        {
      options: ['Отцы и дети'],
      data: {id: 6},
    },
    {
      options: ['У меня нет сна уже 3 день'],
      data: {id: 7},
    },
    {
      options: ['У меня даже пня нет'],
      data: {id: 8},
    },
  ];

const simpleCat = new SimpleCat(items);

simpleCat.match('пагода', 3);
-> {
  "scores": [230,125],
  "indexes": [1,0],
  "options": [0,0]
}

const result = simpleCat.match('пагода', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {"options":["Ясная погода"],"data":{"id":2}},
  {"options":["Премудрый пескарь"],"data":{"id":1}}
]

const result = simpleCat.match('пискарь', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Премудрый пескарь"],
    "data":{"id":1}
  }
]

const result = simpleCat.match('ахота', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Соколиная охота"],
    "data":{"id":4}
  }
]

const result = simpleCat.match('ясный', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Ясный код"],
    "data":{"id":5}
  },{
    "options":["Ясная погода"],
    "data":{"id":2}
  }
]

const result = simpleCat.match('ромио', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Ромео и Джульетта"],
    "data":{"id":3}
  }
]
```