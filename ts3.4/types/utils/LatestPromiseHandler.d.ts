export declare class LatestPromiseHandler<T> {
    handler: (value: T) => void;
    private id_;
    private latestResolved_;
    constructor(handler: (value: T) => void);
    add(promise: Promise<T>): void;
}
