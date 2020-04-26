import { RecursivePartial } from "../../../utils/object-utils";
import { TFeatureBuilder } from "../feature";
import { Unit } from "../../../utils/units";
export declare type TLinksFeatureParams = {
    distance: {
        value: number;
        unit: Unit;
    };
};
export declare class LinksFeatureBuilder {
    static build: (partialParams?: RecursivePartial<TLinksFeatureParams>) => TFeatureBuilder;
}
