import { BaseBladeParams } from '@tweakpane/core';

export interface ProfilerBladePluginParams extends BaseBladeParams {
  view: 'profiler',
  label?: string;
  interval?: number,
}
