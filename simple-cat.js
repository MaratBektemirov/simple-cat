const stRegexp = /[^A-Za-zА-Яа-я ]/g;

function getNGrams(text, gramSize) {
    if (typeof gramSize !== 'number') {
        console.error('Please define size of grams');
    }

    const grams = {};

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

        if (grams[gram]) {
            newArrayLength += grams[gram].length;
            oldArray = grams[gram];
        }

        let newArr = new Int8Array(newArrayLength);

        if (oldArray) {
            newArr.set(oldArray);
        }

        newArr[newArrayLength - 1] = index;
        grams[gram] = newArr;

        cursor++;
        index++;
    }

    const length = index;

    return { grams, length };
}

function smallTextModel(text) {
    const gramSize = 3;
    text = text.toLowerCase().replace(stRegexp, '');

    const { grams, length } = getNGrams(text, gramSize);

    const negVector = new Int8Array(length);
    const vector = new Int8Array(length);

    negVector.fill(-1);
    vector.fill(1);

    return { grams, vector, negVector };
}

function getMatchVector(templateModel, searchModel) {
    const vector = new Float32Array(templateModel.negVector);

    for (const searchGram of Object.keys(searchModel.grams)) {
        const templateGramPositions = templateModel.grams[searchGram];

        if (!templateGramPositions) continue;

        const searchGramPositions = searchModel.grams[searchGram];

        let stepRatio = 1/templateGramPositions.length;

        let i = 0;

        while (typeof searchGramPositions[i] === 'number') {
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

function getVectorCosineDistance(aVector, bVector) {
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

    const cosineDistance = scalarProduct/aL2Norm/bL2Norm;

    if (cosineDistance > 1) {
        return 1;
    } else if (cosineDistance < -1) {
        return -1;
    }

    return cosineDistance;
}

function getNGramsCosineDistance(templateModel, searchModel) {
    const matchVector = getMatchVector(templateModel, searchModel);
    const templateVector = new Float32Array(templateModel.vector);
    
    return getVectorCosineDistance(templateVector, matchVector);
}

class SimpleCat {
    texts = [];
    model;

    constructor(texts, model) {
        let i = 0;

        if (typeof model === 'function') {
            this.model = model;
        } else {
            console.error('Please define the model');
        }
    
        while (texts[i]) {
            const { text, descriptor } = texts[i];

            this.texts.push(
                {
                    model: this.model(text),
                    descriptor,
                }
            );

            i++;
        }
    }

    run(text) {
        const searchModel = this.model(text);
        const distances = new Float32Array(this.texts.length);

        let i = 0;
        let max = -1;
        let maxCosIndex = null;

        while (this.texts[i]) {
            const templateModel = this.texts[i].model;
            const cosineDistance = getNGramsCosineDistance(templateModel, searchModel);
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

module.exports = { 
    smallTextModel,
    getNGrams,
    getMatchVector,
    getVectorCosineDistance,
    getNGramsCosineDistance,
    SimpleCat,
};