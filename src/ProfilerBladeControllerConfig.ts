import type { Ticker, ViewProps } from '@tweakpane/core';

export interface ProfilerBladeControllerConfig {
  ticker: Ticker;
  targetLength: number;
  unitString: string;
  fractionDigits: number;
  viewProps: ViewProps;
}
