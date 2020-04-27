import { RecursivePartial, getDefault } from "../../../utils/object-utils"
import { TFeatureBuilder, IFeature } from "../feature"
import { LinksProgram } from "./links-program"
import { IViewBox } from "../../camera/view-box"
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl"
import { ILibraryInterface } from "../../../library-interface"
import { Unit } from "../../../utils/units"

export type TLinksFeatureParams = {
}

export class LinksFeatureBuilder {
    static build = (partialParams?: RecursivePartial<TLinksFeatureParams>): TFeatureBuilder => ({
        build: (manager: ILibraryInterface) => new LinksFeature(manager, getDefault(partialParams, {
        }))
    })
}

class LinksFeature implements IFeature {

    private _program: LinksProgram;

    constructor(private _manager: ILibraryInterface, private _params: TLinksFeatureParams) {}

    isAvailable = () => true;

    buildProgram(gl: WebGLRenderingContext, viewBox: IViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) {
        this._program = new LinksProgram(gl, viewBox, libraryInterface, this._params);
        return this;
    }

    getProgram = () => this._program;

}