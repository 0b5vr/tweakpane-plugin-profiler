import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';
import type { Ticker, ViewProps } from '@tweakpane/core';

export interface ProfilerControllerConfig {
  ticker: Ticker;
  targetDelta: number;
  bufferSize: number;
  deltaUnit: string;
  fractionDigits: number;
  calcMode: 'frame' | 'mean' | 'median';
  measureHandler: ProfilerBladeMeasureHandler;
  viewProps: ViewProps;
}
