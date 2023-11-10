import { Blade, LabelProps } from '@tweakpane/core';
import { ProfilerController } from './ProfilerController.js';

export interface ProfilerBladeControllerConfig {
  blade: Blade;
  labelProps: LabelProps;
  valueController: ProfilerController;
}
