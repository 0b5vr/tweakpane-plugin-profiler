import { BladeApi } from '@tweakpane/core';
import type { ProfilerBladeController } from './ProfilerBladeController.js';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';

export class ProfilerBladeApi extends BladeApi<ProfilerBladeController> {
  public measureStart( name: string ): void {
    this.controller.valueController.measureStart( name );
  }

  public measureEnd(): Promise<void> {
    return this.controller.valueController.measureEnd();
  }

  public measure( name: string, fn: () => void ): void {
    this.controller.valueController.measure( name, fn );
  }

  public measureAsync( name: string, fn: () => Promise<void> ): Promise<void> {
    return this.controller.valueController.measureAsync( name, fn );
  }

  public get measureHandler(): ProfilerBladeMeasureHandler {
    return this.controller.valueController.measureHandler;
  }
  public set measureHandler( measureHandler: ProfilerBladeMeasureHandler ) {
    this.controller.valueController.measureHandler = measureHandler;
  }
}
