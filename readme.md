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
Simple-cat в основе своей использует [N-грамм](https://ru.wikipedia.org/wiki/N-%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B0), последовательности символов n-длины.

Zero-dependency, меньше 2Kb в сжатом виде

## Установка

```
npm install simple-cat
```

[Демо](https://maratbektemirov.github.io/simple-cat/)

## Примеры
<br>

### Алгоритм нечеткого поиска, возможность выдачи при опечатках пользователя

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
  ];

const simpleCat = new SimpleCat(items);

simpleCat.match('пагода', 3);
-> {
  "scores":{"0":28},
  "indexes":{"0":1},
  "options":{"0":0}
}

const result = simpleCat.match('пагода', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Ясная погода"],
    "data":{"id":2}
  }
]

simpleCat.match('пискарь', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Премудрый пескарь"],
    "data":{"id":1}
  }
]

simpleCat.match('ахота', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Соколиная охота"],
    "data":{"id":4}
  }
]

simpleCat.match('ясный', 3);
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

simpleCat.match('ромио', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Ромео и Джульетта"],
    "data":{"id":3}
  }
]
```
<br>

### Увеличение качества поиска в результате подключения расширения

```typescript
import { SimpleCat } from "simple-cat"

const items = [
    {
      options: ['Отцы и дети'],
      data: {id: 1},
    },
    {
      options: ['У меня нет сна уже 3 день'],
      data: {id: 2},
    },
    {
      options: ['У меня даже пня нет'],
      data: {id: 3},
    },
];

const simpleCat = new SimpleCat(items, [SimpleCat.STUFF.extensions.ru.fluentVowels]);

const result = simpleCat.match('отец', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Отцы и дети"],
    "data":{"id":1}
  }
]

const result = simpleCat.match('дите', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["Отцы и дети"],
    "data":{"id":1}
  }
]

const result = simpleCat.match('пень', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["У меня даже пня нет"],
    "data":{"id":3}
  },{
    "options":["У меня нет сна уже 3 день"],
    "data":{"id":2}
  }
]

const result = simpleCat.match('сон', 3);
Array.from(result.indexes).map((index) => items[index]);
-> [
  {
    "options":["У меня нет сна уже 3 день"],
    "data":{"id":2}
  }
]
```