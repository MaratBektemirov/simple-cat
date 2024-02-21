interface ITextChar {
    [key: string]: number[],
}  

interface IPreparedText {
    chars: {[key: string]: ITextChar},
    wordsLength: {[key: string]: number},
}

interface ITextCharsWrapper<A> {
    text: IPreparedText,
    data: A,
}

interface ITextOption<A> {
    options: string[];
    data: A;
}

interface IMatchResultHash {
    [key: string]: {[key: string]: IMatchResult}
}

type IMatchResult = [number[], number[]];

interface ISequencesHash {
    [key: string]: ISequences;
}

type ISequences = [number[], number[]];
type IWordScores = Int16Array[];

class SimpleCat<D> {
    public splitWordRegexp = /\s+/g;
    private _wrappers: ITextCharsWrapper<D>[][] = [];

    constructor(
        texts: ITextOption<D>[],

    ) {
        let i = 0;
    
        while (i < texts.length) {
            const { options, data } = texts[i];

            let j = 0;

            const wrappers: ITextCharsWrapper<D>[] = [];
            
            while (j < options.length) {
                const words = this.textToWords(options[j]);
                const text = this.getPreparedText(words);

                wrappers.push(
                    {
                        text,
                        data,
                    }
                );

                j++;
            }

            this._wrappers.push(wrappers);

            i++;
        }
    }

    textToWords(textStr: string) {
        return textStr
            .split(this.splitWordRegexp)
            .map((word) => word.replace(/[^A-Za-zА-Яа-я ]/g, '').toLowerCase())
            .filter((word) => word.length >= 3)
    }

    insertScoreToTable(scoresTable: {[key: string]: IWordScores}, wordScores: IWordScores) {
        if (!wordScores[0]) {
            return;
        }

        const wordIndex = wordScores[0][0];
        const highScore = wordScores[0][1];

        if (!scoresTable[wordIndex]) {
            scoresTable[wordIndex] = wordScores;
        } else if (scoresTable[wordIndex] && highScore > scoresTable[wordIndex][0][1]) {
            const departing = scoresTable[wordIndex];
            departing.splice(0, 1);

            this.insertScoreToTable(scoresTable, departing);
            scoresTable[wordIndex] = wordScores;
        } else if (scoresTable[wordIndex] && highScore <= scoresTable[wordIndex][0][1]) {
            wordScores.splice(0, 1);

            this.insertScoreToTable(scoresTable, wordScores);
        }
    }

    countScoresTable(scoresTable: {[key: string]: IWordScores}) {
        let count = 0;

        const wordIndexes = Object.keys(scoresTable);

        let i = 0;

        while (i < wordIndexes.length) {
            count += scoresTable[wordIndexes[i]][0][1];
            i++;
        }


        return count;
    }

    getTextScore(textStr: string, preparedText: IPreparedText) {
        const words = this.textToWords(textStr);

        let i = 0;

        const scoresTable = {};

        while (i < words.length) {
            const word = words[i];

            const matchResultHash = this.getMatchResultHash(word, preparedText);
            const sequencesHash = this.getSequencesHash(matchResultHash);
            const wordScores = this.getWordScores(sequencesHash);
            this.minusAntiScoreFromWordScores(word, wordScores, preparedText);

            wordScores.sort((a,b) => b[1] - a[1]);

            this.insertScoreToTable(scoresTable, wordScores);
            i++;
        }

        return this.countScoresTable(scoresTable);
    }

    getWordScore(sequences: ISequences) {
        let score = 0;

        let i = 0;
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

            if (
                typeof sequences[1][i] === 'number' &&
                typeof sequences[1][i + 1] === 'number' &&
                (sequences[0][i] - sequences[1][i]) === 
                (sequences[0][i + 1] - sequences[1][i + 1])
            ) {
                score += 10;
            }

            i++;
        }

        return score;
    }

    scoreFilter(score: number) {
        if (score >= 70) {
            return true;
        }

        return false;
    }

    getWordScores(sequencesHash: ISequencesHash) {
        const wordScores: IWordScores = [];

        const wordIndexes = Object.keys(sequencesHash);

        let j = 0;
        while (j < wordIndexes.length) {
            const wordIndex = wordIndexes[j];
            const wordSequences = sequencesHash[wordIndex];
            const score = this.getWordScore(wordSequences);

            const arr = new Int16Array(2);
            arr[0] = Number(wordIndex);
            arr[1] = score;

            wordScores.push(arr);
            
            j++;
        }

        return wordScores;
    }

    minusAntiScoreFromWordScores(word: string, wordScores: IWordScores, text: IPreparedText): IWordScores {
        let j = 0;
        while (j < wordScores.length) {
            const wordIndex = wordScores[j][0];
            const lengthDiff = Math.abs(text.wordsLength[wordIndex] - word.length) * 35;
            wordScores[j][1] -= lengthDiff;
            j++;
        }

        return wordScores;
    }

    accSequences(
        matchResultArr: IMatchResult[],
        original: number[], 
        compared: number[],
        i: number
    ) {
        let next = false;

        let k = 0;
        while (k < matchResultArr.length) {
            const originalIndex = matchResultArr[k][0][i];
            const comparedIndex = matchResultArr[k][1][i];

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
    }

    getSequencesHash(matchResultHash: IMatchResultHash): ISequencesHash {
        const sequencesHash = {};

        const wordIndexes = Object.keys(matchResultHash);

        let i = 0;

        while (i < wordIndexes.length) {
            const wordIndex = wordIndexes[i];
            const wordMatchResult = matchResultHash[wordIndex];
            const chars = Object.keys(wordMatchResult);

            const matchResultArr: IMatchResult[] = [];

            let j = 0;
            while (j < chars.length) {
                const char = chars[j];
                matchResultArr.push(wordMatchResult[char]);
                j++;
            }

            matchResultArr.sort((a,b) => a[0][0] - b[0][0]);

            const original = [];
            const compared = [];

            this.accSequences(matchResultArr, original, compared, 0);

            sequencesHash[wordIndex] = [original, compared];

            i++;
        }

        return sequencesHash;
    }
    
    getMatchResultHash(word: string, preparedText: IPreparedText) {
        const matchResultHash: IMatchResultHash = {};

        let charIndex = 0;
        while (charIndex < word.length) {
            const char = preparedText.chars[word[charIndex]];

            if (char) {
                const wordIndexes = Object.keys(char);

                let j = 0;
                while (j < wordIndexes.length) {
                    const wordIndex = wordIndexes[j];

                    matchResultHash[wordIndex] = matchResultHash[wordIndex] || {};
                    matchResultHash[wordIndex][word[charIndex]] = matchResultHash[wordIndex][word[charIndex]] || [[],[]];

                    const original = matchResultHash[wordIndex][word[charIndex]][0];
                    const compared = matchResultHash[wordIndex][word[charIndex]][1];

                    compared.push(char[wordIndex][original.length] || null);
                    original.push(charIndex + 1);

                    j++;
                }    
            }

            charIndex++;
        }

        return matchResultHash;
    }

    getPreparedText(words: string[]): IPreparedText {
        const chars = {};
        const wordsLength = {};
        const text: IPreparedText = {chars, wordsLength};

        let wordIndex = 0;

        while (wordIndex < words.length) {
            const word = words[wordIndex];
            wordsLength[wordIndex] = word.length;

            let charIndex = 0;
            while (charIndex < word.length) {
                let ch = word[charIndex];
                const match: ITextChar = chars[ch] = chars[ch] || {};
                match[wordIndex] = match[wordIndex] || [];
                match[wordIndex].push(charIndex + 1);
                charIndex++;
            }

            wordIndex++;
        }

        return text;
    }
    
    indexPredicate(index: number) {return index > -1}
    scorePredicate(score: number) {return score > 0}

    arrFindVacantIndex(arr: Int16Array, candidate: number) {
        let i = 0;

        while (i < arr.length) {
            if (candidate > arr[i]) {
                return i;
            }

            i++;
        }

        return -1;
    }

    arrShiftRight(arr: Int16Array, value: number, index: number) {
        let i = arr.length - 1;

        while (i > index) {
            arr[i] = arr[i - 1];
            i--;
        }

        arr[index] = value;

        return arr;
    }

    match(textStr: string, top: number) {
        const topScores = new Int16Array(top);

        const topIndex = new Int16Array(top);
        topIndex.fill(-1);

        const topOption = new Int16Array(top);
        topOption.fill(-1);
        
        let i = 0;
        while (i < this._wrappers.length) {
            let j = 0;

            while (j < this._wrappers[i].length) {
                const preparedText = this._wrappers[i][j].text;

                const score = this.getTextScore(textStr, preparedText);

                if (this.scoreFilter(score)) {
                    const vacantIndex = this.arrFindVacantIndex(topScores, score);
    
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
    }
}

export { SimpleCat }