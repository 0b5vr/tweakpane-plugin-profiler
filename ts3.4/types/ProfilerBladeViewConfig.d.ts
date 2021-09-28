import { ViewProps } from '@tweakpane/core';
export interface ProfilerBladeViewConfig {
    targetDelta: number;
    deltaUnit: string;
    fractionDigits: number;
    calcMode: 'frame' | 'mean' | 'median';
    viewProps: ViewProps;
}
