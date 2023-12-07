import type { Observable } from "core/Misc/observable";
import * as React from "react";

interface IPerformancePlayheadButtonProps {
    returnToPlayhead: Observable<void>;
}
export const PerformancePlayheadButtonComponent: React.FC<IPerformancePlayheadButtonProps> = ({ returnToPlayhead }) => {
    const onReturnToPlayheadClick = () => {
        returnToPlayhead.notifyObservers();
    };

    return (
        <button className="performancePlayheadButton" onClick={onReturnToPlayheadClick} title="返回播放头">
            返回
        </button>
    );
};
