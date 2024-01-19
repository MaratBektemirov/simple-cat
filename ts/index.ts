type TextToGramModel = (text: string, gramSize: number, extensions: ITextExtension[]) => IGramModel;
type WeightFunction = (templatePositions: Int16Array, searchPositions: Int16Array) => number;
type NGrams = {[key: string]: {positions: Int16Array[], indexes: number[]}};

interface IGramModel {
    grams: NGrams;
    length: number;
}

interface IGramModelWrapper<A> {
    model: IGramModel,
    data: A,
}

interface ITextOption<A> {
    options: string[],
    data: A
}

type ITextExtension = (wordsAcc: string[]) => any;

const STUFF = {
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
            fluentVowels: (wordsAcc: string[]) => {
                const ruVowelSymbols = STUFF.symbols.ru.vowel;

                const word = wordsAcc[0];

                if (!word) {
                    return;
                }

                let wordWithoutVowel = word[0];
                let i = 1;
    
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
}

class SimpleCat<D> {
    static STUFF = STUFF;

    private _models: IGramModelWrapper<D>[][] = [];

    constructor(
        texts: ITextOption<D>[],
        private extensions: ITextExtension[] = [],
        private gramSize = 3,
    ) {
        let i = 0;
    
        while (i < texts.length) {
            const { options, data } = texts[i];

            let j = 0;

            const models: IGramModelWrapper<D>[] = [];
            
            while (j < options.length) {
                const model = this.getNGramsModel(options[j], this.gramSize, this.extensions);

                models.push(
                    {
                        model,
                        data,
                    }
                );

                j++;
            }

            this._models.push(models);

            i++;
        }
    }

    addGram(grams: NGrams, gram: string, absoluteGramIndex: number, wordIndex: number, gramInWordIndex: number) {
        grams[gram] = grams[gram] || {positions: [], indexes: []};
        grams[gram].positions.push(new Int16Array([wordIndex, gramInWordIndex]));
        grams[gram].indexes.push(absoluteGramIndex);
    };

    _getNGramsModel(words: string[], gramSize: number, extensions: ITextExtension[]) {    
        const grams: NGrams = {};
    
        let w = 0;
        let absoluteGramIndex = 0;
    
        while (w < words.length) {
            const wordsAcc = [words[w].toLowerCase().replace(STUFF.wordRegexp, '')];

            let e = 0;
            while (e < extensions.length) {
                extensions[e](wordsAcc);
                e++;
            }

            let wa = 0;
            while (wa < wordsAcc.length) {
                const word = wordsAcc[wa];

                if (word.length < gramSize) {
                    if (word.length > 1) {
                        this.addGram(grams, word, absoluteGramIndex, w, 0);
                    }

                    if (wa === 0) {
                        absoluteGramIndex++;
                    }
                } else {
                    let g = 0;
                    while (word[g + gramSize - 1]) {
                        let gram = word.slice(g, g + gramSize);
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
    
        const length = absoluteGramIndex;
    
        return { grams, length };
    }
    
    getMatchWeights(templateModel: IGramModel, searchModel: IGramModel, weightFunction: WeightFunction) {
        const weights = [];
    
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
    
                const weight = weightFunction(templatePositions, searchPositions);
                weights.push(weight);
                i++;
            }
        }
    
        return new Int16Array(weights);
    }

    scorePredicate(score: number) {return score > 0}
    indexPredicate(index: number) {return index > -1}
    matchWeightsReducer(acc: number, weight: number) {return acc + weight};

    vectorFindVacantIndex(vector: Int16Array, candidate: number) {
        let i = 0;

        while (i < vector.length) {
            if (candidate > vector[i]) {
                return i;
            }

            i++;
        }

        return -1;
    }

    vectorShiftRight(vector: Int16Array, value: number, index: number) {
        let i = vector.length - 1;

        while (i > index) {
            vector[i] = vector[i - 1];
            i--;
        }

        vector[index] = value;

        return vector;
    }

    weightFunction: WeightFunction = (templatePositions, searchPositions) => {
        const wordIndexDiff = Math.abs(templatePositions[0] - searchPositions[0]) * 1;
        const gramIndexInWordDiff = Math.abs(templatePositions[1] - searchPositions[1]) * 4
        const positionWeight = 5 - wordIndexDiff - gramIndexInWordDiff;

        return 10 + Math.max(0, positionWeight);    
    }

    getNGramsModel: TextToGramModel = (text: string, gramSize: number, extensions: ITextExtension[]) => {
        const words = text.split(SimpleCat.STUFF.splitWordRegexp);

        return this._getNGramsModel(words, gramSize, extensions);
    }

    match(text: string, top: number) {
        const searchModel = this.getNGramsModel(text, this.gramSize, this.extensions);

        const topScoresVector = new Int16Array(top);

        const topIndexVector = new Int16Array(top);
        topIndexVector.fill(-1);

        const topOptionVector = new Int16Array(top);
        topOptionVector.fill(-1);
        
        let i = 0;
        while (i < this._models.length) {
            let j = 0;

            while (j < this._models[i].length) {
                const templateModel = this._models[i][j].model;

                const matchWeights = this.getMatchWeights(templateModel, searchModel, this.weightFunction);

                const score = matchWeights.reduce(this.matchWeightsReducer, 0);
    
                const vacantIndex = this.vectorFindVacantIndex(topScoresVector, score);
    
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
    }
}

export {
    SimpleCat,
}