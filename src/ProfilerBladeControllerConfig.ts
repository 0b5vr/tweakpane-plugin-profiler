import { BufferedValue, Ticker, ViewProps } from '@tweakpane/core';

export interface ProfilerBladeControllerConfig {
  ticker: Ticker;
  value: BufferedValue<number>;
  viewProps: ViewProps;
}
