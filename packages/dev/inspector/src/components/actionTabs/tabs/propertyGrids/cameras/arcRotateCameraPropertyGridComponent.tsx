import * as React from "react";

import type { ArcRotateCamera } from "core/Cameras/arcRotateCamera";
import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { CommonCameraPropertyGridComponent } from "./commonCameraPropertyGridComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { Vector3LineComponent } from "shared-ui-components/lines/vector3LineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";

interface IArcRotateCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: ArcRotateCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class ArcRotateCameraPropertyGridComponent extends React.Component<IArcRotateCameraPropertyGridComponentProps> {
    constructor(props: IArcRotateCameraPropertyGridComponentProps) {
        super(props);
    }

    render() {
        const camera = this.props.camera;

        return (
            <>
                <CommonCameraPropertyGridComponent
                    globalState={this.props.globalState}
                    lockObject={this.props.lockObject}
                    camera={camera}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="变换" selection={this.props.globalState}>
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="目标"
                        target={camera}
                        propertyName="target"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="Alpha"
                        useEuler={this.props.globalState.onlyUseEulers}
                        target={camera}
                        propertyName="alpha"
                        minimum={camera.lowerAlphaLimit || 0}
                        maximum={camera.upperAlphaLimit || 2 * Math.PI}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="试用版"
                        useEuler={this.props.globalState.onlyUseEulers}
                        target={camera}
                        propertyName="beta"
                        minimum={camera.lowerAlphaLimit || 0}
                        maximum={camera.upperBetaLimit || 2 * Math.PI}
                        step={0.01}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="半径"
                        target={camera}
                        propertyName="radius"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="控制" closed={true} selection={this.props.globalState}>
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="角度灵敏度 X"
                        target={camera}
                        propertyName="angularSensibilityX"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="角度灵敏度 Y"
                        target={camera}
                        propertyName="angularSensibilityY"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="平移灵敏度"
                        target={camera}
                        propertyName="panningSensibility"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="捏合增量百分比"
                        target={camera}
                        propertyName="pinchDeltaPercentage"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="车轮增量百分比"
                        target={camera}
                        propertyName="wheelDeltaPercentage"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="速度"
                        target={camera}
                        propertyName="speed"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="碰撞" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="检查碰撞"
                        target={camera}
                        propertyName="checkCollisions"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="碰撞半径"
                        target={camera}
                        propertyName="collisionRadius"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="限制" closed={true} selection={this.props.globalState}>
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="alpha 下限"
                        target={camera}
                        propertyName="lowerAlphaLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="alpha 上限"
                        target={camera}
                        propertyName="upperAlphaLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="beta 下限"
                        target={camera}
                        propertyName="lowerBetaLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="beta 上限"
                        target={camera}
                        propertyName="upperBetaLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="半径下限"
                        target={camera}
                        propertyName="lowerRadiusLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="半径上限"
                        target={camera}
                        propertyName="upperRadiusLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="行为" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="自动旋转"
                        target={camera}
                        propertyName="useAutoRotationBehavior"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="弹跳"
                        target={camera}
                        propertyName="useBouncingBehavior"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent label="框架" target={camera} propertyName="useFramingBehavior" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                </LineContainerComponent>
            </>
        );
    }
}
