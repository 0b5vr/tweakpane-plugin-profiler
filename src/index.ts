import { ProfilerBladePlugin } from './ProfilerBladePlugin.js';
import type { TpPlugin } from 'tweakpane';

// TODO evaluate need for these exports
export { ProfilerBladeDefaultMeasureHandler } from './ProfilerBladeDefaultMeasureHandler.js';
export type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler.js';
export { ProfilerBladePlugin } from './ProfilerBladePlugin.js';
export { ProfilerBladePlugin as plugin } from './ProfilerBladePlugin.js';

export const id = 'profiler';

export const css = '__css__';

export const plugins: TpPlugin[] = [
  ProfilerBladePlugin,
];
