import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { PostProcess } from "core/PostProcesses/postProcess";
import { Color3LineComponent } from "shared-ui-components/lines/color3LineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import type { GlobalState } from "../../../../globalState";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { TextInputLineComponent } from "shared-ui-components/lines/textInputLineComponent";
import { CustomPropertyGridComponent } from "../customPropertyGridComponent";

interface ICommonPostProcessPropertyGridComponentProps {
    globalState: GlobalState;
    postProcess: PostProcess;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class CommonPostProcessPropertyGridComponent extends React.Component<ICommonPostProcessPropertyGridComponentProps> {
    constructor(props: ICommonPostProcessPropertyGridComponentProps) {
        super(props);
    }

    render() {
        const postProcess = this.props.postProcess;

        return (
            <div>
                <CustomPropertyGridComponent
                    globalState={this.props.globalState}
                    target={postProcess}
                    lockObject={this.props.lockObject}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextLineComponent label="类型" value={postProcess.getClassName()} />
                    <TextInputLineComponent
                        lockObject={this.props.lockObject}
                        label="名称"
                        target={postProcess}
                        propertyName="name"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    {postProcess.width && <TextLineComponent label="宽度" value={postProcess.width.toString()} />}
                    {postProcess.height && <TextLineComponent label="高度" value={postProcess.height.toString()} />}
                    <CheckBoxLineComponent label="自动清除" target={postProcess} propertyName="autoClear" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    {postProcess.clearColor && (
                        <Color3LineComponent
                            lockObject={this.props.lockObject}
                            label="清理颜色"
                            target={postProcess}
                            propertyName="clearColor"
                            onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        />
                    )}
                    <CheckBoxLineComponent
                        label="完美像素"
                        target={postProcess}
                        propertyName="enablePixelPerfectMode"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="全屏窗口"
                        target={postProcess}
                        propertyName="forceFullscreenViewport"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="样品"
                        target={postProcess}
                        propertyName="samples"
                        minimum={1}
                        maximum={8}
                        step={1}
                        decimalCount={0}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <ButtonLineComponent
                        label="删除"
                        onClick={() => {
                            postProcess.dispose();
                            this.props.globalState.onSelectionChangedObservable.notifyObservers(null);
                        }}
                    />
                </LineContainerComponent>
            </div>
        );
    }
}
