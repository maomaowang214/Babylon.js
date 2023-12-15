import * as React from "react";
import type { FreeCamera } from "core/Cameras/freeCamera";
import type { Observable } from "core/Misc/observable";
import { CommonCameraPropertyGridComponent } from "./commonCameraPropertyGridComponent";
import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { Vector3LineComponent } from "shared-ui-components/lines/vector3LineComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";

interface IFreeCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: FreeCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class FreeCameraPropertyGridComponent extends React.Component<IFreeCameraPropertyGridComponentProps> {
    constructor(props: IFreeCameraPropertyGridComponentProps) {
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
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="坐标"
                        target={camera}
                        propertyName="position"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="旋转"
                        noSlider={true}
                        useEuler={this.props.globalState.onlyUseEulers}
                        target={camera}
                        propertyName="rotation"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="控制" closed={true} selection={this.props.globalState}>
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="角度灵敏度"
                        target={camera}
                        propertyName="angularSensibility"
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
                    <CheckBoxLineComponent label="施加重力" target={camera} propertyName="applyGravity" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="椭圆体"
                        target={camera}
                        propertyName="ellipsoid"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="椭球体偏移"
                        target={camera}
                        propertyName="ellipsoidOffset"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
