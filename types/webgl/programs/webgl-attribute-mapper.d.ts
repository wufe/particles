declare type TVertexMapHookCallback<TModel> = (model: TModel, vertexIndex: number, mapper: ICommittedAttributeMapper<TModel>) => any;
declare type TVertexAssignationCallback = (indices: Float32Array) => any;
export interface IUsableAttributeMapper<TModel> {
    useVerticesBuilder(onVerticesBuilt: TVertexAssignationCallback): IBuildableMappableAttributeMapper<TModel>;
    bringYourOwnVertices(): IMappableAttributeMapper<TModel>;
}
export interface IMappableAttributeMapper<TModel> {
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): IMappableAttributeMapper<TModel>;
    commit(): ICommittedAttributeMapper<TModel>;
}
export interface IBuildableMappableAttributeMapper<TModel> extends IMappableAttributeMapper<TModel> {
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): IBuildableMappableAttributeMapper<TModel>;
    afterEachVertexMap(action: TVertexMapHookCallback<TModel>): IBuildableMappableAttributeMapper<TModel>;
}
export interface ICommittedAttributeMapper<TModel> {
    buildVertices(models?: TModel[]): void;
    enableAttributes(glContext: WebGLRenderingContext): ICommittedAttributeMapper<TModel>;
    getTotalSize(): number;
}
export declare class AttributeMapper<TModel> implements IUsableAttributeMapper<TModel>, IMappableAttributeMapper<TModel>, IBuildableMappableAttributeMapper<TModel>, ICommittedAttributeMapper<TModel> {
    private constructor();
    private _maps;
    private _vertexMapCallback;
    private _onVerticesBuiltCallback;
    private _verticesPointers;
    private _totalSize;
    private _stride;
    private _verticesCount;
    private _models;
    private _vertices;
    private _bringYourOwnVertices;
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): this;
    afterEachVertexMap(action: TVertexMapHookCallback<TModel>): this;
    useVerticesBuilder(onVerticesBuilt: TVertexAssignationCallback): this;
    bringYourOwnVertices(): this;
    buildVertices(models?: TModel[]): void;
    commit(): this;
    enableAttributes(glContext: WebGLRenderingContext): this;
    private _calculateVerticesParameters;
    getTotalSize(): number;
    static build<TModel>(): IUsableAttributeMapper<TModel>;
}
export {};
