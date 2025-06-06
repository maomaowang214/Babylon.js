import type { Scene } from "../../scene";
import type { Engine } from "../../Engines/engine";
import { Texture } from "../../Materials/Textures/texture";
import { RenderTargetTexture } from "../../Materials/Textures/renderTargetTexture";
import { Constants } from "../../Engines/constants";

import "../../Engines/Extensions/engine.multiRender";
import type { InternalTexture } from "./internalTexture";

/**
 * Creation options of the multi render target texture.
 */
export interface IMultiRenderTargetOptions {
    /**
     * Specifies if mipmaps must be created. If undefined, the value from generateMipMaps is taken instead
     */
    createMipMaps?: boolean;
    /**
     * Define if the texture needs to create mip maps after render (default: false).
     */
    generateMipMaps?: boolean;
    /**
     * Define the types of all the draw buffers (render textures) we want to create
     */
    types?: number[];
    /**
     * Define the sampling modes of all the draw buffers (render textures) we want to create
     */
    samplingModes?: number[];
    /**
     * Define if sRGB format should be used for each of the draw buffers (render textures) we want to create
     */
    useSRGBBuffers?: boolean[];
    /**
     * Define if a depth buffer is required (default: true)
     */
    generateDepthBuffer?: boolean;
    /**
     * Define if a stencil buffer is required (default: false)
     */
    generateStencilBuffer?: boolean;
    /**
     * Define if a depth texture is required instead of a depth buffer (default: false)
     */
    generateDepthTexture?: boolean;
    /**
     * Define the internal format of the buffer in the RTT (RED, RG, RGB, RGBA (default), ALPHA...) of all the draw buffers (render textures) we want to create
     */
    formats?: number[];
    /**
     * Define depth texture format to use
     */
    depthTextureFormat?: number;
    /**
     * Define the number of desired draw buffers (render textures). You can set it to 0 if you don't need any color attachment. (default: 1)
     */
    textureCount?: number;
    /**
     * Define if aspect ratio should be adapted to the texture or stay the scene one (default: true)
     */
    doNotChangeAspectRatio?: boolean;
    /**
     * Define the default type of the buffers we are creating (default: Constants.TEXTURETYPE_UNSIGNED_BYTE). types[] is prioritized over defaultType if provided.
     */
    defaultType?: number;
    /**
     * Defines sample count (1 by default)
     */
    samples?: number;
    /**
     * Defines if we should draw into all attachments or the first one only by default (default: false)
     */
    drawOnlyOnFirstAttachmentByDefault?: boolean;
    /**
     * Define the type of texture at each attahment index (of Constants.TEXTURE_2D, .TEXTURE_2D_ARRAY, .TEXTURE_CUBE_MAP, .TEXTURE_CUBE_MAP_ARRAY, .TEXTURE_3D).
     * You can also use the -1 value to indicate that no texture should be created but that you will assign a texture to that attachment index later.
     * Can be useful when you want to attach several layers of the same 2DArrayTexture / 3DTexture or several faces of the same CubeMapTexture: Use the setInternalTexture
     * method for that purpose, after the MultiRenderTarget has been created.
     */
    targetTypes?: number[];
    /**
     * Define the face index of each texture in the textures array (if applicable, given the corresponding targetType) at creation time (for Constants.TEXTURE_CUBE_MAP and .TEXTURE_CUBE_MAP_ARRAY).
     * Can be changed at any time by calling setLayerAndFaceIndices or setLayerAndFaceIndex
     */
    faceIndex?: number[];
    /**
     * Define the layer index of each texture in the textures array (if applicable, given the corresponding targetType) at creation time (for Constants.TEXTURE_3D, .TEXTURE_2D_ARRAY, and .TEXTURE_CUBE_MAP_ARRAY).
     * Can be changed at any time by calling setLayerAndFaceIndices or setLayerAndFaceIndex
     */
    layerIndex?: number[];
    /**
     * Define the number of layer of each texture in the textures array (if applicable, given the corresponding targetType) (for Constants.TEXTURE_3D, .TEXTURE_2D_ARRAY, and .TEXTURE_CUBE_MAP_ARRAY)
     */
    layerCounts?: number[];
    /**
     * Define the creation flags of the textures (Constants.TEXTURE_CREATIONFLAG_STORAGE for storage textures, for eg)
     */
    creationFlags?: number[];
    /**
     * Define the names of the textures (used for debugging purpose)
     */
    labels?: string[];
    /**
     * Label of the RenderTargetWrapper (used for debugging only)
     */
    label?: string;
    /**
     * Define if the textures should not be created by the MultiRenderTarget (default: false)
     * If true, you will need to set the textures yourself by calling setTexture on the MultiRenderTarget.
     */
    dontCreateTextures?: boolean;
}

/**
 * A multi render target, like a render target provides the ability to render to a texture.
 * Unlike the render target, it can render to several draw buffers (render textures) in one draw.
 * This is specially interesting in deferred rendering or for any effects requiring more than
 * just one color from a single pass.
 */
export class MultiRenderTarget extends RenderTargetTexture {
    private _textures: Texture[];
    private _multiRenderTargetOptions: IMultiRenderTargetOptions;
    private _count: number;
    private _drawOnlyOnFirstAttachmentByDefault: boolean;
    private _textureNames?: string[];

    /**
     * Get if draw buffers (render textures) are currently supported by the used hardware and browser.
     */
    public get isSupported(): boolean {
        return this._engine?.getCaps().drawBuffersExtension ?? false;
    }

    /**
     * Get the list of textures generated by the multi render target.
     */
    public get textures(): Texture[] {
        return this._textures;
    }

    /**
     * Gets the number of textures in this MRT. This number can be different from `_textures.length` in case a depth texture is generated.
     */
    public get count(): number {
        return this._count;
    }

    /**
     * Get the depth texture generated by the multi render target if options.generateDepthTexture has been set
     */
    public get depthTexture(): Texture {
        return this._textures[this._textures.length - 1];
    }

    /**
     * Set the wrapping mode on U of all the textures we are rendering to.
     * Can be any of the Texture. (CLAMP_ADDRESSMODE, MIRROR_ADDRESSMODE or WRAP_ADDRESSMODE)
     */
    public override set wrapU(wrap: number) {
        if (this._textures) {
            for (let i = 0; i < this._textures.length; i++) {
                this._textures[i].wrapU = wrap;
            }
        }
    }

    /**
     * Set the wrapping mode on V of all the textures we are rendering to.
     * Can be any of the Texture. (CLAMP_ADDRESSMODE, MIRROR_ADDRESSMODE or WRAP_ADDRESSMODE)
     */
    public override set wrapV(wrap: number) {
        if (this._textures) {
            for (let i = 0; i < this._textures.length; i++) {
                this._textures[i].wrapV = wrap;
            }
        }
    }

    /**
     * Instantiate a new multi render target texture.
     * A multi render target, like a render target provides the ability to render to a texture.
     * Unlike the render target, it can render to several draw buffers (render textures) in one draw.
     * This is specially interesting in deferred rendering or for any effects requiring more than
     * just one color from a single pass.
     * @param name Define the name of the texture
     * @param size Define the size of the buffers to render to
     * @param count Define the number of target we are rendering into
     * @param scene Define the scene the texture belongs to
     * @param options Define the options used to create the multi render target
     * @param textureNames Define the names to set to the textures (if count \> 0 - optional)
     */
    constructor(name: string, size: any, count: number, scene?: Scene, options?: IMultiRenderTargetOptions, textureNames?: string[]) {
        const generateMipMaps = options && options.generateMipMaps ? options.generateMipMaps : false;
        const generateDepthTexture = options && options.generateDepthTexture ? options.generateDepthTexture : false;
        const depthTextureFormat = options && options.depthTextureFormat ? options.depthTextureFormat : Constants.TEXTUREFORMAT_DEPTH16;
        const doNotChangeAspectRatio = !options || options.doNotChangeAspectRatio === undefined ? true : options.doNotChangeAspectRatio;
        const drawOnlyOnFirstAttachmentByDefault = options && options.drawOnlyOnFirstAttachmentByDefault ? options.drawOnlyOnFirstAttachmentByDefault : false;
        super(name, size, scene, generateMipMaps, doNotChangeAspectRatio, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);

        if (!this.isSupported) {
            this.dispose();
            return;
        }

        this._textureNames = textureNames;

        const types: number[] = [];
        const samplingModes: number[] = [];
        const useSRGBBuffers: boolean[] = [];
        const formats: number[] = [];
        const targetTypes: number[] = [];
        const faceIndex: number[] = [];
        const layerIndex: number[] = [];
        const layerCounts: number[] = [];
        this._initTypes(count, types, samplingModes, useSRGBBuffers, formats, targetTypes, faceIndex, layerIndex, layerCounts, options);

        const generateDepthBuffer = !options || options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
        const generateStencilBuffer = !options || options.generateStencilBuffer === undefined ? false : options.generateStencilBuffer;
        const samples = options && options.samples ? options.samples : 1;

        this._multiRenderTargetOptions = {
            samplingModes: samplingModes,
            generateMipMaps: generateMipMaps,
            generateDepthBuffer: generateDepthBuffer,
            generateStencilBuffer: generateStencilBuffer,
            generateDepthTexture: generateDepthTexture,
            depthTextureFormat: depthTextureFormat,
            types: types,
            textureCount: count,
            useSRGBBuffers: useSRGBBuffers,
            samples,
            formats: formats,
            targetTypes: targetTypes,
            faceIndex: faceIndex,
            layerIndex: layerIndex,
            layerCounts: layerCounts,
            labels: textureNames,
            label: name,
        };

        this._count = count;
        this._drawOnlyOnFirstAttachmentByDefault = drawOnlyOnFirstAttachmentByDefault;

        if (count > 0) {
            this._createInternalTextures();
            this._createTextures(textureNames);
        }
    }

    private _initTypes(
        count: number,
        types: number[],
        samplingModes: number[],
        useSRGBBuffers: boolean[],
        formats: number[],
        targets: number[],
        faceIndex: number[],
        layerIndex: number[],
        layerCounts: number[],
        options?: IMultiRenderTargetOptions
    ) {
        for (let i = 0; i < count; i++) {
            if (options && options.types && options.types[i] !== undefined) {
                types.push(options.types[i]);
            } else {
                types.push(options && options.defaultType ? options.defaultType : Constants.TEXTURETYPE_UNSIGNED_BYTE);
            }

            if (options && options.samplingModes && options.samplingModes[i] !== undefined) {
                samplingModes.push(options.samplingModes[i]);
            } else {
                samplingModes.push(Texture.BILINEAR_SAMPLINGMODE);
            }

            if (options && options.useSRGBBuffers && options.useSRGBBuffers[i] !== undefined) {
                useSRGBBuffers.push(options.useSRGBBuffers[i]);
            } else {
                useSRGBBuffers.push(false);
            }

            if (options && options.formats && options.formats[i] !== undefined) {
                formats.push(options.formats[i]);
            } else {
                formats.push(Constants.TEXTUREFORMAT_RGBA);
            }

            if (options && options.targetTypes && options.targetTypes[i] !== undefined) {
                targets.push(options.targetTypes[i]);
            } else {
                targets.push(Constants.TEXTURE_2D);
            }

            if (options && options.faceIndex && options.faceIndex[i] !== undefined) {
                faceIndex.push(options.faceIndex[i]);
            } else {
                faceIndex.push(0);
            }

            if (options && options.layerIndex && options.layerIndex[i] !== undefined) {
                layerIndex.push(options.layerIndex[i]);
            } else {
                layerIndex.push(0);
            }

            if (options && options.layerCounts && options.layerCounts[i] !== undefined) {
                layerCounts.push(options.layerCounts[i]);
            } else {
                layerCounts.push(1);
            }
        }
    }

    private _createInternaTextureIndexMapping() {
        const mapMainInternalTexture2Index: { [key: number]: number } = {};
        const mapInternalTexture2MainIndex: number[] = [];

        if (!this._renderTarget) {
            return mapInternalTexture2MainIndex;
        }

        const internalTextures = this._renderTarget.textures!;
        for (let i = 0; i < internalTextures.length; i++) {
            const texture = internalTextures[i];
            if (!texture) {
                continue;
            }
            const mainIndex = mapMainInternalTexture2Index[texture.uniqueId];
            if (mainIndex !== undefined) {
                mapInternalTexture2MainIndex[i] = mainIndex;
            } else {
                mapMainInternalTexture2Index[texture.uniqueId] = i;
            }
        }

        return mapInternalTexture2MainIndex;
    }

    /**
     * @internal
     */
    public override _rebuild(fromContextLost = false, forceFullRebuild: boolean = false, textureNames?: string[]): void {
        if (this._count < 1 || fromContextLost) {
            return;
        }

        const mapInternalTexture2MainIndex = this._createInternaTextureIndexMapping();

        this.releaseInternalTextures();
        this._createInternalTextures();

        if (forceFullRebuild) {
            this._releaseTextures();
            this._createTextures(textureNames);
        }

        const internalTextures = this._renderTarget!.textures!;
        for (let i = 0; i < internalTextures.length; i++) {
            const texture = this._textures[i];
            if (mapInternalTexture2MainIndex[i] !== undefined) {
                this._renderTarget!.setTexture(internalTextures[mapInternalTexture2MainIndex[i]], i);
            }
            texture._texture = internalTextures[i];
            if (texture._texture) {
                texture._noMipmap = !texture._texture.useMipMaps;
                texture._useSRGBBuffer = texture._texture._useSRGBBuffer;
            }
        }

        if (this.samples !== 1) {
            this._renderTarget!.setSamples(this.samples, !this._drawOnlyOnFirstAttachmentByDefault, true);
        }
    }

    private _createInternalTextures(): void {
        this._renderTarget = this._getEngine()!.createMultipleRenderTarget(this._size, this._multiRenderTargetOptions, !this._drawOnlyOnFirstAttachmentByDefault);
        this._texture = this._renderTarget.texture;
    }

    private _releaseTextures(): void {
        if (this._textures) {
            for (let i = 0; i < this._textures.length; i++) {
                this._textures[i]._texture = null; // internal textures are released by a call to releaseInternalTextures()
                this._textures[i].dispose();
            }
        }
    }

    private _createTextures(textureNames?: string[]): void {
        const internalTextures = this._renderTarget!.textures!;
        this._textures = [];
        for (let i = 0; i < internalTextures.length; i++) {
            const texture = new Texture(null, this.getScene());
            if (textureNames?.[i]) {
                texture.name = textureNames[i];
            }
            texture._texture = internalTextures[i];
            if (texture._texture) {
                texture._noMipmap = !texture._texture.useMipMaps;
                texture._useSRGBBuffer = texture._texture._useSRGBBuffer;
            }
            this._textures.push(texture);
        }
    }

    /**
     * Replaces an internal texture within the MRT. Useful to share textures between MultiRenderTarget.
     * @param texture The new texture to set in the MRT
     * @param index The index of the texture to replace
     * @param disposePrevious Set to true if the previous internal texture should be disposed
     */
    public setInternalTexture(texture: InternalTexture, index: number, disposePrevious: boolean = true) {
        if (!this.renderTarget) {
            return;
        }

        if (index === 0) {
            this._texture = texture;
        }

        this.renderTarget.setTexture(texture, index, disposePrevious);

        if (!this.textures[index]) {
            this.textures[index] = new Texture(null, this.getScene());
            this.textures[index].name = this._textureNames?.[index] ?? this.textures[index].name;
        }
        this.textures[index]._texture = texture;
        this.textures[index]._noMipmap = !texture.useMipMaps;
        this.textures[index]._useSRGBBuffer = texture._useSRGBBuffer;

        this._count = this.renderTarget.textures ? this.renderTarget.textures.length : 0;

        if (this._multiRenderTargetOptions.types) {
            this._multiRenderTargetOptions.types[index] = texture.type;
        }
        if (this._multiRenderTargetOptions.samplingModes) {
            this._multiRenderTargetOptions.samplingModes[index] = texture.samplingMode;
        }
        if (this._multiRenderTargetOptions.useSRGBBuffers) {
            this._multiRenderTargetOptions.useSRGBBuffers[index] = texture._useSRGBBuffer;
        }
        if (this._multiRenderTargetOptions.targetTypes && this._multiRenderTargetOptions.targetTypes[index] !== -1) {
            let target: number = 0;
            if (texture.is2DArray) {
                target = Constants.TEXTURE_2D_ARRAY;
            } else if (texture.isCube) {
                target = Constants.TEXTURE_CUBE_MAP;
            } /*else if (texture.isCubeArray) {
                target = Constants.TEXTURE_CUBE_MAP_ARRAY;
            }*/ else if (texture.is3D) {
                target = Constants.TEXTURE_3D;
            } else {
                target = Constants.TEXTURE_2D;
            }
            this._multiRenderTargetOptions.targetTypes[index] = target;
        }
    }

    /**
     * Changes an attached texture's face index or layer.
     * @param index The index of the texture to modify the attachment of
     * @param layerIndex The layer index of the texture to be attached to the framebuffer
     * @param faceIndex The face index of the texture to be attached to the framebuffer
     */
    public setLayerAndFaceIndex(index: number, layerIndex: number = -1, faceIndex: number = -1) {
        if (!this.textures[index] || !this.renderTarget) {
            return;
        }

        if (this._multiRenderTargetOptions.layerIndex) {
            this._multiRenderTargetOptions.layerIndex[index] = layerIndex;
        }
        if (this._multiRenderTargetOptions.faceIndex) {
            this._multiRenderTargetOptions.faceIndex[index] = faceIndex;
        }

        this.renderTarget.setLayerAndFaceIndex(index, layerIndex, faceIndex);
    }

    /**
     * Changes every attached texture's face index or layer.
     * @param layerIndices The layer indices of the texture to be attached to the framebuffer
     * @param faceIndices The face indices of the texture to be attached to the framebuffer
     */
    public setLayerAndFaceIndices(layerIndices: number[], faceIndices: number[]) {
        if (!this.renderTarget) {
            return;
        }

        this._multiRenderTargetOptions.layerIndex = layerIndices;
        this._multiRenderTargetOptions.faceIndex = faceIndices;

        this.renderTarget.setLayerAndFaceIndices(layerIndices, faceIndices);
    }

    /**
     * Define the number of samples used if MSAA is enabled.
     */
    public override get samples(): number {
        return this._samples;
    }

    public override set samples(value: number) {
        if (this._renderTarget) {
            this._samples = this._renderTarget.setSamples(value);
        } else {
            // In case samples are set with 0 textures created, we must save the desired samples value
            this._samples = value;
        }
    }

    /**
     * Resize all the textures in the multi render target.
     * Be careful as it will recreate all the data in the new texture.
     * @param size Define the new size
     */
    public override resize(size: any) {
        this._processSizeParameter(size);
        this._rebuild(false, undefined, this._textureNames);
    }

    /**
     * Changes the number of render targets in this MRT
     * Be careful as it will recreate all the data in the new texture.
     * @param count new texture count
     * @param options Specifies texture types and sampling modes for new textures
     * @param textureNames Specifies the names of the textures (optional)
     */
    public updateCount(count: number, options?: IMultiRenderTargetOptions, textureNames?: string[]) {
        this._multiRenderTargetOptions.textureCount = count;
        this._count = count;

        const types: number[] = [];
        const samplingModes: number[] = [];
        const useSRGBBuffers: boolean[] = [];
        const formats: number[] = [];
        const targetTypes: number[] = [];
        const faceIndex: number[] = [];
        const layerIndex: number[] = [];
        const layerCounts: number[] = [];

        this._textureNames = textureNames;

        this._initTypes(count, types, samplingModes, useSRGBBuffers, formats, targetTypes, faceIndex, layerIndex, layerCounts, options);
        this._multiRenderTargetOptions.types = types;
        this._multiRenderTargetOptions.samplingModes = samplingModes;
        this._multiRenderTargetOptions.useSRGBBuffers = useSRGBBuffers;
        this._multiRenderTargetOptions.formats = formats;
        this._multiRenderTargetOptions.targetTypes = targetTypes;
        this._multiRenderTargetOptions.faceIndex = faceIndex;
        this._multiRenderTargetOptions.layerIndex = layerIndex;
        this._multiRenderTargetOptions.layerCounts = layerCounts;
        this._multiRenderTargetOptions.labels = textureNames;

        this._rebuild(false, true, textureNames);
    }

    protected override _unbindFrameBuffer(engine: Engine, faceIndex: number): void {
        if (this._renderTarget) {
            engine.unBindMultiColorAttachmentFramebuffer(this._renderTarget, this.isCube, () => {
                this.onAfterRenderObservable.notifyObservers(faceIndex);
            });
        }
    }

    /**
     * Dispose the render targets and their associated resources
     * @param doNotDisposeInternalTextures if set to true, internal textures won't be disposed (default: false).
     */
    public override dispose(doNotDisposeInternalTextures = false): void {
        this._releaseTextures();
        if (!doNotDisposeInternalTextures) {
            this.releaseInternalTextures();
        } else {
            // Prevent internal texture dispose in super.dispose
            this._texture = null;
        }
        super.dispose();
    }

    /**
     * Release all the underlying texture used as draw buffers (render textures).
     */
    public releaseInternalTextures(): void {
        const internalTextures = this._renderTarget?.textures;

        if (!internalTextures) {
            return;
        }

        for (let i = internalTextures.length - 1; i >= 0; i--) {
            this._textures[i]._texture = null;
        }

        this._renderTarget?.dispose();
        this._renderTarget = null;
    }
}
