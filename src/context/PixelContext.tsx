
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pixel, PixelSelection, GridMode, PixelCoordinate } from '@/types';
import { fetchPixels } from '@/utils/api';

interface PixelContextProps {
  pixels: Pixel[];
  selectedPixels: PixelCoordinate[];
  selection: PixelSelection | null;
  gridMode: GridMode;
  isLoading: boolean;
  viewTransform: {
    scale: number;
    translateX: number;
    translateY: number;
  };
  totalPixelCount: number;
  purchasedPixelCount: number;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  setGridMode: (mode: GridMode) => void;
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  completeSelection: () => void;
  clearSelection: () => void;
  addSelectedPixel: (x: number, y: number) => void;
  removeSelectedPixel: (x: number, y: number) => void;
  isPixelSelected: (x: number, y: number) => boolean;
  isPixelOwned: (x: number, y: number) => boolean;
  getPixelColor: (x: number, y: number) => string;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  panGrid: (deltaX: number, deltaY: number) => void;
  refreshPixels: () => void;
}

const PixelContext = createContext<PixelContextProps | undefined>(undefined);

const TOTAL_PIXEL_COUNT = 100000000; // 10000 x 10000
const INITIAL_SCALE = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 10;
const SCALE_FACTOR = 1.2;

export const PixelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [selectedPixels, setSelectedPixels] = useState<PixelCoordinate[]>([]);
  const [selection, setSelection] = useState<PixelSelection | null>(null);
  const [gridMode, setGridMode] = useState<GridMode>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [viewTransform, setViewTransform] = useState({
    scale: INITIAL_SCALE,
    translateX: 0,
    translateY: 0,
  });
  const [selectedColor, setSelectedColor] = useState('#F7931A'); // Bitcoin orange

  // Mock data for initial development
  const purchasedPixelCount = pixels.length;

  const refreshPixels = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPixels = await fetchPixels();
      setPixels(fetchedPixels);
    } catch (error) {
      console.error('Failed to fetch pixels:', error);
      // For development, generate some random pixels
      const mockPixels = Array(1000).fill(null).map((_, index) => ({
        id: `pixel-${index}`,
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        ownerId: `owner-${Math.floor(index / 100)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setPixels(mockPixels);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPixels();
  }, [refreshPixels]);

  const startSelection = useCallback((x: number, y: number) => {
    if (gridMode === 'select') {
      setSelection({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    }
  }, [gridMode]);

  const updateSelection = useCallback((x: number, y: number) => {
    if (selection && gridMode === 'select') {
      setSelection({
        ...selection,
        endX: x,
        endY: y,
      });
    }
  }, [selection, gridMode]);

  const completeSelection = useCallback(() => {
    if (selection && gridMode === 'select') {
      const startX = Math.min(selection.startX, selection.endX);
      const endX = Math.max(selection.startX, selection.endX);
      const startY = Math.min(selection.startY, selection.endY);
      const endY = Math.max(selection.startY, selection.endY);

      const newSelectedPixels: PixelCoordinate[] = [];
      
      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          // Skip if already owned
          if (!isPixelOwned(x, y)) {
            newSelectedPixels.push({ x, y });
          }
        }
      }

      setSelectedPixels(newSelectedPixels);
      setSelection(null);
    }
  }, [selection, gridMode]);

  const clearSelection = useCallback(() => {
    setSelectedPixels([]);
    setSelection(null);
  }, []);

  const addSelectedPixel = useCallback((x: number, y: number) => {
    if (!isPixelOwned(x, y) && !isPixelSelected(x, y)) {
      setSelectedPixels(prev => [...prev, { x, y }]);
    }
  }, []);

  const removeSelectedPixel = useCallback((x: number, y: number) => {
    setSelectedPixels(prev => 
      prev.filter(pixel => !(pixel.x === x && pixel.y === y))
    );
  }, []);

  const isPixelSelected = useCallback((x: number, y: number) => {
    return selectedPixels.some(pixel => pixel.x === x && pixel.y === y);
  }, [selectedPixels]);

  const isPixelOwned = useCallback((x: number, y: number) => {
    return pixels.some(pixel => pixel.x === x && pixel.y === y);
  }, [pixels]);

  const getPixelColor = useCallback((x: number, y: number) => {
    const pixel = pixels.find(p => p.x === x && p.y === y);
    return pixel ? pixel.color : '';
  }, [pixels]);

  const zoomIn = useCallback(() => {
    setViewTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * SCALE_FACTOR, MAX_SCALE),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / SCALE_FACTOR, MIN_SCALE),
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewTransform({
      scale: INITIAL_SCALE,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const panGrid = useCallback((deltaX: number, deltaY: number) => {
    setViewTransform(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
  }, []);

  const value = {
    pixels,
    selectedPixels,
    selection,
    gridMode,
    isLoading,
    viewTransform,
    totalPixelCount: TOTAL_PIXEL_COUNT,
    purchasedPixelCount,
    selectedColor,
    setSelectedColor,
    setGridMode,
    startSelection,
    updateSelection,
    completeSelection,
    clearSelection,
    addSelectedPixel,
    removeSelectedPixel,
    isPixelSelected,
    isPixelOwned,
    getPixelColor,
    zoomIn,
    zoomOut,
    resetView,
    panGrid,
    refreshPixels,
  };

  return <PixelContext.Provider value={value}>{children}</PixelContext.Provider>;
};

export const usePixels = () => {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error('usePixels must be used within a PixelProvider');
  }
  return context;
};
