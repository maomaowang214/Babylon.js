import * as React from "react";
import type { Observable } from "core/Misc/observable";
import type { IShadowLight } from "core/Lights/shadowLight";
import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../../../globalState";
import { OptionsLineComponent } from "shared-ui-components/lines/optionsLineComponent";
import { ShadowGenerator } from "core/Lights/Shadows/shadowGenerator";
import { CascadedShadowGenerator } from "core/Lights/Shadows/cascadedShadowGenerator";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { DirectionalLight } from "core/Lights/directionalLight";

interface ICommonShadowLightPropertyGridComponentProps {
    globalState: GlobalState;
    light: IShadowLight;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class CommonShadowLightPropertyGridComponent extends React.Component<ICommonShadowLightPropertyGridComponentProps> {
    private _internals: { generatorType: number; mapSize: number };

    constructor(props: ICommonShadowLightPropertyGridComponentProps) {
        super(props);

        this._internals = {
            generatorType: 0,
            mapSize: 1024,
        };
    }

    createShadowGenerator() {
        const light = this.props.light;
        const scene = light.getScene();
        const internals = this._internals;
        const generator = internals.generatorType === 0 ? new ShadowGenerator(internals.mapSize, light) : new CascadedShadowGenerator(internals.mapSize, light as DirectionalLight);

        scene.meshes.forEach((m) => {
            if (m.infiniteDistance) {
                return;
            }
            generator.addShadowCaster(m);
            if (!m.isAnInstance) {
                m.receiveShadows = true;
            }
        });

        this.forceUpdate();
    }

    disposeShadowGenerator() {
        const light = this.props.light;

        light.getShadowGenerator()?.dispose();

        this.forceUpdate();
    }

    render() {
        const light = this.props.light;
        const internals = this._internals;
        const generator = (light.getShadowGenerator() as ShadowGenerator | CascadedShadowGenerator) || null;
        const csmGenerator = generator instanceof CascadedShadowGenerator;
        const camera = light.getScene().activeCamera;

        const typeGeneratorOptions = [{ label: "阴影生成器", value: 0 }];

        if (light instanceof DirectionalLight) {
            typeGeneratorOptions.push({ label: "级联阴影生成器", value: 1 });
        }

        const mapSizeOptions = [
            { label: "4096x4096", value: 4096 },
            { label: "2048x2048", value: 2048 },
            { label: "1024x1024", value: 1024 },
            { label: "512x512", value: 512 },
            { label: "256x256", value: 256 },
        ];

        let blurModeOptions;

        if (generator instanceof CascadedShadowGenerator) {
            blurModeOptions = [
                { label: "None", value: ShadowGenerator.FILTER_NONE },
                { label: "PCF", value: ShadowGenerator.FILTER_PCF },
                { label: "PCSS", value: ShadowGenerator.FILTER_PCSS },
            ];
        } else {
            blurModeOptions = [
                { label: "None", value: ShadowGenerator.FILTER_NONE },
                { label: "PCF", value: ShadowGenerator.FILTER_PCF },
                { label: "PCSS", value: ShadowGenerator.FILTER_PCSS },
                { label: "Poisson", value: ShadowGenerator.FILTER_POISSONSAMPLING },
                { label: "指数", value: ShadowGenerator.FILTER_EXPONENTIALSHADOWMAP },
                { label: "模糊指数", value: ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP },
                { label: "关闭指数", value: ShadowGenerator.FILTER_CLOSEEXPONENTIALSHADOWMAP },
                { label: "关闭模糊指数", value: ShadowGenerator.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP },
            ];
        }

        const filteringQualityOptions = [
            { label: "低", value: ShadowGenerator.QUALITY_LOW },
            { label: "中", value: ShadowGenerator.QUALITY_MEDIUM },
            { label: "高", value: ShadowGenerator.QUALITY_HIGH },
        ];

        const numCascadesOptions = [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
        ];

        const near = camera ? camera.minZ : 0,
            far = camera ? (camera.maxZ ? camera.maxZ : 500000) : 0;

        const filter = generator ? generator.filter : 0;

        return (
            <div>
                <LineContainerComponent title="阴影" selection={this.props.globalState}>
                    <CheckBoxLineComponent
                        label="已启用阴影"
                        target={light}
                        propertyName="shadowEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {!csmGenerator && (
                        <>
                            <FloatLineComponent
                                lockObject={this.props.lockObject}
                                label="平面附近的阴影"
                                target={light}
                                propertyName="shadowMinZ"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                            <FloatLineComponent
                                lockObject={this.props.lockObject}
                                label="阴影远平面"
                                target={light}
                                propertyName="shadowMaxZ"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        </>
                    )}
                </LineContainerComponent>
                {generator == null && (
                    <LineContainerComponent title="阴影生成器" selection={this.props.globalState}>
                        <OptionsLineComponent label="类型" options={typeGeneratorOptions} target={internals} propertyName="generatorType" />
                        <OptionsLineComponent label="地图大小" options={mapSizeOptions} target={internals} propertyName="mapSize" />
                        <ButtonLineComponent label="创建生成器" onClick={() => this.createShadowGenerator()} />
                    </LineContainerComponent>
                )}
                {generator !== null && (
                    <LineContainerComponent title="阴影生成器" selection={this.props.globalState}>
                        <ButtonLineComponent label="删除生成器" onClick={() => this.disposeShadowGenerator()} />
                        {csmGenerator && (
                            <>
                                <OptionsLineComponent
                                    label="在级联"
                                    options={numCascadesOptions}
                                    target={generator}
                                    propertyName="numCascades"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <CheckBoxLineComponent
                                    label="调试模式"
                                    target={generator}
                                    propertyName="debug"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <CheckBoxLineComponent
                                    label="稳定级联"
                                    target={generator}
                                    propertyName="stabilizeCascades"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="Lambda"
                                    minimum={0}
                                    maximum={1.0}
                                    step={0.01}
                                    target={generator}
                                    propertyName="lambda"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="级联混合"
                                    minimum={0}
                                    maximum={1.0}
                                    step={0.01}
                                    target={generator}
                                    propertyName="cascadeBlendPercentage"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <CheckBoxLineComponent
                                    label="深度夹"
                                    target={generator}
                                    propertyName="depthClamp"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <CheckBoxLineComponent
                                    label="自动计算深度边界"
                                    target={generator}
                                    propertyName="autoCalcDepthBounds"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="阴影最大Z"
                                    minimum={near}
                                    maximum={far}
                                    step={0.5}
                                    target={generator}
                                    propertyName="shadowMaxZ"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            </>
                        )}
                        <FloatLineComponent
                            lockObject={this.props.lockObject}
                            digits={4}
                            step="0.0001"
                            label="Bias"
                            target={generator}
                            propertyName="bias"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <FloatLineComponent
                            lockObject={this.props.lockObject}
                            label="正常的偏差"
                            target={generator}
                            propertyName="normalBias"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="黑暗"
                            target={generator}
                            minimum={0}
                            maximum={1}
                            step={0.01}
                            propertyName="darkness"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <CheckBoxLineComponent
                            label="允许透明阴影"
                            target={generator}
                            propertyName="transparencyShadow"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        <OptionsLineComponent
                            label="过滤器"
                            options={blurModeOptions}
                            onSelect={() => {
                                this.forceUpdate();
                            }}
                            target={generator}
                            propertyName="filter"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                        {(filter === ShadowGenerator.FILTER_PCF || filter === ShadowGenerator.FILTER_PCSS) && (
                            <OptionsLineComponent
                                label="过滤性能"
                                options={filteringQualityOptions}
                                onSelect={() => {
                                    this.forceUpdate();
                                }}
                                target={generator}
                                propertyName="filteringQuality"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        )}
                        {filter === ShadowGenerator.FILTER_PCSS && (
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="半影比率"
                                minimum={0}
                                maximum={0.5}
                                step={0.001}
                                target={generator}
                                propertyName="contactHardeningLightSizeUVRatio"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        )}
                        {!csmGenerator && (filter === ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP || filter === ShadowGenerator.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP) && (
                            <CheckBoxLineComponent
                                label="使用内核模糊"
                                target={generator}
                                propertyName="useKernelBlur"
                                onValueChanged={() => this.forceUpdate()}
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        )}
                        {generator instanceof ShadowGenerator &&
                            (filter === ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP || filter === ShadowGenerator.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP) &&
                            !generator.useKernelBlur && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="模糊框偏移"
                                    target={generator}
                                    propertyName="blurBoxOffset"
                                    minimum={1}
                                    maximum={64}
                                    step={1}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                        {generator instanceof ShadowGenerator &&
                            (filter === ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP || filter === ShadowGenerator.FILTER_BLURCLOSEEXPONENTIALSHADOWMAP) &&
                            generator.useKernelBlur && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="模糊的内核"
                                    target={generator}
                                    propertyName="blurKernel"
                                    minimum={1}
                                    maximum={64}
                                    step={1}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                        {generator instanceof ShadowGenerator &&
                            (filter === ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP || filter === ShadowGenerator.FILTER_EXPONENTIALSHADOWMAP) && (
                                <FloatLineComponent
                                    lockObject={this.props.lockObject}
                                    label="深度范围内"
                                    target={generator}
                                    propertyName="depthScale"
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                        {generator instanceof ShadowGenerator &&
                            (filter === ShadowGenerator.FILTER_BLUREXPONENTIALSHADOWMAP || filter === ShadowGenerator.FILTER_EXPONENTIALSHADOWMAP) && (
                                <SliderLineComponent
                                    lockObject={this.props.lockObject}
                                    label="模糊的规模"
                                    target={generator}
                                    propertyName="blurScale"
                                    minimum={1}
                                    maximum={4}
                                    step={1}
                                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                                />
                            )}
                        {csmGenerator && filter === ShadowGenerator.FILTER_PCSS && (
                            <SliderLineComponent
                                lockObject={this.props.lockObject}
                                label="半影黑暗"
                                minimum={0}
                                maximum={1.0}
                                step={0.01}
                                target={generator}
                                propertyName="penumbraDarkness"
                                onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                            />
                        )}
                    </LineContainerComponent>
                )}
            </div>
        );
    }
}
