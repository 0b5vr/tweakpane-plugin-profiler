import { BladeApi } from '@tweakpane/core';
import type { ProfilerBladeController } from './ProfilerBladeController.js';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';

export class ProfilerBladeApi extends BladeApi<ProfilerBladeController> {
  public measure( name: string, fn: () => void ): void {
    this.controller.valueController.measure( name, fn );
  }

  public get measureHandler(): ProfilerBladeMeasureHandler {
    return this.controller.valueController.measureHandler;
  }
  public set measureHandler( measureHandler: ProfilerBladeMeasureHandler ) {
    this.controller.valueController.measureHandler = measureHandler;
  }
}
