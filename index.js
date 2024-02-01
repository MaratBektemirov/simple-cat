if (typeof exports === 'undefined') {
    exports = {};
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCat = void 0;
var SimpleCat = /** @class */ (function () {
    function SimpleCat(texts) {
        this.splitWordRegexp = /\s+/g;
        this._wrappers = [];
        var i = 0;
        while (i < texts.length) {
            var _a = texts[i], options = _a.options, data = _a.data;
            var j = 0;
            var wrappers = [];
            while (j < options.length) {
                var words = this.textToWords(options[j]);
                var text = this.getTextChars(words);
                wrappers.push({
                    text: text,
                    data: data,
                });
                j++;
            }
            this._wrappers.push(wrappers);
            i++;
        }
    }
    SimpleCat.prototype.textToWords = function (textStr) {
        return textStr
            .split(this.splitWordRegexp)
            .map(function (word) { return word.replace(/[^A-Za-zА-Яа-я ]/g, '').toLowerCase(); })
            .filter(function (word) { return word.length >= 3; });
    };
    SimpleCat.prototype.getTextScore = function (textStr, text) {
        var words = this.textToWords(textStr);
        var i = 0;
        var score = 0;
        while (i < words.length) {
            var word = words[i];
            var matchResultHash = this.getMatchResultHash(word, text);
            var sequencesHash = this.getSequencesHash(matchResultHash);
            var wordScores = this.getWordScores(sequencesHash);
            this.minusAntiScoreFromWordScores(word, wordScores, text);
            wordScores.sort(function (a, b) { return b[1] - a[1]; });
            if (wordScores[0]) {
                score += wordScores[0][1];
            }
            i++;
        }
        return score;
    };
    SimpleCat.prototype.getWordScore = function (sequences) {
        var score = 0;
        var i = 0;
        while (i < sequences[0].length) {
            if (typeof sequences[1][i] === 'number') {
                score += 10;
            }
            if (sequences[0][i] === sequences[1][i]) {
                score += 20;
                if (sequences[0][i] === 1) {
                    score += 120;
                }
            }
            if (typeof sequences[1][i] === 'number' &&
                typeof sequences[1][i + 1] === 'number' &&
                (sequences[0][i] - sequences[1][i]) ===
                    (sequences[0][i + 1] - sequences[1][i + 1])) {
                score += 10;
            }
            i++;
        }
        return score;
    };
    SimpleCat.prototype.scoreFilter = function (score) {
        if (score >= 70) {
            return true;
        }
        return false;
    };
    SimpleCat.prototype.getWordScores = function (sequencesHash) {
        var wordScores = [];
        var wordIndexes = Object.keys(sequencesHash);
        var j = 0;
        while (j < wordIndexes.length) {
            var wordIndex = wordIndexes[j];
            var wordSequences = sequencesHash[wordIndex];
            var score = this.getWordScore(wordSequences);
            var arr = new Int16Array(2);
            arr[0] = Number(wordIndex);
            arr[1] = score;
            wordScores.push(arr);
            j++;
        }
        return wordScores;
    };
    SimpleCat.prototype.minusAntiScoreFromWordScores = function (word, wordScores, text) {
        var j = 0;
        while (j < wordScores.length) {
            var wordIndex = wordScores[j][0];
            var lengthDiff = Math.abs(text.wordsLength[wordIndex] - word.length) * 35;
            wordScores[j][1] -= lengthDiff;
            j++;
        }
        return wordScores;
    };
    SimpleCat.prototype.accSequences = function (matchResultArr, original, compared, i) {
        var next = false;
        var k = 0;
        while (k < matchResultArr.length) {
            var originalIndex = matchResultArr[k][0][i];
            var comparedIndex = matchResultArr[k][1][i];
            if (typeof matchResultArr[k][0][i + 1] === 'number') {
                next = true;
            }
            if (typeof originalIndex === 'number') {
                original.push(originalIndex);
                compared.push(comparedIndex);
            }
            k++;
        }
        if (next) {
            this.accSequences(matchResultArr, original, compared, i + 1);
        }
    };
    SimpleCat.prototype.getSequencesHash = function (matchResultHash) {
        var sequencesHash = {};
        var wordIndexes = Object.keys(matchResultHash);
        var i = 0;
        while (i < wordIndexes.length) {
            var wordIndex = wordIndexes[i];
            var wordMatchResult = matchResultHash[wordIndex];
            var chars = Object.keys(wordMatchResult);
            var matchResultArr = [];
            var j = 0;
            while (j < chars.length) {
                var char = chars[j];
                matchResultArr.push(wordMatchResult[char]);
                j++;
            }
            matchResultArr.sort(function (a, b) { return a[0][0] - b[0][0]; });
            var original = [];
            var compared = [];
            this.accSequences(matchResultArr, original, compared, 0);
            sequencesHash[wordIndex] = [original, compared];
            i++;
        }
        return sequencesHash;
    };
    SimpleCat.prototype.getMatchResultHash = function (word, textChars) {
        var matchResultHash = {};
        var charIndex = 0;
        while (charIndex < word.length) {
            var char = textChars.chars[word[charIndex]];
            if (char) {
                var wordIndexes = Object.keys(char);
                var j = 0;
                while (j < wordIndexes.length) {
                    var wordIndex = wordIndexes[j];
                    matchResultHash[wordIndex] = matchResultHash[wordIndex] || {};
                    matchResultHash[wordIndex][word[charIndex]] = matchResultHash[wordIndex][word[charIndex]] || [[], []];
                    var original = matchResultHash[wordIndex][word[charIndex]][0];
                    var compared = matchResultHash[wordIndex][word[charIndex]][1];
                    compared.push(char[wordIndex][original.length] || null);
                    original.push(charIndex + 1);
                    j++;
                }
            }
            charIndex++;
        }
        return matchResultHash;
    };
    SimpleCat.prototype.getTextChars = function (words) {
        var chars = {};
        var wordsLength = {};
        var text = { chars: chars, wordsLength: wordsLength };
        var wordIndex = 0;
        while (wordIndex < words.length) {
            var word = words[wordIndex];
            wordsLength[wordIndex] = word.length;
            var charIndex = 0;
            while (charIndex < word.length) {
                var ch = word[charIndex];
                var match = chars[ch] = chars[ch] || {};
                match[wordIndex] = match[wordIndex] || [];
                match[wordIndex].push(charIndex + 1);
                charIndex++;
            }
            wordIndex++;
        }
        return text;
    };
    SimpleCat.prototype.indexPredicate = function (index) { return index > -1; };
    SimpleCat.prototype.scorePredicate = function (score) { return score > 0; };
    SimpleCat.prototype.arrFindVacantIndex = function (arr, candidate) {
        var i = 0;
        while (i < arr.length) {
            if (candidate > arr[i]) {
                return i;
            }
            i++;
        }
        return -1;
    };
    SimpleCat.prototype.arrShiftRight = function (arr, value, index) {
        var i = arr.length - 1;
        while (i > index) {
            arr[i] = arr[i - 1];
            i--;
        }
        arr[index] = value;
        return arr;
    };
    SimpleCat.prototype.match = function (textStr, top) {
        var topScores = new Int16Array(top);
        var topIndex = new Int16Array(top);
        topIndex.fill(-1);
        var topOption = new Int16Array(top);
        topOption.fill(-1);
        var i = 0;
        while (i < this._wrappers.length) {
            var j = 0;
            while (j < this._wrappers[i].length) {
                var textChars = this._wrappers[i][j].text;
                var score = this.getTextScore(textStr, textChars);
                if (this.scoreFilter(score)) {
                    var vacantIndex = this.arrFindVacantIndex(topScores, score);
                    if (vacantIndex > -1) {
                        this.arrShiftRight(topScores, score, vacantIndex);
                        this.arrShiftRight(topIndex, i, vacantIndex);
                        this.arrShiftRight(topOption, j, vacantIndex);
                    }
                }
                j++;
            }
            i++;
        }
        return {
            scores: topScores.filter(this.scorePredicate),
            indexes: topIndex.filter(this.indexPredicate),
            options: topOption.filter(this.indexPredicate),
        };
    };
    return SimpleCat;
}());
exports.SimpleCat = SimpleCat;
//# sourceMappingURL=index.js.map