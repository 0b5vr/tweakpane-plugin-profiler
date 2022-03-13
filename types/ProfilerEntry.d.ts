export interface ProfilerEntry {
    name: string;
    delta: number;
    deltaMean: number;
    deltaMedian: number;
    selfDelta: number;
    selfDeltaMean: number;
    selfDeltaMedian: number;
    children: ProfilerEntry[];
}
