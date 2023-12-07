import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import type { SSRRenderingPipeline } from "core/PostProcesses/RenderPipeline/Pipelines/ssrRenderingPipeline";
import type { GlobalState } from "../../../../globalState";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { TextureLinkLineComponent } from "../../../lines/textureLinkLineComponent";

interface ISSRRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: SSRRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class SSRRenderingPipelinePropertyGridComponent extends React.Component<ISSRRenderingPipelinePropertyGridComponentProps> {
    constructor(props: ISSRRenderingPipelinePropertyGridComponentProps) {
        super(props);
    }

    render() {
        const renderPipeline = this.props.renderPipeline;

        return (
            <>
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextLineComponent label="名称" value={renderPipeline.name} />
                    <TextLineComponent label="类型" value={renderPipeline.getClassName()} />
                </LineContainerComponent>
                <LineContainerComponent title="SSR" selection={this.props.globalState}>
                    <CheckBoxLineComponent label="启用" target={renderPipeline} propertyName="isEnabled" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <CheckBoxLineComponent label="调试" target={renderPipeline} propertyName="debug" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="强度"
                        minimum={0}
                        maximum={5}
                        step={0.05}
                        target={renderPipeline}
                        propertyName="strength"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="反射指数"
                        minimum={0}
                        maximum={5}
                        step={0.05}
                        target={renderPipeline}
                        propertyName="reflectionSpecularFalloffExponent"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="反射率阈值"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="reflectivityThreshold"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="厚度"
                        minimum={0}
                        maximum={10}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="thickness"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="步骤"
                        minimum={1}
                        maximum={50}
                        step={1}
                        target={renderPipeline}
                        propertyName="step"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="光滑的反射"
                        target={renderPipeline}
                        propertyName="enableSmoothReflections"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最大步骤"
                        minimum={1}
                        maximum={3000}
                        step={10}
                        target={renderPipeline}
                        propertyName="maxSteps"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最大距离"
                        minimum={1}
                        maximum={3000}
                        step={10}
                        target={renderPipeline}
                        propertyName="maxDistance"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="粗糙度因素"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="roughnessFactor"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="自碰撞跳闸"
                        minimum={1}
                        maximum={10}
                        step={1}
                        target={renderPipeline}
                        propertyName="selfCollisionNumSkip"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="SSR 下采样"
                        minimum={0}
                        maximum={5}
                        step={1}
                        target={renderPipeline}
                        propertyName="ssrDownsample"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="夹到截锥体上"
                        target={renderPipeline}
                        propertyName="clipToFrustum"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <LineContainerComponent title="自动厚度计算" selection={this.props.globalState}>
                        <CheckBoxLineComponent
                            label="启用"
                            target={renderPipeline}
                            propertyName="enableAutomaticThicknessComputation"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="强制写入透明"
                            target={renderPipeline}
                            propertyName="backfaceForceDepthWriteTransparentMeshes"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="下采样"
                            minimum={0}
                            maximum={5}
                            step={1}
                            target={renderPipeline}
                            propertyName="backfaceDepthTextureDownsample"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="模糊" selection={this.props.globalState}>
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="强度"
                            minimum={0}
                            maximum={0.15}
                            step={0.001}
                            target={renderPipeline}
                            propertyName="blurDispersionStrength"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="下采样"
                            minimum={0}
                            maximum={5}
                            step={1}
                            target={renderPipeline}
                            propertyName="blurDownsample"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="衰减" selection={this.props.globalState}>
                        <CheckBoxLineComponent
                            label="屏幕边界"
                            target={renderPipeline}
                            propertyName="attenuateScreenBorders"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="距离"
                            target={renderPipeline}
                            propertyName="attenuateIntersectionDistance"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="步迭代"
                            target={renderPipeline}
                            propertyName="attenuateIntersectionIterations"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="面对镜头"
                            target={renderPipeline}
                            propertyName="attenuateFacingCamera"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="沿墙反射"
                            target={renderPipeline}
                            propertyName="attenuateBackfaceReflection"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="环境" selection={this.props.globalState}>
                        <TextureLinkLineComponent
                            label="立方体"
                            texture={renderPipeline.environmentTexture}
                            propertyName="environmentTexture"
                            texturedObject={renderPipeline}
                            fileFormats=".dds"
                            cubeOnly={true}
                        />
                        <CheckBoxLineComponent
                            label="探针"
                            target={renderPipeline}
                            propertyName="environmentTextureIsProbe"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="颜色空间" selection={this.props.globalState}>
                        <CheckBoxLineComponent
                            label="输入在空间中"
                            target={renderPipeline}
                            propertyName="inputTextureColorIsInGammaSpace"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="输出到空间"
                            target={renderPipeline}
                            propertyName="generateOutputInGammaSpace"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    </LineContainerComponent>
                </LineContainerComponent>
            </>
        );
    }
}
