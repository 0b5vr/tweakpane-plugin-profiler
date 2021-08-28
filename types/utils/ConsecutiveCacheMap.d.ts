export declare class ConsecutiveCacheMap<TKey, TValue> {
    private readonly __map;
    private readonly __setUsed;
    constructor();
    get(key: TKey): TValue | undefined;
    getOrCreate(key: TKey, create: () => TValue): TValue;
    set(key: TKey, value: TValue): void;
    resetUsedSet(): void;
    vaporize(onVaporize?: (entry: [key: TKey, value: TValue]) => void): void;
}
