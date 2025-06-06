import type { Nullable } from "../../types";
import type { Scene } from "../../scene";
import { Matrix, Vector3 } from "../../Maths/math.vector";
import type { SubMesh } from "../../Meshes/subMesh";

import type { IShadowLight } from "../../Lights/shadowLight";
import type { Effect } from "../../Materials/effect";
import { RenderTargetTexture } from "../../Materials/Textures/renderTargetTexture";

import { Constants } from "../../Engines/constants";
import type { Observer } from "../../Misc/observable";
import { _WarnImport } from "../../Misc/devTools";
import { ShadowGenerator } from "./shadowGenerator";
import type { DirectionalLight } from "../directionalLight";

import { BoundingInfo } from "../../Culling/boundingInfo";
import type { DepthRenderer } from "../../Rendering/depthRenderer";
import { DepthReducer } from "../../Misc/depthReducer";
import { Logger } from "../../Misc/logger";
import { EngineStore } from "../../Engines/engineStore";
import type { Camera } from "../../Cameras/camera";

interface ICascade {
    prevBreakDistance: number;
    breakDistance: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const UpDir = Vector3.Up();
// eslint-disable-next-line @typescript-eslint/naming-convention
const ZeroVec = Vector3.Zero();

const Tmpv1 = new Vector3();
const Tmpv2 = new Vector3();
const TmpMatrix = new Matrix();

/**
 * A CSM implementation allowing casting shadows on large scenes.
 * Documentation : https://doc.babylonjs.com/babylon101/cascadedShadows
 * Based on: https://github.com/TheRealMJP/Shadows and https://johanmedestrom.wordpress.com/2016/03/18/opengl-cascaded-shadow-maps/
 */
export class CascadedShadowGenerator extends ShadowGenerator {
    private static readonly _FrustumCornersNdcSpace = [
        new Vector3(-1.0, +1.0, -1.0),
        new Vector3(+1.0, +1.0, -1.0),
        new Vector3(+1.0, -1.0, -1.0),
        new Vector3(-1.0, -1.0, -1.0),
        new Vector3(-1.0, +1.0, +1.0),
        new Vector3(+1.0, +1.0, +1.0),
        new Vector3(+1.0, -1.0, +1.0),
        new Vector3(-1.0, -1.0, +1.0),
    ];

    /**
     * Name of the CSM class
     */
    public static override CLASSNAME = "CascadedShadowGenerator";

    /**
     * Defines the default number of cascades used by the CSM.
     */
    public static readonly DEFAULT_CASCADES_COUNT = 4;
    /**
     * Defines the minimum number of cascades used by the CSM.
     */
    public static MIN_CASCADES_COUNT = 2;
    /**
     * Defines the maximum number of cascades used by the CSM.
     */
    public static MAX_CASCADES_COUNT = 4;

    protected override _validateFilter(filter: number): number {
        if (filter === ShadowGenerator.FILTER_NONE || filter === ShadowGenerator.FILTER_PCF || filter === ShadowGenerator.FILTER_PCSS) {
            return filter;
        }

        Logger.Error('Unsupported filter "' + filter + '"!');

        return ShadowGenerator.FILTER_NONE;
    }

    /**
     * Gets or sets the actual darkness of the soft shadows while using PCSS filtering (value between 0. and 1.)
     */
    public penumbraDarkness: number;

    private _numCascades: number;

    /**
     * Gets or set the number of cascades used by the CSM.
     */
    public get numCascades(): number {
        return this._numCascades;
    }

    public set numCascades(value: number) {
        value = Math.min(Math.max(value, CascadedShadowGenerator.MIN_CASCADES_COUNT), CascadedShadowGenerator.MAX_CASCADES_COUNT);
        if (value === this._numCascades) {
            return;
        }

        this._numCascades = value;
        this.recreateShadowMap();
        this._recreateSceneUBOs();
    }

    /**
     * Sets this to true if you want that the edges of the shadows don't "swimm" / "shimmer" when rotating the camera.
     * The trade off is that you lose some precision in the shadow rendering when enabling this setting.
     */
    public stabilizeCascades: boolean;

    private _freezeShadowCastersBoundingInfo: boolean;
    private _freezeShadowCastersBoundingInfoObservable: Nullable<Observer<Scene>>;

    /**
     * Enables or disables the shadow casters bounding info computation.
     * If your shadow casters don't move, you can disable this feature.
     * If it is enabled, the bounding box computation is done every frame.
     */
    public get freezeShadowCastersBoundingInfo(): boolean {
        return this._freezeShadowCastersBoundingInfo;
    }

    public set freezeShadowCastersBoundingInfo(freeze: boolean) {
        if (this._freezeShadowCastersBoundingInfoObservable && freeze) {
            this._scene.onBeforeRenderObservable.remove(this._freezeShadowCastersBoundingInfoObservable);
            this._freezeShadowCastersBoundingInfoObservable = null;
        }

        if (!this._freezeShadowCastersBoundingInfoObservable && !freeze) {
            this._freezeShadowCastersBoundingInfoObservable = this._scene.onBeforeRenderObservable.add(() => this._computeShadowCastersBoundingInfo());
        }

        this._freezeShadowCastersBoundingInfo = freeze;

        if (freeze) {
            this._computeShadowCastersBoundingInfo();
        }
    }

    private _scbiMin: Vector3;
    private _scbiMax: Vector3;

    protected _computeShadowCastersBoundingInfo(): void {
        this._scbiMin.copyFromFloats(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._scbiMax.copyFromFloats(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        if (this._shadowMap && this._shadowMap.renderList) {
            const renderList = this._shadowMap.renderList;
            for (let meshIndex = 0; meshIndex < renderList.length; meshIndex++) {
                const mesh = renderList[meshIndex];

                if (!mesh) {
                    continue;
                }

                const boundingInfo = mesh.getBoundingInfo(),
                    boundingBox = boundingInfo.boundingBox;

                this._scbiMin.minimizeInPlace(boundingBox.minimumWorld);
                this._scbiMax.maximizeInPlace(boundingBox.maximumWorld);
            }
        }

        this._shadowCastersBoundingInfo.reConstruct(this._scbiMin, this._scbiMax);
    }

    protected _shadowCastersBoundingInfo: BoundingInfo;

    /**
     * Gets or sets the shadow casters bounding info.
     * If you provide your own shadow casters bounding info, first enable freezeShadowCastersBoundingInfo
     * so that the system won't overwrite the bounds you provide
     */
    public get shadowCastersBoundingInfo(): BoundingInfo {
        return this._shadowCastersBoundingInfo;
    }

    public set shadowCastersBoundingInfo(boundingInfo: BoundingInfo) {
        this._shadowCastersBoundingInfo = boundingInfo;
    }

    protected _breaksAreDirty: boolean;

    protected _minDistance: number;
    protected _maxDistance: number;

    /**
     * Sets the minimal and maximal distances to use when computing the cascade breaks.
     *
     * The values of min / max are typically the depth zmin and zmax values of your scene, for a given frame.
     * If you don't know these values, simply leave them to their defaults and don't call this function.
     * @param min minimal distance for the breaks (default to 0.)
     * @param max maximal distance for the breaks (default to 1.)
     */
    public setMinMaxDistance(min: number, max: number): void {
        if (this._minDistance === min && this._maxDistance === max) {
            return;
        }

        if (min > max) {
            min = 0;
            max = 1;
        }

        if (min < 0) {
            min = 0;
        }

        if (max > 1) {
            max = 1;
        }

        this._minDistance = min;
        this._maxDistance = max;
        this._breaksAreDirty = true;
    }

    /** Gets the minimal distance used in the cascade break computation */
    public get minDistance(): number {
        return this._minDistance;
    }

    /** Gets the maximal distance used in the cascade break computation */
    public get maxDistance(): number {
        return this._maxDistance;
    }

    /**
     * Gets the class name of that object
     * @returns "CascadedShadowGenerator"
     */
    public override getClassName(): string {
        return CascadedShadowGenerator.CLASSNAME;
    }

    private _cascadeMinExtents: Array<Vector3>;
    private _cascadeMaxExtents: Array<Vector3>;

    /**
     * Gets a cascade minimum extents
     * @param cascadeIndex index of the cascade
     * @returns the minimum cascade extents
     */
    public getCascadeMinExtents(cascadeIndex: number): Nullable<Vector3> {
        return cascadeIndex >= 0 && cascadeIndex < this._numCascades ? this._cascadeMinExtents[cascadeIndex] : null;
    }

    /**
     * Gets a cascade maximum extents
     * @param cascadeIndex index of the cascade
     * @returns the maximum cascade extents
     */
    public getCascadeMaxExtents(cascadeIndex: number): Nullable<Vector3> {
        return cascadeIndex >= 0 && cascadeIndex < this._numCascades ? this._cascadeMaxExtents[cascadeIndex] : null;
    }

    private _cascades: Array<ICascade>;
    private _currentLayer: number;
    private _viewSpaceFrustumsZ: Array<number>;
    private _viewMatrices: Array<Matrix>;
    private _projectionMatrices: Array<Matrix>;
    private _transformMatrices: Array<Matrix>;
    private _transformMatricesAsArray: Float32Array;
    private _frustumLengths: Array<number>;
    private _lightSizeUVCorrection: Array<number>;
    private _depthCorrection: Array<number>;
    private _frustumCornersWorldSpace: Array<Array<Vector3>>;
    private _frustumCenter: Array<Vector3>;
    private _shadowCameraPos: Array<Vector3>;
    private _onRenderDepthRendererObserver: Observer<Scene>;

    private _shadowMaxZ: number;
    /**
     * Gets the shadow max z distance. It's the limit beyond which shadows are not displayed.
     * It defaults to camera.maxZ
     */
    public get shadowMaxZ(): number {
        if (!this._getCamera()) {
            return 0;
        }
        return this._shadowMaxZ;
    }
    /**
     * Sets the shadow max z distance.
     */
    public set shadowMaxZ(value: number) {
        const camera = this._getCamera();
        if (!camera) {
            this._shadowMaxZ = value;
            return;
        }
        if (this._shadowMaxZ === value || value < camera.minZ || (value > camera.maxZ && camera.maxZ !== 0)) {
            return;
        }
        this._shadowMaxZ = value;
        this._light._markMeshesAsLightDirty();
        this._breaksAreDirty = true;
    }

    protected _debug: boolean;

    /**
     * Gets or sets the debug flag.
     * When enabled, the cascades are materialized by different colors on the screen.
     */
    public get debug(): boolean {
        return this._debug;
    }

    public set debug(dbg: boolean) {
        this._debug = dbg;
        this._light._markMeshesAsLightDirty();
    }

    private _depthClamp: boolean;

    /**
     * Gets or sets the depth clamping value.
     *
     * When enabled, it improves the shadow quality because the near z plane of the light frustum don't need to be adjusted
     * to account for the shadow casters far away.
     *
     * Note that this property is incompatible with PCSS filtering, so it won't be used in that case.
     */
    public get depthClamp(): boolean {
        return this._depthClamp;
    }

    public set depthClamp(value: boolean) {
        this._depthClamp = value;
    }

    private _cascadeBlendPercentage: number;

    /**
     * Gets or sets the percentage of blending between two cascades (value between 0. and 1.).
     * It defaults to 0.1 (10% blending).
     */
    public get cascadeBlendPercentage(): number {
        return this._cascadeBlendPercentage;
    }

    public set cascadeBlendPercentage(value: number) {
        this._cascadeBlendPercentage = value;
        this._light._markMeshesAsLightDirty();
    }

    private _lambda: number;

    /**
     * Gets or set the lambda parameter.
     * This parameter is used to split the camera frustum and create the cascades.
     * It's a value between 0. and 1.: If 0, the split is a uniform split of the frustum, if 1 it is a logarithmic split.
     * For all values in-between, it's a linear combination of the uniform and logarithm split algorithm.
     */
    public get lambda(): number {
        return this._lambda;
    }

    public set lambda(value: number) {
        const lambda = Math.min(Math.max(value, 0), 1);
        if (this._lambda == lambda) {
            return;
        }
        this._lambda = lambda;
        this._breaksAreDirty = true;
    }

    /**
     * Gets the view matrix corresponding to a given cascade
     * @param cascadeNum cascade to retrieve the view matrix from
     * @returns the cascade view matrix
     */
    public getCascadeViewMatrix(cascadeNum: number): Nullable<Matrix> {
        return cascadeNum >= 0 && cascadeNum < this._numCascades ? this._viewMatrices[cascadeNum] : null;
    }

    /**
     * Gets the projection matrix corresponding to a given cascade
     * @param cascadeNum cascade to retrieve the projection matrix from
     * @returns the cascade projection matrix
     */
    public getCascadeProjectionMatrix(cascadeNum: number): Nullable<Matrix> {
        return cascadeNum >= 0 && cascadeNum < this._numCascades ? this._projectionMatrices[cascadeNum] : null;
    }

    /**
     * Gets the transformation matrix corresponding to a given cascade
     * @param cascadeNum cascade to retrieve the transformation matrix from
     * @returns the cascade transformation matrix
     */
    public getCascadeTransformMatrix(cascadeNum: number): Nullable<Matrix> {
        return cascadeNum >= 0 && cascadeNum < this._numCascades ? this._transformMatrices[cascadeNum] : null;
    }

    private _depthRenderer: Nullable<DepthRenderer>;
    /**
     * Sets the depth renderer to use when autoCalcDepthBounds is enabled.
     *
     * Note that if no depth renderer is set, a new one will be automatically created internally when necessary.
     *
     * You should call this function if you already have a depth renderer enabled in your scene, to avoid
     * doing multiple depth rendering each frame. If you provide your own depth renderer, make sure it stores linear depth!
     * @param depthRenderer The depth renderer to use when autoCalcDepthBounds is enabled. If you pass null or don't call this function at all, a depth renderer will be automatically created
     */
    public setDepthRenderer(depthRenderer: Nullable<DepthRenderer>): void {
        this._depthRenderer = depthRenderer;

        if (this._depthReducer) {
            this._depthReducer.setDepthRenderer(this._depthRenderer);
        }
    }

    private _depthReducer: Nullable<DepthReducer>;
    private _autoCalcDepthBounds: boolean;

    /**
     * Gets or sets the autoCalcDepthBounds property.
     *
     * When enabled, a depth rendering pass is first performed (with an internally created depth renderer or with the one
     * you provide by calling setDepthRenderer). Then, a min/max reducing is applied on the depth map to compute the
     * minimal and maximal depth of the map and those values are used as inputs for the setMinMaxDistance() function.
     * It can greatly enhance the shadow quality, at the expense of more GPU works.
     * When using this option, you should increase the value of the lambda parameter, and even set it to 1 for best results.
     */
    public get autoCalcDepthBounds(): boolean {
        return this._autoCalcDepthBounds;
    }

    public set autoCalcDepthBounds(value: boolean) {
        const camera = this._getCamera();

        if (!camera) {
            return;
        }

        this._autoCalcDepthBounds = value;

        if (!value) {
            if (this._depthReducer) {
                this._depthReducer.deactivate();
            }
            this.setMinMaxDistance(0, 1);
            return;
        }

        if (!this._depthReducer) {
            this._depthReducer = new DepthReducer(camera);
            this._depthReducer.onAfterReductionPerformed.add((minmax: { min: number; max: number }) => {
                let min = minmax.min,
                    max = minmax.max;
                if (min >= max) {
                    min = 0;
                    max = 1;
                }
                if (min != this._minDistance || max != this._maxDistance) {
                    this.setMinMaxDistance(min, max);
                }
            });
            this._depthReducer.setDepthRenderer(this._depthRenderer);
        }

        this._depthReducer.activate();
    }

    /**
     * Defines the refresh rate of the min/max computation used when autoCalcDepthBounds is set to true
     * Use 0 to compute just once, 1 to compute on every frame, 2 to compute every two frames and so on...
     * Note that if you provided your own depth renderer through a call to setDepthRenderer, you are responsible
     * for setting the refresh rate on the renderer yourself!
     */
    public get autoCalcDepthBoundsRefreshRate(): number {
        return this._depthReducer?.depthRenderer?.getDepthMap().refreshRate ?? -1;
    }

    public set autoCalcDepthBoundsRefreshRate(value: number) {
        if (this._depthReducer?.depthRenderer) {
            this._depthReducer.depthRenderer.getDepthMap().refreshRate = value;
        }
    }

    /**
     * Create the cascade breaks according to the lambda, shadowMaxZ and min/max distance properties, as well as the camera near and far planes.
     * This function is automatically called when updating lambda, shadowMaxZ and min/max distances, however you should call it yourself if
     * you change the camera near/far planes!
     */
    public splitFrustum(): void {
        this._breaksAreDirty = true;
    }

    private _splitFrustum(): void {
        const camera = this._getCamera();
        if (!camera) {
            return;
        }

        const near = camera.minZ,
            far = camera.maxZ || this._shadowMaxZ, // account for infinite far plane (ie. maxZ = 0)
            cameraRange = far - near,
            minDistance = this._minDistance,
            maxDistance = this._shadowMaxZ < far && this._shadowMaxZ >= near ? Math.min((this._shadowMaxZ - near) / (far - near), this._maxDistance) : this._maxDistance;

        const minZ = near + minDistance * cameraRange,
            maxZ = near + maxDistance * cameraRange;

        const range = maxZ - minZ,
            ratio = maxZ / minZ;

        for (let cascadeIndex = 0; cascadeIndex < this._cascades.length; ++cascadeIndex) {
            const p = (cascadeIndex + 1) / this._numCascades,
                log = minZ * ratio ** p,
                uniform = minZ + range * p;

            const d = this._lambda * (log - uniform) + uniform;

            this._cascades[cascadeIndex].prevBreakDistance = cascadeIndex === 0 ? minDistance : this._cascades[cascadeIndex - 1].breakDistance;
            this._cascades[cascadeIndex].breakDistance = (d - near) / cameraRange;

            this._viewSpaceFrustumsZ[cascadeIndex] = d;
            this._frustumLengths[cascadeIndex] = (this._cascades[cascadeIndex].breakDistance - this._cascades[cascadeIndex].prevBreakDistance) * cameraRange;
        }

        this._breaksAreDirty = false;
    }

    private _computeMatrices(): void {
        const scene = this._scene;

        const camera = this._getCamera();
        if (!camera) {
            return;
        }

        Vector3.NormalizeToRef(this._light.getShadowDirection(0), this._lightDirection);
        if (Math.abs(Vector3.Dot(this._lightDirection, Vector3.Up())) === 1.0) {
            this._lightDirection.z = 0.0000000000001; // Required to avoid perfectly perpendicular light
        }

        this._cachedDirection.copyFrom(this._lightDirection);

        const useReverseDepthBuffer = scene.getEngine().useReverseDepthBuffer;

        for (let cascadeIndex = 0; cascadeIndex < this._numCascades; ++cascadeIndex) {
            this._computeFrustumInWorldSpace(cascadeIndex);
            this._computeCascadeFrustum(cascadeIndex);

            this._cascadeMaxExtents[cascadeIndex].subtractToRef(this._cascadeMinExtents[cascadeIndex], Tmpv1); // tmpv1 = cascadeExtents

            // Get position of the shadow camera
            this._frustumCenter[cascadeIndex].addToRef(this._lightDirection.scale(this._cascadeMinExtents[cascadeIndex].z), this._shadowCameraPos[cascadeIndex]);

            // Come up with a new orthographic camera for the shadow caster
            Matrix.LookAtLHToRef(this._shadowCameraPos[cascadeIndex], this._frustumCenter[cascadeIndex], UpDir, this._viewMatrices[cascadeIndex]);

            // Z extents of the current cascade, in cascade view coordinate system
            let viewMinZ = 0,
                viewMaxZ = Tmpv1.z;

            // Try to tighten minZ and maxZ based on the bounding box of the shadow casters
            const boundingInfo = this._shadowCastersBoundingInfo;

            boundingInfo.update(this._viewMatrices[cascadeIndex]);
            // Note that after the call to update, the boundingInfo properties that are identified as "world" coordinates are in fact view coordinates for the current cascade!
            // This is because the boundingInfo properties that are identifed as "local" are in fact world coordinates (see _computeShadowCastersBoundingInfo()), and we multiply them by the current cascade view matrix when we call update.

            const castersViewMinZ = boundingInfo.boundingBox.minimumWorld.z;
            const castersViewMaxZ = boundingInfo.boundingBox.maximumWorld.z;

            if (castersViewMinZ > viewMaxZ) {
                // Do nothing, keep the current z extents.
                // All the casters are too far from the light to have an impact on the current cascade.
                // Possible optimization: skip the rendering of the shadow map for this cascade, as all the casters will be clipped by the GPU anyway.
            } else {
                if (!this._depthClamp || this.filter === ShadowGenerator.FILTER_PCSS) {
                    // If we don't use depth clamping, we must define minZ so that all shadow casters are in the cascade frustum
                    viewMinZ = Math.min(viewMinZ, castersViewMinZ);

                    if (this.filter !== ShadowGenerator.FILTER_PCSS) {
                        // We do not need the actual distance between the currently shaded pixel and the occluder when generating shadows, so we can lower the far plane to increase the accuracy of the shadow map.
                        viewMaxZ = Math.min(viewMaxZ, castersViewMaxZ);
                    }
                } else {
                    // If we use depth clamping (but not PCSS!), we can adjust minZ/maxZ to reduce the range [minZ, maxZ] (and obtain additional precision in the shadow map)
                    viewMaxZ = Math.min(viewMaxZ, castersViewMaxZ);

                    // Thanks to depth clamping, casters won't be Z clipped even if they fall outside the [-1,1] range, so we can move the near plane to 0 if castersViewMinZ < 0.
                    // We will generate negative Z values in the shadow map, but that's okay (they will be clamped to the 0..1 range anyway), except in PCSS case
                    // where we need the actual distance between the currently shader pixel and the occluder: that's why we don't use depth clamping in PCSS case.
                    viewMinZ = Math.max(viewMinZ, castersViewMinZ);

                    // If all the casters are behind the near plane of the cascade, minZ = 0 due to the previous line, and maxZ < 0 at this point.
                    // We need to make sure that maxZ > minZ, so in this case we set maxZ a little higher than minZ. As we are using depth clamping, the casters won't be Z clipped, so we just need to make sure that we have a valid Z range for the cascade.
                    // Having a 0 range is not ok, due to undefined behavior in the calculation in this case.
                    viewMaxZ = Math.max(viewMinZ + 1.0, viewMaxZ);
                }
            }

            Matrix.OrthoOffCenterLHToRef(
                this._cascadeMinExtents[cascadeIndex].x,
                this._cascadeMaxExtents[cascadeIndex].x,
                this._cascadeMinExtents[cascadeIndex].y,
                this._cascadeMaxExtents[cascadeIndex].y,
                useReverseDepthBuffer ? viewMaxZ : viewMinZ,
                useReverseDepthBuffer ? viewMinZ : viewMaxZ,
                this._projectionMatrices[cascadeIndex],
                scene.getEngine().isNDCHalfZRange
            );

            this._cascadeMinExtents[cascadeIndex].z = viewMinZ;
            this._cascadeMaxExtents[cascadeIndex].z = viewMaxZ;

            this._viewMatrices[cascadeIndex].multiplyToRef(this._projectionMatrices[cascadeIndex], this._transformMatrices[cascadeIndex]);

            // Create the rounding matrix, by projecting the world-space origin and determining
            // the fractional offset in texel space
            Vector3.TransformCoordinatesToRef(ZeroVec, this._transformMatrices[cascadeIndex], Tmpv1); // tmpv1 = shadowOrigin
            Tmpv1.scaleInPlace(this._mapSize / 2);

            Tmpv2.copyFromFloats(Math.round(Tmpv1.x), Math.round(Tmpv1.y), Math.round(Tmpv1.z)); // tmpv2 = roundedOrigin
            Tmpv2.subtractInPlace(Tmpv1).scaleInPlace(2 / this._mapSize); // tmpv2 = roundOffset

            Matrix.TranslationToRef(Tmpv2.x, Tmpv2.y, 0.0, TmpMatrix);

            this._projectionMatrices[cascadeIndex].multiplyToRef(TmpMatrix, this._projectionMatrices[cascadeIndex]);
            this._viewMatrices[cascadeIndex].multiplyToRef(this._projectionMatrices[cascadeIndex], this._transformMatrices[cascadeIndex]);

            this._transformMatrices[cascadeIndex].copyToArray(this._transformMatricesAsArray, cascadeIndex * 16);
        }
    }

    // Get the 8 points of the view frustum in world space
    private _computeFrustumInWorldSpace(cascadeIndex: number): void {
        const camera = this._getCamera();
        if (!camera) {
            return;
        }

        const prevSplitDist = this._cascades[cascadeIndex].prevBreakDistance,
            splitDist = this._cascades[cascadeIndex].breakDistance;

        const isNDCHalfZRange = this._scene.getEngine().isNDCHalfZRange;

        camera.getViewMatrix(); // make sure the transformation matrix we get when calling 'getTransformationMatrix()' is calculated with an up to date view matrix

        const cameraInfiniteFarPlane = camera.maxZ === 0;
        const saveCameraMaxZ = camera.maxZ;

        if (cameraInfiniteFarPlane) {
            camera.maxZ = this._shadowMaxZ;
            camera.getProjectionMatrix(true);
        }

        const invViewProj = Matrix.Invert(camera.getTransformationMatrix());

        if (cameraInfiniteFarPlane) {
            camera.maxZ = saveCameraMaxZ;
            camera.getProjectionMatrix(true);
        }

        const cornerIndexOffset = this._scene.getEngine().useReverseDepthBuffer ? 4 : 0;
        for (let cornerIndex = 0; cornerIndex < CascadedShadowGenerator._FrustumCornersNdcSpace.length; ++cornerIndex) {
            Tmpv1.copyFrom(CascadedShadowGenerator._FrustumCornersNdcSpace[(cornerIndex + cornerIndexOffset) % CascadedShadowGenerator._FrustumCornersNdcSpace.length]);
            if (isNDCHalfZRange && Tmpv1.z === -1) {
                Tmpv1.z = 0;
            }
            Vector3.TransformCoordinatesToRef(Tmpv1, invViewProj, this._frustumCornersWorldSpace[cascadeIndex][cornerIndex]);
        }

        // Get the corners of the current cascade slice of the view frustum
        for (let cornerIndex = 0; cornerIndex < CascadedShadowGenerator._FrustumCornersNdcSpace.length / 2; ++cornerIndex) {
            Tmpv1.copyFrom(this._frustumCornersWorldSpace[cascadeIndex][cornerIndex + 4]).subtractInPlace(this._frustumCornersWorldSpace[cascadeIndex][cornerIndex]);
            Tmpv2.copyFrom(Tmpv1).scaleInPlace(prevSplitDist); // near corner ray
            Tmpv1.scaleInPlace(splitDist); // far corner ray

            Tmpv1.addInPlace(this._frustumCornersWorldSpace[cascadeIndex][cornerIndex]);

            this._frustumCornersWorldSpace[cascadeIndex][cornerIndex + 4].copyFrom(Tmpv1);
            this._frustumCornersWorldSpace[cascadeIndex][cornerIndex].addInPlace(Tmpv2);
        }
    }

    private _computeCascadeFrustum(cascadeIndex: number): void {
        this._cascadeMinExtents[cascadeIndex].copyFromFloats(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cascadeMaxExtents[cascadeIndex].copyFromFloats(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        this._frustumCenter[cascadeIndex].copyFromFloats(0, 0, 0);

        const camera = this._getCamera();

        if (!camera) {
            return;
        }

        // Calculate the centroid of the view frustum slice
        for (let cornerIndex = 0; cornerIndex < this._frustumCornersWorldSpace[cascadeIndex].length; ++cornerIndex) {
            this._frustumCenter[cascadeIndex].addInPlace(this._frustumCornersWorldSpace[cascadeIndex][cornerIndex]);
        }

        this._frustumCenter[cascadeIndex].scaleInPlace(1 / this._frustumCornersWorldSpace[cascadeIndex].length);

        if (this.stabilizeCascades) {
            // Calculate the radius of a bounding sphere surrounding the frustum corners
            let sphereRadius = 0;
            for (let cornerIndex = 0; cornerIndex < this._frustumCornersWorldSpace[cascadeIndex].length; ++cornerIndex) {
                const dist = this._frustumCornersWorldSpace[cascadeIndex][cornerIndex].subtractToRef(this._frustumCenter[cascadeIndex], Tmpv1).length();
                sphereRadius = Math.max(sphereRadius, dist);
            }

            sphereRadius = Math.ceil(sphereRadius * 16) / 16;

            this._cascadeMaxExtents[cascadeIndex].copyFromFloats(sphereRadius, sphereRadius, sphereRadius);
            this._cascadeMinExtents[cascadeIndex].copyFromFloats(-sphereRadius, -sphereRadius, -sphereRadius);
        } else {
            // Create a temporary view matrix for the light
            const lightCameraPos = this._frustumCenter[cascadeIndex];

            this._frustumCenter[cascadeIndex].addToRef(this._lightDirection, Tmpv1); // tmpv1 = look at

            Matrix.LookAtLHToRef(lightCameraPos, Tmpv1, UpDir, TmpMatrix); // matrix = lightView

            // Calculate an AABB around the frustum corners
            for (let cornerIndex = 0; cornerIndex < this._frustumCornersWorldSpace[cascadeIndex].length; ++cornerIndex) {
                Vector3.TransformCoordinatesToRef(this._frustumCornersWorldSpace[cascadeIndex][cornerIndex], TmpMatrix, Tmpv1);

                this._cascadeMinExtents[cascadeIndex].minimizeInPlace(Tmpv1);
                this._cascadeMaxExtents[cascadeIndex].maximizeInPlace(Tmpv1);
            }
        }
    }

    protected _recreateSceneUBOs(): void {
        this._disposeSceneUBOs();
        if (this._sceneUBOs) {
            for (let i = 0; i < this._numCascades; ++i) {
                this._sceneUBOs.push(this._scene.createSceneUniformBuffer(`Scene for CSM Shadow Generator (light "${this._light.name}" cascade #${i})`));
            }
        }
    }

    /**
     *  Support test.
     */
    public static get IsSupported(): boolean {
        const engine = EngineStore.LastCreatedEngine;
        if (!engine) {
            return false;
        }
        return engine._features.supportCSM;
    }

    /**
     * @internal
     */
    public static override _SceneComponentInitialization: (scene: Scene) => void = (_) => {
        throw _WarnImport("ShadowGeneratorSceneComponent");
    };

    /**
     * Creates a Cascaded Shadow Generator object.
     * A ShadowGenerator is the required tool to use the shadows.
     * Each directional light casting shadows needs to use its own ShadowGenerator.
     * Documentation : https://doc.babylonjs.com/babylon101/cascadedShadows
     * @param mapSize The size of the texture what stores the shadows. Example : 1024.
     * @param light The directional light object generating the shadows.
     * @param usefulFloatFirst By default the generator will try to use half float textures but if you need precision (for self shadowing for instance), you can use this option to enforce full float texture.
     * @param camera Camera associated with this shadow generator (default: null). If null, takes the scene active camera at the time we need to access it
     * @param useRedTextureType Forces the generator to use a Red instead of a RGBA type for the shadow map texture format (default: true)
     */
    constructor(mapSize: number, light: DirectionalLight, usefulFloatFirst?: boolean, camera?: Nullable<Camera>, useRedTextureType = true) {
        if (!CascadedShadowGenerator.IsSupported) {
            Logger.Error("CascadedShadowMap is not supported by the current engine.");
            return;
        }

        super(mapSize, light, usefulFloatFirst, camera, useRedTextureType);

        this.usePercentageCloserFiltering = true;

        this._onRenderDepthRendererObserver = this._scene.onBeforeRenderObservable.add(() => {
            const depthRenderer = this._depthReducer?.depthRenderer;
            if (this._scene.frameGraph && depthRenderer && this._autoCalcDepthBounds) {
                const depthMap = depthRenderer.getDepthMap();
                if (!depthMap.renderList) {
                    depthMap.renderList = this._scene.meshes;
                }
                this._scene._renderRenderTarget(depthMap, this._camera);
                this._scene.activeCamera = null;
            }
        });
    }

    protected override _initializeGenerator(): void {
        this.penumbraDarkness = this.penumbraDarkness ?? 1.0;
        this._numCascades = this._numCascades ?? CascadedShadowGenerator.DEFAULT_CASCADES_COUNT;
        this.stabilizeCascades = this.stabilizeCascades ?? false;
        this._freezeShadowCastersBoundingInfoObservable = this._freezeShadowCastersBoundingInfoObservable ?? null;
        this.freezeShadowCastersBoundingInfo = this.freezeShadowCastersBoundingInfo ?? false;
        this._scbiMin = this._scbiMin ?? new Vector3(0, 0, 0);
        this._scbiMax = this._scbiMax ?? new Vector3(0, 0, 0);
        this._shadowCastersBoundingInfo = this._shadowCastersBoundingInfo ?? new BoundingInfo(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        this._breaksAreDirty = this._breaksAreDirty ?? true;
        this._minDistance = this._minDistance ?? 0;
        this._maxDistance = this._maxDistance ?? 1;
        this._currentLayer = this._currentLayer ?? 0;
        this._shadowMaxZ = this._shadowMaxZ ?? this._getCamera()?.maxZ ?? 10000;
        this._debug = this._debug ?? false;
        this._depthClamp = this._depthClamp ?? true;
        this._cascadeBlendPercentage = this._cascadeBlendPercentage ?? 0.1;
        this._lambda = this._lambda ?? 0.5;
        this._autoCalcDepthBounds = this._autoCalcDepthBounds ?? false;

        this._recreateSceneUBOs();

        super._initializeGenerator();
    }

    protected override _createTargetRenderTexture(): void {
        const engine = this._scene.getEngine();
        const size = { width: this._mapSize, height: this._mapSize, layers: this.numCascades };
        this._shadowMap = new RenderTargetTexture(
            this._light.name + "_CSMShadowMap",
            size,
            this._scene,
            false,
            true,
            this._textureType,
            false,
            undefined,
            false,
            false,
            undefined,
            this._useRedTextureType ? Constants.TEXTUREFORMAT_RED : Constants.TEXTUREFORMAT_RGBA
        );
        this._shadowMap.createDepthStencilTexture(
            engine.useReverseDepthBuffer ? Constants.GREATER : Constants.LESS,
            true,
            undefined,
            undefined,
            undefined,
            `DepthStencilForCSMShadowGenerator-${this._light.name}`
        );
        this._shadowMap.noPrePassRenderer = true;
    }

    protected override _initializeShadowMap(): void {
        super._initializeShadowMap();

        if (this._shadowMap === null) {
            return;
        }

        this._transformMatricesAsArray = new Float32Array(this._numCascades * 16);
        this._viewSpaceFrustumsZ = new Array(this._numCascades);
        this._frustumLengths = new Array(this._numCascades);
        this._lightSizeUVCorrection = new Array(this._numCascades * 2);
        this._depthCorrection = new Array(this._numCascades);

        this._cascades = [];
        this._viewMatrices = [];
        this._projectionMatrices = [];
        this._transformMatrices = [];
        this._cascadeMinExtents = [];
        this._cascadeMaxExtents = [];
        this._frustumCenter = [];
        this._shadowCameraPos = [];
        this._frustumCornersWorldSpace = [];

        for (let cascadeIndex = 0; cascadeIndex < this._numCascades; ++cascadeIndex) {
            this._cascades[cascadeIndex] = {
                prevBreakDistance: 0,
                breakDistance: 0,
            };

            this._viewMatrices[cascadeIndex] = Matrix.Zero();
            this._projectionMatrices[cascadeIndex] = Matrix.Zero();
            this._transformMatrices[cascadeIndex] = Matrix.Zero();
            this._cascadeMinExtents[cascadeIndex] = new Vector3();
            this._cascadeMaxExtents[cascadeIndex] = new Vector3();
            this._frustumCenter[cascadeIndex] = new Vector3();
            this._shadowCameraPos[cascadeIndex] = new Vector3();
            this._frustumCornersWorldSpace[cascadeIndex] = new Array(CascadedShadowGenerator._FrustumCornersNdcSpace.length);

            for (let i = 0; i < CascadedShadowGenerator._FrustumCornersNdcSpace.length; ++i) {
                this._frustumCornersWorldSpace[cascadeIndex][i] = new Vector3();
            }
        }

        const engine = this._scene.getEngine();

        this._shadowMap.onBeforeBindObservable.clear();
        this._shadowMap.onBeforeRenderObservable.clear();

        this._shadowMap.onBeforeRenderObservable.add((layer: number) => {
            if (this._sceneUBOs) {
                this._scene.setSceneUniformBuffer(this._sceneUBOs[layer]);
            }
            this._currentLayer = layer;
            if (this._filter === ShadowGenerator.FILTER_PCF) {
                engine.setColorWrite(false);
            }
            this._scene.setTransformMatrix(this.getCascadeViewMatrix(layer)!, this.getCascadeProjectionMatrix(layer)!);
            if (this._useUBO) {
                this._scene.getSceneUniformBuffer().unbindEffect();
                this._scene.finalizeSceneUbo();
            }
        });

        this._shadowMap.onBeforeBindObservable.add(() => {
            this._currentSceneUBO = this._scene.getSceneUniformBuffer();
            engine._debugPushGroup?.(`cascaded shadow map generation for pass id ${engine.currentRenderPassId}`, 1);
            if (this._breaksAreDirty) {
                this._splitFrustum();
            }
            this._computeMatrices();
        });

        this._splitFrustum();
    }

    protected override _bindCustomEffectForRenderSubMeshForShadowMap(subMesh: SubMesh, effect: Effect): void {
        effect.setMatrix("viewProjection", this.getCascadeTransformMatrix(this._currentLayer)!);
    }

    protected override _isReadyCustomDefines(defines: any): void {
        defines.push("#define SM_DEPTHCLAMP " + (this._depthClamp && this._filter !== ShadowGenerator.FILTER_PCSS ? "1" : "0"));
    }

    /**
     * Prepare all the defines in a material relying on a shadow map at the specified light index.
     * @param defines Defines of the material we want to update
     * @param lightIndex Index of the light in the enabled light list of the material
     */
    public override prepareDefines(defines: any, lightIndex: number): void {
        super.prepareDefines(defines, lightIndex);

        const scene = this._scene;
        const light = this._light;

        if (!scene.shadowsEnabled || !light.shadowEnabled) {
            return;
        }

        defines["SHADOWCSM" + lightIndex] = true;
        defines["SHADOWCSMDEBUG" + lightIndex] = this.debug;
        defines["SHADOWCSMNUM_CASCADES" + lightIndex] = this.numCascades;
        defines["SHADOWCSM_RIGHTHANDED" + lightIndex] = scene.useRightHandedSystem;

        const camera = this._getCamera();

        if (camera && this._shadowMaxZ <= (camera.maxZ || this._shadowMaxZ)) {
            defines["SHADOWCSMUSESHADOWMAXZ" + lightIndex] = true;
        }

        if (this.cascadeBlendPercentage === 0) {
            defines["SHADOWCSMNOBLEND" + lightIndex] = true;
        }
    }

    /**
     * Binds the shadow related information inside of an effect (information like near, far, darkness...
     * defined in the generator but impacting the effect).
     * @param lightIndex Index of the light in the enabled light list of the material owning the effect
     * @param effect The effect we are binfing the information for
     */
    public override bindShadowLight(lightIndex: string, effect: Effect): void {
        const light = this._light;
        const scene = this._scene;

        if (!scene.shadowsEnabled || !light.shadowEnabled) {
            return;
        }

        const camera = this._getCamera();
        if (!camera) {
            return;
        }

        const shadowMap = this.getShadowMap();
        if (!shadowMap) {
            return;
        }

        const width = shadowMap.getSize().width;

        effect.setMatrices("lightMatrix" + lightIndex, this._transformMatricesAsArray);
        effect.setArray("viewFrustumZ" + lightIndex, this._viewSpaceFrustumsZ);
        effect.setFloat("cascadeBlendFactor" + lightIndex, this.cascadeBlendPercentage === 0 ? 10000 : 1 / this.cascadeBlendPercentage);
        effect.setArray("frustumLengths" + lightIndex, this._frustumLengths);

        // Only PCF uses depth stencil texture.
        if (this._filter === ShadowGenerator.FILTER_PCF) {
            effect.setDepthStencilTexture("shadowTexture" + lightIndex, shadowMap);
            light._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), width, 1 / width, this.frustumEdgeFalloff, lightIndex);
        } else if (this._filter === ShadowGenerator.FILTER_PCSS) {
            for (let cascadeIndex = 0; cascadeIndex < this._numCascades; ++cascadeIndex) {
                this._lightSizeUVCorrection[cascadeIndex * 2 + 0] =
                    cascadeIndex === 0
                        ? 1
                        : (this._cascadeMaxExtents[0].x - this._cascadeMinExtents[0].x) / (this._cascadeMaxExtents[cascadeIndex].x - this._cascadeMinExtents[cascadeIndex].x); // x correction
                this._lightSizeUVCorrection[cascadeIndex * 2 + 1] =
                    cascadeIndex === 0
                        ? 1
                        : (this._cascadeMaxExtents[0].y - this._cascadeMinExtents[0].y) / (this._cascadeMaxExtents[cascadeIndex].y - this._cascadeMinExtents[cascadeIndex].y); // y correction
                this._depthCorrection[cascadeIndex] =
                    cascadeIndex === 0
                        ? 1
                        : (this._cascadeMaxExtents[cascadeIndex].z - this._cascadeMinExtents[cascadeIndex].z) / (this._cascadeMaxExtents[0].z - this._cascadeMinExtents[0].z);
            }
            effect.setDepthStencilTexture("shadowTexture" + lightIndex, shadowMap);
            effect.setTexture("depthTexture" + lightIndex, shadowMap);

            effect.setArray2("lightSizeUVCorrection" + lightIndex, this._lightSizeUVCorrection);
            effect.setArray("depthCorrection" + lightIndex, this._depthCorrection);
            effect.setFloat("penumbraDarkness" + lightIndex, this.penumbraDarkness);
            light._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), 1 / width, this._contactHardeningLightSizeUVRatio * width, this.frustumEdgeFalloff, lightIndex);
        } else {
            effect.setTexture("shadowTexture" + lightIndex, shadowMap);
            light._uniformBuffer.updateFloat4("shadowsInfo", this.getDarkness(), width, 1 / width, this.frustumEdgeFalloff, lightIndex);
        }

        light._uniformBuffer.updateFloat2(
            "depthValues",
            this.getLight().getDepthMinZ(camera),
            this.getLight().getDepthMinZ(camera) + this.getLight().getDepthMaxZ(camera),
            lightIndex
        );
    }

    /**
     * Gets the transformation matrix of the first cascade used to project the meshes into the map from the light point of view.
     * (eq to view projection * shadow projection matrices)
     * @returns The transform matrix used to create the shadow map
     */
    public override getTransformMatrix(): Matrix {
        return this.getCascadeTransformMatrix(0)!;
    }

    /**
     * Disposes the ShadowGenerator.
     * Returns nothing.
     */
    public override dispose(): void {
        super.dispose();

        this._scene.onBeforeRenderObservable.remove(this._onRenderDepthRendererObserver);

        if (this._freezeShadowCastersBoundingInfoObservable) {
            this._scene.onBeforeRenderObservable.remove(this._freezeShadowCastersBoundingInfoObservable);
            this._freezeShadowCastersBoundingInfoObservable = null;
        }

        if (this._depthReducer) {
            this._depthReducer.dispose();
            this._depthReducer = null;
        }
    }

    /**
     * Serializes the shadow generator setup to a json object.
     * @returns The serialized JSON object
     */
    public override serialize(): any {
        const serializationObject: any = super.serialize();
        const shadowMap = this.getShadowMap();

        if (!shadowMap) {
            return serializationObject;
        }

        serializationObject.numCascades = this._numCascades;
        serializationObject.debug = this._debug;
        serializationObject.stabilizeCascades = this.stabilizeCascades;
        serializationObject.lambda = this._lambda;
        serializationObject.cascadeBlendPercentage = this.cascadeBlendPercentage;
        serializationObject.depthClamp = this._depthClamp;
        serializationObject.autoCalcDepthBounds = this.autoCalcDepthBounds;
        serializationObject.shadowMaxZ = this._shadowMaxZ;
        serializationObject.penumbraDarkness = this.penumbraDarkness;

        serializationObject.freezeShadowCastersBoundingInfo = this._freezeShadowCastersBoundingInfo;
        serializationObject.minDistance = this.minDistance;
        serializationObject.maxDistance = this.maxDistance;

        serializationObject.renderList = [];
        if (shadowMap.renderList) {
            for (let meshIndex = 0; meshIndex < shadowMap.renderList.length; meshIndex++) {
                const mesh = shadowMap.renderList[meshIndex];

                serializationObject.renderList.push(mesh.id);
            }
        }

        return serializationObject;
    }

    /**
     * Parses a serialized ShadowGenerator and returns a new ShadowGenerator.
     * @param parsedShadowGenerator The JSON object to parse
     * @param scene The scene to create the shadow map for
     * @returns The parsed shadow generator
     */
    public static override Parse(parsedShadowGenerator: any, scene: Scene): ShadowGenerator {
        const shadowGenerator = ShadowGenerator.Parse(
            parsedShadowGenerator,
            scene,
            (mapSize: number, light: IShadowLight, camera: Nullable<Camera>) => new CascadedShadowGenerator(mapSize, <DirectionalLight>light, undefined, camera)
        ) as CascadedShadowGenerator;

        if (parsedShadowGenerator.numCascades !== undefined) {
            shadowGenerator.numCascades = parsedShadowGenerator.numCascades;
        }

        if (parsedShadowGenerator.debug !== undefined) {
            shadowGenerator.debug = parsedShadowGenerator.debug;
        }

        if (parsedShadowGenerator.stabilizeCascades !== undefined) {
            shadowGenerator.stabilizeCascades = parsedShadowGenerator.stabilizeCascades;
        }

        if (parsedShadowGenerator.lambda !== undefined) {
            shadowGenerator.lambda = parsedShadowGenerator.lambda;
        }

        if (parsedShadowGenerator.cascadeBlendPercentage !== undefined) {
            shadowGenerator.cascadeBlendPercentage = parsedShadowGenerator.cascadeBlendPercentage;
        }

        if (parsedShadowGenerator.depthClamp !== undefined) {
            shadowGenerator.depthClamp = parsedShadowGenerator.depthClamp;
        }

        if (parsedShadowGenerator.autoCalcDepthBounds !== undefined) {
            shadowGenerator.autoCalcDepthBounds = parsedShadowGenerator.autoCalcDepthBounds;
        }

        if (parsedShadowGenerator.shadowMaxZ !== undefined) {
            shadowGenerator.shadowMaxZ = parsedShadowGenerator.shadowMaxZ;
        }

        if (parsedShadowGenerator.penumbraDarkness !== undefined) {
            shadowGenerator.penumbraDarkness = parsedShadowGenerator.penumbraDarkness;
        }

        if (parsedShadowGenerator.freezeShadowCastersBoundingInfo !== undefined) {
            shadowGenerator.freezeShadowCastersBoundingInfo = parsedShadowGenerator.freezeShadowCastersBoundingInfo;
        }

        if (parsedShadowGenerator.minDistance !== undefined && parsedShadowGenerator.maxDistance !== undefined) {
            shadowGenerator.setMinMaxDistance(parsedShadowGenerator.minDistance, parsedShadowGenerator.maxDistance);
        }

        return shadowGenerator;
    }
}
