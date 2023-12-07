import * as React from "react";

import type { Observable } from "core/Misc/observable";
import type { DefaultRenderingPipeline } from "core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { DepthOfFieldEffectBlurLevel } from "core/PostProcesses/depthOfFieldEffect";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { CommonRenderingPipelinePropertyGridComponent } from "./commonRenderingPipelinePropertyGridComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { OptionsLineComponent } from "shared-ui-components/lines/optionsLineComponent";
import { ImageProcessingConfiguration } from "core/Materials/imageProcessingConfiguration";
import { Color3LineComponent } from "shared-ui-components/lines/color3LineComponent";
import type { GlobalState } from "../../../../globalState";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { Vector2LineComponent } from "shared-ui-components/lines/vector2LineComponent";

interface IDefaultRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: DefaultRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class DefaultRenderingPipelinePropertyGridComponent extends React.Component<IDefaultRenderingPipelinePropertyGridComponentProps> {
    constructor(props: IDefaultRenderingPipelinePropertyGridComponentProps) {
        super(props);
    }

    render() {
        const renderPipeline = this.props.renderPipeline;

        const camera = renderPipeline.scene.activeCamera!;

        const toneMappingOptions = [
            { label: "标准", value: ImageProcessingConfiguration.TONEMAPPING_STANDARD },
            { label: "ACES", value: ImageProcessingConfiguration.TONEMAPPING_ACES },
        ];

        const vignetteModeOptions = [
            { label: "乘", value: ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY },
            { label: "不透明", value: ImageProcessingConfiguration.VIGNETTEMODE_OPAQUE },
        ];

        const depthOfFieldBlurOptions = [
            { label: "低", value: DepthOfFieldEffectBlurLevel.Low },
            { label: "中", value: DepthOfFieldEffectBlurLevel.Medium },
            { label: "高", value: DepthOfFieldEffectBlurLevel.High },
        ];

        return (
            <>
                <CommonRenderingPipelinePropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    renderPipeline={renderPipeline}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="绽放" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="bloomEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.bloomEnabled && (
                        <div>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="阈值"
                                minimum={0}
                                maximum={2.0}
                                step={0.01}
                                target={renderPipeline}
                                propertyName="bloomThreshold"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="重量"
                                minimum={0}
                                maximum={1}
                                step={0.05}
                                target={renderPipeline}
                                propertyName="bloomWeight"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="内核"
                                minimum={0}
                                maximum={128}
                                step={1}
                                target={renderPipeline}
                                propertyName="bloomKernel"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                decimalCount={0}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="规模"
                                minimum={0}
                                maximum={1}
                                step={0.25}
                                target={renderPipeline}
                                propertyName="bloomScale"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="色差" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="chromaticAberrationEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.chromaticAberrationEnabled && (
                        <div>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="畸变量"
                                minimum={0}
                                maximum={128}
                                step={0.1}
                                target={renderPipeline.chromaticAberration}
                                propertyName="aberrationAmount"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="径向强度"
                                minimum={0}
                                maximum={1}
                                step={0.01}
                                target={renderPipeline.chromaticAberration}
                                propertyName="radialIntensity"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Vector2LineComponent
                                lockObject={this.props.lockObject}
                                label="中心"
                                target={renderPipeline.chromaticAberration}
                                propertyName="centerPosition"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Vector2LineComponent
                                lockObject={this.props.lockObject}
                                label="方向"
                                target={renderPipeline.chromaticAberration}
                                propertyName="direction"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="景深" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="depthOfFieldEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.depthOfFieldEnabled && (
                        <div>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="焦距"
                                minimum={0}
                                maximum={camera.maxZ}
                                step={0.1}
                                target={renderPipeline.depthOfField}
                                propertyName="focalLength"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="fStop"
                                minimum={0}
                                maximum={32}
                                step={0.1}
                                target={renderPipeline.depthOfField}
                                propertyName="fStop"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="距离"
                                minimum={0}
                                maximum={camera.maxZ}
                                step={0.1}
                                target={renderPipeline.depthOfField}
                                propertyName="focusDistance"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="镜头尺寸"
                                minimum={0}
                                maximum={1000}
                                step={1}
                                target={renderPipeline.depthOfField}
                                propertyName="lensSize"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                decimalCount={0}
                            />
                            <OptionsLineComponent
                                label="模糊级别"
                                options={depthOfFieldBlurOptions}
                                target={renderPipeline}
                                propertyName="depthOfFieldBlurLevel"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ mode: value })}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="FXAA" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        propertyName="fxaaEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="发光层" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        propertyName="glowLayerEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.glowLayerEnabled && (
                        <div>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="模糊内核大小"
                                minimum={1}
                                maximum={128}
                                step={1}
                                decimalCount={0}
                                target={renderPipeline.glowLayer}
                                propertyName="blurKernelSize"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                minimum={0}
                                maximum={10}
                                step={0.1}
                                target={renderPipeline.glowLayer}
                                propertyName="intensity"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="粗糙" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="grainEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.grainEnabled && (
                        <div>
                            <CheckBoxLineComponent
                                label="动画"
                                target={renderPipeline.grain}
                                propertyName="animated"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="强度"
                                minimum={0}
                                maximum={50}
                                step={0.1}
                                target={renderPipeline.grain}
                                propertyName="intensity"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="图像处理" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="imageProcessingEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.imageProcessing && (
                        <div>
                            <ButtonLineComponent
                                label="将透明颜色转换为线性"
                                onClick={() =>
                                    (renderPipeline.scene.clearColor = renderPipeline.scene.clearColor.toLinearSpace(renderPipeline.scene.getEngine().useExactSrgbConversions))
                                }
                            />
                            <ButtonLineComponent
                                label="将透明颜色转换为伽马"
                                onClick={() =>
                                    (renderPipeline.scene.clearColor = renderPipeline.scene.clearColor.toGammaSpace(renderPipeline.scene.getEngine().useExactSrgbConversions))
                                }
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={4}
                                step={0.1}
                                label="对比"
                                target={renderPipeline.imageProcessing}
                                propertyName="contrast"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={4}
                                step={0.1}
                                label="曝光"
                                target={renderPipeline.imageProcessing}
                                propertyName="exposure"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <CheckBoxLineComponent
                                label="色调映射"
                                target={renderPipeline.imageProcessing}
                                propertyName="toneMappingEnabled"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <OptionsLineComponent
                                label="音调映射类型"
                                options={toneMappingOptions}
                                target={renderPipeline.imageProcessing}
                                propertyName="toneMappingType"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ mode: value })}
                            />
                            <CheckBoxLineComponent
                                label="装饰图案"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteEnabled"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={4}
                                step={0.1}
                                label="装饰图案的重量"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteWeight"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={1}
                                step={0.1}
                                label="装饰图案延伸"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteStretch"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={Math.PI}
                                step={0.1}
                                label="装饰图案视场"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteCameraFov"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={1}
                                step={0.1}
                                label="装饰图案中心 X"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteCenterX"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={1}
                                step={0.1}
                                label="装饰图案中心 Y"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteCenterY"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <Color3LineComponent
                                lockObject={this.props.lockObject}
                                label="装饰图案的颜色"
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteColor"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <OptionsLineComponent
                                label="装饰图案混合模式"
                                options={vignetteModeOptions}
                                target={renderPipeline.imageProcessing}
                                propertyName="vignetteBlendMode"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                onSelect={(value) => this.setState({ mode: value })}
                            />
                            <CheckBoxLineComponent
                                label="混色"
                                target={renderPipeline.imageProcessing}
                                propertyName="ditheringEnabled"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                minimum={0}
                                maximum={1}
                                step={0.5 / 255.0}
                                label="混色强度"
                                target={renderPipeline.imageProcessing}
                                propertyName="ditheringIntensity"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
                <LineContainerComponent title="锐化" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="启用"
                        target={renderPipeline}
                        onValueChanged={() => this.forceUpdate()}
                        propertyName="sharpenEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {renderPipeline.sharpenEnabled && (
                        <div>
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="颜色数量"
                                minimum={0}
                                maximum={1}
                                step={0.05}
                                target={renderPipeline.sharpen}
                                propertyName="colorAmount"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="边量"
                                minimum={0}
                                maximum={5}
                                step={0.05}
                                target={renderPipeline.sharpen}
                                propertyName="edgeAmount"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </div>
                    )}
                </LineContainerComponent>
            </>
        );
    }
}
