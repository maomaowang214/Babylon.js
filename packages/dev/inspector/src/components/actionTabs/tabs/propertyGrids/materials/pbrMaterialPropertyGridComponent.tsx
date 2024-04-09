import * as React from "react";

import { Observable } from "core/Misc/observable";
import type { PBRMaterial } from "core/Materials/PBR/pbrMaterial";
import { Constants } from "core/Engines/constants";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { Color3LineComponent } from "shared-ui-components/lines/color3LineComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { OptionsLineComponent } from "shared-ui-components/lines/optionsLineComponent";
import { CommonMaterialPropertyGridComponent } from "./commonMaterialPropertyGridComponent";
import { TextureLinkLineComponent } from "../../../lines/textureLinkLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import { Vector2LineComponent } from "shared-ui-components/lines/vector2LineComponent";

import "core/Materials/material.decalMap";
import "core/Rendering/prePassRendererSceneComponent";
import "core/Rendering/subSurfaceSceneComponent";

interface IPBRMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: PBRMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

/**
 * @internal
 */
export class PBRMaterialPropertyGridComponent extends React.Component<IPBRMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable = new Observable<TextureLinkLineComponent>();
    constructor(props: IPBRMaterialPropertyGridComponentProps) {
        super(props);
    }

    switchAmbientMode(state: boolean) {
        this.props.material.debugMode = state ? 21 : 0;
    }

    renderTextures(onDebugSelectionChangeObservable: Observable<TextureLinkLineComponent>) {
        const material = this.props.material;

        return (
            <LineContainerComponent title="CHANNELS" selection={this.props.globalState}>
                <TextureLinkLineComponent
                    label="Albedo"
                    texture={material.albedoTexture}
                    propertyName="albedoTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Metallic Roughness"
                    texture={material.metallicTexture}
                    propertyName="metallicTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Reflection"
                    texture={material.reflectionTexture}
                    propertyName="reflectionTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Refraction"
                    texture={material.refractionTexture}
                    propertyName="refractionTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Reflectivity"
                    texture={material.reflectivityTexture}
                    propertyName="reflectivityTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Micro-surface"
                    texture={material.microSurfaceTexture}
                    propertyName="microSurfaceTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Bump"
                    texture={material.bumpTexture}
                    propertyName="bumpTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Emissive"
                    texture={material.emissiveTexture}
                    propertyName="emissiveTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Opacity"
                    texture={material.opacityTexture}
                    propertyName="opacityTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    customDebugAction={(state) => this.switchAmbientMode(state)}
                    label="Ambient"
                    texture={material.ambientTexture}
                    propertyName="ambientTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Lightmap"
                    texture={material.lightmapTexture}
                    propertyName="lightmapTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="Detailmap"
                    texture={material.detailMap.texture}
                    material={material}
                    onTextureCreated={(texture) => (material.detailMap.texture = texture)}
                    onTextureRemoved={() => (material.detailMap.texture = null)}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <CheckBoxLineComponent
                    label="Use lightmap as shadowmap"
                    target={material}
                    propertyName="useLightmapAsShadowmap"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <CheckBoxLineComponent
                    label="Use detailmap"
                    target={material.detailMap}
                    propertyName="isEnabled"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                {material.decalMap && (
                    <CheckBoxLineComponent
                        label="Use decalmap"
                        target={material.decalMap}
                        propertyName="isEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                )}
            </LineContainerComponent>
        );
    }

    render() {
        const material = this.props.material;

        const debugMode = [
            { label: "None", value: 0 },
            // Geometry
            { label: "标准化位置", value: 1 },
            { label: "法线", value: 2 },
            { label: "切线", value: 3 },
            { label: "双切线", value: 4 },
            { label: "凹凸法线", value: 5 },
            { label: "UV1", value: 6 },
            { label: "UV2", value: 7 },
            { label: "漆法线", value: 8 },
            { label: "漆切线", value: 9 },
            { label: "漆 双切线", value: 10 },
            { label: "各向异性法线", value: 11 },
            { label: "各向异性切线", value: 12 },
            { label: "各向异性双切线", value: 13 },
            // Maps
            { label: "反照率图", value: 20 },
            { label: "环境图", value: 21 },
            { label: "不透明图", value: 22 },
            { label: "放射性图", value: 23 },
            { label: "光照图", value: 24 },
            { label: "金属图", value: 25 },
            { label: "反射率图", value: 26 },
            { label: "漆图", value: 27 },
            { label: "漆色彩图", value: 28 },
            { label: "光泽图", value: 29 },
            { label: "各向异性图", value: 30 },
            { label: "厚度图", value: 31 },
            { label: "凹凸图", value: 32 },
            // Env
            { label: "环境折射", value: 40 },
            { label: "环境反射", value: 41 },
            { label: "环境漆", value: 42 },
            // Lighting
            { label: "直接漫反射", value: 50 },
            { label: "直接镜面反射", value: 51 },
            { label: "直接漆", value: 52 },
            { label: "直接光泽", value: 53 },
            { label: "环境辐照度", value: 54 },
            // Lighting Params
            { label: "表面反照率", value: 60 },
            { label: "反射系数 0", value: 61 },
            { label: "金属", value: 62 },
            { label: "金属 F0", value: 71 },
            { label: "粗糙度", value: 63 },
            { label: "阿尔法G", value: 64 },
            { label: "金标法V", value: 65 },
            { label: "实验确定的颜色", value: 66 },
            { label: "实验确定粗糙度", value: 67 },
            { label: "实验确定金标法V", value: 68 },
            { label: "透光率", value: 69 },
            { label: "折射透光率", value: 70 },
            { label: "光泽度", value: 72 },
            { label: "基本色", value: 73 },
            { label: "高光颜色", value: 74 },
            { label: "放射性的颜色", value: 75 },
            // Misc
            { label: "搜索引擎优化", value: 80 },
            { label: "边缘谐波振荡", value: 81 },
            { label: "能量因数", value: 82 },
            { label: "镜面反射率", value: 83 },
            { label: "漆反射率", value: 84 },
            { label: "光泽反射", value: 85 },
            { label: "阿尔法亮度", value: 86 },
            { label: "阿尔法", value: 87 },
            { label: "反照率阿尔法", value: 88 },
        ];

        const realTimeFilteringQualityOptions = [
            { label: "低", value: Constants.TEXTURE_FILTERING_QUALITY_LOW },
            { label: "中", value: Constants.TEXTURE_FILTERING_QUALITY_MEDIUM },
            { label: "高", value: Constants.TEXTURE_FILTERING_QUALITY_HIGH },
        ];

        (material.sheen as any)._useRoughness = (material.sheen as any)._useRoughness ?? material.sheen.roughness !== null;
        material.sheen.roughness = material.sheen.roughness ?? (material.sheen as any)._saveRoughness ?? 0;

        if (!(material.sheen as any)._useRoughness) {
            (material.sheen as any)._saveRoughness = material.sheen.roughness;
            material.sheen.roughness = null;
        }

        return (
            <>
                <CommonMaterialPropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    material={material}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                {this.renderTextures(this._onDebugSelectionChangeObservable)}
                <LineContainerComponent title="灯光 & 颜色" selection={this.props.globalState}>
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="反照率"
                        target={material}
                        propertyName="albedoColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="反射率"
                        target={material}
                        propertyName="reflectivityColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="微观表面"
                        target={material}
                        propertyName="microSurface"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="放射性"
                        target={material}
                        propertyName="emissiveColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="环境光"
                        target={material}
                        propertyName="ambientColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />
                    <CheckBoxLineComponent
                        label="使用物理光衰减"
                        target={material}
                        propertyName="usePhysicalLightFalloff"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="金属的工作流程" selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="金属"
                        target={material}
                        propertyName="metallic"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="粗糙度"
                        target={material}
                        propertyName="roughness"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="折射率"
                        target={material}
                        propertyName="indexOfRefraction"
                        minimum={1}
                        maximum={3}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="F0 因素"
                        target={material}
                        propertyName="metallicF0Factor"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="反射的颜色"
                        target={material}
                        propertyName="metallicReflectanceColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />
                    <CheckBoxLineComponent
                        label="只使用来自金属反射纹理的金属"
                        target={material}
                        propertyName="useOnlyMetallicFromMetallicReflectanceTexture"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <TextureLinkLineComponent
                        label="金属反射纹理"
                        texture={material.metallicReflectanceTexture}
                        onTextureCreated={(texture) => (material.metallicReflectanceTexture = texture)}
                        onTextureRemoved={() => (material.metallicReflectanceTexture = null)}
                        material={material}
                        onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                        onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                    />
                    <TextureLinkLineComponent
                        label="反射结构"
                        texture={material.reflectanceTexture}
                        onTextureCreated={(texture) => (material.reflectanceTexture = texture)}
                        onTextureRemoved={() => (material.reflectanceTexture = null)}
                        material={material}
                        onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                        onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="漆" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={material.clearCoat}
                        propertyName="isEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.clearCoat.isEnabled && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.clearCoat}
                                propertyName="intensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="粗糙度"
                                target={material.clearCoat}
                                propertyName="roughness"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="折射率"
                                target={material.clearCoat}
                                propertyName="indexOfRefraction"
                                minimum={1.0}
                                maximum={3}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="重新映射 F0"
                                target={material.clearCoat}
                                propertyName="remapF0OnInterfaceChange"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <TextureLinkLineComponent
                                label="漆"
                                texture={material.clearCoat.texture}
                                onTextureCreated={(texture) => (material.clearCoat.texture = texture)}
                                onTextureRemoved={() => (material.clearCoat.texture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <TextureLinkLineComponent
                                label="粗糙度"
                                texture={material.clearCoat.textureRoughness}
                                onTextureCreated={(texture) => (material.clearCoat.textureRoughness = texture)}
                                onTextureRemoved={() => (material.clearCoat.textureRoughness = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <TextureLinkLineComponent
                                label="凹凸"
                                texture={material.clearCoat.bumpTexture}
                                onTextureCreated={(texture) => (material.clearCoat.bumpTexture = texture)}
                                onTextureRemoved={() => (material.clearCoat.bumpTexture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            {material.clearCoat.bumpTexture && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="凹凸强度"
                                    target={material.clearCoat.bumpTexture}
                                    propertyName="level"
                                    minimum={0}
                                    maximum={2}
                                    step={0.01}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                            <CheckBoxLineComponent
                                label="使用主纹理的粗糙度"
                                target={material.clearCoat}
                                propertyName="useRoughnessFromMainTexture"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="色调"
                                target={material.clearCoat}
                                propertyName="isTintEnabled"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            {material.clearCoat.isEnabled && material.clearCoat.isTintEnabled && (
                                <Color3LineComponent
                                    lockObject={this.props.lockObject}
                                    label="颜色"
                                    target={material.clearCoat}
                                    propertyName="tintColor"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                    isLinear={true}
                                />
                            )}
                            {material.clearCoat.isEnabled && material.clearCoat.isTintEnabled && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="远距离"
                                    target={material.clearCoat}
                                    propertyName="tintColorAtDistance"
                                    minimum={0}
                                    maximum={20}
                                    step={0.1}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                            {material.clearCoat.isEnabled && material.clearCoat.isTintEnabled && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="色彩厚度"
                                    target={material.clearCoat}
                                    propertyName="tintThickness"
                                    minimum={0}
                                    maximum={20}
                                    step={0.1}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                            {material.clearCoat.isEnabled && material.clearCoat.isTintEnabled && (
                                <TextureLinkLineComponent
                                    label="色彩"
                                    texture={material.clearCoat.tintTexture}
                                    onTextureCreated={(texture) => (material.clearCoat.tintTexture = texture)}
                                    onTextureRemoved={() => (material.clearCoat.tintTexture = null)}
                                    material={material}
                                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                    onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                                />
                            )}
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="渐变色" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={material.iridescence}
                        propertyName="isEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.iridescence.isEnabled && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.iridescence}
                                propertyName="intensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="折射率"
                                target={material.iridescence}
                                propertyName="indexOfRefraction"
                                minimum={1.0}
                                maximum={3}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="最小厚度"
                                target={material.iridescence}
                                propertyName="minimumThickness"
                                minimum={0}
                                maximum={1000}
                                step={10}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="最大厚度"
                                target={material.iridescence}
                                propertyName="maximumThickness"
                                minimum={0}
                                maximum={1000}
                                step={10}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <TextureLinkLineComponent
                                label="彩虹色"
                                texture={material.iridescence.texture}
                                onTextureCreated={(texture) => (material.iridescence.texture = texture)}
                                onTextureRemoved={() => (material.iridescence.texture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <TextureLinkLineComponent
                                label="厚度"
                                texture={material.iridescence.thicknessTexture}
                                onTextureCreated={(texture) => (material.iridescence.thicknessTexture = texture)}
                                onTextureRemoved={() => (material.iridescence.thicknessTexture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="各向异性" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={material.anisotropy}
                        propertyName="isEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.anisotropy.isEnabled && (
                        <div className="fragment">
                            <CheckBoxLineComponent
                                label="传统模式"
                                target={material.anisotropy}
                                propertyName="legacy"
                                onValueChanged={() => this.forceUpdate()}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.anisotropy}
                                propertyName="intensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Vector2LineComponent
                                lockObject={this.props.lockObject}
                                label="方向"
                                target={material.anisotropy}
                                propertyName="direction"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <TextureLinkLineComponent
                                label="各向异性"
                                texture={material.anisotropy.texture}
                                onTextureCreated={(texture) => (material.anisotropy.texture = texture)}
                                onTextureRemoved={() => (material.anisotropy.texture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="光泽" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={material.sheen}
                        propertyName="isEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.sheen.isEnabled && (
                        <div className="fragment">
                            <CheckBoxLineComponent
                                label="链接到反照度"
                                target={material.sheen}
                                propertyName="linkSheenWithAlbedo"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.sheen}
                                propertyName="intensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Color3LineComponent
                                lockObject={this.props.lockObject}
                                label="颜色"
                                target={material.sheen}
                                propertyName="color"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                isLinear={true}
                            />
                            <TextureLinkLineComponent
                                label="光泽度"
                                texture={material.sheen.texture}
                                onTextureCreated={(texture) => (material.sheen.texture = texture)}
                                onTextureRemoved={() => (material.sheen.texture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <TextureLinkLineComponent
                                label="粗糙度"
                                texture={material.sheen.textureRoughness}
                                onTextureCreated={(texture) => (material.sheen.textureRoughness = texture)}
                                onTextureRemoved={() => (material.sheen.textureRoughness = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <CheckBoxLineComponent label="使用粗糙度" target={material.sheen} propertyName="_useRoughness" />
                            {(material.sheen as any)._useRoughness && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="粗糙度"
                                    target={material.sheen}
                                    propertyName="roughness"
                                    minimum={0}
                                    maximum={1}
                                    step={0.01}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                            <CheckBoxLineComponent
                                label="使用主纹理的粗糙度"
                                target={material.sheen}
                                propertyName="useRoughnessFromMainTexture"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="反照率比例"
                                target={material.sheen}
                                propertyName="albedoScaling"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="次表面" selection={this.props.globalState}>
                    <TextureLinkLineComponent
                        label="厚度"
                        texture={material.subSurface.thicknessTexture}
                        onTextureCreated={(texture) => (material.subSurface.thicknessTexture = texture)}
                        onTextureRemoved={() => (material.subSurface.thicknessTexture = null)}
                        material={material}
                        onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                        onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最小厚度"
                        target={material.subSurface}
                        propertyName="minimumThickness"
                        minimum={0}
                        maximum={10}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最大厚度"
                        target={material.subSurface}
                        propertyName="maximumThickness"
                        minimum={0}
                        maximum={10}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="厚度遮罩"
                        target={material.subSurface}
                        propertyName="useMaskFromThicknessTexture"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="glTF-Style 纹理"
                        target={material.subSurface}
                        propertyName="useGltfStyleTextures"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="使用厚度作为深度"
                        target={material.subSurface}
                        propertyName="useThicknessAsDepth"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="色调"
                        target={material.subSurface}
                        propertyName="tintColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        isLinear={true}
                    />

                    <CheckBoxLineComponent
                        label="光散射启用"
                        target={material.subSurface}
                        propertyName="isScatteringEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {(material.subSurface as any).isScatteringEnabled && material.getScene().prePassRenderer && material.getScene().subSurfaceConfiguration && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="单位米数"
                                target={material.getScene().subSurfaceConfiguration!}
                                propertyName="metersPerUnit"
                                minimum={0.01}
                                maximum={2}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                    <CheckBoxLineComponent
                        label="已启用折射"
                        target={material.subSurface}
                        propertyName="isRefractionEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.subSurface.isRefractionEnabled && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.subSurface}
                                propertyName="refractionIntensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <TextureLinkLineComponent
                                label="折射强度"
                                texture={material.subSurface.refractionIntensityTexture}
                                onTextureCreated={(texture) => (material.subSurface.refractionIntensityTexture = texture)}
                                onTextureRemoved={() => (material.subSurface.refractionIntensityTexture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <TextureLinkLineComponent
                                label="折射"
                                texture={material.subSurface.refractionTexture}
                                onTextureCreated={(texture) => (material.subSurface.refractionTexture = texture)}
                                onTextureRemoved={() => (material.subSurface.refractionTexture = null)}
                                material={material}
                                onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                                onDebugSelectionChangeObservable={this._onDebugSelectionChangeObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="体积折射率"
                                target={material.subSurface}
                                propertyName="volumeIndexOfRefraction"
                                minimum={1}
                                maximum={3}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="远距离着色"
                                target={material.subSurface}
                                propertyName="tintColorAtDistance"
                                minimum={0}
                                maximum={10}
                                step={0.1}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="将折射与透明度联系起来"
                                target={material.subSurface}
                                propertyName="linkRefractionWithTransparency"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="使用反照率着色表面透明度"
                                target={material.subSurface}
                                propertyName="useAlbedoToTintRefraction"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}

                    <CheckBoxLineComponent
                        label="Dispersion Enabled"
                        target={material.subSurface}
                        propertyName="isDispersionEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.subSurface.isDispersionEnabled && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="Intensity"
                                target={material.subSurface}
                                propertyName="dispersion"
                                minimum={0}
                                maximum={5}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                    <CheckBoxLineComponent
                        label="Translucency Enabled"
                        target={material.subSurface}
                        propertyName="isTranslucencyEnabled"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.subSurface.isTranslucencyEnabled && (
                        <div className="fragment">
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                target={material.subSurface}
                                propertyName="translucencyIntensity"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Color3LineComponent
                                lockObject={this.props.lockObject}
                                label="扩散距离"
                                target={material.subSurface}
                                propertyName="diffusionDistance"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                isLinear={true}
                            />
                            <CheckBoxLineComponent
                                label="使用反照率着色表面半透明"
                                target={material.subSurface}
                                propertyName="useAlbedoToTintTranslucency"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="标准" closed={true} selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="环境"
                        target={material}
                        propertyName="environmentIntensity"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="镜面"
                        target={material}
                        propertyName="specularIntensity"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="发射"
                        target={material}
                        propertyName="emissiveIntensity"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="直接"
                        target={material}
                        propertyName="directIntensity"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {material.bumpTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="撞击的力量"
                            target={material.bumpTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.ambientTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="环境的力量"
                            target={material}
                            propertyName="ambientTextureStrength"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.reflectionTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="反射强度"
                            target={material.reflectionTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.clearCoat.texture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="漆"
                            target={material.clearCoat.texture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.clearCoat.bumpTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="凹凸漆"
                            target={material.clearCoat.bumpTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.clearCoat.tintTexture && false /* level is not used for the clear coat tint texture */ && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="漆色调"
                            target={material.clearCoat.tintTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.anisotropy.texture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="各向异性"
                            target={material.anisotropy.texture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.sheen.texture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="光泽"
                            target={material.sheen.texture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.subSurface.thicknessTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="厚度"
                            target={material.subSurface.thicknessTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.subSurface.refractionTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="折射"
                            target={material.subSurface.refractionTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.detailMap.isEnabled && (
                        <>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="详细漫反射图"
                                target={material.detailMap}
                                propertyName="diffuseBlendLevel"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="详细凹凸图"
                                target={material.detailMap}
                                propertyName="bumpLevel"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="详细粗糙图"
                                target={material.detailMap}
                                propertyName="roughnessBlendLevel"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="抹灰" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="来自反照率的阿尔法"
                        target={material}
                        propertyName="useAlphaFromAlbedoTexture"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="灰度环境光"
                        target={material}
                        propertyName="useAmbientInGrayScale"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="阿尔法上的辐射"
                        target={material}
                        propertyName="useRadianceOverAlpha"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="参考图阿尔法的微观表面"
                        target={material}
                        propertyName="useMicroSurfaceFromReflectivityMapAlpha"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="阿尔法上的镜面反射"
                        target={material}
                        propertyName="useSpecularOverAlpha"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="镜面反射抗锯齿"
                        target={material}
                        propertyName="enableSpecularAntiAliasing"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="实时筛选"
                        target={material}
                        propertyName="realTimeFiltering"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <OptionsLineComponent
                        allowNullValue={true}
                        label="实时过滤质量"
                        options={realTimeFilteringQualityOptions}
                        target={material}
                        propertyName="realTimeFilteringQuality"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="法线贴图" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent label="反转X轴" target={material} propertyName="invertNormalMapX" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <CheckBoxLineComponent label="反转Y轴" target={material} propertyName="invertNormalMapY" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                </LineContainerComponent>
                <LineContainerComponent title="高级" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="节能"
                        target={material.brdf}
                        propertyName="useEnergyConservation"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="球面谐波"
                        target={material.brdf}
                        propertyName="useSphericalHarmonics"
                        onValueChanged={() => this.forceUpdate()}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="辐射遮挡"
                        target={material}
                        propertyName="useRadianceOcclusion"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="地平线遮挡 "
                        target={material}
                        propertyName="useHorizonOcclusion"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent label="熄灭" target={material} propertyName="unlit" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                </LineContainerComponent>
                <LineContainerComponent title="调试" closed={true} selection={this.props.globalState}>
                    <OptionsLineComponent label="调试模式" options={debugMode} target={material} propertyName="debugMode" />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="分裂的位置"
                        target={material}
                        propertyName="debugLimit"
                        minimum={-1}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="输出的因素"
                        target={material}
                        propertyName="debugFactor"
                        minimum={0}
                        maximum={5}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
