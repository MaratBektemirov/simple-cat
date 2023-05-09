type MatchFunction = (templateModel: ITextModel, searchModel: ITextModel) => number;
type TextToModel = (text: string) => ITextModel;
type NGrams = {[key: string]: Int8Array};

interface ITextModel {
    grams: NGrams;
    negGrams: NGrams;
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

function getNGrams(text: string, gramSize: number) {
    if (typeof gramSize !== 'number') {
        console.error('Please define size of grams');
    }

    const grams = {};
    const negGrams = {};

    let cursor = 0;
    let index = 0;

    while (text[cursor + gramSize - 1]) {
        let gram = text.slice(cursor, cursor + gramSize);

        if (gram.indexOf(' ') !== -1) {
            cursor++;
            continue;
        }

        let newArrayLength = 1;
        let oldArray;
        let oldNegArray;

        if (grams[gram]) {
            newArrayLength += grams[gram].length;
            oldArray = grams[gram];
            oldNegArray = negGrams[gram];
        }

        let newArr = new Int8Array(newArrayLength);
        let newNegArr = new Int8Array(newArrayLength);

        if (oldArray) {
            newArr.set(oldArray);
            newNegArr.set(oldNegArray);
        }

        newArr[newArrayLength - 1] = index;
        newNegArr[newArrayLength - 1] = index * -1;

        grams[gram] = newArr;
        negGrams[gram] = newNegArr;

        cursor++;
        index++;
    }

    const length = index;

    return { grams, negGrams, length };
}

const stRegexp = /[^A-Za-zА-Яа-я ]/g;

function smallTextModel(text): ITextModel {
    const gramSize = 3;
    text = text.toLowerCase().replace(stRegexp, '');

    const { grams, length, negGrams } = getNGrams(text, gramSize);

    const negVector = new Int8Array(length);
    const vector = new Int8Array(length);

    negVector.fill(-1);
    vector.fill(1);

    return { grams, negGrams, vector, negVector, length };
}

function getPositionVector(negTemplateGrams: NGrams, templateModelLength: number, model: ITextModel) {
    const vector = new Int8Array(templateModelLength);
    let lastIndex = 0;

    for (const gram of Object.keys(negTemplateGrams)) {
        const tmplCoords = negTemplateGrams[gram];
        const insertCoords = model.grams[gram];

        if (!tmplCoords || !insertCoords) continue;

        let i = 0;
        while (tmplCoords[i]) {
            vector[lastIndex] = typeof insertCoords[i] === 'number'
                ? insertCoords[i] 
                : tmplCoords[i];

            i++;
            lastIndex++;
        }
    }

    return vector;
}

function getMatchVector(templateModel: ITextModel, searchModel: ITextModel) {
    const vector = new Float32Array(templateModel.negVector);

    for (const searchGram of Object.keys(searchModel.grams)) {
        const templateGramPositions = templateModel.grams[searchGram];

        if (!templateGramPositions) continue;

        let stepRatio = 1/templateGramPositions.length;
        let i = 0;

        const searchGramPositions = searchModel.grams[searchGram];
        const overflowCheck = () => i < templateGramPositions.length;

        while (typeof searchGramPositions[i] === 'number' && overflowCheck()) {
            let j = 0;

            while (typeof templateGramPositions[j] === 'number') {
                const position = templateGramPositions[j];
                const distance = templateModel.vector[position] - templateModel.negVector[position];
                let step = stepRatio * distance;
                vector[position] = vector[position] + step;
                j++;
            }

            i++;
        }
    }

    return vector;
}

type Vector = Float32Array | Int8Array;

function getVectorCosineDistance(aVector: Vector, bVector: Vector) {
    let scalarProduct = 0;
    let aSumOfSquaresOfCoordinates = 0;
    let bSumOfSquaresOfCoordinates = 0;

    let cursor = 0;

    while (aVector[cursor]) {
        scalarProduct += (aVector[cursor] * bVector[cursor]);
        aSumOfSquaresOfCoordinates += (aVector[cursor] * aVector[cursor]);
        bSumOfSquaresOfCoordinates += (bVector[cursor] * bVector[cursor]);
        cursor++;
    }

    const aL2Norm = Math.sqrt(aSumOfSquaresOfCoordinates);
    const bL2Norm = Math.sqrt(bSumOfSquaresOfCoordinates);

    return scalarProduct/aL2Norm/bL2Norm;
}

const getNGramsSpaceCosineDistance: MatchFunction = (templateModel: ITextModel, searchModel: ITextModel) => {
    const matchVector = getMatchVector(templateModel, searchModel);
    const templateVector = new Float32Array(templateModel.vector);
    
    return getVectorCosineDistance(templateVector, matchVector);
}

const getNGramsPositionCosineDistance: MatchFunction = (templateModel: ITextModel, searchModel: ITextModel) => {
    const templatePositionVector = getPositionVector(templateModel.negGrams, templateModel.length, templateModel);
    const searchPositionVector = getPositionVector(templateModel.negGrams, templateModel.length, searchModel);
    
    return getVectorCosineDistance(templatePositionVector, searchPositionVector);
}

enum MatchFunctionType {
    space = 'space',
    position = 'position',
}

class SimpleCat<D> {
    private _models: ITextModelWithDescriptor<D>[] = [];

    constructor(texts: ITextOption<D>[], private textToModel: TextToModel) {
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

    match(text: string, matchType: MatchFunctionType) {
        const searchModel = this.textToModel(text);
        const distances = new Float32Array(this._models.length);

        let matchFunction: MatchFunction;

        if (matchType === MatchFunctionType.position) {
            matchFunction = getNGramsPositionCosineDistance;
        } else if (matchType === MatchFunctionType.space) {
            matchFunction = getNGramsSpaceCosineDistance;
        }
    
        let i = 0;
        let max = -1;
        let maxCosIndex: number = null;

        while (this._models[i]) {
            const templateModel = this._models[i].model;
            const cosineDistance = matchFunction(templateModel, searchModel);
            distances[i] = cosineDistance;

            if (cosineDistance > max) {
                max = cosineDistance;
                maxCosIndex = i;
            }

            i++;
        }

        return {
            distances,
            maxCosIndex,
        };
    }
}

export { 
    smallTextModel,
    getNGrams,
    getMatchVector,
    getVectorCosineDistance,
    getNGramsSpaceCosineDistance,
    SimpleCat,
    MatchFunctionType,
}