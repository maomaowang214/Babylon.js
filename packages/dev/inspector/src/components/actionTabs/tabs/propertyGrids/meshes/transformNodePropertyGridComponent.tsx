import * as React from "react";

import type { TransformNode } from "core/Meshes/transformNode";
import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { Vector3LineComponent } from "shared-ui-components/lines/vector3LineComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import { QuaternionLineComponent } from "../../../lines/quaternionLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import { CustomPropertyGridComponent } from "../customPropertyGridComponent";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { TextInputLineComponent } from "shared-ui-components/lines/textInputLineComponent";
import { AnimationGridComponent } from "../animations/animationPropertyGridComponent";
import { CommonPropertyGridComponent } from "../commonPropertyGridComponent";
import { VariantsPropertyGridComponent } from "../variantsPropertyGridComponent";
import type { Mesh } from "core/Meshes/mesh";
import { ParentPropertyGridComponent } from "../parentPropertyGridComponent";

interface ITransformNodePropertyGridComponentProps {
    globalState: GlobalState;
    transformNode: TransformNode;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class TransformNodePropertyGridComponent extends React.Component<ITransformNodePropertyGridComponentProps> {
    constructor(props: ITransformNodePropertyGridComponentProps) {
        super(props);
    }

    render() {
        const transformNode = this.props.transformNode;

        return (
            <>
                <CustomPropertyGridComponent
                    globalState={this.props.globalState}
                    target={transformNode}
                    lockObject={this.props.lockObject}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextLineComponent label="ID" value={transformNode.id} />
                    <TextInputLineComponent
                        lockObject={this.props.lockObject}
                        label="名称"
                        target={transformNode}
                        propertyName="name"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <TextLineComponent label="唯一 ID" value={transformNode.uniqueId.toString()} />
                    <TextLineComponent label="类型" value={transformNode.getClassName()} />
                    <CheckBoxLineComponent label="是否启用" isSelected={() => transformNode.isEnabled()} onSelect={(value) => transformNode.setEnabled(value)} />
                    <ParentPropertyGridComponent globalState={this.props.globalState} node={transformNode} lockObject={this.props.lockObject} />
                    <ButtonLineComponent
                        label="删除"
                        onClick={() => {
                            transformNode.dispose();
                            this.props.globalState.onSelectionChangedObservable.notifyObservers(null);
                        }}
                    />
                </LineContainerComponent>
                <CommonPropertyGridComponent host={transformNode} lockObject={this.props.lockObject} globalState={this.props.globalState} />
                <VariantsPropertyGridComponent host={transformNode as Mesh} lockObject={this.props.lockObject} globalState={this.props.globalState} />
                <LineContainerComponent title="变换" selection={this.props.globalState}>
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="坐标"
                        target={transformNode}
                        propertyName="position"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {!transformNode.rotationQuaternion && (
                        <Vector3LineComponent
                            lockObject={this.props.lockObject}
                            label="旋转"
                            useEuler={this.props.globalState.onlyUseEulers}
                            target={transformNode}
                            propertyName="rotation"
                            step={0.01}
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    {transformNode.rotationQuaternion && (
                        <QuaternionLineComponent
                            lockObject={this.props.lockObject}
                            label="旋转"
                            useEuler={this.props.globalState.onlyUseEulers}
                            target={transformNode}
                            propertyName="rotationQuaternion"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    <Vector3LineComponent
                        lockObject={this.props.lockObject}
                        label="缩放"
                        target={transformNode}
                        propertyName="scaling"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
                <AnimationGridComponent globalState={this.props.globalState} animatable={transformNode} scene={transformNode.getScene()} lockObject={this.props.lockObject} />
            </>
        );
    }
}
