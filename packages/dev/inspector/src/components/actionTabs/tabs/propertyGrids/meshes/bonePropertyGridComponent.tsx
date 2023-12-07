import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import type { Bone } from "core/Bones/bone";
import { Vector3LineComponent } from "shared-ui-components/lines/vector3LineComponent";
import { QuaternionLineComponent } from "../../../lines/quaternionLineComponent";

interface IBonePropertyGridComponentProps {
    globalState: GlobalState;
    bone: Bone;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class BonePropertyGridComponent extends React.Component<IBonePropertyGridComponentProps> {
    constructor(props: IBonePropertyGridComponentProps) {
        super(props);
    }

    onTransformNodeLink() {
        if (!this.props.globalState.onSelectionChangedObservable) {
            return;
        }

        const node = this.props.bone.getTransformNode()!;
        this.props.globalState.onSelectionChangedObservable.notifyObservers(node);
    }

    render() {
        const bone = this.props.bone;

        return (
            <>
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextLineComponent label="名称" value={bone.name} />
                    <TextLineComponent label="索引" value={bone.getIndex().toString()} />
                    <TextLineComponent label="唯一 ID" value={bone.uniqueId.toString()} />
                    {bone.getParent() && (
                        <TextLineComponent
                            label="父"
                            value={bone.getParent()!.name}
                            onLink={() => this.props.globalState.onSelectionChangedObservable.notifyObservers(bone.getParent())}
                        />
                    )}
                    {bone.getTransformNode() && <TextLineComponent label="链接节点" value={bone.getTransformNode()!.name} onLink={() => this.onTransformNodeLink()} />}
                </LineContainerComponent>
                <LineContainerComponent title="转换" selection={this.props.globalState}>
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="坐标"
                        target={bone}
                        propertyName="position"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {!bone.rotationQuaternion && (
                        <Vector3LineComponent
                            lockObject={this.props.lockObject}
                            label="旋转"
                            useEuler={this.props.globalState.onlyUseEulers}
                            target={bone}
                            propertyName="rotation"
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {bone.rotationQuaternion && (
                        <QuaternionLineComponent
                            lockObject={this.props.lockObject}
                            label="旋转"
                            useEuler={this.props.globalState.onlyUseEulers}
                            target={bone}
                            propertyName="rotationQuaternion"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="缩放"
                        target={bone}
                        propertyName="scaling"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
