<div align="center">
  <img src="https://github.com/MaratBektemirov/simple-cat/raw/master/big3.png" width="172" height="58">
  <br>
  <br>
  <img src="https://github.com/MaratBektemirov/simple-cat/raw/master/logo.svg" width="225" height="49">
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
Возможный спектр задач от легких систем поиска до классификации текстов (пользовательских отзывов, комментариев)

Simple-cat в основе своей использует [N-грамм](https://ru.wikipedia.org/wiki/N-%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B0), последовательности символов n-длины

Zero-dependency, меньше 2Kb в сжатом виде

## Установка

```
npm install simple-cat
```

## API

### Интерфейс класса SimpleCat

```typescript
class SimpleCat<D> {
    constructor(texts: ITextOption<D>[], textToModel: TextToModel, weightFunction: WeightFunction);
    match(text: string, top: number): {
        scores: Int16Array;
        indexes: Int16Array;
    };
}

interface ITextOption<A> {
    options: string[];
    descriptor: A;
}

interface ITextModel {
    grams: NGrams;
    length: number;
}

type TextToModel = (text: string) => ITextModel;
type WeightFunction = (templatePositions: Int16Array, searchPositions: Int16Array) => number;
```
<br><br>

### Поиск с опечаткой

```typescript
import { SimpleCat, standartTextModel, standartWeightFunction } from "simple-cat"

const getItems = () => {
  return [
    {
      options: ['агентство недвижимости'],
      descriptor: {id: 1},
    },
    {
      options: ['строительная компания'],
      descriptor: {id: 2},
    },
    {
      options: ['бюро по земельным разработкам'],
      descriptor: {id: 3},
    },
    {
      options: ['контора Игоря крутого'],
      descriptor: {id: 4},
    }
  ]
}

const items = getItems();
const simpleCat = new SimpleCat(items, standartTextModel, standartWeightFunction);

simpleCat.match('агенство', 5);
-> {
    "scores": [52],
    "indexes": [0],
}

simpleCat.match('кантора', 5);
-> {
    "scores": [45],
    "indexes": [3],
}

simpleCat.match('контора', 5);
-> {
    "scores": [75],
    "indexes": [3],
}
```
<br><br>

### Нечеткий поиск текста

```typescript
import { SimpleCat, standartTextModel, standartWeightFunction } from "simple-cat"

const getItems = () => {
  return [
    {
      options: ['итальянская пицца'],
      descriptor: {id: 1},
    },
    {
      options: ['пицца 4 сыра'],
      descriptor: {id: 2},
    },
    {
      options: ['макароны по итальянски'],
      descriptor: {id: 3},
    },
    {
      options: ['бургер италия'],
      descriptor: {id: 4},
    }
  ]
}

const items = getItems();
const simpleCat = new SimpleCat(items, standartTextModel, standartWeightFunction);

simpleCat.match('италия', 5);
-> {
    "scores": [56,30,26],
    "indexes": [3,0,2],
}
```
Получаем индексы элементов в которых есть хоть какие-то совпадения. Индексы отсортированы по релеватности, определяемой в weightFunction

<br><br>

### Классификация отзывов

```typescript
import { SimpleCat, standartTextModel, standartWeightFunction, WeightFunction } from "simple-cat"

const getItems = () => {
  return [
    {
      options: ['вкусный хороший замечательный прекрасный классный фантастический блестящий чудесный невероятный волшебный ужасный оригинальный шикарный дивный чудный совершенный веселый интересный'],
      descriptor: {type: 'positive'},
    },
    {
      options: ['безвкусный плохой ужасный жуткий отвратительный безобразный наводящий ужас пугающий противный печальный скучный приторный тухлый'],
      descriptor: {type: 'negative'},
    },
  ]
}

const negPosWeightFunction: WeightFunction = (templatePositions, searchPositions) => {
    const gramIndexInWordDiff = Math.abs(templatePositions[1] - searchPositions[1]) * 4
    const positionWeight = 5 - gramIndexInWordDiff;

    return 10 + Math.max(0, positionWeight);    
}

const items = getItems();
const simpleCat = new SimpleCat(items, standartTextModel, negPosWeightFunction);

simpleCat.match('Булочка прекрасно испечена, много начинки и в меру сладкая. Будем покупать еще', 2);
-> {
    "scores": [105,20],
    "indexes": [0,1],
}

simpleCat.match('Напиток абсолютно безвкусный, ощущение тухлых ягод', 2);
-> {
    "scores": [131,50],
    "indexes": [1,0],
}
```
Вместо стандартной weightFunction используется negPosWeightFunction, где не учитывается индекс слов