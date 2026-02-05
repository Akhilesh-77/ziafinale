
import Dexie, { type Table } from 'dexie';
import type { PhotoHuman, Prompt } from '../types';

/**
 * ZIA DataLayer
 * 
 * A futuristic, scalable storage engine designed for handling
 * massive amounts of binary image data without quality loss.
 */
export class ZiaDataLayer extends Dexie {
  photoHumans!: Table<PhotoHuman, number>;
  prompts!: Table<Prompt, number>;
  likes!: Table<{ albumId: number; likedAt: Date }, number>;

  constructor() {
    super('ziar-core-storage');
    
    // Schema definition - Designed to be additive for future-proofing
    // Fix: Cast this to any/Dexie to access version method which might be hidden on subclass type
    (this as unknown as Dexie).version(2).stores({
      photoHumans: '++id, name, createdAt, updatedAt',
      prompts: '++id, index',
      likes: 'albumId, likedAt' // persistent likes storage
    });

    this.initStoragePersistence();
  }

  /**
   * Aggressively attempts to secure persistent storage from the browser.
   * This prevents the browser from "cleaning up" data during space pressure.
   */
  async initStoragePersistence() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const result = await navigator.storage.persist();
          console.log(`[ZIA Storage] Persistence request result: ${result ? 'GRANTED' : 'DENIED'}`);
        } else {
            console.log("[ZIA Storage] Persistence already active.");
        }
      }
      
      this.logStorageEstimate();
    } catch (e) {
      console.warn("[ZIA Storage] Persistence initialization failed", e);
    }
  }

  /**
   * Monitors storage quota to ensure application stability with large datasets.
   */
  async logStorageEstimate() {
      if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          const used = (estimate.usage || 0) / 1024 / 1024;
          const total = (estimate.quota || 0) / 1024 / 1024;
          const percent = total > 0 ? (used / total) * 100 : 0;
          
          console.log(`[ZIA Storage] Usage: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB (${percent.toFixed(2)}%)`);
          
          if (percent > 80) {
              console.warn("[ZIA Storage] Warning: Storage usage is exceeding 80% of available quota.");
          }
      }
  }
}

export const data = new ZiaDataLayer();
