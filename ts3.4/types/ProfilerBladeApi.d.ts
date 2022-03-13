import { BladeApi } from '@tweakpane/core';
import { LabelController } from '@tweakpane/core';
import { ProfilerBladeController } from './ProfilerBladeController';
import { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
export declare class ProfilerBladeApi extends BladeApi<LabelController<ProfilerBladeController>> {
    measure(name: string, fn: () => void): void;
    measureHandler: ProfilerBladeMeasureHandler;
}
