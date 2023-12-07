import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { CommonRenderingPipelinePropertyGridComponent } from "./commonRenderingPipelinePropertyGridComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import type { SSAO2RenderingPipeline } from "core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline";
import type { GlobalState } from "../../../../globalState";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";

interface ISSAO2RenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: SSAO2RenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class SSAO2RenderingPipelinePropertyGridComponent extends React.Component<ISSAO2RenderingPipelinePropertyGridComponentProps> {
    constructor(props: ISSAO2RenderingPipelinePropertyGridComponentProps) {
        super(props);
    }

    render() {
        const renderPipeline = this.props.renderPipeline;

        const camera = renderPipeline.scene.activeCamera!;

        return (
            <>
                <CommonRenderingPipelinePropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    renderPipeline={renderPipeline}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="SSAO" selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="强度"
                        minimum={0}
                        maximum={2}
                        step={0.05}
                        target={renderPipeline}
                        propertyName="totalStrength"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="基础"
                        minimum={0}
                        maximum={1}
                        step={0.05}
                        target={renderPipeline}
                        propertyName="base"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最大 Z"
                        minimum={0}
                        maximum={camera.maxZ}
                        step={1}
                        target={renderPipeline}
                        propertyName="maxZ"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="最小Z向"
                        minimum={0}
                        maximum={0.5}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="minZAspect"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="半径"
                        minimum={0}
                        maximum={10}
                        step={0.05}
                        target={renderPipeline}
                        propertyName="radius"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="Epsilon"
                        minimum={0}
                        maximum={1}
                        step={0.001}
                        target={renderPipeline}
                        propertyName="epsilon"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="消除干扰">
                    <CheckBoxLineComponent
                        label="绕过模糊"
                        propertyName="bypassBlur"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        target={renderPipeline}
                    />
                    <CheckBoxLineComponent
                        label="昂贵的模糊"
                        propertyName="expensiveBlur"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        target={renderPipeline}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="案例"
                        minimum={2}
                        maximum={32}
                        step={1}
                        target={renderPipeline}
                        propertyName="bilateralSamples"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="软化"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="bilateralSoften"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="宽容"
                        minimum={0}
                        maximum={1}
                        step={0.01}
                        target={renderPipeline}
                        propertyName="bilateralTolerance"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
