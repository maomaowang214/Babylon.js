import type { Nullable } from "core/types";
import type { Observer, Observable } from "core/Misc/observable";
import type { PointerInfo } from "core/Events/pointerEvents";
import { PointerEventTypes } from "core/Events/pointerEvents";
import type { IExplorerExtensibilityGroup } from "core/Debug/debugLayer";
import { GizmoManager } from "core/Gizmos/gizmoManager";
import type { Scene } from "core/scene";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faImage, faCrosshairs, faArrowsAlt, faCompress, faRedoAlt, faVectorSquare, faLocationDot } from "@fortawesome/free-solid-svg-icons";
// import { ExtensionsComponent } from "../extensionsComponent";
import * as React from "react";

import type { GlobalState } from "../../globalState";
import { UtilityLayerRenderer } from "core/Rendering/utilityLayerRenderer";
import { PropertyChangedEvent } from "../../../components/propertyChangedEvent";
import type { LightGizmo } from "core/Gizmos/lightGizmo";
import type { CameraGizmo } from "core/Gizmos/cameraGizmo";
import type { Camera } from "core/Cameras/camera";
import { TmpVectors, Vector3 } from "core/Maths/math";
import { GizmoCoordinatesMode } from "core/Gizmos/gizmo";
// import { MeshBuilder } from "core/Meshes/meshBuilder";
// import { AdvancedDynamicTexture } from "gui/2D/advancedDynamicTexture";
// import { Rectangle } from "gui/2D/controls/rectangle";
// import { TextBlock } from "gui/2D/controls/textBlock";
// import type { Mesh } from "core/Meshes/mesh";

interface ISceneTreeItemComponentProps {
    scene: Scene;
    gizmoCamera?: Camera;
    onRefresh: () => void;
    selectedEntity?: any;
    extensibilityGroups?: IExplorerExtensibilityGroup[];
    onSelectionChangedObservable?: Observable<any>;
    globalState: GlobalState;
}

/**
 *
 */
export class SceneTreeItemComponent extends React.Component<
    ISceneTreeItemComponentProps,
    {
        /**
         *
         */
        isSelected: boolean;
        /**
         *
         */
        isInPickingMode: boolean;
        /**
         *
         */
        gizmoMode: number;
        /**
         *
         */
        isInWorldCoodinatesMode: boolean;
        /**
         *
         */
        isMouseDown: boolean;
        /**
         *
         */
        isMeasure: boolean;
    }
> {
    private _gizmoLayerOnPointerObserver: Nullable<Observer<PointerInfo>>;
    private _onPointerObserver: Nullable<Observer<PointerInfo>>;
    private _onSelectionChangeObserver: Nullable<Observer<any>>;
    private _selectedEntity: any;

    private _posDragEnd: Nullable<Observer<PropertyChangedEvent>> = null;
    private _scaleDragEnd: Nullable<Observer<PropertyChangedEvent>> = null;
    private _rotateDragEnd: Nullable<Observer<PropertyChangedEvent>> = null;

    constructor(props: ISceneTreeItemComponentProps) {
        super(props);

        const scene = this.props.scene;
        let gizmoMode = 0;
        if (scene.reservedDataStore && scene.reservedDataStore.gizmoManager) {
            const manager: GizmoManager = scene.reservedDataStore.gizmoManager;
            if (manager.positionGizmoEnabled) {
                gizmoMode = 1;
            } else if (manager.rotationGizmoEnabled) {
                gizmoMode = 2;
            } else if (manager.scaleGizmoEnabled) {
                gizmoMode = 3;
            } else if (manager.boundingBoxGizmoEnabled) {
                gizmoMode = 4;
            }
            // autopicking is disable by default
            manager.enableAutoPicking = false;
        }

        this.state = { isSelected: false, isInPickingMode: false, gizmoMode: gizmoMode, isInWorldCoodinatesMode: false, isMouseDown: false, isMeasure: false };

        setTimeout(() => {
            this.draggableBox(document.getElementById("draggableBox"));
        }, 500);
    }

    shouldComponentUpdate(
        nextProps: ISceneTreeItemComponentProps,
        nextState: {
            /**
             *
             */
            isSelected: boolean;
            /**
             *
             */
            isInPickingMode: boolean;
        }
    ) {
        if (nextProps.selectedEntity) {
            if (nextProps.scene === nextProps.selectedEntity) {
                nextState.isSelected = true;
                return true;
            } else {
                nextState.isSelected = false;
            }
        }
        this.updateGizmoAutoPicking(nextState.isInPickingMode);
        return true;
    }

    updateGizmoAutoPicking(isInPickingMode: boolean) {
        const scene = this.props.scene;
        if (scene.reservedDataStore && scene.reservedDataStore.gizmoManager) {
            const manager: GizmoManager = scene.reservedDataStore.gizmoManager;
            manager.enableAutoPicking = isInPickingMode;
        }
    }

    componentDidMount() {
        if (!this.props.onSelectionChangedObservable) {
            return;
        }

        const scene = this.props.scene;
        this._onSelectionChangeObserver = this.props.onSelectionChangedObservable.add((entity) => {
            this._selectedEntity = entity;
            if (entity && scene.reservedDataStore && scene.reservedDataStore.gizmoManager) {
                const manager: GizmoManager = scene.reservedDataStore.gizmoManager;

                const className = entity.getClassName();

                if (className === "TransformNode" || className.indexOf("Mesh") !== -1) {
                    manager.attachToMesh(entity);
                } else if (className.indexOf("Light") !== -1) {
                    if (!this._selectedEntity.reservedDataStore || !this._selectedEntity.reservedDataStore.lightGizmo) {
                        this.props.globalState.enableLightGizmo(this._selectedEntity, true, this.props.gizmoCamera);
                        this.forceUpdate();
                    }
                    manager.attachToNode(this._selectedEntity.reservedDataStore.lightGizmo.attachedNode);
                } else if (className.indexOf("Camera") !== -1) {
                    if (!this._selectedEntity.reservedDataStore || !this._selectedEntity.reservedDataStore.cameraGizmo) {
                        this.props.globalState.enableCameraGizmo(this._selectedEntity, true, this.props.gizmoCamera);
                        this.forceUpdate();
                    }
                    manager.attachToNode(this._selectedEntity.reservedDataStore.cameraGizmo.attachedNode);
                } else if (className.indexOf("Bone") !== -1) {
                    manager.attachToMesh(this._selectedEntity._linkedTransformNode ? this._selectedEntity._linkedTransformNode : this._selectedEntity);
                } else {
                    manager.attachToNode(null);
                }
            }
        });
    }

    componentWillUnmount() {
        const scene = this.props.scene;

        if (this._onPointerObserver) {
            scene.onPointerObservable.remove(this._onPointerObserver);
            this._onPointerObserver = null;
        }

        if (this._gizmoLayerOnPointerObserver) {
            scene.onPointerObservable.remove(this._gizmoLayerOnPointerObserver);
            this._gizmoLayerOnPointerObserver = null;
        }

        if (this._onSelectionChangeObserver && this.props.onSelectionChangedObservable) {
            this.props.onSelectionChangedObservable.remove(this._onSelectionChangeObserver);
        }
    }

    onSelect() {
        if (!this.props.onSelectionChangedObservable) {
            return;
        }
        const scene = this.props.scene;
        this.props.onSelectionChangedObservable.notifyObservers(scene);
    }

    onCoordinatesMode() {
        const scene = this.props.scene;
        if (scene.reservedDataStore) {
            const manager: GizmoManager = scene.reservedDataStore.gizmoManager;
            if (manager) {
                manager.coordinatesMode = this.state.isInWorldCoodinatesMode ? GizmoCoordinatesMode.Local : GizmoCoordinatesMode.World;
                this.setState({ isInWorldCoodinatesMode: !this.state.isInWorldCoodinatesMode });
            }

            // flip coordinate system
            // if (manager.coordinatesMode) {
            //     manager.coordinatesMode = this.state.isInWorldCoodinatesMode ? GizmoCoordinatesMode.Local : GizmoCoordinatesMode.World;
            //     this.setState({ isInWorldCoodinatesMode: !this.state.isInWorldCoodinatesMode });
            // }
        }
    }
    onPickingMode() {
        const scene = this.props.scene;

        if (this._onPointerObserver) {
            scene.onPointerObservable.remove(this._onPointerObserver);
            this._onPointerObserver = null;
        }

        if (!this.state.isInPickingMode) {
            this._onPointerObserver = scene.onPointerObservable.add(() => {
                const pickPosition = scene.unTranslatedPointer;
                const pickInfo = scene.pick(
                    pickPosition.x,
                    pickPosition.y,
                    (mesh) => mesh.isEnabled() && mesh.isVisible && mesh.getTotalVertices() > 0,
                    false,
                    undefined,
                    (p0, p1, p2, ray) => {
                        if (!this.props.globalState.ignoreBackfacesForPicking) {
                            return true;
                        }

                        const p0p1 = TmpVectors.Vector3[0];
                        const p1p2 = TmpVectors.Vector3[1];
                        let normal = TmpVectors.Vector3[2];

                        p1.subtractToRef(p0, p0p1);
                        p2.subtractToRef(p1, p1p2);

                        normal = Vector3.Cross(p0p1, p1p2);

                        return Vector3.Dot(normal, ray.direction) < 0;
                    }
                );

                // Pick light gizmos first
                if (this.props.globalState.lightGizmos.length > 0) {
                    const gizmoScene = this.props.globalState.lightGizmos[0].gizmoLayer.utilityLayerScene;
                    const pickInfo = gizmoScene.pick(pickPosition.x, pickPosition.y, (m: any) => {
                        for (const g of this.props.globalState.lightGizmos as any) {
                            if (g.attachedNode == m) {
                                return true;
                            }
                        }
                        return false;
                    });
                    if (pickInfo && pickInfo.hit && this.props.onSelectionChangedObservable) {
                        this.props.onSelectionChangedObservable.notifyObservers(pickInfo.pickedMesh);
                        return;
                    }
                }
                // Pick camera gizmos
                if (this.props.globalState.cameraGizmos.length > 0) {
                    const gizmoScene = this.props.globalState.cameraGizmos[0].gizmoLayer.utilityLayerScene;
                    const pickInfo = gizmoScene.pick(pickPosition.x, pickPosition.y, (m: any) => {
                        for (const g of this.props.globalState.cameraGizmos as any) {
                            if (g.attachedNode == m) {
                                return true;
                            }
                        }
                        return false;
                    });
                    if (pickInfo && pickInfo.hit && this.props.onSelectionChangedObservable) {
                        this.props.onSelectionChangedObservable.notifyObservers(pickInfo.pickedMesh);
                        return;
                    }
                }
                if (pickInfo && pickInfo.hit && this.props.onSelectionChangedObservable) {
                    this.props.onSelectionChangedObservable.notifyObservers(pickInfo.pickedMesh);
                }
            }, PointerEventTypes.POINTERTAP);
        }

        this.setState({ isInPickingMode: !this.state.isInPickingMode });
    }

    setGizmoMode(mode: number) {
        const scene = this.props.scene;

        if (!scene.reservedDataStore) {
            scene.reservedDataStore = {};
        }

        if (this._gizmoLayerOnPointerObserver) {
            scene.onPointerObservable.remove(this._gizmoLayerOnPointerObserver);
            this._gizmoLayerOnPointerObserver = null;
        }

        if (!scene.reservedDataStore.gizmoManager) {
            scene.reservedDataStore.gizmoManager = new GizmoManager(scene, undefined, new UtilityLayerRenderer(scene), new UtilityLayerRenderer(scene));
        }

        if (this.props.gizmoCamera) {
            scene.reservedDataStore.gizmoManager.utilityLayer.setRenderCamera(this.props.gizmoCamera);
        }

        const manager: GizmoManager = scene.reservedDataStore.gizmoManager;
        // Allow picking of light gizmo when a gizmo mode is selected
        this._gizmoLayerOnPointerObserver = UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                    let node: Nullable<any> = pointerInfo.pickInfo.pickedMesh;
                    // Attach to the most parent node
                    while (node && node.parent != null) {
                        node = node.parent;
                    }
                    for (const gizmo of this.props.globalState.lightGizmos) {
                        if (gizmo._rootMesh == node) {
                            manager.attachToNode(gizmo.attachedNode);
                        }
                    }
                }
            }
        });

        manager.boundingBoxGizmoEnabled = false;
        manager.positionGizmoEnabled = false;
        manager.rotationGizmoEnabled = false;
        manager.scaleGizmoEnabled = false;

        if (this.state.gizmoMode === mode) {
            mode = 0;
            manager.dispose();
            scene.reservedDataStore.gizmoManager = null;
        } else {
            switch (mode) {
                case 1:
                    manager.positionGizmoEnabled = true;
                    if (!this._posDragEnd) {
                        // Record movement for generating replay code
                        this._posDragEnd = manager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
                            if (manager.gizmos.positionGizmo && manager.gizmos.positionGizmo.attachedNode) {
                                const lightGizmo: Nullable<LightGizmo> = manager.gizmos.positionGizmo.attachedNode.reservedDataStore
                                    ? manager.gizmos.positionGizmo.attachedNode.reservedDataStore.lightGizmo
                                    : null;
                                const objLight: any = lightGizmo && lightGizmo.light ? lightGizmo.light : manager.gizmos.positionGizmo.attachedNode;

                                if (objLight.position) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objLight;
                                    e.property = "position";
                                    e.value = objLight.position;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                } else {
                                    const cameraGizmo: Nullable<CameraGizmo> = manager.gizmos.positionGizmo.attachedNode.reservedDataStore
                                        ? manager.gizmos.positionGizmo.attachedNode.reservedDataStore.cameraGizmo
                                        : null;
                                    const objCamera: any = cameraGizmo && cameraGizmo.camera ? cameraGizmo.camera : manager.gizmos.positionGizmo.attachedNode;

                                    if (objCamera.position) {
                                        const e = new PropertyChangedEvent();
                                        e.object = objCamera;
                                        e.property = "position";
                                        e.value = objCamera.position;
                                        this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                    }
                                }
                            }
                        });
                    }

                    break;
                case 2:
                    manager.rotationGizmoEnabled = true;
                    if (!this._rotateDragEnd) {
                        // Record movement for generating replay code
                        this._rotateDragEnd = manager.gizmos.rotationGizmo!.onDragEndObservable.add(() => {
                            if (manager.gizmos.rotationGizmo && manager.gizmos.rotationGizmo.attachedNode) {
                                const lightGizmo: Nullable<LightGizmo> = manager.gizmos.rotationGizmo.attachedNode.reservedDataStore
                                    ? manager.gizmos.rotationGizmo.attachedNode.reservedDataStore.lightGizmo
                                    : null;
                                const objLight: any = lightGizmo && lightGizmo.light ? lightGizmo.light : manager.gizmos.rotationGizmo.attachedNode;
                                const cameraGizmo: Nullable<CameraGizmo> = manager.gizmos.rotationGizmo.attachedNode.reservedDataStore
                                    ? manager.gizmos.rotationGizmo.attachedNode.reservedDataStore.cameraGizmo
                                    : null;
                                const objCamera: any = cameraGizmo && cameraGizmo.camera ? cameraGizmo.camera : manager.gizmos.rotationGizmo.attachedNode;

                                if (objLight.rotationQuaternion) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objLight;
                                    e.property = "rotationQuaternion";
                                    e.value = objLight.rotationQuaternion;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                } else if (objLight.rotation) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objLight;
                                    e.property = "rotation";
                                    e.value = objLight.rotation;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                } else if (objLight.direction) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objLight;
                                    e.property = "direction";
                                    e.value = objLight.direction;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                } else if (objCamera.rotationQuaternion) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objCamera;
                                    e.property = "rotationQuaternion";
                                    e.value = objCamera.rotationQuaternion;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                } else if (objCamera.rotation) {
                                    const e = new PropertyChangedEvent();
                                    e.object = objCamera;
                                    e.property = "rotation";
                                    e.value = objCamera.rotation;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                }
                            }
                        });
                    }

                    break;
                case 3:
                    manager.scaleGizmoEnabled = true;
                    if (!this._scaleDragEnd) {
                        // Record movement for generating replay code
                        this._scaleDragEnd = manager.gizmos.scaleGizmo!.onDragEndObservable.add(() => {
                            if (manager.gizmos.scaleGizmo && manager.gizmos.scaleGizmo.attachedMesh) {
                                const lightGizmo: Nullable<LightGizmo> = manager.gizmos.scaleGizmo.attachedMesh.reservedDataStore
                                    ? manager.gizmos.scaleGizmo.attachedMesh.reservedDataStore.lightGizmo
                                    : null;
                                const obj: any = lightGizmo && lightGizmo.light ? lightGizmo.light : manager.gizmos.scaleGizmo.attachedMesh;

                                if (obj.scaling) {
                                    const e = new PropertyChangedEvent();
                                    e.object = obj;
                                    e.property = "scaling";
                                    e.value = obj.scaling;
                                    this.props.globalState.onPropertyChangedObservable.notifyObservers(e);
                                }
                            }
                        });
                    }

                    break;
                case 4:
                    manager.boundingBoxGizmoEnabled = true;
                    if (manager.gizmos.boundingBoxGizmo) {
                        manager.gizmos.boundingBoxGizmo.fixedDragMeshScreenSize = true;
                    }
                    break;
            }

            if (this._selectedEntity && this._selectedEntity.getClassName) {
                const className = this._selectedEntity.getClassName();

                if (className === "TransformNode" || className.indexOf("Mesh") !== -1) {
                    manager.attachToMesh(this._selectedEntity);
                } else if (className.indexOf("Light") !== -1) {
                    if (!this._selectedEntity.reservedDataStore || !this._selectedEntity.reservedDataStore.lightGizmo) {
                        this.props.globalState.enableLightGizmo(this._selectedEntity, true, this.props.gizmoCamera);
                        this.forceUpdate();
                    }
                    manager.attachToNode(this._selectedEntity.reservedDataStore.lightGizmo.attachedNode);
                } else if (className.indexOf("Camera") !== -1) {
                    if (!this._selectedEntity.reservedDataStore || !this._selectedEntity.reservedDataStore.cameraGizmo) {
                        this.props.globalState.enableCameraGizmo(this._selectedEntity, true, this.props.gizmoCamera);
                        this.forceUpdate();
                    }
                    manager.attachToNode(this._selectedEntity.reservedDataStore.cameraGizmo.attachedNode);
                } else if (className.indexOf("Bone") !== -1) {
                    manager.attachToMesh(this._selectedEntity._linkedTransformNode ? this._selectedEntity._linkedTransformNode : this._selectedEntity);
                }
            }
        }

        this.setState({ gizmoMode: mode });
    }

    /** 自定义拖动工具栏 */
    draggableBox(elmnt: any) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;

        if (document.getElementById(elmnt.id + "header")) {
            /* 如果存在，header 就是你移动 DIV 的地方：*/
            const dom: any = document.getElementById(elmnt.id + "header");
            dom.onmousedown = dragMouseDown;
        } else {
            /* 否则，将 DIV 从 DIV 内的任何位置移动：*/
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e: any) {
            e = e || window.event;
            e.preventDefault();
            // 在启动时获取鼠标光标位置：
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 当光标移动时调用一个函数：
            document.onmousemove = elementDrag;
        }

        function elementDrag(e: any) {
            e = e || window.event;
            e.preventDefault();
            // 计算新的光标位置：
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // 设置元素的新位置：
            elmnt.style.top = elmnt.offsetTop - pos2 + "px";
            elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
        }

        function closeDragElement() {
            /* 释放鼠标按钮时停止移动：*/
            document.onmouseup = null;
            document.onmousemove = null;
        }

        // setTimeout(() => {
        //     const draggable = document.getElementById("draggableBox") as HTMLElement;
        //     let isMouseDown = false;
        //     let initX: number, initY: number;

        //     let click_store: string | number | NodeJS.Timeout | undefined;

        //     draggable.addEventListener("mousedown", (e) => {
        //         click_store = setTimeout(() => {
        //             isMouseDown = true;
        //             initX = e.offsetX;
        //             initY = e.offsetY;
        //         }, 200);
        //     });

        //     document.addEventListener("mousemove", (e) => {
        //         if (isMouseDown) {
        //             draggable.style.left = e.clientX - initX + "px";
        //             draggable.style.top = e.clientY - initY + "px";
        //         }
        //     });

        //     draggable.addEventListener("mouseup", () => {
        //         isMouseDown = false;
        //         clearTimeout(click_store);
        //     });
        // }, 1000);
    }

    /** 自定义测量 */
    // lines: any;
    // advancedTexture: AdvancedDynamicTexture;
    // box: any;
    // onMeasure() {
    //     this.setState({ isMeasure: !this.state.isMeasure });

    //     const scene: any = this.props.scene;
    //     const canvas: HTMLCanvasElement = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement;
    //     let startPoint: any = null;
    //     let endPoint = null;
    //     let count = 0;

    //     const myColors = [new Color4(1, 0, 0, 1), new Color4(0, 1, 0, 1), new Color4(0, 0, 1, 1), new Color4(1, 1, 0, 1)];
    //     const options: any = {
    //         points: [Vector3.Zero(), Vector3.Zero()],
    //         colors: myColors,
    //         updatable: true,
    //     };
    //     if (!this.lines) this.lines = MeshBuilder.CreateLines("lines", options, scene);
    //     if (!this.advancedTexture) this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //     if (!this.box) this.box = MeshBuilder.CreateBox("measureBox", { width: 0.001, height: 0.001 }, scene);

    //     const pointerdown = () => {
    //         const pickResult = scene.pick(scene.pointerX, scene.pointerY);
    //         if (this.state.isMeasure) {
    //             if (pickResult.hit) {
    //                 this.advancedTexture._linkedControls.forEach((item) => {
    //                     this.advancedTexture.removeControl(item);
    //                     item.dispose();
    //                 });
    //                 if (count === 1) {
    //                     endPoint = pickResult.pickedPoint as Vector3;
    //                     options.points = [startPoint, endPoint];
    //                     options.instance = this.lines;
    //                     this.lines = MeshBuilder.CreateLines("lines", options);
    //                     this.lines.alwaysSelectAsActiveMesh = true; // 禁用视口裁剪
    //                     const value = Vector3.Distance(startPoint, endPoint).toFixed(8) + "m";
    //                     startPoint = null;
    //                     count = 0;
    //                     this.addMark(this.advancedTexture, endPoint, this.box, value);
    //                 } else {
    //                     startPoint = pickResult.pickedPoint as Vector3;
    //                     count++;
    //                 }
    //             }
    //         } else {
    //             canvas.removeEventListener("pointerdown", pointerdown);
    //             canvas.removeEventListener("pointermove", pointermove);
    //             canvas.removeEventListener("pointerup", pointerup);
    //         }
    //     };

    //     const pointermove = () => {
    //         if (count === 1) {
    //             this.advancedTexture._linkedControls.forEach((item) => {
    //                 this.advancedTexture.removeControl(item);
    //                 item.dispose();
    //             });

    //             const pickResult = scene.pick(scene.pointerX, scene.pointerY);
    //             if (pickResult.hit && startPoint) {
    //                 endPoint = pickResult.pickedPoint as Vector3;
    //                 options.points = [startPoint, endPoint];
    //                 options.instance = this.lines;
    //                 this.lines = MeshBuilder.CreateLines("lines", options);

    //                 const value = Vector3.Distance(startPoint, endPoint).toFixed(8) + "m";
    //                 this.addMark(this.advancedTexture, endPoint, this.box, value);
    //             }
    //         }
    //     };

    //     const pointerup = () => {};

    //     if (!this.state.isMeasure) {
    //         canvas.addEventListener("pointerdown", pointerdown);
    //         canvas.addEventListener("pointermove", pointermove);
    //         canvas.addEventListener("pointerup", pointerup);
    //     } else {
    //         this.lines.alwaysSelectAsActiveMesh = true; // 禁用视口裁剪
    //         if (this.lines.material) {
    //             scene.materials.forEach((item: any) => {
    //                 if (item.name === "colorShader") {
    //                     item.dispose();
    //                 }
    //             });
    //             this.lines.material.dispose();
    //             this.lines.material.shader = null;
    //         }
    //         this.lines.dispose();
    //         this.lines = null;
    //         this.box.dispose();
    //         this.box = null;

    //         this.advancedTexture._linkedControls.forEach((item) => {
    //             this.advancedTexture.removeControl(item);
    //             item.dispose();
    //         });
    //     }
    // }

    // /** 添加测量标签 */
    // addMark(advancedTexture: AdvancedDynamicTexture, point: Vector3, box: Mesh, value: string) {
    //     box.position = point;
    //     advancedTexture.idealWidth = 600;

    //     const rect1 = new Rectangle();
    //     rect1.width = 0.1;
    //     rect1.height = "10px";
    //     rect1.cornerRadius = 1;
    //     rect1.color = "Orange";
    //     rect1.thickness = 1;
    //     // rect1.background = "green";
    //     advancedTexture.addControl(rect1);
    //     rect1.linkOffsetY = -5;
    //     rect1.linkWithMesh(box);
    //     const label = new TextBlock();
    //     label.text = value;
    //     rect1.addControl(label);
    // }

    render() {
        return (
            <div className={this.state.isSelected ? "itemContainer selected" : "itemContainer"}>
                <div className="sceneNode">
                    <div className="sceneTitle" onClick={() => this.onSelect()}>
                        <FontAwesomeIcon icon={faImage} />
                        &nbsp;场景资源
                    </div>
                    {/* <div className={this.state.gizmoMode === 1 ? "translation selected icon" : "translation icon"} onClick={() => this.setGizmoMode(1)} title="启用/禁用 位置模式">
                        <FontAwesomeIcon icon={faArrowsAlt} />
                    </div>
                    <div className={this.state.gizmoMode === 2 ? "rotation selected icon" : "rotation icon"} onClick={() => this.setGizmoMode(2)} title="启用/禁用 旋转模式">
                        <FontAwesomeIcon icon={faRedoAlt} />
                    </div>
                    <div className={this.state.gizmoMode === 3 ? "scaling selected icon" : "scaling icon"} onClick={() => this.setGizmoMode(3)} title="启用/禁用 缩放模式">
                        <FontAwesomeIcon icon={faCompress} />
                    </div>
                    <div className={this.state.gizmoMode === 4 ? "bounding selected icon" : "bounding icon"} onClick={() => this.setGizmoMode(4)} title="启用/禁用 边界框模式">
                        <FontAwesomeIcon icon={faVectorSquare} />
                    </div>
                    <div className="separator" />
                    <div
                        className={this.state.isInPickingMode ? "pickingMode selected icon" : "pickingMode icon"}
                        onClick={() => this.onPickingMode()}
                        title="打开/关闭 鼠标选择模式"
                    >
                        <FontAwesomeIcon icon={faCrosshairs} />
                    </div>
                    <div
                        className={this.state.isInWorldCoodinatesMode ? "coordinates selected icon" : "coordinates icon"}
                        onClick={() => this.onCoordinatesMode()}
                        title="世界坐标/本地坐标 切换"
                    >
                        <FontAwesomeIcon icon={faLocationDot} />
                    </div>
                    <div className="refresh icon" onClick={() => this.props.onRefresh()} title="刷新资源管理器">
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </div>
                    {<ExtensionsComponent target={this.props.scene} extensibilityGroups={this.props.extensibilityGroups} />} */}
                </div>

                <div id="draggableBox" className="draggableBox">
                    <div id="draggableBoxheader" className="dragGJ" title="拖动工具">
                        {/* <FontAwesomeIcon icon={faChevronDown} /> */}
                    </div>
                    <div
                        className={this.state.gizmoMode === 1 ? "dragItem3 translation selected icon selectDrag" : "dragItem3 translation icon"}
                        onClick={() => this.setGizmoMode(1)}
                        title="启用/禁用 位置模式"
                    >
                        <FontAwesomeIcon icon={faArrowsAlt} />
                    </div>
                    <div
                        className={this.state.gizmoMode === 2 ? "dragItem3 rotation selected icon selectDrag" : "dragItem3 rotation icon"}
                        onClick={() => this.setGizmoMode(2)}
                        title="启用/禁用 旋转模式"
                    >
                        <FontAwesomeIcon icon={faRedoAlt} />
                    </div>
                    <div
                        className={this.state.gizmoMode === 3 ? "dragItem3 scaling selected icon selectDrag" : "dragItem3 scaling icon"}
                        onClick={() => this.setGizmoMode(3)}
                        title="启用/禁用 缩放模式"
                    >
                        <FontAwesomeIcon icon={faCompress} />
                    </div>
                    <div
                        className={this.state.gizmoMode === 4 ? "dragItem2 bounding selected icon selectDrag" : "dragItem2 bounding icon"}
                        onClick={() => this.setGizmoMode(4)}
                        title="启用/禁用 边界框模式"
                    >
                        <FontAwesomeIcon icon={faVectorSquare} />
                    </div>

                    <div
                        className={this.state.isInPickingMode ? "dragItem1 pickingMode selected icon selectDrag" : "dragItem1 pickingMode icon"}
                        onClick={() => this.onPickingMode()}
                        title="打开/关闭 鼠标选择模式"
                    >
                        <FontAwesomeIcon icon={faCrosshairs} />
                    </div>
                    <div
                        className={this.state.isInWorldCoodinatesMode ? "dragItem3 coordinates selected icon selectDrag" : "dragItem3 coordinates icon"}
                        onClick={() => this.onCoordinatesMode()}
                        title="世界坐标/本地坐标"
                    >
                        <FontAwesomeIcon icon={faLocationDot} />
                    </div>
                    {/* <div
                        className={this.state.isMeasure ? "dragItem3 coordinates selected icon selectDrag" : "dragItem3 coordinates icon"}
                        onClick={() => this.onMeasure()}
                        title="测量"
                    >
                        <FontAwesomeIcon icon={faRulerHorizontal} />
                    </div> */}
                    <div className="dragItem2 refresh icon" onClick={() => this.props.onRefresh()} title="刷新资源管理器">
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </div>
                </div>
            </div>
        );
    }
}
