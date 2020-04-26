import { ILibraryInterface } from "../library-interface";
export declare type TRendererBuilder = {
    build(libraryInterface: ILibraryInterface): IRenderer;
};
export interface IRenderer {
    register: () => void;
}
