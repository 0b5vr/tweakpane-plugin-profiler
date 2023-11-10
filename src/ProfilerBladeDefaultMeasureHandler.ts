import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';

export class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
  public measureStart(): () => number {
    const begin = performance.now();
    return () => performance.now() - begin;
  }
}
