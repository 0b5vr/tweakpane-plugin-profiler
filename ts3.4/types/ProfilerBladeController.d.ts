import { Controller, ViewProps } from '@tweakpane/core';
import { ProfilerBladeView } from './ProfilerBladeView';
import { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeController implements Controller<ProfilerBladeView> {
    targetDelta: number;
    medianBufferSize: number;
    measureHandler: ProfilerBladeMeasureHandler;
    readonly view: ProfilerBladeView;
    readonly viewProps: ViewProps;
    private ticker_;
    private measureStack_;
    private latestEntry_;
    private latestPromiseHandler_;
    private readonly entryCalcCacheMap_;
    constructor(doc: Document, config: ProfilerBladeControllerConfig);
    measure(name: string, fn: () => void): void;
    private onTick_;
}
