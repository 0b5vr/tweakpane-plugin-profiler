import { Constants, IntervalTicker, ManualTicker, Ticker } from '@tweakpane/core';

export function createTicker(
  document: Document,
  interval: number | undefined,
): Ticker {
  return interval === 0
    ? new ManualTicker()
    : new IntervalTicker(
      document,
      interval ?? Constants.monitor.defaultInterval,
    );
}
