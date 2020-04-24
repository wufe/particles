declare type TBeforeVertexMapHookCallback<TModel> = (models: TModel[], mapper: ICommittedAttributeMapper<TModel>) => any;
declare type TAfterEachVertexMapHookCallback<TModel> = (model: TModel, vertexIndex: number, mapper: ICommittedAttributeMapper<TModel>) => any;
declare type TVertexAssignationCallback = (indices: Float32Array) => any;
export interface IUsableAttributeMapper<TModel> {
    useVertices(): IBuildableMappableAttributeMapper<TModel>;
    bringYourOwnVertices(): IMappableAttributeMapper<TModel>;
}
export interface IMappableAttributeMapper<TModel> {
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): IMappableAttributeMapper<TModel>;
    commit(): ICommittedAttributeMapper<TModel>;
}
export interface IBuildableMappableAttributeMapper<TModel> extends IMappableAttributeMapper<TModel> {
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): IBuildableMappableAttributeMapper<TModel>;
    afterVerticesMap(onVerticesBuilt: TVertexAssignationCallback): IBuildableMappableAttributeMapper<TModel>;
    beforeVerticesMap(action: TBeforeVertexMapHookCallback<TModel>): IBuildableMappableAttributeMapper<TModel>;
    afterEachVertexMap(action: TAfterEachVertexMapHookCallback<TModel>): IBuildableMappableAttributeMapper<TModel>;
}
export interface ICommittedAttributeMapper<TModel> {
    buildVertices(models?: TModel[]): void;
    enableAttributes(glContext: WebGLRenderingContext): ICommittedAttributeMapper<TModel>;
    disableAttributes(glContext: WebGLRenderingContext): ICommittedAttributeMapper<TModel>;
    getTotalSize(): number;
    getCount(): number;
    useVerticesAttibPointers(gl: WebGLRenderingContext): ICommittedAttributeMapper<TModel>;
}
export declare class AttributeMapper<TModel> implements IUsableAttributeMapper<TModel>, IMappableAttributeMapper<TModel>, IBuildableMappableAttributeMapper<TModel>, ICommittedAttributeMapper<TModel> {
    private constructor();
    private _maps;
    private _beforeVertexMapCallback;
    private _afterEachVertexMapCallback;
    private _afterVerticesMapCallback;
    private _verticesPointers;
    private _totalSize;
    private _stride;
    private _verticesCount;
    private _models;
    private _vertices;
    private _bringYourOwnVertices;
    private _count;
    useVertices(): this;
    addMap(index: number, size: number, type: number, map: (model: TModel) => any): this;
    beforeVerticesMap(action: TBeforeVertexMapHookCallback<TModel>): this;
    afterEachVertexMap(action: TAfterEachVertexMapHookCallback<TModel>): this;
    afterVerticesMap(onVerticesBuilt: TVertexAssignationCallback): this;
    bringYourOwnVertices(): this;
    buildVertices(models?: TModel[]): void;
    commit(): this;
    enableAttributes(glContext: WebGLRenderingContext): this;
    disableAttributes(glContext: WebGLRenderingContext): this;
    private _calculateVerticesParameters;
    getTotalSize(): number;
    getCount(): number;
    useVerticesAttibPointers(gl: WebGLRenderingContext): this;
    static build<TModel>(): IUsableAttributeMapper<TModel>;
}
export {};
