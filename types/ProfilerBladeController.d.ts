import { Controller, ViewProps } from '@tweakpane/core';
import { ProfilerBladeView } from './ProfilerBladeView';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeController implements Controller<ProfilerBladeView> {
    targetDelta: number;
    bufferSize: number;
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
