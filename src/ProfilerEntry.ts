export interface ProfilerEntry {
  name: string;
  path: string;
  delta: number;
  children: ProfilerEntry[];
}
