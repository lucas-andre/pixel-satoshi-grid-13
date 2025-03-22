
export interface Pixel {
  id: string;
  x: number;
  y: number;
  color: string;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  content?: string; // Data URL for images or pixel art
}

export interface PixelOwner {
  id: string;
  nickname: string;
  url?: string;
  totalPixels: number;
  totalSpent: number;
  createdAt: string;
}

export interface PixelSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface PixelPurchase {
  pixels: PixelCoordinate[];
  color: string;
  nickname: string;
  url?: string;
  text?: string;
  image?: string;
  content?: string; // Data URL for custom pixel content
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  totalPixels: number;
  totalSpent: number;
  url?: string;
}

export type GridMode = 'view' | 'select';

export type CustomizationType = 'color' | 'text' | 'image' | 'draw';
