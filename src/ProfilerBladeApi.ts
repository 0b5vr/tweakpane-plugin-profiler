import { BladeApi, LabelController } from '@tweakpane/core';
import type { ProfilerBladeController } from './ProfilerBladeController';

export class ProfilerBladeApi extends BladeApi<LabelController<ProfilerBladeController>> {
  public haha(): void {
    this.controller_.valueController.haha();
  }
}
