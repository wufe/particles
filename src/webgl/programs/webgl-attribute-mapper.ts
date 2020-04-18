import { ProgramContainer } from "./webgl-program-container";

type TAttributeMap<TModel> = {
    index: number;
    size: number;
    type: number;
    map: (model: TModel) => any;
}

type TVertexAttributePointer = {
    index: number;
    size: number;
    type: number;
    normalized: boolean;
    stride: number;
    offset: number;
}

type TBeforeVertexMapHookCallback<TModel> = (models: TModel[], mapper: ICommittedAttributeMapper<TModel>) => any;

type TAfterEachVertexMapHookCallback<TModel> = (model: TModel, vertexIndex: number, mapper: ICommittedAttributeMapper<TModel>) => any;

type TVertexAssignationCallback = (indices: Float32Array) => any;

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

export class AttributeMapper<TModel>
    implements
        IUsableAttributeMapper<TModel>,
        IMappableAttributeMapper<TModel>,
        IBuildableMappableAttributeMapper<TModel>,
        ICommittedAttributeMapper<TModel> {

    private constructor() {}

    private _maps: TAttributeMap<TModel>[] = [];
    private _beforeVertexMapCallback: TBeforeVertexMapHookCallback<TModel> | null = null;
    private _afterEachVertexMapCallback: TAfterEachVertexMapHookCallback<TModel> | null = null;
    private _afterVerticesMapCallback: TVertexAssignationCallback | null = null;
    private _verticesPointers: TVertexAttributePointer[] = [];
    private _totalSize = 0;
    private _stride: number | null = null;
    private _verticesCount: number | null = null;
    private _models: TModel[] | null = null;
    private _vertices: Float32Array | null = null;
    private _bringYourOwnVertices = false;
    private _count = 0;

    useVertices() {
        return this;
    }

    addMap(index: number, size: number, type: number, map: (model: TModel) => any) {
        this._maps.push({ index, size, type, map });
        return this;
    }

    beforeVerticesMap(action: TBeforeVertexMapHookCallback<TModel>) {
        this._beforeVertexMapCallback = action;
        return this;
    }

    afterEachVertexMap(action: TAfterEachVertexMapHookCallback<TModel>) {
        this._afterEachVertexMapCallback = action;
        return this;
    }

    afterVerticesMap(onVerticesBuilt: TVertexAssignationCallback) {
        this._afterVerticesMapCallback = onVerticesBuilt;
        return this;
    }

    bringYourOwnVertices() {
        this._bringYourOwnVertices = true;
        return this;
    }

    buildVertices(models?: TModel[]) {
        if (!models) {
            if (!this._models)
                throw new Error('The attribute mapper require models to map from.');
            models = this._models;
        }

        this._count = models.length;

        if (typeof this._beforeVertexMapCallback === 'function')
            this._beforeVertexMapCallback(models, this);

        const callAfterEachHook = typeof this._afterEachVertexMapCallback === 'function';

        const vertices = new Float32Array(models.map((model, i) => {
            const mappedProperties = this._maps.map(map =>
                map.map(model));
            if (callAfterEachHook)
                this._afterEachVertexMapCallback(model, i, this);
            return mappedProperties;
        }).flat(2));

        this._vertices = vertices;

        // call assignation via previously set callback
        if (typeof this._afterVerticesMapCallback === 'function')
            this._afterVerticesMapCallback(this._vertices);

    }

    commit() {
        this._calculateVerticesParameters();
        return this;
    }
    
    enableAttributes(glContext: WebGLRenderingContext) {
        this._maps.forEach(({index}) => glContext.enableVertexAttribArray(index));
        return this;
    }

    disableAttributes(glContext: WebGLRenderingContext) {
        this._maps.forEach(({index}) => glContext.disableVertexAttribArray(index));
        return this;
    }

    private _calculateVerticesParameters() {

        let totalSize = this._maps
            .reduce((acc, { size, type }) => acc + size, 0);

        let stride = this._maps
            .reduce((acc, { size, type }) => acc + size * Float32Array.BYTES_PER_ELEMENT, 0); // TODO: Check if using float, to calculate size

        let verticesPointers = this._maps
            .reduce<TVertexAttributePointer[]>(
                (acc, {index, size, type}, i) => {
                    return [
                        ...acc,
                        {
                            index,
                            size,
                            type,
                            normalized: false,
                            stride,
                            offset: i === 0 ? 0 : (acc[i-1].offset + acc[i-1].size * Float32Array.BYTES_PER_ELEMENT) // TODO: Check if using float, to calculate size
                        } as TVertexAttributePointer
                    ];
                }, []);

        this._totalSize = totalSize;
        this._stride = stride;
        this._verticesPointers = verticesPointers;

        this._verticesCount = this._maps.length;
    }

    getTotalSize() {
        return this._totalSize;
    }
    
    getCount() {
        return this._count;
    }

    useVerticesAttibPointers(gl: WebGLRenderingContext) {
        this._verticesPointers.forEach(v => {
            gl.vertexAttribPointer(v.index, v.size, v.type, v.normalized, v.stride, v.offset);
        });
        return this;
    }

    static build<TModel>(): IUsableAttributeMapper<TModel> {
        return new AttributeMapper<TModel>();
    }
}