export interface ProfilerEntry {
  name: string;
  path: string;
  length: number;
  children: ProfilerEntry[];
}
