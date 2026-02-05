
import Dexie, { type Table } from 'dexie';
import type { PhotoHuman, Prompt } from '../types';

export class ZiaImageDB extends Dexie {
  photoHumans!: Table<PhotoHuman, number>;
  prompts!: Table<Prompt, number>;

  constructor() {
    super('zia-image-db');
    // FIX: Cast `this` to Dexie to resolve a type error where the 'version' method was not being found on the subclass.
    (this as Dexie).version(2).stores({
      photoHumans: '++id, name, createdAt',
      prompts: '++id, index'
    });

    this.initStoragePersistence();
  }

  async initStoragePersistence() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const result = await navigator.storage.persist();
          console.log(`Zia.ai Storage Persistence enabled: ${result}`);
        } else {
            console.log("Zia.ai Storage is already persisted.");
        }
      }
      
      if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          console.log(`Storage usage: ${(estimate.usage || 0) / 1024 / 1024}MB of ${(estimate.quota || 0) / 1024 / 1024}MB`);
      }
    } catch (e) {
      console.warn("Storage persistence initialization failed", e);
    }
  }
}

export const db = new ZiaImageDB();
