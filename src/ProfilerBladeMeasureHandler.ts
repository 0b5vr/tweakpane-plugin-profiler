export interface ProfilerBladeMeasureHandler {
  measureStart: () => () => number | Promise<number>;
}
