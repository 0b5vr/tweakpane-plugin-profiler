import type { ProfilerEntry } from './ProfilerEntry';

export interface ProfilerMeasureStackEntry {
  path: string;
  promiseChildren: Promise<ProfilerEntry>[];
}
