
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
  lastViewedAt?: Date; // New field for sorting by usage
  schemaVersion?: number;
  metadata?: Record<string, any>;
  tiltConfig?: TiltConfig;
}

export interface MediaAsset {
  id?: number;
  blob: Blob;
  createdAt: Date;
  type: 'image' | 'video'; // Future proofing
}

export interface Prompt {
  id?: number;
  title: string;
  content: string;
  index: number;
}
