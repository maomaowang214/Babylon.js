import * as React from "react";

import type { Observable } from "core/Misc/observable";
import type { LensRenderingPipeline } from "core/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { CommonRenderingPipelinePropertyGridComponent } from "./commonRenderingPipelinePropertyGridComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import type { GlobalState } from "../../../../globalState";

interface ILenstRenderingPipelinePropertyGridComponentProps {
    globalState: GlobalState;
    renderPipeline: LensRenderingPipeline;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class LensRenderingPipelinePropertyGridComponent extends React.Component<ILenstRenderingPipelinePropertyGridComponentProps> {
    constructor(props: ILenstRenderingPipelinePropertyGridComponentProps) {
        super(props);
    }

    render() {
        const renderPipeline = this.props.renderPipeline;

        return (
            <>
                <CommonRenderingPipelinePropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    renderPipeline={renderPipeline}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="选项" selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="边缘模糊"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="edgeBlur"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="边缘失真"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="edgeDistortion"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="粗糙数量"
                        minimum={0}
                        maximum={1}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="grainAmount"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="色差"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="chromaticAberration"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="变暗失焦"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="darkenOutOfFocus"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="模糊噪点"
                        target={renderPipeline}
                        propertyName="blurNoise"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="景深" selection={this.props.globalState}>
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="孔径"
                        minimum={0}
                        maximum={10}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="dofAperture"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="失真"
                        minimum={0}
                        maximum={1000}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="dofDistortion"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="多边形焦外成像"
                        target={renderPipeline}
                        propertyName="pentagonBokeh"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="增加获取"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="highlightsGain"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="增加阈值"
                        minimum={0}
                        maximum={5}
                        step={0.1}
                        target={renderPipeline}
                        propertyName="highlightsThreshold"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
