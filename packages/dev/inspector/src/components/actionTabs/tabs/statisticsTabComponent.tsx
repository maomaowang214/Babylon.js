import type { IPaneComponentProps } from "../paneComponent";
import { PaneComponent } from "../paneComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";

import type { Nullable } from "core/types";
import { EngineInstrumentation } from "core/Instrumentation/engineInstrumentation";
import { SceneInstrumentation } from "core/Instrumentation/sceneInstrumentation";
import { Engine } from "core/Engines/engine";

import { ValueLineComponent } from "shared-ui-components/lines/valueLineComponent";
import { BooleanLineComponent } from "shared-ui-components/lines/booleanLineComponent";
import { PerformanceViewerComponent } from "./performanceViewer/performanceViewerComponent";

export class StatisticsTabComponent extends PaneComponent {
    private _sceneInstrumentation: Nullable<SceneInstrumentation>;
    private _engineInstrumentation: Nullable<EngineInstrumentation>;
    private _timerIntervalId: number;

    constructor(props: IPaneComponentProps) {
        super(props);

        const scene = this.props.scene;

        if (!scene) {
            return;
        }

        this._sceneInstrumentation = new SceneInstrumentation(scene);
        this._sceneInstrumentation.captureActiveMeshesEvaluationTime = true;
        this._sceneInstrumentation.captureRenderTargetsRenderTime = true;
        this._sceneInstrumentation.captureFrameTime = true;
        this._sceneInstrumentation.captureRenderTime = true;
        this._sceneInstrumentation.captureInterFrameTime = true;
        this._sceneInstrumentation.captureParticlesRenderTime = true;
        this._sceneInstrumentation.captureSpritesRenderTime = true;
        this._sceneInstrumentation.capturePhysicsTime = true;
        this._sceneInstrumentation.captureAnimationsTime = true;

        this._engineInstrumentation = new EngineInstrumentation(scene.getEngine());
        this._engineInstrumentation.captureGPUFrameTime = true;

        this._timerIntervalId = window.setInterval(() => this.forceUpdate(), 500);
    }

    componentWillUnmount() {
        if (this._sceneInstrumentation) {
            this._sceneInstrumentation.dispose();
            this._sceneInstrumentation = null;
        }

        if (this._engineInstrumentation) {
            this._engineInstrumentation.dispose();
            this._engineInstrumentation = null;
        }

        window.clearInterval(this._timerIntervalId);
    }

    render() {
        const scene = this.props.scene;

        if (!scene || !this._sceneInstrumentation || !this._engineInstrumentation) {
            return null;
        }

        const engine = scene.getEngine();
        const sceneInstrumentation = this._sceneInstrumentation;
        const engineInstrumentation = this._engineInstrumentation;
        const caps = engine.getCaps();

        return (
            <div className="pane">
                <TextLineComponent label="版本" value={Engine.Version} color="rgb(113, 159, 255)" />
                <ValueLineComponent label="FPS" value={engine.getFps()} fractionDigits={0} />
                <PerformanceViewerComponent scene={scene} />
                <LineContainerComponent title="计数">
                    <TextLineComponent label="总网格数" value={scene.meshes.length.toString()} />
                    <TextLineComponent label="活动网格" value={scene.getActiveMeshes().length.toString()} />
                    <TextLineComponent label="活跃指数" value={scene.getActiveIndices().toString()} />
                    <TextLineComponent label="活动面孔" value={(scene.getActiveIndices() / 3).toString()} />
                    <TextLineComponent label="活跃的骨骼" value={scene.getActiveBones().toString()} />
                    <TextLineComponent label="活性颗粒" value={scene.getActiveParticles().toString()} />
                    <TextLineComponent label="绘制调用" value={sceneInstrumentation.drawCallsCounter.current.toString()} />
                    <TextLineComponent label="总灯数" value={scene.lights.length.toString()} />
                    <TextLineComponent label="顶点总数" value={scene.getTotalVertices().toString()} />
                    <TextLineComponent label="材料总数" value={scene.materials.length.toString()} />
                    <TextLineComponent label="总纹理数" value={scene.textures.length.toString()} />
                </LineContainerComponent>
                <LineContainerComponent title="帧步长持续时间">
                    <ValueLineComponent label="绝对FPS" value={1000.0 / this._sceneInstrumentation!.frameTimeCounter.lastSecAverage} fractionDigits={0} />
                    <ValueLineComponent label="网格选择" value={sceneInstrumentation.activeMeshesEvaluationTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="呈现目标" value={sceneInstrumentation.renderTargetsRenderTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="粒子" value={sceneInstrumentation.particlesRenderTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="精灵" value={sceneInstrumentation.spritesRenderTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="动画" value={sceneInstrumentation.animationsTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="物理" value={sceneInstrumentation.physicsTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="渲染" value={sceneInstrumentation.renderTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="总帧数" value={sceneInstrumentation.frameTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="帧间" value={sceneInstrumentation.interFrameTimeCounter.lastSecAverage} units="ms" />
                    <ValueLineComponent label="GPU 帧时间" value={engineInstrumentation.gpuFrameTimeCounter.lastSecAverage * 0.000001} units="ms" />
                    <ValueLineComponent label="GPU 帧时间（平均）" value={engineInstrumentation.gpuFrameTimeCounter.average * 0.000001} units="ms" />
                </LineContainerComponent>
                <LineContainerComponent title="系统信息">
                    <TextLineComponent label="分辨率" value={engine.getRenderWidth() + "x" + engine.getRenderHeight()} />
                    <TextLineComponent label="硬件缩放级别" value={engine.getHardwareScalingLevel().toString()} />
                    <TextLineComponent label="引擎" value={engine.description} />
                    <BooleanLineComponent label="标准衍生品" value={caps.standardDerivatives} />
                    <BooleanLineComponent label="压缩纹理" value={caps.s3tc !== undefined} />
                    <BooleanLineComponent label="硬件实例" value={caps.instancedArrays} />
                    <BooleanLineComponent label="纹理浮点" value={caps.textureFloat} />
                    <BooleanLineComponent label="质地半浮" value={caps.textureHalfFloat} />
                    <BooleanLineComponent label="渲染为纹理浮点" value={caps.textureFloatRender} />
                    <BooleanLineComponent label="渲染为纹理半浮点" value={caps.textureHalfFloatRender} />
                    <BooleanLineComponent label="32bits 索引" value={caps.uintIndices} />
                    <BooleanLineComponent label="片段深度" value={caps.fragmentDepthSupported} />
                    <BooleanLineComponent label="高精度着色器" value={caps.highPrecisionShaderSupported} />
                    <BooleanLineComponent label="绘制缓冲区" value={caps.drawBuffersExtension} />
                    <BooleanLineComponent label="顶点数组对象" value={caps.vertexArrayObject} />
                    <BooleanLineComponent label="计时器查询" value={caps.timerQuery !== undefined} />
                    <BooleanLineComponent label="模版" value={engine.isStencilEnable} />
                    <BooleanLineComponent label="并行着色器编译" value={caps.parallelShaderCompile != null} />
                    <ValueLineComponent label="最大纹理单位数" value={caps.maxTexturesImageUnits} fractionDigits={0} />
                    <ValueLineComponent label="最大纹理大小" value={caps.maxTextureSize} fractionDigits={0} />
                    <ValueLineComponent label="最大各向异性" value={caps.maxAnisotropy} fractionDigits={0} />
                    <TextLineComponent label="驱动" value={engine.getGlInfo().renderer} />
                </LineContainerComponent>
            </div>
        );
    }
}
