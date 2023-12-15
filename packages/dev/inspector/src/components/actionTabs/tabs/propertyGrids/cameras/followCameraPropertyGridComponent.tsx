import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { CommonCameraPropertyGridComponent } from "./commonCameraPropertyGridComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import type { FollowCamera } from "core/Cameras/followCamera";

interface IFollowCameraPropertyGridComponentProps {
    globalState: GlobalState;
    camera: FollowCamera;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class FollowCameraPropertyGridComponent extends React.Component<IFollowCameraPropertyGridComponentProps> {
    constructor(props: IFollowCameraPropertyGridComponentProps) {
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
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="半径"
                        target={camera}
                        propertyName="radius"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="旋转偏移"
                        target={camera}
                        propertyName="rotationOffset"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="高度偏移"
                        target={camera}
                        propertyName="heightOffset"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="相机加速"
                        target={camera}
                        propertyName="cameraAcceleration"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="限制" closed={true} selection={this.props.globalState}>
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
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="旋转偏移下限"
                        target={camera}
                        propertyName="lowerRotationOffsetLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="旋转偏移上限"
                        target={camera}
                        propertyName="upperRotationOffsetLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="高度偏移下限"
                        target={camera}
                        propertyName="lowerHeightOffsetLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="高度偏移上限"
                        target={camera}
                        propertyName="upperHeightOffsetLimit"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="最大相机速度"
                        target={camera}
                        propertyName="maxCameraSpeed"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
