import Dexie, { Table } from 'dexie';

export type PrismAgentFramework = 'react' | 'vanilla';

export interface PrismAgentProjectRecord {
  id: string;
  name: string;
  framework: PrismAgentFramework;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, unknown>;
  snapshotIndex: number;
}

export interface PrismAgentFileRecord {
  projectId: string;
  path: string;
  content: string;
  hash: string;
  updatedAt: string;
}

export interface PrismAgentSnapshotRecord {
  id: string;
  projectId: string;
  order: number;
  createdAt: string;
  label?: string;
  files: string;
}

export class PrismAgentDexie extends Dexie {
  projects!: Table<PrismAgentProjectRecord>;
  files!: Table<PrismAgentFileRecord>;
  snapshots!: Table<PrismAgentSnapshotRecord>;

  constructor() {
    super('PrismAgent');

    this.version(1).stores({
      projects: 'id, updatedAt',
      files: '&[projectId+path], projectId',
      snapshots: 'id, projectId, order',
    });
  }
}

export const prismAgentDB = new PrismAgentDexie();
