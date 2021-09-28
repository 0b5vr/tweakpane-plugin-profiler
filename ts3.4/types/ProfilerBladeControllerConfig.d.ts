import { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import { Ticker, ViewProps } from '@tweakpane/core';
export interface ProfilerBladeControllerConfig {
    ticker: Ticker;
    targetDelta: number;
    bufferSize: number;
    deltaUnit: string;
    fractionDigits: number;
    calcMode: 'frame' | 'mean' | 'median';
    measureHandler: ProfilerBladeMeasureHandler;
    viewProps: ViewProps;
}
