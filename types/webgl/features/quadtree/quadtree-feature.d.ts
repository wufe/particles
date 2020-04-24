import { TFeatureBuilder } from "../feature";
import { RecursivePartial } from "../../../utils/object-utils";
export declare type TQuadTreeFeatureParams = {
    color: number[];
};
export declare class QuadTreeFeatureBuilder {
    static build: (partialParams?: RecursivePartial<TQuadTreeFeatureParams>) => TFeatureBuilder;
}
