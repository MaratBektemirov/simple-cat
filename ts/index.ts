type TextToModel = (text: string) => ITextModel;
type WeightFunction = (templatePositions: Int16Array, searchPositions: Int16Array) => number;
type NGrams = {[key: string]: {positions: Int16Array[], indexes: number[]}};

interface ITextModel {
    grams: NGrams;
    length: number;
}

interface ITextModelWithDescriptor<A> {
    model: ITextModel,
    descriptor: A
}

interface ITextOption<A> {
    text: string,
    descriptor: A
}

const wordRegexp = /[^A-Za-zА-Яа-я ]/g;
const splitWordRegexp = /\s+/g;

const standartWeightFunction: WeightFunction = (templatePositions, searchPositions) => {
    const wordIndexDiff = Math.abs(templatePositions[0] - searchPositions[0]) * 1;
    const gramIndexInWordDiff = Math.abs(templatePositions[1] - searchPositions[1]) * 4
    const positionWeight = 5 - wordIndexDiff - gramIndexInWordDiff;

    return 10 + Math.max(0, positionWeight);    
}

const standartTextModel: TextToModel = (text: string) => {
    const gramSize = 3;
    const words = text.split(splitWordRegexp);

    return getNGrams(words, gramSize);
}

const VectorFindVacantIndex = (vector: Int16Array, candidate: number) => {
    let i = 0;

    while (i < vector.length) {
        if (candidate > vector[i]) {
            return i;
        }

        i++;
    }

    return -1;
}

const VectorShiftRight = (vector: Int16Array, value: number, index: number) => {
    let i = vector.length - 1;

    while (i > index) {
        vector[i] = vector[i - 1];
        i--;
    }

    vector[index] = value;

    return vector;
}

function getNGrams(words: string[], gramSize: number) {
    if (typeof gramSize !== 'number') {
        console.error('Please define size of grams');
    }

    const grams: NGrams = {};
    const addGram = (gram: string, absoluteGramIndex: number, wordIndex: number, gramInWordIndex: number) => {
        grams[gram] = grams[gram] || {positions: [], indexes: []};
        grams[gram].positions.push(new Int16Array([wordIndex, gramInWordIndex]));
        grams[gram].indexes.push(absoluteGramIndex);
    };

    let i = 0;
    let absoluteGramIndex = 0;

    while (words[i]) {
        const word = words[i].toLowerCase().replace(wordRegexp, '');

        if (word.length < gramSize) {
            addGram(word, absoluteGramIndex, i, 0);
            absoluteGramIndex++;
        } else {
            let j = 0;
            while (word[j + gramSize - 1]) {
                let gram = word.slice(j, j + gramSize);
                addGram(gram, absoluteGramIndex, i, j);
    
                j++;
                absoluteGramIndex++;
            }
        }

        i++;
    }

    const length = absoluteGramIndex;

    return { grams, length };
}

function getMatchScore(templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction) {
    let score = 0

    for (const searchGram of Object.keys(searchModel.grams)) {
        const templateGramPositions = templateModel.grams[searchGram];

        if (!templateGramPositions) continue;

        const searchGramPositions = searchModel.grams[searchGram];

        let i = 0;

        while (i < templateGramPositions.indexes.length) {
            const templatePositions = templateGramPositions.positions[i];
            const searchPositions = searchGramPositions.positions[i];

            if (!searchPositions) {
                break;
            }

            score += weightFunction(templatePositions, searchPositions);
            i++;
        }
    }

    return score;
}

class SimpleCat<D> {
    private _models: ITextModelWithDescriptor<D>[] = [];

    constructor(
        texts: ITextOption<D>[],
        private textToModel: TextToModel,
        private weightFunction: WeightFunction,
    ) {
        let i = 0;

        if (typeof textToModel !== 'function') {
            console.error('Please define the text to model function');
        }
    
        while (texts[i]) {
            const { text, descriptor } = texts[i];

            this._models.push(
                {
                    model: this.textToModel(text),
                    descriptor,
                }
            );

            i++;
        }
    }

    match(text: string, top: number) {
        const searchModel = this.textToModel(text);

        const topScoresVector = new Int16Array(top);
        const topIndexVector = new Int16Array(top);
        topIndexVector.fill(-1);

        let i = 0;
        while (this._models[i]) {
            const templateModel = this._models[i].model;
            const score = getMatchScore(templateModel, searchModel, this.weightFunction);

            const vacantIndex = VectorFindVacantIndex(topScoresVector, score);

            if (vacantIndex > -1) {
                VectorShiftRight(topScoresVector, score, vacantIndex);
                VectorShiftRight(topIndexVector, i, vacantIndex);
            }

            i++;
        }

        return {
            scores: topScoresVector,
            indexes: topIndexVector,
        };
    }
}

export {
    SimpleCat,
    standartTextModel,
    standartWeightFunction,
    getNGrams,
    getMatchScore,
    VectorFindVacantIndex,
    VectorShiftRight,
}