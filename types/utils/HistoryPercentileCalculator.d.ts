/**
 * Useful for fps calc
 * See also: {@link HistoryMeanCalculator}
 */
export declare class HistoryPercentileCalculator {
    private __history;
    private __sorted;
    private __index;
    private readonly __length;
    constructor(length: number);
    get median(): number;
    percentile(percentile: number): number;
    reset(): void;
    push(value: number): void;
}
