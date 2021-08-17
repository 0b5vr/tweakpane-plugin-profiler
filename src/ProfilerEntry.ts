export interface ProfilerEntry {
  name: string;
  path: string;
  delta: number;
  median: number;
  selfDelta: number;
  selfMedian: number;
  children: ProfilerEntry[];
}
