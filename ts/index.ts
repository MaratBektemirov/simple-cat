type MatchFunction = (templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction) => number;
type TextToModel = (text: string) => ITextModel;
type WeightFunction = (templatePositions: Vector, searchPositions: Vector) => number;
type NGrams = {[key: string]: {positions: Vector[], indexes: number[]}};
type Vector = Float32Array | Int8Array | Int16Array | Int32Array;

interface ITextModel {
    grams: NGrams;
    vector: Int8Array;
    negVector: Int8Array;
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
    const positionWeight = 0.4 
        - (Math.abs(templatePositions[0] - searchPositions[0]) * 0.02) 
        + (Math.abs(templatePositions[1] - searchPositions[1]) * 0.08);

    return (1.6 + Math.max(0, positionWeight));    
}

const standartTextModel: TextToModel = (text: string) => {
    const gramSize = 3;
    const words = text.split(splitWordRegexp);

    const { grams, length } = getNGrams(words, gramSize);

    const negVector = new Int8Array(length);
    const vector = new Int8Array(length);

    negVector.fill(-1);
    vector.fill(1);

    return { grams, vector, negVector, length };
}

const VectorFindVacantIndex = (vector: Vector, candidate: number) => {
    let i = 0;

    while (i < vector.length) {
        if (candidate > vector[i]) {
            return i;
        }

        i++;
    }

    return -1;
}

const VectorShiftRight = (vector: Vector, value: number, index: number) => {
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

function getMatchVector(templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction) {
    const vector = new Float32Array(templateModel.negVector);

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

            const index = templateGramPositions.indexes[i];
            vector[index] += weightFunction(templatePositions, searchPositions);
            i++;
        }
    }

    return vector;
}

function getVectorCosineDistance(aVector: Vector, bVector: Vector) {    
    let scalarProduct = 0;
    let aSumOfSquaresOfCoordinates = 0;
    let bSumOfSquaresOfCoordinates = 0;

    let cursor = 0;

    while (cursor < aVector.length) {
        scalarProduct += (aVector[cursor] * bVector[cursor]);
        aSumOfSquaresOfCoordinates += (aVector[cursor] * aVector[cursor]);
        bSumOfSquaresOfCoordinates += (bVector[cursor] * bVector[cursor]);
        cursor++;
    }

    const aL2Norm = Math.sqrt(aSumOfSquaresOfCoordinates);
    const bL2Norm = Math.sqrt(bSumOfSquaresOfCoordinates);

    return scalarProduct/aL2Norm/bL2Norm;
}

const getNGramsCosineDistance: MatchFunction = (templateModel, searchModel, weightFunction) => {
    const matchVector = getMatchVector(templateModel, searchModel, weightFunction);
    const templateVector = new Float32Array(templateModel.vector);
    
    return getVectorCosineDistance(templateVector, matchVector);
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

    match(text: string, topSize: number) {
        const searchModel = this.textToModel(text);

        let i = 0;

        const topDistanceVector = new Float32Array(topSize);
        topDistanceVector.fill(-1.1);

        const topIndexVector = new Int8Array(topSize);
        topIndexVector.fill(-1);

        while (this._models[i]) {
            const templateModel = this._models[i].model;
            const cosineDistance = getNGramsCosineDistance(templateModel, searchModel, this.weightFunction);

            const vacantIndex = VectorFindVacantIndex(topDistanceVector, cosineDistance);

            if (vacantIndex > -1) {
                VectorShiftRight(topDistanceVector, cosineDistance, vacantIndex);
                VectorShiftRight(topIndexVector, i, vacantIndex);
            }

            i++;
        }

        return {
            distances: topDistanceVector,
            indexes: topIndexVector,
        };
    }
}

export {
    SimpleCat,
    standartTextModel,
    standartWeightFunction,
    getNGrams,
    getMatchVector,
    getVectorCosineDistance,
    getNGramsCosineDistance,
    VectorFindVacantIndex,
    VectorShiftRight,
}