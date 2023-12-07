import * as React from "react";

import { Observable } from "core/Misc/observable";
import type { StandardMaterial } from "core/Materials/standardMaterial";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { Color3LineComponent } from "shared-ui-components/lines/color3LineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { CommonMaterialPropertyGridComponent } from "./commonMaterialPropertyGridComponent";
import { TextureLinkLineComponent } from "../../../lines/textureLinkLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";

import "core/Materials/material.decalMap";

interface IStandardMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: StandardMaterial;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class StandardMaterialPropertyGridComponent extends React.Component<IStandardMaterialPropertyGridComponentProps> {
    private _onDebugSelectionChangeObservable = new Observable<TextureLinkLineComponent>();

    constructor(props: IStandardMaterialPropertyGridComponentProps) {
        super(props);
    }

    renderTextures() {
        const material = this.props.material;

        const onDebugSelectionChangeObservable = this._onDebugSelectionChangeObservable;

        return (
            <LineContainerComponent title="纹理" selection={this.props.globalState}>
                <TextureLinkLineComponent
                    label="扩散"
                    texture={material.diffuseTexture}
                    propertyName="diffuseTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="镜面"
                    texture={material.specularTexture}
                    propertyName="specularTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="反射"
                    texture={material.reflectionTexture}
                    propertyName="reflectionTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="折射"
                    texture={material.refractionTexture}
                    propertyName="refractionTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="发射"
                    texture={material.emissiveTexture}
                    propertyName="emissiveTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="凹凸"
                    texture={material.bumpTexture}
                    propertyName="bumpTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="透明度"
                    texture={material.opacityTexture}
                    propertyName="opacityTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="环境"
                    texture={material.ambientTexture}
                    propertyName="ambientTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="光线映射"
                    texture={material.lightmapTexture}
                    propertyName="lightmapTexture"
                    material={material}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <TextureLinkLineComponent
                    label="细节图"
                    texture={material.detailMap.texture}
                    material={material}
                    onTextureCreated={(texture) => (material.detailMap.texture = texture)}
                    onTextureRemoved={() => (material.detailMap.texture = null)}
                    onSelectionChangedObservable={this.props.onSelectionChangedObservable}
                    onDebugSelectionChangeObservable={onDebugSelectionChangeObservable}
                />
                <CheckBoxLineComponent
                    label="使用光照贴图作为阴影贴图"
                    target={material}
                    propertyName="useLightmapAsShadowmap"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <CheckBoxLineComponent
                    label="使用细节图"
                    target={material.detailMap}
                    propertyName="isEnabled"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                {material.decalMap && (
                    <CheckBoxLineComponent
                        label="使用贴花贴图"
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

        return (
            <>
                <CommonMaterialPropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    material={material}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                {this.renderTextures()}
                <LineContainerComponent title="灯光 & 颜色" selection={this.props.globalState}>
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="漫反射"
                        target={material}
                        propertyName="diffuseColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="高光贴图"
                        target={material}
                        propertyName="specularColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="高光强度"
                        target={material}
                        propertyName="specularPower"
                        minimum={0}
                        maximum={128}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="发射"
                        target={material}
                        propertyName="emissiveColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        label="环境"
                        target={material}
                        propertyName="ambientColor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="在阿尔法上使用镜面反射"
                        target={material}
                        propertyName="useSpecularOverAlpha"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="标准" closed={true} selection={this.props.globalState}>
                    {material.diffuseTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="漫反射级别"
                            target={material.diffuseTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.specularTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="高光级别"
                            target={material.specularTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.reflectionTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="反射级别"
                            target={material.reflectionTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.refractionTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="折射级别"
                            target={material.refractionTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.emissiveTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="发射级别"
                            target={material.emissiveTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.bumpTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="凹凸级别"
                            target={material.bumpTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.opacityTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="透明度级别"
                            target={material.opacityTexture}
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
                            label="环境级别"
                            target={material.ambientTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.lightmapTexture && (
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="光线映射级别"
                            target={material.lightmapTexture}
                            propertyName="level"
                            minimum={0}
                            maximum={2}
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {material.detailMap.isEnabled && (
                        <>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="细节图扩散"
                                target={material.detailMap}
                                propertyName="diffuseBlendLevel"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="细节图凹凸"
                                target={material.detailMap}
                                propertyName="bumpLevel"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="法线贴图" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="反转X轴"
                        target={material}
                        propertyName="invertNormalMapX"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="反转Y轴"
                        target={material}
                        propertyName="invertNormalMapY"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
