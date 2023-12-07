import * as React from "react";

import type { Observable } from "core/Misc/observable";
import type { GlobalState } from "../../../../globalState";
import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import type { SphereParticleEmitter } from "core/Particles/EmitterTypes/sphereParticleEmitter";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";

interface ISphereEmitterGridComponentProps {
    globalState: GlobalState;
    emitter: SphereParticleEmitter;
    lockObject: LockObject;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class SphereEmitterGridComponent extends React.Component<ISphereEmitterGridComponentProps> {
    constructor(props: ISphereEmitterGridComponentProps) {
        super(props);
    }

    render() {
        const emitter = this.props.emitter;
        return (
            <>
                <FloatLineComponent
                    lockObject={this.props.lockObject}
                    label="半径"
                    target={emitter}
                    propertyName="radius"
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                />
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
                    label="方向随机化器"
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
