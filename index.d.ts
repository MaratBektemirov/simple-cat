type TextToModel = (text: string) => ITextModel;
type WeightFunction = (templatePositions: Int16Array, searchPositions: Int16Array) => number;
type NGrams = {
    [key: string]: {
        positions: Int16Array[];
        indexes: number[];
    };
};
interface ITextModel {
    grams: NGrams;
    length: number;
}
interface ITextOption<A> {
    text: string;
    descriptor: A;
}
declare const standartWeightFunction: WeightFunction;
declare const standartTextModel: TextToModel;
declare const VectorFindVacantIndex: (vector: Int16Array, candidate: number) => number;
declare const VectorShiftRight: (vector: Int16Array, value: number, index: number) => Int16Array;
declare function getNGrams(words: string[], gramSize: number): {
    grams: NGrams;
    length: number;
};
declare function getMatchScore(templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction): number;
declare class SimpleCat<D> {
    private textToModel;
    private weightFunction;
    private _models;
    constructor(texts: ITextOption<D>[], textToModel: TextToModel, weightFunction: WeightFunction);
    match(text: string, top: number): {
        scores: Int16Array;
        indexes: Int16Array;
    };
}
export { SimpleCat, standartTextModel, standartWeightFunction, getNGrams, getMatchScore, VectorFindVacantIndex, VectorShiftRight, };
