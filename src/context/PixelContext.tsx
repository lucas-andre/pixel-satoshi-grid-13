
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
  selectionDimensions: { width: number; height: number } | null;
  pixelContent: { pixelIds: string[]; content: string } | null;
  isSelectionLocked: boolean;
  selectionOffset: { x: number; y: number } | null;
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
  savePixelContent: (pixelIds: string[], content: string) => void;
  getPixelContent: (x: number, y: number) => string | null;
  toggleSelectionLock: () => void;
  startMovingSelection: (x: number, y: number) => void;
  moveSelection: (x: number, y: number) => void;
  finalizeSelectionMove: () => void;
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
  const [pixelContent, setPixelContent] = useState<{ pixelIds: string[]; content: string } | null>(null);
  // New state for locking selections
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);
  const [selectionOffset, setSelectionOffset] = useState<{ x: number; y: number } | null>(null);

  // Calculate the dimensions of the selection or selected pixels
  const selectionDimensions = useCallback(() => {
    if (selection) {
      const width = Math.abs(selection.endX - selection.startX) + 1;
      const height = Math.abs(selection.endY - selection.startY) + 1;
      return { width, height };
    } else if (selectedPixels.length > 0) {
      // Find min and max x,y coordinates
      const xCoords = selectedPixels.map(p => p.x);
      const yCoords = selectedPixels.map(p => p.y);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);
      return { 
        width: maxX - minX + 1,
        height: maxY - minY + 1
      };
    }
    return null;
  }, [selection, selectedPixels]);

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
    if (gridMode === 'select' && !isSelectionLocked) {
      setSelection({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    }
  }, [gridMode, isSelectionLocked]);

  const updateSelection = useCallback((x: number, y: number) => {
    if (selection && gridMode === 'select' && !isSelectionLocked) {
      setSelection({
        ...selection,
        endX: x,
        endY: y,
      });
    }
  }, [selection, gridMode, isSelectionLocked]);

  const completeSelection = useCallback(() => {
    if (selection && gridMode === 'select' && !isSelectionLocked) {
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
  }, [selection, gridMode, isSelectionLocked]);

  const clearSelection = useCallback(() => {
    setSelectedPixels([]);
    setSelection(null);
    setIsSelectionLocked(false);
    setSelectionOffset(null);
  }, []);

  const addSelectedPixel = useCallback((x: number, y: number) => {
    if (!isPixelOwned(x, y) && !isPixelSelected(x, y) && !isSelectionLocked) {
      setSelectedPixels(prev => [...prev, { x, y }]);
    }
  }, [isSelectionLocked]);

  const removeSelectedPixel = useCallback((x: number, y: number) => {
    if (!isSelectionLocked) {
      setSelectedPixels(prev => 
        prev.filter(pixel => !(pixel.x === x && pixel.y === y))
      );
    }
  }, [isSelectionLocked]);

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

  const savePixelContent = useCallback((pixelIds: string[], content: string) => {
    setPixelContent({ pixelIds, content });
    
    // In a real implementation, this would call an API to save the content
    console.log('Saving pixel content', { pixelIds, content });
  }, []);

  const getPixelContent = useCallback((x: number, y: number) => {
    if (!pixelContent) return null;
    
    // Find if the pixel belongs to any content
    const pixelId = `pixel-${x}-${y}`;
    if (pixelContent.pixelIds.includes(pixelId)) {
      return pixelContent.content;
    }
    
    return null;
  }, [pixelContent]);

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

  // Toggle lock for selected pixels
  const toggleSelectionLock = useCallback(() => {
    if (selectedPixels.length > 0) {
      setIsSelectionLocked(prev => !prev);
      // Reset selection offset when unlocking
      if (isSelectionLocked) {
        setSelectionOffset(null);
      }
    }
  }, [selectedPixels, isSelectionLocked]);

  // Start moving locked selection
  const startMovingSelection = useCallback((x: number, y: number) => {
    if (isSelectionLocked && selectedPixels.length > 0) {
      const dims = selectionDimensions();
      if (dims) {
        // Calculate the center of the selection for offset
        const xCoords = selectedPixels.map(p => p.x);
        const yCoords = selectedPixels.map(p => p.y);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        
        // Store the offset from click position to selection corner
        setSelectionOffset({ 
          x: x - minX, 
          y: y - minY 
        });
      }
    }
  }, [isSelectionLocked, selectedPixels, selectionDimensions]);

  // Move the locked selection
  const moveSelection = useCallback((x: number, y: number) => {
    if (isSelectionLocked && selectionOffset && selectedPixels.length > 0) {
      // Calculate new top-left position based on mouse position and offset
      const newMinX = x - selectionOffset.x;
      const newMinY = y - selectionOffset.y;
      
      // Find current bounds
      const xCoords = selectedPixels.map(p => p.x);
      const yCoords = selectedPixels.map(p => p.y);
      const minX = Math.min(...xCoords);
      const minY = Math.min(...yCoords);
      const width = Math.max(...xCoords) - minX + 1;
      const height = Math.max(...yCoords) - minY + 1;
      
      // Calculate the shift needed
      const shiftX = newMinX - minX;
      const shiftY = newMinY - minY;
      
      // Check if new position would overlap with owned pixels
      let canMove = true;
      for (let x = newMinX; x < newMinX + width; x++) {
        for (let y = newMinY; y < newMinY + height; y++) {
          if (isPixelOwned(x, y)) {
            canMove = false;
            break;
          }
        }
        if (!canMove) break;
      }
      
      if (canMove) {
        // Move all selected pixels by the calculated shift
        setSelectedPixels(prevSelected => prevSelected.map(pixel => ({
          x: pixel.x + shiftX,
          y: pixel.y + shiftY
        })));
      }
    }
  }, [isSelectionLocked, selectionOffset, selectedPixels, isPixelOwned]);

  // Finalize the selection move
  const finalizeSelectionMove = useCallback(() => {
    if (isSelectionLocked && selectionOffset) {
      setSelectionOffset(null);
    }
  }, [isSelectionLocked, selectionOffset]);

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
    selectionDimensions: selectionDimensions(),
    pixelContent,
    isSelectionLocked,
    selectionOffset,
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
    savePixelContent,
    getPixelContent,
    toggleSelectionLock,
    startMovingSelection,
    moveSelection,
    finalizeSelectionMove,
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
