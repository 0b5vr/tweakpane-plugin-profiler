import type { BaseBladeParams } from '@tweakpane/core';

export interface ProfilerBladePluginParams extends BaseBladeParams {
  view: 'profiler';
  targetLength?: number;
  unitString?: string;
  fractionDigits?: number;
  label?: string;
  interval?: number;
}
