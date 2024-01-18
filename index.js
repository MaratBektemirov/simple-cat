"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCat = void 0;
var STUFF = {
    wordRegexp: /[^A-Za-zА-Яа-я ]/g,
    splitWordRegexp: /\s+/g,
    symbols: {
        ru: {
            vowel: {
                а: "а",
                и: "и",
                й: "й",
                о: "о",
                у: "у",
                ы: "ы",
                э: "э",
                е: "е",
                я: "я",
                ь: "ь",
            },
            consonant: {
                б: "б",
                в: "в",
                г: "г",
                д: "д",
                ж: "ж",
                з: "з",
                й: "й",
                к: "к",
                л: "л",
                м: "м",
                н: "н",
                п: "п",
                р: "р",
                с: "с",
                т: "т",
                ф: "ф",
                х: "х",
                ц: "ц",
                ч: "ч",
                ш: "ш",
                щ: "щ",
            }
        }
    },
    extensions: {
        ru: {
            fluentVowels: function (wordsAcc) {
                var ruVowelSymbols = STUFF.symbols.ru.vowel;
                var word = wordsAcc[0];
                if (!word) {
                    return;
                }
                var wordWithoutVowel = word[0];
                var i = 1;
                while (i < word.length) {
                    if (!ruVowelSymbols[word[i]]) {
                        wordWithoutVowel += word[i];
                    }
                    i++;
                }
                wordsAcc.push(wordWithoutVowel);
            }
        },
    }
};
var SimpleCat = /** @class */ (function () {
    function SimpleCat(texts, extensions, gramSize) {
        if (extensions === void 0) { extensions = []; }
        if (gramSize === void 0) { gramSize = 3; }
        var _this = this;
        this.extensions = extensions;
        this.gramSize = gramSize;
        this._models = [];
        this.weightFunction = function (templatePositions, searchPositions) {
            var wordIndexDiff = Math.abs(templatePositions[0] - searchPositions[0]) * 1;
            var gramIndexInWordDiff = Math.abs(templatePositions[1] - searchPositions[1]) * 4;
            var positionWeight = 5 - wordIndexDiff - gramIndexInWordDiff;
            return 10 + Math.max(0, positionWeight);
        };
        this.getNGramsModel = function (text, gramSize, extensions) {
            var words = text.split(SimpleCat.STUFF.splitWordRegexp);
            return _this._getNGramsModel(words, gramSize, extensions);
        };
        var i = 0;
        while (i < texts.length) {
            var _a = texts[i], options = _a.options, data = _a.data;
            var j = 0;
            var models = [];
            while (j < options.length) {
                var model = this.getNGramsModel(options[j], this.gramSize, this.extensions);
                models.push({
                    model: model,
                    data: data,
                });
                j++;
            }
            this._models.push(models);
            i++;
        }
    }
    SimpleCat.prototype.addGram = function (grams, gram, absoluteGramIndex, wordIndex, gramInWordIndex) {
        grams[gram] = grams[gram] || { positions: [], indexes: [] };
        grams[gram].positions.push(new Int16Array([wordIndex, gramInWordIndex]));
        grams[gram].indexes.push(absoluteGramIndex);
    };
    ;
    SimpleCat.prototype._getNGramsModel = function (words, gramSize, extensions) {
        var grams = {};
        var w = 0;
        var absoluteGramIndex = 0;
        while (w < words.length) {
            var wordsAcc = [words[w].toLowerCase().replace(STUFF.wordRegexp, '')];
            var e = 0;
            while (e < extensions.length) {
                extensions[e](wordsAcc);
                e++;
            }
            var wa = 0;
            while (wa < wordsAcc.length) {
                var word = wordsAcc[wa];
                if (word.length < gramSize) {
                    if (word.length > 1) {
                        this.addGram(grams, word, absoluteGramIndex, w, 0);
                    }
                    if (wa === 0) {
                        absoluteGramIndex++;
                    }
                }
                else {
                    var g = 0;
                    while (word[g + gramSize - 1]) {
                        var gram = word.slice(g, g + gramSize);
                        this.addGram(grams, gram, absoluteGramIndex, w, g);
                        g++;
                        if (wa === 0) {
                            absoluteGramIndex++;
                        }
                    }
                }
                wa++;
            }
            w++;
        }
        var length = absoluteGramIndex;
        return { grams: grams, length: length };
    };
    SimpleCat.prototype.getMatchVector = function (templateModel, searchModel, weightFunction) {
        var vector = [];
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
                var weight = weightFunction(templatePositions, searchPositions);
                vector.push(weight);
                i++;
            }
        }
        return new Int16Array(vector);
    };
    SimpleCat.prototype.scorePredicate = function (score) { return score > 0; };
    SimpleCat.prototype.indexPredicate = function (index) { return index > -1; };
    SimpleCat.prototype.matchVectorReducer = function (acc, weight) { return acc + weight; };
    ;
    SimpleCat.prototype.vectorFindVacantIndex = function (vector, candidate) {
        var i = 0;
        while (i < vector.length) {
            if (candidate > vector[i]) {
                return i;
            }
            i++;
        }
        return -1;
    };
    SimpleCat.prototype.vectorShiftRight = function (vector, value, index) {
        var i = vector.length - 1;
        while (i > index) {
            vector[i] = vector[i - 1];
            i--;
        }
        vector[index] = value;
        return vector;
    };
    SimpleCat.prototype.match = function (text, top) {
        var searchModel = this.getNGramsModel(text, this.gramSize, this.extensions);
        var topScoresVector = new Int16Array(top);
        var topIndexVector = new Int16Array(top);
        topIndexVector.fill(-1);
        var topOptionVector = new Int16Array(top);
        topOptionVector.fill(-1);
        var i = 0;
        while (i < this._models.length) {
            var j = 0;
            while (j < this._models[i].length) {
                var templateModel = this._models[i][j].model;
                var matchVector = this.getMatchVector(templateModel, searchModel, this.weightFunction);
                var score = matchVector.reduce(this.matchVectorReducer, 0);
                var vacantIndex = this.vectorFindVacantIndex(topScoresVector, score);
                if (vacantIndex > -1) {
                    this.vectorShiftRight(topScoresVector, score, vacantIndex);
                    this.vectorShiftRight(topIndexVector, i, vacantIndex);
                    this.vectorShiftRight(topOptionVector, j, vacantIndex);
                }
                j++;
            }
            i++;
        }
        return {
            scores: topScoresVector.filter(this.scorePredicate),
            indexes: topIndexVector.filter(this.indexPredicate),
            options: topOptionVector.filter(this.indexPredicate),
        };
    };
    SimpleCat.STUFF = STUFF;
    return SimpleCat;
}());
exports.SimpleCat = SimpleCat;
//# sourceMappingURL=index.js.map