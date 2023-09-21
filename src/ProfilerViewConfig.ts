import type { ViewProps } from '@tweakpane/core';

export interface ProfilerViewConfig {
  targetDelta: number;
  deltaUnit: string;
  fractionDigits: number;
  calcMode: 'frame' | 'mean' | 'median';
  viewProps: ViewProps;
}
