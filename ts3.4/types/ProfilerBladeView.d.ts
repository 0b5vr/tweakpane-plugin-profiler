import { ProfilerBladeViewConfig } from './ProfilerBladeViewConfig';
import { ProfilerEntry } from './ProfilerEntry';
import { View } from '@tweakpane/core';
export declare class ProfilerBladeView implements View {
    targetDelta: number;
    deltaUnit: string;
    fractionDigits: number;
    readonly element: HTMLElement;
    private readonly svgRootElement_;
    private readonly entryContainerElement_;
    private readonly tooltipElement_;
    private readonly tooltipInsideElement_;
    private readonly labelElement_;
    private readonly entryElementCacheMap_;
    private hoveringEntry_;
    constructor(doc: Document, config: ProfilerBladeViewConfig);
    update(rootEntry: ProfilerEntry): void;
    private updateTooltip_;
    private addEntry_;
    private deltaToDisplayDelta;
}
