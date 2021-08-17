import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';

export class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
  public measure( name: string, fn: () => void ): number {
    const begin = performance.now();

    fn();

    return performance.now() - begin;
  }
}
