type MatchFunction = (templateModel: ITextModel, searchModel: ITextModel) => number;
type TextToModel = (text: string) => ITextModel;
type NGrams = {
    [key: string]: Int8Array;
};
interface ITextModel {
    grams: NGrams;
    negGrams: NGrams;
    vector: Int8Array;
    negVector: Int8Array;
    length: number;
}
interface ITextOption<A> {
    text: string;
    descriptor: A;
}
declare function getNGrams(text: string, gramSize: number): {
    grams: {};
    negGrams: {};
    length: number;
};
declare function smallTextModel(text: any): ITextModel;
declare function getMatchVector(templateModel: ITextModel, searchModel: ITextModel): Float32Array;
type Vector = Float32Array | Int8Array;
declare function getVectorCosineDistance(aVector: Vector, bVector: Vector): number;
declare const getNGramsSpaceCosineDistance: MatchFunction;
declare enum MatchFunctionType {
    space = "space",
    position = "position"
}
declare class SimpleCat<D> {
    private textToModel;
    private _models;
    constructor(texts: ITextOption<D>[], textToModel: TextToModel);
    match(text: string, matchType: MatchFunctionType): {
        distances: Float32Array;
        maxCosIndex: number;
    };
}
export { smallTextModel, getNGrams, getMatchVector, getVectorCosineDistance, getNGramsSpaceCosineDistance, SimpleCat, MatchFunctionType, };
