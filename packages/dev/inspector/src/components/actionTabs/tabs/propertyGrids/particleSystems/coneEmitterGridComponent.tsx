import * as React from "react";

import type { Observable } from "core/Misc/observable";
import type { GlobalState } from "../../../../globalState";
import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { ConeParticleEmitter } from "core/Particles/EmitterTypes/coneParticleEmitter";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";

interface IConeEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: ConeParticleEmitter;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class ConeEmitterGridComponent extends React.Component<IConeEmitterGridComponentProps> {
    constructor(props: IConeEmitterGridComponentProps) {
        super(props);
    }

    render() {
        const emitter = this.props.emitter;
        return (
            <>
                <SliderLineComponent
                    lockObject={this.props.lockObject}
                    label="半径范围"
                    target={emitter}
                    propertyName="radiusRange"
                    minimum={0}
                    maximum={1}
                    step={0.01}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <SliderLineComponent
                    lockObject={this.props.lockObject}
                    label="高度范围"
                    target={emitter}
                    propertyName="heightRange"
                    minimum={0}
                    maximum={1}
                    step={0.01}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <CheckBoxLineComponent
                    label="只能从刷出点发射"
                    target={emitter}
                    propertyName="emitFromSpawnPointOnly"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
                <SliderLineComponent
                    lockObject={this.props.lockObject}
                    label="方向随机函数发生器"
                    target={emitter}
                    propertyName="directionRandomizer"
                    minimum={0}
                    maximum={1}
                    step={0.01}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
            </>
        );
    }
}
