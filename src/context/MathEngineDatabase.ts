import Dexie, { Table } from 'dexie';

export type MathEngineFramework = 'react' | 'vanilla';

export interface MathEngineProjectRecord {
  id: string;
  name: string;
  framework: MathEngineFramework;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, unknown>;
  snapshotIndex: number;
}

export interface MathEngineFileRecord {
  projectId: string;
  path: string;
  content: string;
  hash: string;
  updatedAt: string;
}

export interface MathEngineSnapshotRecord {
  id: string;
  projectId: string;
  order: number;
  createdAt: string;
  label?: string;
  files: string;
}

export class MathEngineDexie extends Dexie {
  projects!: Table<MathEngineProjectRecord>;
  files!: Table<MathEngineFileRecord>;
  snapshots!: Table<MathEngineSnapshotRecord>;

  constructor() {
    super('MathEngine');

    this.version(1).stores({
      projects: 'id, updatedAt',
      files: '&[projectId+path], projectId',
      snapshots: 'id, projectId, order',
    });
  }
}

export const mathEngineDB = new MathEngineDexie();
