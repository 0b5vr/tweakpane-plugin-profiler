export interface ProfilerEntry {
    name: string;
    path: string;
    delta: number;
    deltaMedian: number;
    selfDelta: number;
    selfDeltaMedian: number;
    children: ProfilerEntry[];
}
