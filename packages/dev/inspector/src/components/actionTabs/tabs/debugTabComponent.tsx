import type { IPaneComponentProps } from "../paneComponent";
import { PaneComponent } from "../paneComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { RenderGridPropertyGridComponent } from "./propertyGrids/renderGridPropertyGridComponent";

import { PhysicsViewer } from "core/Debug/physicsViewer";
import { StandardMaterial } from "core/Materials/standardMaterial";
import type { Mesh } from "core/Meshes/mesh";
import { MaterialFlags } from "core/Materials/materialFlags";

import "core/Physics/physicsEngineComponent";
import "core/Physics/v1/physicsEngineComponent";
import "core/Physics/v2/physicsEngineComponent";

export class DebugTabComponent extends PaneComponent {
    private _physicsViewersEnabled = false;

    constructor(props: IPaneComponentProps) {
        super(props);

        const scene = this.props.scene;

        if (!scene) {
            return;
        }

        if (!scene.reservedDataStore) {
            scene.reservedDataStore = {};
        }

        this._physicsViewersEnabled = scene.reservedDataStore.physicsViewer != null;
    }

    switchPhysicsViewers() {
        this._physicsViewersEnabled = !this._physicsViewersEnabled;
        const scene = this.props.scene;

        if (this._physicsViewersEnabled) {
            const physicsViewer = new PhysicsViewer(scene);
            scene.reservedDataStore.physicsViewer = physicsViewer;

            for (const mesh of scene.meshes) {
                if (mesh.physicsImpostor) {
                    const debugMesh = physicsViewer.showImpostor(mesh.physicsImpostor, mesh as Mesh);

                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        debugMesh.material!.reservedDataStore = { hidden: true };
                    }
                } else if (mesh.physicsBody) {
                    const debugMesh = physicsViewer.showBody(mesh.physicsBody);

                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        debugMesh.material!.reservedDataStore = { hidden: true };
                    }
                }
            }

            for (const transformNode of scene.transformNodes) {
                if (transformNode.physicsBody) {
                    const debugMesh = physicsViewer.showBody(transformNode.physicsBody);

                    if (debugMesh) {
                        debugMesh.reservedDataStore = { hidden: true };
                        debugMesh.material!.reservedDataStore = { hidden: true };
                    }
                }
            }
        } else {
            scene.reservedDataStore.physicsViewer.dispose();
            scene.reservedDataStore.physicsViewer = null;
        }
    }

    render() {
        const scene = this.props.scene;

        if (!scene) {
            return null;
        }

        return (
            <div className="pane">
                <LineContainerComponent title="助手" selection={this.props.globalState}>
                    <RenderGridPropertyGridComponent globalState={this.props.globalState} scene={scene} />
                    <CheckBoxLineComponent label="物理" isSelected={() => this._physicsViewersEnabled} onSelect={() => this.switchPhysicsViewers()} />
                </LineContainerComponent>
                <LineContainerComponent title="核心纹理通道" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="扩散"
                        isSelected={() => StandardMaterial.DiffuseTextureEnabled}
                        onSelect={() => (StandardMaterial.DiffuseTextureEnabled = !StandardMaterial.DiffuseTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="环境"
                        isSelected={() => StandardMaterial.AmbientTextureEnabled}
                        onSelect={() => (StandardMaterial.AmbientTextureEnabled = !StandardMaterial.AmbientTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="镜面"
                        isSelected={() => StandardMaterial.SpecularTextureEnabled}
                        onSelect={() => (StandardMaterial.SpecularTextureEnabled = !StandardMaterial.SpecularTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="发射"
                        isSelected={() => StandardMaterial.EmissiveTextureEnabled}
                        onSelect={() => (StandardMaterial.EmissiveTextureEnabled = !StandardMaterial.EmissiveTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="凹凸"
                        isSelected={() => StandardMaterial.BumpTextureEnabled}
                        onSelect={() => (StandardMaterial.BumpTextureEnabled = !StandardMaterial.BumpTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="透明度"
                        isSelected={() => StandardMaterial.OpacityTextureEnabled}
                        onSelect={() => (StandardMaterial.OpacityTextureEnabled = !StandardMaterial.OpacityTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="反射"
                        isSelected={() => StandardMaterial.ReflectionTextureEnabled}
                        onSelect={() => (StandardMaterial.ReflectionTextureEnabled = !StandardMaterial.ReflectionTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="折射"
                        isSelected={() => StandardMaterial.RefractionTextureEnabled}
                        onSelect={() => (StandardMaterial.RefractionTextureEnabled = !StandardMaterial.RefractionTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="色彩分级"
                        isSelected={() => StandardMaterial.ColorGradingTextureEnabled}
                        onSelect={() => (StandardMaterial.ColorGradingTextureEnabled = !StandardMaterial.ColorGradingTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="光线映射"
                        isSelected={() => StandardMaterial.LightmapTextureEnabled}
                        onSelect={() => (StandardMaterial.LightmapTextureEnabled = !StandardMaterial.LightmapTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="菲涅耳"
                        isSelected={() => StandardMaterial.FresnelEnabled}
                        onSelect={() => (StandardMaterial.FresnelEnabled = !StandardMaterial.FresnelEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="详情"
                        isSelected={() => MaterialFlags.DetailTextureEnabled}
                        onSelect={() => (MaterialFlags.DetailTextureEnabled = !MaterialFlags.DetailTextureEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="贴花"
                        isSelected={() => MaterialFlags.DecalMapEnabled}
                        onSelect={() => (MaterialFlags.DecalMapEnabled = !MaterialFlags.DecalMapEnabled)}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="特性" selection={this.props.globalState}>
                    <CheckBoxLineComponent label="动画" isSelected={() => scene.animationsEnabled} onSelect={() => (scene.animationsEnabled = !scene.animationsEnabled)} />
                    <CheckBoxLineComponent label="物理" isSelected={() => scene.physicsEnabled} onSelect={() => (scene.physicsEnabled = !scene.physicsEnabled)} />
                    <CheckBoxLineComponent label="碰撞" isSelected={() => scene.collisionsEnabled} onSelect={() => (scene.collisionsEnabled = !scene.collisionsEnabled)} />
                    <CheckBoxLineComponent label="雾" isSelected={() => scene.fogEnabled} onSelect={() => (scene.fogEnabled = !scene.fogEnabled)} />
                    <CheckBoxLineComponent label="镜头光斑" isSelected={() => scene.lensFlaresEnabled} onSelect={() => (scene.lensFlaresEnabled = !scene.lensFlaresEnabled)} />
                    <CheckBoxLineComponent label="灯光" isSelected={() => scene.lightsEnabled} onSelect={() => (scene.lightsEnabled = !scene.lightsEnabled)} />
                    <CheckBoxLineComponent label="粒子" isSelected={() => scene.particlesEnabled} onSelect={() => (scene.particlesEnabled = !scene.particlesEnabled)} />
                    <CheckBoxLineComponent
                        label="后处理"
                        isSelected={() => scene.postProcessesEnabled}
                        onSelect={() => (scene.postProcessesEnabled = !scene.postProcessesEnabled)}
                    />
                    <CheckBoxLineComponent label="探针" isSelected={() => scene.probesEnabled} onSelect={() => (scene.probesEnabled = !scene.probesEnabled)} />
                    <CheckBoxLineComponent label="纹理" isSelected={() => scene.texturesEnabled} onSelect={() => (scene.texturesEnabled = !scene.texturesEnabled)} />
                    <CheckBoxLineComponent
                        label="可编程纹理"
                        isSelected={() => scene.proceduralTexturesEnabled}
                        onSelect={() => (scene.proceduralTexturesEnabled = !scene.proceduralTexturesEnabled)}
                    />
                    <CheckBoxLineComponent
                        label="渲染目标"
                        isSelected={() => scene.renderTargetsEnabled}
                        onSelect={() => (scene.renderTargetsEnabled = !scene.renderTargetsEnabled)}
                    />
                    <CheckBoxLineComponent label="阴影" isSelected={() => scene.shadowsEnabled} onSelect={() => (scene.shadowsEnabled = !scene.shadowsEnabled)} />
                    <CheckBoxLineComponent label="骨架" isSelected={() => scene.skeletonsEnabled} onSelect={() => (scene.skeletonsEnabled = !scene.skeletonsEnabled)} />
                    <CheckBoxLineComponent label="精灵" isSelected={() => scene.spritesEnabled} onSelect={() => (scene.spritesEnabled = !scene.spritesEnabled)} />
                </LineContainerComponent>
            </div>
        );
    }
}
