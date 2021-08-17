import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';

export class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
  public measure( name: string, fn: () => void ): number {
    const begin = performance.now();

    fn();

    const delta = performance.now() - begin;

    return delta;
  }
}
