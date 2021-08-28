import { BladeApi } from '@tweakpane/core';
import type { LabelController } from '@tweakpane/core';
import type { ProfilerBladeController } from './ProfilerBladeController';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeApi extends BladeApi<LabelController<ProfilerBladeController>> {
    measure(path: string, fn: () => void): void;
    get measureHandler(): ProfilerBladeMeasureHandler;
    set measureHandler(measureHandler: ProfilerBladeMeasureHandler);
}
