import * as React from "react";

import type { Observable } from "core/Misc/observable";
import { Material } from "core/Materials/material";
import { PBRMaterial } from "core/Materials/PBR/pbrMaterial";
import { Constants } from "core/Engines/constants";
import { Engine } from "core/Engines/engine";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import { OptionsLineComponent, Null_Value } from "shared-ui-components/lines/optionsLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import { CustomPropertyGridComponent } from "../customPropertyGridComponent";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { TextInputLineComponent } from "shared-ui-components/lines/textInputLineComponent";
import { AnimationGridComponent } from "../animations/animationPropertyGridComponent";
import { HexLineComponent } from "shared-ui-components/lines/hexLineComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";

interface ICommonMaterialPropertyGridComponentProps {
    globalState: GlobalState;
    material: Material;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class CommonMaterialPropertyGridComponent extends React.Component<ICommonMaterialPropertyGridComponentProps> {
    constructor(props: ICommonMaterialPropertyGridComponentProps) {
        super(props);
    }

    render() {
        const material = this.props.material;

        material.depthFunction = material.depthFunction ?? 0;

        const orientationOptions = [
            { label: "顺时针", value: Material.ClockWiseSideOrientation },
            { label: "逆时针", value: Material.CounterClockWiseSideOrientation },
        ];

        const transparencyModeOptions = [
            { label: "<未定义>", value: Null_Value },
            { label: "不透明", value: PBRMaterial.PBRMATERIAL_OPAQUE },
            { label: "Alpha测试", value: PBRMaterial.PBRMATERIAL_ALPHATEST },
            { label: "Alpha混合", value: PBRMaterial.PBRMATERIAL_ALPHABLEND },
            { label: "Alpha混合和测试", value: PBRMaterial.PBRMATERIAL_ALPHATESTANDBLEND },
        ];

        const alphaModeOptions = [
            { label: "融合", value: Constants.ALPHA_COMBINE },
            { label: "一对一", value: Constants.ALPHA_ONEONE },
            { label: "加", value: Constants.ALPHA_ADD },
            { label: "减", value: Constants.ALPHA_SUBTRACT },
            { label: "乘", value: Constants.ALPHA_MULTIPLY },
            { label: "最大", value: Constants.ALPHA_MAXIMIZED },
            { label: "预相乘", value: Constants.ALPHA_PREMULTIPLIED },
        ];

        const depthfunctionOptions = [
            { label: "<引擎默认值>", value: 0 },
            { label: "绝不", value: Engine.NEVER },
            { label: "常用", value: Engine.ALWAYS },
            { label: "相等", value: Engine.EQUAL },
            { label: "小于", value: Engine.LESS },
            { label: "小于或等于", value: Engine.LEQUAL },
            { label: "大于", value: Engine.GREATER },
            { label: "大于或等于", value: Engine.GEQUAL },
            { label: "不等于", value: Engine.NOTEQUAL },
        ];

        const stencilFunctionOptions = [
            { label: "绝不", value: Constants.NEVER },
            { label: "常用", value: Constants.ALWAYS },
            { label: "相等", value: Constants.EQUAL },
            { label: "小于", value: Constants.LESS },
            { label: "小于或等于", value: Constants.LEQUAL },
            { label: "大于", value: Constants.GREATER },
            { label: "大于或等于", value: Constants.GEQUAL },
            { label: "不等于", value: Constants.NOTEQUAL },
        ];

        const stencilOperationOptions = [
            { label: "保持活力", value: Constants.KEEP },
            { label: "调校到0", value: Constants.ZERO },
            { label: "更替", value: Constants.REPLACE },
            { label: "增加", value: Constants.INCR },
            { label: "减少", value: Constants.DECR },
            { label: "倒置", value: Constants.INVERT },
            { label: "增加包装", value: Constants.INCR_WRAP },
            { label: "减少包装", value: Constants.DECR_WRAP },
        ];

        return (
            <div>
                <CustomPropertyGridComponent
                    globalState={this.props.globalState}
                    target={material}
                    lockObject={this.props.lockObject}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextLineComponent label="ID" value={material.id} />
                    <TextInputLineComponent
                        lockObject={this.props.lockObject}
                        label="名称"
                        target={material}
                        propertyName="name"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <TextLineComponent label="唯一 ID" value={material.uniqueId.toString()} />
                    <TextLineComponent label="类型" value={material.getClassName()} />
                    <CheckBoxLineComponent
                        label="隐面消除"
                        target={material}
                        propertyName="backFaceCulling"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <OptionsLineComponent
                        label="朝向"
                        options={orientationOptions}
                        target={material}
                        propertyName="sideOrientation"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        onSelect={(value) => this.setState({ mode: value })}
                    />
                    <CheckBoxLineComponent
                        label="禁用照明"
                        target={material}
                        propertyName="disableLighting"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="禁用颜色写入"
                        target={material}
                        propertyName="disableColorWrite"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="禁用深度写入"
                        target={material}
                        propertyName="disableDepthWrite"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <OptionsLineComponent
                        label="深度函数"
                        options={depthfunctionOptions}
                        target={material}
                        propertyName="depthFunction"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        onSelect={(value) => this.setState({ depthFunction: value })}
                    />
                    <CheckBoxLineComponent
                        label="需要深度预处理"
                        target={material}
                        propertyName="needDepthPrePass"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent label="线框" target={material} propertyName="wireframe" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <CheckBoxLineComponent label="点云" target={material} propertyName="pointsCloud" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="点的大小"
                        target={material}
                        propertyName="pointSize"
                        minimum={0}
                        maximum={100}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="Z-偏移因子"
                        target={material}
                        propertyName="zOffset"
                        minimum={-10}
                        maximum={10}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="Z-偏移单位"
                        target={material}
                        propertyName="zOffsetUnits"
                        minimum={-10}
                        maximum={10}
                        step={0.1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <ButtonLineComponent
                        label="删除"
                        onClick={() => {
                            material.dispose();
                            this.props.globalState.onSelectionChangedObservable.notifyObservers(null);
                        }}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="透明度" selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="阿尔法"
                        target={material}
                        propertyName="alpha"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {(material as any).transparencyMode !== undefined && (
                        <OptionsLineComponent
                            allowNullValue={true}
                            label="透明模式"
                            options={transparencyModeOptions}
                            target={material}
                            propertyName="transparencyMode"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            onSelect={(value) => this.setState({ transparencyMode: value })}
                        />
                    )}
                    <OptionsLineComponent
                        label="阿尔法模式"
                        options={alphaModeOptions}
                        target={material}
                        propertyName="alphaMode"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        onSelect={(value) => this.setState({ alphaMode: value })}
                    />
                    {(material as any).diffuseTexture && (
                        <CheckBoxLineComponent
                            label="漫反射纹理具有阿尔法"
                            target={(material as any).diffuseTexture}
                            propertyName="hasAlpha"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {(material as any).useAlphaFromDiffuseTexture !== undefined && (
                        <CheckBoxLineComponent
                            label="使用漫反射纹理的阿尔法"
                            target={material}
                            propertyName="useAlphaFromDiffuseTexture"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {(material as any).albedoTexture && (
                        <CheckBoxLineComponent
                            label="反照率纹理有阿尔法"
                            target={(material as any).albedoTexture}
                            propertyName="hasAlpha"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {(material as any).useAlphaFromAlbedoTexture !== undefined && (
                        <CheckBoxLineComponent
                            label="使用来自反照率纹理的阿尔法"
                            target={material}
                            propertyName="useAlphaFromAlbedoTexture"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    <CheckBoxLineComponent
                        label="单独的筛选通道"
                        target={material}
                        propertyName="separateCullingPass"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                {material.stencil && (
                    <>
                        <LineContainerComponent title="模板" selection={this.props.globalState}>
                            <CheckBoxLineComponent
                                label="激活"
                                target={material.stencil}
                                propertyName="enabled"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <HexLineComponent
                                isInteger
                                lockObject={this.props.lockObject}
                                label="面罩"
                                target={material.stencil}
                                propertyName="mask"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <OptionsLineComponent
                                label="函数"
                                options={stencilFunctionOptions}
                                target={material.stencil}
                                propertyName="func"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ stencilFunction: value })}
                            />
                            <FloatLineComponent
                                isInteger
                                lockObject={this.props.lockObject}
                                label="参考函数"
                                target={material.stencil}
                                propertyName="funcRef"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <HexLineComponent
                                isInteger
                                lockObject={this.props.lockObject}
                                label="函数掩码"
                                target={material.stencil}
                                propertyName="funcMask"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <OptionsLineComponent
                                label="模板失效"
                                options={stencilOperationOptions}
                                target={material.stencil}
                                propertyName="opStencilFail"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ opStencilFail: value })}
                            />
                            <OptionsLineComponent
                                label="操作深度失败"
                                options={stencilOperationOptions}
                                target={material.stencil}
                                propertyName="opDepthFail"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ opDepthFail: value })}
                            />
                            <OptionsLineComponent
                                label="操作模板+深度通道"
                                options={stencilOperationOptions}
                                target={material.stencil}
                                propertyName="opStencilDepthPass"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ opStencilDepthPass: value })}
                            />
                        </LineContainerComponent>
                    </>
                )}
                <AnimationGridComponent globalState={this.props.globalState} animatable={material} scene={material.getScene()} lockObject={this.props.lockObject} />
            </div>
        );
    }
}
