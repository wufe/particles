import { IWebGLLibraryInterface } from "../../rendering/renderer-webgl";
import { IViewBox } from "../camera/view-box";
import { IBaseProgram } from "./base-webgl-program";

export interface IProgramBuilder {
	new(gl: WebGLRenderingContext,
        viewBox: IViewBox,
        libraryInterface: IWebGLLibraryInterface, ...args: any[]): IProgram;
}

export interface IProgram extends IBaseProgram {
	init(): void;
	update(deltaT: number, T: number): void;
	draw  (deltaT: number, T: number): void;
}