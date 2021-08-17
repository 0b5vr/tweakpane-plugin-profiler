export interface ProfilerBladeMeasureHandler {
  measure: ( path: string, fn: () => void ) => number;
}
