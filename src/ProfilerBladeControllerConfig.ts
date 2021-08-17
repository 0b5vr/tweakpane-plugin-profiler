import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { Ticker, ViewProps } from '@tweakpane/core';

export interface ProfilerBladeControllerConfig {
  ticker: Ticker;
  targetDelta: number;
  deltaUnit: string;
  fractionDigits: number;
  measureHandler: ProfilerBladeMeasureHandler;
  viewProps: ViewProps;
}
