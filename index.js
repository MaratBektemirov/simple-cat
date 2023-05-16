"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorShiftRight = exports.VectorFindVacantIndex = exports.getNGramsCosineDistance = exports.getVectorCosineDistance = exports.getMatchVector = exports.getNGrams = exports.standartWeightFunction = exports.standartTextModel = exports.SimpleCat = void 0;
var wordRegexp = /[^A-Za-zА-Яа-я ]/g;
var splitWordRegexp = /\s+/g;
var standartWeightFunction = function (templatePositions, searchPositions) {
    var positionWeight = 0.5
        - (Math.abs(templatePositions[0] - searchPositions[0]) * 0.02)
        - (Math.abs(templatePositions[1] - searchPositions[1]) * 0.1);
    return (1.5 + Math.max(0, positionWeight));
};
exports.standartWeightFunction = standartWeightFunction;
var standartTextModel = function (text) {
    var gramSize = 3;
    var words = text.split(splitWordRegexp);
    var _a = getNGrams(words, gramSize), grams = _a.grams, length = _a.length;
    var negVector = new Int8Array(length);
    var vector = new Int8Array(length);
    negVector.fill(-1);
    vector.fill(1);
    return { grams: grams, vector: vector, negVector: negVector, length: length };
};
exports.standartTextModel = standartTextModel;
var VectorFindVacantIndex = function (vector, candidate) {
    var i = 0;
    while (i < vector.length) {
        if (candidate > vector[i]) {
            return i;
        }
        i++;
    }
    return -1;
};
exports.VectorFindVacantIndex = VectorFindVacantIndex;
var VectorShiftRight = function (vector, value, index) {
    var i = vector.length - 1;
    while (i > index) {
        vector[i] = vector[i - 1];
        i--;
    }
    vector[index] = value;
    return vector;
};
exports.VectorShiftRight = VectorShiftRight;
function getNGrams(words, gramSize) {
    if (typeof gramSize !== 'number') {
        console.error('Please define size of grams');
    }
    var grams = {};
    var addGram = function (gram, absoluteGramIndex, wordIndex, gramInWordIndex) {
        grams[gram] = grams[gram] || { positions: [], indexes: [] };
        grams[gram].positions.push(new Int16Array([wordIndex, gramInWordIndex]));
        grams[gram].indexes.push(absoluteGramIndex);
    };
    var i = 0;
    var absoluteGramIndex = 0;
    while (words[i]) {
        var word = words[i].toLowerCase().replace(wordRegexp, '');
        if (word.length < gramSize) {
            addGram(word, absoluteGramIndex, i, 0);
            absoluteGramIndex++;
        }
        else {
            var j = 0;
            while (word[j + gramSize - 1]) {
                var gram = word.slice(j, j + gramSize);
                addGram(gram, absoluteGramIndex, i, j);
                j++;
                absoluteGramIndex++;
            }
        }
        i++;
    }
    var length = absoluteGramIndex;
    return { grams: grams, length: length };
}
exports.getNGrams = getNGrams;
function getMatchVector(templateModel, searchModel, weightFunction) {
    var vector = new Float32Array(templateModel.negVector);
    for (var _i = 0, _a = Object.keys(searchModel.grams); _i < _a.length; _i++) {
        var searchGram = _a[_i];
        var templateGramPositions = templateModel.grams[searchGram];
        if (!templateGramPositions)
            continue;
        var searchGramPositions = searchModel.grams[searchGram];
        var i = 0;
        while (i < templateGramPositions.indexes.length) {
            var templatePositions = templateGramPositions.positions[i];
            var searchPositions = searchGramPositions.positions[i];
            if (!searchPositions) {
                break;
            }
            var index = templateGramPositions.indexes[i];
            vector[index] += weightFunction(templatePositions, searchPositions);
            i++;
        }
    }
    return vector;
}
exports.getMatchVector = getMatchVector;
function getVectorCosineDistance(aVector, bVector) {
    var scalarProduct = 0;
    var aSumOfSquaresOfCoordinates = 0;
    var bSumOfSquaresOfCoordinates = 0;
    var cursor = 0;
    while (cursor < aVector.length) {
        scalarProduct += (aVector[cursor] * bVector[cursor]);
        aSumOfSquaresOfCoordinates += (aVector[cursor] * aVector[cursor]);
        bSumOfSquaresOfCoordinates += (bVector[cursor] * bVector[cursor]);
        cursor++;
    }
    var aL2Norm = Math.sqrt(aSumOfSquaresOfCoordinates);
    var bL2Norm = Math.sqrt(bSumOfSquaresOfCoordinates);
    return scalarProduct / aL2Norm / bL2Norm;
}
exports.getVectorCosineDistance = getVectorCosineDistance;
var getNGramsCosineDistance = function (templateModel, searchModel, weightFunction) {
    var matchVector = getMatchVector(templateModel, searchModel, weightFunction);
    var templateVector = new Float32Array(templateModel.vector);
    return getVectorCosineDistance(templateVector, matchVector);
};
exports.getNGramsCosineDistance = getNGramsCosineDistance;
var SimpleCat = /** @class */ (function () {
    function SimpleCat(texts, textToModel, weightFunction) {
        this.textToModel = textToModel;
        this.weightFunction = weightFunction;
        this._models = [];
        var i = 0;
        if (typeof textToModel !== 'function') {
            console.error('Please define the text to model function');
        }
        while (texts[i]) {
            var _a = texts[i], text = _a.text, descriptor = _a.descriptor;
            this._models.push({
                model: this.textToModel(text),
                descriptor: descriptor,
            });
            i++;
        }
    }
    SimpleCat.prototype.match = function (text, topSize) {
        var searchModel = this.textToModel(text);
        var i = 0;
        var topDistanceVector = new Float32Array(topSize);
        topDistanceVector.fill(-1.1);
        var topIndexVector = new Int8Array(topSize);
        topIndexVector.fill(-1);
        while (this._models[i]) {
            var templateModel = this._models[i].model;
            var cosineDistance = getNGramsCosineDistance(templateModel, searchModel, this.weightFunction);
            var vacantIndex = VectorFindVacantIndex(topDistanceVector, cosineDistance);
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
    };
    return SimpleCat;
}());
exports.SimpleCat = SimpleCat;
//# sourceMappingURL=index.js.map