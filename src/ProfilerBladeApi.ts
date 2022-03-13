import { BladeApi } from '@tweakpane/core';
import type { LabelController } from '@tweakpane/core';
import type { ProfilerBladeController } from './ProfilerBladeController';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';

export class ProfilerBladeApi extends BladeApi<LabelController<ProfilerBladeController>> {
  public measure( name: string, fn: () => void ): void {
    this.controller_.valueController.measure( name, fn );
  }

  public get measureHandler(): ProfilerBladeMeasureHandler {
    return this.controller_.valueController.measureHandler;
  }
  public set measureHandler( measureHandler: ProfilerBladeMeasureHandler ) {
    this.controller_.valueController.measureHandler = measureHandler;
  }
}
