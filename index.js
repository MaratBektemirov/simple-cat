"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorShiftRight = exports.VectorFindVacantIndex = exports.getMatchScore = exports.getNGrams = exports.standartWeightFunction = exports.standartTextModel = exports.SimpleCat = void 0;
var wordRegexp = /[^A-Za-zА-Яа-я ]/g;
var splitWordRegexp = /\s+/g;
var standartWeightFunction = function (templatePositions, searchPositions) {
    var wordIndexDiff = Math.abs(templatePositions[0] - searchPositions[0]) * 1;
    var gramIndexInWordDiff = Math.abs(templatePositions[1] - searchPositions[1]) * 4;
    var positionWeight = 5 - wordIndexDiff - gramIndexInWordDiff;
    return 10 + Math.max(0, positionWeight);
};
exports.standartWeightFunction = standartWeightFunction;
var standartTextModel = function (text) {
    var gramSize = 3;
    var words = text.split(splitWordRegexp);
    var _a = getNGrams(words, gramSize), grams = _a.grams, length = _a.length;
    return { grams: grams, length: length };
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
function getMatchScore(templateModel, searchModel, weightFunction) {
    var score = 0;
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
            score += weightFunction(templatePositions, searchPositions);
            i++;
        }
    }
    return score;
}
exports.getMatchScore = getMatchScore;
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
    SimpleCat.prototype.match = function (text, top) {
        var searchModel = this.textToModel(text);
        var topScoresVector = new Int16Array(top);
        var topIndexVector = new Int16Array(top);
        topIndexVector.fill(-1);
        var i = 0;
        while (this._models[i]) {
            var templateModel = this._models[i].model;
            var score = getMatchScore(templateModel, searchModel, this.weightFunction);
            var vacantIndex = VectorFindVacantIndex(topScoresVector, score);
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
    };
    return SimpleCat;
}());
exports.SimpleCat = SimpleCat;
//# sourceMappingURL=index.js.map