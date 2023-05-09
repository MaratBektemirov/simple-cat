"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchFunctionType = exports.SimpleCat = exports.getNGramsSpaceCosineDistance = exports.getVectorCosineDistance = exports.getMatchVector = exports.getNGrams = exports.standartTextModel = void 0;
var wordRegexp = /[^A-Za-zА-Яа-я ]/g;
var splitWordRegexp = /\s+/g;
var standartTextModel = function (text) {
    var gramSize = 3;
    var words = text.split(splitWordRegexp);
    var _a = getNGrams(words, gramSize), grams = _a.grams, negGrams = _a.negGrams, length = _a.length;
    var negVector = new Int8Array(length);
    var vector = new Int8Array(length);
    negVector.fill(-1);
    vector.fill(1);
    return { grams: grams, negGrams: negGrams, vector: vector, negVector: negVector, length: length };
};
exports.standartTextModel = standartTextModel;
function getNGrams(words, gramSize) {
    if (typeof gramSize !== 'number') {
        console.error('Please define size of grams');
    }
    var grams = {};
    var negGrams = {};
    var addGram = function (gram, index) {
        var newArrayLength = 1;
        var oldArray;
        var oldNegArray;
        if (grams[gram]) {
            newArrayLength += grams[gram].length;
            oldArray = grams[gram];
            oldNegArray = negGrams[gram];
        }
        var newArr = new Int8Array(newArrayLength);
        var newNegArr = new Int8Array(newArrayLength);
        if (oldArray) {
            newArr.set(oldArray);
            newNegArr.set(oldNegArray);
        }
        newArr[newArrayLength - 1] = index;
        newNegArr[newArrayLength - 1] = index * -1;
        grams[gram] = newArr;
        negGrams[gram] = newNegArr;
    };
    var i = 0;
    var index = 0;
    while (words[i]) {
        var word = words[i].toLowerCase().replace(wordRegexp, '');
        if (word.length < gramSize) {
            addGram(word, index);
            index++;
        }
        else {
            var j = 0;
            while (word[j + gramSize - 1]) {
                var gram = word.slice(j, j + gramSize);
                addGram(gram, index);
                j++;
                index++;
            }
        }
        i++;
    }
    var length = index;
    return { grams: grams, negGrams: negGrams, length: length };
}
exports.getNGrams = getNGrams;
function getPositionVector(negTemplateGrams, templateModelLength, model) {
    var vector = new Int8Array(templateModelLength);
    var lastIndex = 0;
    for (var _i = 0, _a = Object.keys(negTemplateGrams); _i < _a.length; _i++) {
        var gram = _a[_i];
        var tmplCoords = negTemplateGrams[gram];
        var insertCoords = model.grams[gram];
        if (!tmplCoords || !insertCoords)
            continue;
        var i = 0;
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
function getMatchVector(templateModel, searchModel) {
    var vector = new Float32Array(templateModel.negVector);
    var _loop_1 = function (searchGram) {
        var templateGramPositions = templateModel.grams[searchGram];
        if (!templateGramPositions)
            return "continue";
        var stepRatio = 1 / templateGramPositions.length;
        var i = 0;
        var searchGramPositions = searchModel.grams[searchGram];
        var overflowCheck = function () { return i < templateGramPositions.length; };
        while (typeof searchGramPositions[i] === 'number' && overflowCheck()) {
            var j = 0;
            while (typeof templateGramPositions[j] === 'number') {
                var position = templateGramPositions[j];
                var distance = templateModel.vector[position] - templateModel.negVector[position];
                var step = stepRatio * distance;
                vector[position] = vector[position] + step;
                j++;
            }
            i++;
        }
    };
    for (var _i = 0, _a = Object.keys(searchModel.grams); _i < _a.length; _i++) {
        var searchGram = _a[_i];
        _loop_1(searchGram);
    }
    return vector;
}
exports.getMatchVector = getMatchVector;
function getVectorCosineDistance(aVector, bVector) {
    var scalarProduct = 0;
    var aSumOfSquaresOfCoordinates = 0;
    var bSumOfSquaresOfCoordinates = 0;
    var cursor = 0;
    while (aVector[cursor]) {
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
var getNGramsSpaceCosineDistance = function (templateModel, searchModel) {
    var matchVector = getMatchVector(templateModel, searchModel);
    var templateVector = new Float32Array(templateModel.vector);
    return getVectorCosineDistance(templateVector, matchVector);
};
exports.getNGramsSpaceCosineDistance = getNGramsSpaceCosineDistance;
var getNGramsPositionCosineDistance = function (templateModel, searchModel) {
    var templatePositionVector = getPositionVector(templateModel.negGrams, templateModel.length, templateModel);
    var searchPositionVector = getPositionVector(templateModel.negGrams, templateModel.length, searchModel);
    return getVectorCosineDistance(templatePositionVector, searchPositionVector);
};
var MatchFunctionType;
(function (MatchFunctionType) {
    MatchFunctionType["space"] = "space";
    MatchFunctionType["position"] = "position";
})(MatchFunctionType || (MatchFunctionType = {}));
exports.MatchFunctionType = MatchFunctionType;
var SimpleCat = /** @class */ (function () {
    function SimpleCat(texts, textToModel) {
        this.textToModel = textToModel;
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
    SimpleCat.prototype.match = function (text, matchType) {
        var searchModel = this.textToModel(text);
        var distances = new Float32Array(this._models.length);
        var matchFunction;
        if (matchType === MatchFunctionType.position) {
            matchFunction = getNGramsPositionCosineDistance;
        }
        else if (matchType === MatchFunctionType.space) {
            matchFunction = getNGramsSpaceCosineDistance;
        }
        var i = 0;
        var max = -1;
        var maxCosIndex = null;
        while (this._models[i]) {
            var templateModel = this._models[i].model;
            var cosineDistance = matchFunction(templateModel, searchModel);
            distances[i] = cosineDistance;
            if (cosineDistance > max) {
                max = cosineDistance;
                maxCosIndex = i;
            }
            i++;
        }
        return {
            distances: distances,
            maxCosIndex: maxCosIndex,
        };
    };
    return SimpleCat;
}());
exports.SimpleCat = SimpleCat;
//# sourceMappingURL=index.js.map