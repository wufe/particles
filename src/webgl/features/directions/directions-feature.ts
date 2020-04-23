import { RecursivePartial, getDefault } from "../../../utils/object-utils"
import { TFeatureBuilder, IFeature } from "../feature"
import { ILibraryInterface } from "../../../main"
import { DirectionsProgram } from "./directions-program"
import { ViewBox } from "../../camera/view-box"
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl"

export type TDirectionsFeatureParams = {}

export class DirectionsFeatureBuilder {
    static build = (partialParams?: RecursivePartial<TDirectionsFeatureParams>): TFeatureBuilder => ({
        build: (manager: ILibraryInterface) => new DirectionsFeature(manager, getDefault(partialParams, {}))
    })
}

class DirectionsFeature implements IFeature {
    private _program: DirectionsProgram;

    constructor(private _manager: ILibraryInterface, private _params: TDirectionsFeatureParams) {}

    isAvailable = () => true;

    buildProgram(gl: WebGLRenderingContext, viewBox: ViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) {
        this._program = new DirectionsProgram(gl, viewBox, libraryInterface);
        return this;
    }

    getProgram = () => this._program;
}