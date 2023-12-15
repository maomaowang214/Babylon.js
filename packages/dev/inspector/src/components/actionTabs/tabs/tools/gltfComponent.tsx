import * as React from "react";
import type { Scene } from "core/scene";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import type { GlobalState } from "../../../globalState";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import { OptionsLineComponent } from "shared-ui-components/lines/optionsLineComponent";
import { MessageLineComponent } from "shared-ui-components/lines/messageLineComponent";
import { faCheck, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
// TODO - does it still work if loading the modules from the correct files?
// eslint-disable-next-line import/no-internal-modules
import { GLTFLoaderCoordinateSystemMode, GLTFLoaderAnimationStartMode } from "loaders/glTF/index";
import type { Nullable } from "core/types";
import type { Observer } from "core/Misc/observable";
import type { IGLTFValidationResults } from "babylonjs-gltf2interface";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";

interface IGLTFComponentProps {
    scene: Scene;
    globalState: GlobalState;
    lockObject: LockObject;
}

export class GLTFComponent extends React.Component<IGLTFComponentProps> {
    private _onValidationResultsUpdatedObserver: Nullable<Observer<Nullable<IGLTFValidationResults>>> = null;

    openValidationDetails() {
        const validationResults = this.props.globalState.validationResults;
        const win = window.open("", "_blank");
        if (win) {
            // TODO: format this better and use generator registry (https://github.com/KhronosGroup/glTF-Generator-Registry)
            win.document.title = "glTF 验证结果";
            win.document.body.innerText = JSON.stringify(validationResults, null, 2);
            win.document.body.style.whiteSpace = "pre";
            win.document.body.style.fontFamily = `monospace`;
            win.document.body.style.fontSize = `14px`;
            win.focus();
        }
    }

    prepareText(singularForm: string, count: number) {
        if (count) {
            return `${count} ${singularForm}s`;
        }

        return `${singularForm}`;
    }

    componentDidMount() {
        if (this.props.globalState) {
            this._onValidationResultsUpdatedObserver = this.props.globalState.onValidationResultsUpdatedObservable.add(() => {
                this.forceUpdate();
            });
        }
    }

    componentWillUnmount() {
        if (this.props.globalState) {
            if (this._onValidationResultsUpdatedObserver) {
                this.props.globalState.onValidationResultsUpdatedObservable.remove(this._onValidationResultsUpdatedObserver);
            }
        }
    }

    renderValidation() {
        const validationResults = this.props.globalState.validationResults;
        if (!validationResults) {
            return null;
        }

        const issues = validationResults.issues;

        return (
            <LineContainerComponent title="GLTF 验证" closed={!issues.numErrors && !issues.numWarnings} selection={this.props.globalState}>
                {issues.numErrors !== 0 && <MessageLineComponent text="您的文件存在一些验证问题" icon={faTimesCircle} color="Red" />}
                {issues.numErrors === 0 && <MessageLineComponent text="您的文件是有效的 glTF 文件" icon={faCheck} color="Green" />}
                <TextLineComponent label="错误" value={issues.numErrors.toString()} />
                <TextLineComponent label="警告" value={issues.numWarnings.toString()} />
                <TextLineComponent label="信息" value={issues.numInfos.toString()} />
                <TextLineComponent label="提示" value={issues.numHints.toString()} />
                <TextLineComponent label="更多详情" value="Click here" onLink={() => this.openValidationDetails()} />
            </LineContainerComponent>
        );
    }

    render() {
        const extensionStates = this.props.globalState.glTFLoaderExtensionDefaults;
        const loaderState = this.props.globalState.glTFLoaderDefaults;

        const animationStartMode =
            typeof GLTFLoaderAnimationStartMode !== "undefined"
                ? [
                      { label: "None", value: GLTFLoaderAnimationStartMode.NONE },
                      { label: "First", value: GLTFLoaderAnimationStartMode.FIRST },
                      { label: "ALL", value: GLTFLoaderAnimationStartMode.ALL },
                  ]
                : [
                      { label: "None", value: 0 },
                      { label: "First", value: 1 },
                      { label: "ALL", value: 2 },
                  ];

        const coordinateSystemMode =
            typeof GLTFLoaderCoordinateSystemMode !== "undefined"
                ? [
                      { label: "Auto", value: GLTFLoaderCoordinateSystemMode.AUTO },
                      { label: "Right handed", value: GLTFLoaderCoordinateSystemMode.FORCE_RIGHT_HANDED },
                  ]
                : [
                      { label: "Auto", value: 0 },
                      { label: "Right handed", value: 1 },
                  ];

        return (
            <div>
                <LineContainerComponent title="GLTF加载" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent label="始终计算边界框" target={loaderState} propertyName="alwaysComputeBoundingBox" />
                    <CheckBoxLineComponent label="始终计算主干根节点" target={loaderState} propertyName="alwaysComputeSkeletonRootNode" />
                    <OptionsLineComponent label="动画启动模式" options={animationStartMode} target={loaderState} propertyName="animationStartMode" />
                    <CheckBoxLineComponent label="捕获性能计数器" target={loaderState} propertyName="capturePerformanceCounters" />
                    <CheckBoxLineComponent label="编译材料" target={loaderState} propertyName="compileMaterials" />
                    <CheckBoxLineComponent label="编译阴影生成器" target={loaderState} propertyName="compileShadowGenerators" />
                    <OptionsLineComponent label="坐标系" options={coordinateSystemMode} target={loaderState} propertyName="coordinateSystemMode" />
                    <CheckBoxLineComponent label="创建实例" target={loaderState} propertyName="createInstances" />
                    <CheckBoxLineComponent label="启用日志记录" target={loaderState} propertyName="loggingEnabled" />
                    <CheckBoxLineComponent label="装载所有材料" target={loaderState} propertyName="loadAllMaterials" />
                    <FloatLineComponent lockObject={this.props.lockObject} label="目标 FPS" target={loaderState} propertyName="targetFps" isInteger={true} />
                    <CheckBoxLineComponent label="透明度作为覆盖范围" target={loaderState} propertyName="transparencyAsCoverage" />
                    <CheckBoxLineComponent label="使用剪辑平面" target={loaderState} propertyName="useClipPlane" />
                    <CheckBoxLineComponent label="使用sRGB缓冲区" target={loaderState} propertyName="useSRGBBuffers" />
                    <CheckBoxLineComponent label="验证" target={loaderState} propertyName="validate" />
                    <MessageLineComponent text="您需要重新加载文件才能看到这些更改" />
                </LineContainerComponent>
                <LineContainerComponent title="GLTF 扩展" closed={true} selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="EXT_lights_image_based"
                        isSelected={() => extensionStates["EXT_lights_image_based"].enabled}
                        onSelect={(value) => (extensionStates["EXT_lights_image_based"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="EXT_mesh_gpu_instancing"
                        isSelected={() => extensionStates["EXT_mesh_gpu_instancing"].enabled}
                        onSelect={(value) => (extensionStates["EXT_mesh_gpu_instancing"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="EXT_texture_webp"
                        isSelected={() => extensionStates["EXT_texture_webp"].enabled}
                        onSelect={(value) => (extensionStates["EXT_texture_webp"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_draco_mesh_compression"
                        isSelected={() => extensionStates["KHR_draco_mesh_compression"].enabled}
                        onSelect={(value) => (extensionStates["KHR_draco_mesh_compression"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_pbrSpecularGloss..."
                        isSelected={() => extensionStates["KHR_materials_pbrSpecularGlossiness"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_pbrSpecularGlossiness"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_clearcoat"
                        isSelected={() => extensionStates["KHR_materials_clearcoat"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_clearcoat"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_iridescence"
                        isSelected={() => extensionStates["KHR_materials_iridescence"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_iridescence"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_anisotropy"
                        isSelected={() => extensionStates["KHR_materials_anisotropy"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_anisotropy"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_emissive_strength"
                        isSelected={() => extensionStates["KHR_materials_emissive_strength"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_emissive_strength"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_ior"
                        isSelected={() => extensionStates["KHR_materials_ior"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_ior"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_sheen"
                        isSelected={() => extensionStates["KHR_materials_sheen"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_sheen"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_specular"
                        isSelected={() => extensionStates["KHR_materials_specular"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_specular"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_unlit"
                        isSelected={() => extensionStates["KHR_materials_unlit"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_unlit"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_variants"
                        isSelected={() => extensionStates["KHR_materials_variants"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_variants"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_transmission"
                        isSelected={() => extensionStates["KHR_materials_transmission"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_transmission"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_translucency"
                        isSelected={() => extensionStates["KHR_materials_translucency"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_translucency"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_materials_volume"
                        isSelected={() => extensionStates["KHR_materials_volume"].enabled}
                        onSelect={(value) => (extensionStates["KHR_materials_volume"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_mesh_quantization"
                        isSelected={() => extensionStates["KHR_mesh_quantization"].enabled}
                        onSelect={(value) => (extensionStates["KHR_mesh_quantization"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_lights_punctual"
                        isSelected={() => extensionStates["KHR_lights_punctual"].enabled}
                        onSelect={(value) => (extensionStates["KHR_lights_punctual"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_texture_basisu"
                        isSelected={() => extensionStates["KHR_texture_basisu"].enabled}
                        onSelect={(value) => (extensionStates["KHR_texture_basisu"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_texture_transform"
                        isSelected={() => extensionStates["KHR_texture_transform"].enabled}
                        onSelect={(value) => (extensionStates["KHR_texture_transform"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="KHR_xmp_json_ld"
                        isSelected={() => extensionStates["KHR_xmp_json_ld"].enabled}
                        onSelect={(value) => (extensionStates["KHR_xmp_json_ld"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="MSFT_lod"
                        isSelected={() => extensionStates["MSFT_lod"].enabled}
                        onSelect={(value) => (extensionStates["MSFT_lod"].enabled = value)}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="Maximum LODs"
                        target={extensionStates["MSFT_lod"]}
                        propertyName="maxLODsToLoad"
                        additionalClass="gltf-extension-property"
                        isInteger={true}
                    />
                    <CheckBoxLineComponent
                        label="MSFT_minecraftMesh"
                        isSelected={() => extensionStates["MSFT_minecraftMesh"].enabled}
                        onSelect={(value) => (extensionStates["MSFT_minecraftMesh"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="MSFT_sRGBFactors"
                        isSelected={() => extensionStates["MSFT_sRGBFactors"].enabled}
                        onSelect={(value) => (extensionStates["MSFT_sRGBFactors"].enabled = value)}
                    />
                    <CheckBoxLineComponent
                        label="MSFT_audio_emitter"
                        isSelected={() => extensionStates["MSFT_audio_emitter"].enabled}
                        onSelect={(value) => (extensionStates["MSFT_audio_emitter"].enabled = value)}
                    />
                    <MessageLineComponent text="您需要重新加载文件才能看到这些更改" />
                </LineContainerComponent>
                {this.props.globalState.validationResults && this.renderValidation()}
            </div>
        );
    }
}
