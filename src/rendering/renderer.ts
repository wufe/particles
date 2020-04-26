import { ILibraryInterface } from "../library-interface";

export type TRendererBuilder = {
    build(libraryInterface: ILibraryInterface): IRenderer;
}

export interface IRenderer {
    register: () => void;
}