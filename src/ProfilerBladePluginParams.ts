import type { BaseBladeParams } from '@tweakpane/core';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';

export interface ProfilerBladePluginParams extends BaseBladeParams {
  view: 'profiler';
  targetDelta?: number;
  medianBufferSize?: number;
  deltaUnit?: string;
  fractionDigits?: number;
  label?: string;
  interval?: number;
  measureHandler?: ProfilerBladeMeasureHandler;
}
