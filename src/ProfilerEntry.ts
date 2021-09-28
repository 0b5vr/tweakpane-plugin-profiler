export interface ProfilerEntry {
  name: string;
  path: string;
  delta: number;
  deltaMean: number;
  deltaMedian: number;
  selfDelta: number;
  selfDeltaMean: number;
  selfDeltaMedian: number;
  children: ProfilerEntry[];
}
