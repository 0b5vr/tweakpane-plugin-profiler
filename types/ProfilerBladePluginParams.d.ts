import type { BaseBladeParams } from '@tweakpane/core';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export interface ProfilerBladePluginParams extends BaseBladeParams {
    view: 'profiler';
    targetDelta?: number;
    bufferSize?: number;
    deltaUnit?: string;
    fractionDigits?: number;
    calcMode?: 'frame' | 'mean' | 'median';
    label?: string;
    interval?: number;
    measureHandler?: ProfilerBladeMeasureHandler;
}
