
export interface TiltConfig {
  x: number;
  y: number;
  z: number;
}

export interface PhotoHuman {
  id?: number;
  name: string;
  description?: string;
  thumbnail: Blob;
  images: Blob[];
  createdAt: Date;
  updatedAt?: Date;
  schemaVersion?: number; // Future-proofing for migrations
  metadata?: Record<string, any>; // Flexible storage for future features
  tiltConfig?: TiltConfig;
}

export interface Prompt {
  id?: number;
  title: string;
  content: string;
  index: number;
}
