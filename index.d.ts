interface ITextChar {
    [key: string]: number[];
}
interface IText {
    chars: {
        [key: string]: ITextChar;
    };
    wordsLength: {
        [key: string]: number;
    };
}
interface ITextOption<A> {
    options: string[];
    data: A;
}
interface IMatchResultHash {
    [key: string]: {
        [key: string]: IMatchResult;
    };
}
type IMatchResult = [number[], number[]];
interface ISequencesHash {
    [key: string]: ISequences;
}
type ISequences = [number[], number[]];
type IWordScores = Int16Array[];
declare class SimpleCat<D> {
    splitWordRegexp: RegExp;
    private _wrappers;
    constructor(texts: ITextOption<D>[]);
    textToWords(textStr: string): string[];
    getTextScore(textStr: string, text: IText): number;
    getWordScore(sequences: ISequences): number;
    scoreFilter(score: number): boolean;
    getWordScores(sequencesHash: ISequencesHash): IWordScores;
    minusAntiScoreFromWordScores(word: string, wordScores: IWordScores, text: IText): IWordScores;
    accSequences(matchResultArr: IMatchResult[], original: number[], compared: number[], i: number): void;
    getSequencesHash(matchResultHash: IMatchResultHash): ISequencesHash;
    getMatchResultHash(word: string, textChars: IText): IMatchResultHash;
    getTextChars(words: string[]): IText;
    indexPredicate(index: number): boolean;
    scorePredicate(score: number): boolean;
    arrFindVacantIndex(arr: Int16Array, candidate: number): number;
    arrShiftRight(arr: Int16Array, value: number, index: number): Int16Array;
    match(textStr: string, top: number): {
        scores: Int16Array;
        indexes: Int16Array;
        options: Int16Array;
    };
}
export { SimpleCat };
