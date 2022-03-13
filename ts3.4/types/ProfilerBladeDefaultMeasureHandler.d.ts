import { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
    measure(fn: () => void): number;
}
