export declare class ConsecutiveCacheMap<TKey, TValue> {
    readonly map: Map<TKey, TValue>;
    readonly keySet: Set<TKey>;
    constructor();
    get(key: TKey): TValue | undefined;
    getOrCreate(key: TKey, create: () => TValue): TValue;
    set(key: TKey, value: TValue): void;
    resetUsedSet(): void;
    vaporize(onVaporize?: (entry: [key: TKey, value: TValue]) => void): void;
}
