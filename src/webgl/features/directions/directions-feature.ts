import { RecursivePartial, getDefault } from "../../../utils/object-utils"
import { TFeatureBuilder, IFeature } from "../feature"
import { DirectionsProgram } from "./directions-program"
import { IViewBox } from "../../camera/view-box"
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl"
import { ILibraryInterface } from "../../../library-interface"

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

    buildProgram(gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) {
        this._program = new DirectionsProgram(gl, viewBox, libraryInterface);
        return this;
    }

    getProgram = () => this._program;
}