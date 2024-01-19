type TextToGramModel = (text: string, gramSize: number, extensions: ITextExtension[]) => IGramModel;
type WeightFunction = (templatePositions: Int16Array, searchPositions: Int16Array) => number;
type NGrams = {
    [key: string]: {
        positions: Int16Array[];
        indexes: number[];
    };
};
interface IGramModel {
    grams: NGrams;
    length: number;
}
interface ITextOption<A> {
    options: string[];
    data: A;
}
type ITextExtension = (wordsAcc: string[]) => any;
declare class SimpleCat<D> {
    private extensions;
    private gramSize;
    static STUFF: {
        wordRegexp: RegExp;
        splitWordRegexp: RegExp;
        symbols: {
            ru: {
                vowel: {
                    а: string;
                    и: string;
                    й: string;
                    о: string;
                    у: string;
                    ы: string;
                    э: string;
                    е: string;
                    я: string;
                    ь: string;
                };
                consonant: {
                    б: string;
                    в: string;
                    г: string;
                    д: string;
                    ж: string;
                    з: string;
                    й: string;
                    к: string;
                    л: string;
                    м: string;
                    н: string;
                    п: string;
                    р: string;
                    с: string;
                    т: string;
                    ф: string;
                    х: string;
                    ц: string;
                    ч: string;
                    ш: string;
                    щ: string;
                };
            };
        };
        extensions: {
            ru: {
                fluentVowels: (wordsAcc: string[]) => void;
            };
        };
    };
    private _models;
    constructor(texts: ITextOption<D>[], extensions?: ITextExtension[], gramSize?: number);
    addGram(grams: NGrams, gram: string, absoluteGramIndex: number, wordIndex: number, gramInWordIndex: number): void;
    _getNGramsModel(words: string[], gramSize: number, extensions: ITextExtension[]): {
        grams: NGrams;
        length: number;
    };
    getMatchWeights(templateModel: IGramModel, searchModel: IGramModel, weightFunction: WeightFunction): Int16Array;
    scorePredicate(score: number): boolean;
    indexPredicate(index: number): boolean;
    matchWeightsReducer(acc: number, weight: number): number;
    vectorFindVacantIndex(vector: Int16Array, candidate: number): number;
    vectorShiftRight(vector: Int16Array, value: number, index: number): Int16Array;
    weightFunction: WeightFunction;
    getNGramsModel: TextToGramModel;
    match(text: string, top: number): {
        scores: Int16Array;
        indexes: Int16Array;
        options: Int16Array;
    };
}
export { SimpleCat, };
