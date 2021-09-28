/**
 * Useful for tap tempo
 */
export declare class HistoryMeanCalculator {
    private __recalcForEach;
    private __countUntilRecalc;
    private __history;
    private __index;
    private __length;
    private __count;
    private __cache;
    constructor(length: number);
    readonly mean: number;
    recalcForEach: number;
    reset(): void;
    push(value: number): void;
    recalc(): void;
}
