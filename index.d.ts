type MatchFunction = (templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction) => number;
type TextToModel = (text: string) => ITextModel;
type WeightFunction = (templatePositions: Vector, searchPositions: Vector) => number;
type NGrams = {
    [key: string]: {
        positions: Vector[];
        indexes: number[];
    };
};
type Vector = Float32Array | Int8Array | Int16Array | Int32Array;
interface ITextModel {
    grams: NGrams;
    vector: Int8Array;
    negVector: Int8Array;
    length: number;
}
interface ITextOption<A> {
    text: string;
    descriptor: A;
}
declare const standartWeightFunction: WeightFunction;
declare const standartTextModel: TextToModel;
declare const VectorFindVacantIndex: (vector: Vector, candidate: number) => number;
declare const VectorShiftRight: (vector: Vector, value: number, index: number) => Vector;
declare function getNGrams(words: string[], gramSize: number): {
    grams: NGrams;
    length: number;
};
declare function getMatchVector(templateModel: ITextModel, searchModel: ITextModel, weightFunction: WeightFunction): Float32Array;
declare function getVectorCosineDistance(aVector: Vector, bVector: Vector): number;
declare const getNGramsCosineDistance: MatchFunction;
declare class SimpleCat<D> {
    private textToModel;
    private weightFunction;
    private _models;
    constructor(texts: ITextOption<D>[], textToModel: TextToModel, weightFunction: WeightFunction);
    match(text: string, topSize: number): {
        distances: Float32Array;
        indexes: Int8Array;
    };
}
export { SimpleCat, standartTextModel, standartWeightFunction, getNGrams, getMatchVector, getVectorCosineDistance, getNGramsCosineDistance, VectorFindVacantIndex, VectorShiftRight, };
