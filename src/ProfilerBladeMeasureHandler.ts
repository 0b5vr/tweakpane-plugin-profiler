export interface ProfilerBladeMeasureHandler {
  measure: ( fn: () => void ) => number | Promise<number>;
}
