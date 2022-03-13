import { Controller, ViewProps } from '@tweakpane/core';
import { ProfilerBladeView } from './ProfilerBladeView';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerEntry } from './ProfilerEntry';
export declare class ProfilerBladeController implements Controller<ProfilerBladeView> {
    targetDelta: number;
    bufferSize: number;
    measureHandler: ProfilerBladeMeasureHandler;
    readonly view: ProfilerBladeView;
    readonly viewProps: ViewProps;
    private ticker_;
    private rootCalcCacheStack_;
    constructor(doc: Document, config: ProfilerBladeControllerConfig);
    measure(name: string, fn: () => void): Promise<void>;
    renderEntry(): ProfilerEntry;
    private renderEntryFromCalcCache_;
    private onTick_;
    private createNewEntryCalcCache_;
}
