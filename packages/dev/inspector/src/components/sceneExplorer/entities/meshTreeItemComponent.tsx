import type { IExplorerExtensibilityGroup } from "core/Debug/debugLayer";
import type { AbstractMesh } from "core/Meshes/abstractMesh";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash, faSquare } from "@fortawesome/free-regular-svg-icons";
import { TreeItemLabelComponent } from "../treeItemLabelComponent";
import { ExtensionsComponent } from "../extensionsComponent";
import * as React from "react";
import type { GlobalState } from "../../globalState";

import "core/Rendering/boundingBoxRenderer";
import { BoundingInfo } from "core/Culling/boundingInfo";
import type { Scene } from "core/scene";
import { Animation } from "core/Animations/animation";
import { FramingBehavior } from "core/Behaviors/Cameras/framingBehavior";

interface IMeshTreeItemComponentProps {
    mesh: AbstractMesh | any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onClick: () => void;
    globalState: GlobalState;
}

export class MeshTreeItemComponent extends React.Component<IMeshTreeItemComponentProps, { isBoundingBoxEnabled: boolean; isVisible: boolean; isMapLoation: boolean }> {
    constructor(props: IMeshTreeItemComponentProps) {
        super(props);
        const mesh = this.props.mesh;
        this.state = { isBoundingBoxEnabled: mesh.showBoundingBox, isVisible: this.props.mesh.isVisible, isMapLoation: false };
    }

    showBoundingBox(): void {
        const mesh = this.props.mesh;
        mesh.showBoundingBox = !this.state.isBoundingBoxEnabled;
        this.props.globalState.onPropertyChangedObservable.notifyObservers({
            object: mesh,
            property: "showBoundingBox",
            value: mesh.showBoundingBox,
            initialValue: !mesh.showBoundingBox,
        });
        this.setState({ isBoundingBoxEnabled: !this.state.isBoundingBoxEnabled });
    }

    switchVisibility(): void {
        const newState = !this.state.isVisible;
        this.setState({ isVisible: newState });
        this.props.mesh.isVisible = newState;
        this.props.globalState.onPropertyChangedObservable.notifyObservers({ object: this.props.mesh, property: "isVisible", value: newState, initialValue: !newState });
    }

    // mesh.name can fail the type check when we're in javascript, so
    // we can check to avoid crashing
    private _getNameForLabel(): string {
        return typeof this.props.mesh.name === "string" ? this.props.mesh.name : "no name";
    }

    /** 返回函数--计算模型位置 */
    fixModel() {
        this.setState({ isMapLoation: !this.state.isMapLoation });
        const animatables: any = [];
        const scene = this.props.mesh._scene;
        const mesh = this.props.mesh;
        const { min, max } = mesh.getHierarchyBoundingVectors(true);
        const boundingInfo = new BoundingInfo(min, max);
        this.fixModel2(boundingInfo, animatables, scene.activeCamera, scene);
    }

    /** 计算模型视角 */
    fixModel2(boundingInfo: any, animatables: any, camera: any, scene: Scene) {
        if (!boundingInfo) {
            return;
        }
        this.stopAni(animatables);
        camera.upperRadiusLimit = boundingInfo.boundingSphere.radius * 50;
        camera.maxZ = boundingInfo.boundingSphere.radius * 100000;
        camera.panningSensibility = 5000 / boundingInfo.diagonalLength;
        camera.wheelPrecision = 50 / boundingInfo.boundingSphere.radius;
        camera.speed = 0.1;
        let num = Math.abs(Math.floor((camera.alpha / Math.PI) * 0.5));
        if (num !== 0) {
            camera.alpha += (camera.alpha > 0 ? -num : num) * Math.PI * 2;
        }
        num = Math.abs(Math.floor((camera.beta / Math.PI) * 0.5));
        if (num !== 0) {
            camera.beta += (camera.beta > 0 ? -num : num) * Math.PI * 2;
        }
        const duration = 500;
        const time = 2000; // 调整模型聚焦所需的时间
        let transition = Animation.CreateAnimation("target", Animation.ANIMATIONTYPE_VECTOR3, time, FramingBehavior.EasingFunction);
        let animatabe = Animation.TransitionTo("target", boundingInfo.boundingBox.center, camera, scene, time, transition, duration);
        animatables.push(animatabe);
        transition = Animation.CreateAnimation("radius", Animation.ANIMATIONTYPE_FLOAT, time, FramingBehavior.EasingFunction);
        animatabe = Animation.TransitionTo("radius", boundingInfo.boundingSphere.radius * 3, camera, scene, time, transition, duration);
        animatables.push(animatabe);
        transition = Animation.CreateAnimation("alpha", Animation.ANIMATIONTYPE_FLOAT, time, FramingBehavior.EasingFunction);
        animatabe = Animation.TransitionTo("alpha", Math.PI / 2, camera, scene, time, transition, duration);
        animatables.push(animatabe);
        transition = Animation.CreateAnimation("beta", Animation.ANIMATIONTYPE_FLOAT, time, FramingBehavior.EasingFunction);
        animatabe = Animation.TransitionTo("beta", Math.PI / 3, camera, scene, time, transition, duration, () => {
            //   onEndCallback && onEndCallback();
            this.stopAni(animatables);
        });
        animatables.push(animatabe);
    }

    stopAni(animatables: any) {
        if (animatables) {
            while (animatables.length > 0) {
                const item: any = animatables.pop();
                item.stop();
            }
        }
    }

    render() {
        const mesh = this.props.mesh;

        const visibilityElement = this.state.isVisible ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} className="isNotActive" />;

        return (
            <div className="meshTools">
                <TreeItemLabelComponent label={this._getNameForLabel()} onClick={() => this.props.onClick()} icon={faCube} color="dodgerblue" />
                <div className="toolsDiv">
                    {/* <div className={this.state.isMapLoation ? "bounding-box selected icon" : "bounding-box icon"} onClick={() => this.fixModel()} title="模型位置">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </div> */}
                    <div className={"bounding-box icon"} onClick={() => this.fixModel()} title="模型位置">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </div>
                    <div
                        className={this.state.isBoundingBoxEnabled ? "bounding-box selected icon" : "bounding-box icon"}
                        onClick={() => this.showBoundingBox()}
                        title="显示/隐藏 边界框"
                    >
                        <FontAwesomeIcon icon={faSquare} />
                    </div>
                    <div className="visibility icon" onClick={() => this.switchVisibility()} title="显示/隐藏 网格">
                        {visibilityElement}
                    </div>
                </div>

                {<ExtensionsComponent target={mesh} extensibilityGroups={this.props.extensibilityGroups} />}
            </div>
        );
    }
}
