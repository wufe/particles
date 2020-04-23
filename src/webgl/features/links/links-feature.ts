import { RecursivePartial, getDefault } from "../../../utils/object-utils"
import { TFeatureBuilder, IFeature } from "../feature"
import { ILibraryInterface } from "../../../main"
import { LinksProgram } from "./links-program"
import { ViewBox } from "../../camera/view-box"
import { IWebGLLibraryInterface } from "../../../rendering/renderer-webgl"

export type TLinksFeatureParams = {
    // distance ???
}

export class LinksFeatureBuilder {
    static build = (partialParams?: RecursivePartial<TLinksFeatureParams>): TFeatureBuilder => ({
        build: (manager: ILibraryInterface) => new LinksFeature(manager, getDefault(partialParams, {
            // distance ?
        }))
    })
}

class LinksFeature implements IFeature {

    private _program: LinksProgram;

    constructor(private _manager: ILibraryInterface, private _params: TLinksFeatureParams) {}

    isAvailable = () => true;

    buildProgram(gl: WebGLRenderingContext, viewBox: ViewBox, libraryInterface: IWebGLLibraryInterface, ...args: any[]) {
        this._program = new LinksProgram(gl, viewBox, libraryInterface);
        return this;
    }

    getProgram = () => this._program;

}