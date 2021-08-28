import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
    measure(name: string, fn: () => void): number;
}
