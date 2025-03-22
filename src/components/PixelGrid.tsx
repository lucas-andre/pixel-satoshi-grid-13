
import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Grab, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePixels } from '@/context/PixelContext';
import PixelDetailsModal from './PixelDetailsModal';

const PixelGrid: React.FC = () => {
  const {
    pixels,
    selectedPixels,
    selection,
    gridMode,
    viewTransform,
    isLoading,
    selectionDimensions,
    startSelection,
    updateSelection,
    completeSelection,
    clearSelection,
    isPixelOwned,
    isPixelSelected,
    getPixelColor,
    getPixelContent,
    zoomIn,
    zoomOut,
    resetView,
    panGrid,
  } = usePixels();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [clickedPixel, setClickedPixel] = useState<{ x: number, y: number } | null>(null);
  const [pixelDetailsOpen, setPixelDetailsOpen] = useState(false);
  const pixelContentImages = useRef<Map<string, HTMLImageElement>>(new Map());

  const screenToGrid = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((screenX - rect.left - viewTransform.translateX) / (2 * viewTransform.scale));
    const y = Math.floor((screenY - rect.top - viewTransform.translateY) / (2 * viewTransform.scale));
    
    return { x, y };
  };

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(viewTransform.translateX, viewTransform.translateY);
    ctx.scale(viewTransform.scale, viewTransform.scale);

    const visibleStartX = Math.max(0, Math.floor(-viewTransform.translateX / (2 * viewTransform.scale)));
    const visibleStartY = Math.max(0, Math.floor(-viewTransform.translateY / (2 * viewTransform.scale)));
    const visibleEndX = Math.min(1000, Math.ceil((canvas.width - viewTransform.translateX) / (2 * viewTransform.scale)));
    const visibleEndY = Math.min(1000, Math.ceil((canvas.height - viewTransform.translateY) / (2 * viewTransform.scale)));

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(visibleStartX * 2, visibleStartY * 2, (visibleEndX - visibleStartX) * 2, (visibleEndY - visibleStartY) * 2);

    const gridSize = 2;

    // Draw colored pixels
    for (const pixel of pixels) {
      if (pixel.x >= visibleStartX && pixel.x < visibleEndX && 
          pixel.y >= visibleStartY && pixel.y < visibleEndY) {
        
        // Check if this pixel has custom content
        const content = getPixelContent(pixel.x, pixel.y);
        
        if (content) {
          // If it has content, draw from the cached image if available
          const pixelId = `pixel-${pixel.x}-${pixel.y}`;
          
          if (!pixelContentImages.current.has(pixelId)) {
            // Create and cache the image
            const img = new Image();
            img.src = content;
            pixelContentImages.current.set(pixelId, img);
            
            img.onload = () => {
              // Redraw when image loads
              drawGrid();
            };
          } else {
            // Draw the cached image
            const img = pixelContentImages.current.get(pixelId);
            if (img && img.complete) {
              ctx.drawImage(img, pixel.x * gridSize, pixel.y * gridSize, gridSize, gridSize);
            } else {
              // Fallback to color if image not loaded
              ctx.fillStyle = pixel.color;
              ctx.fillRect(pixel.x * gridSize, pixel.y * gridSize, gridSize, gridSize);
            }
          }
        } else {
          // No custom content, just draw the color
          ctx.fillStyle = pixel.color;
          ctx.fillRect(pixel.x * gridSize, pixel.y * gridSize, gridSize, gridSize);
        }
      }
    }

    // Draw selected pixels
    selectedPixels.forEach(({ x, y }) => {
      if (x >= visibleStartX && x < visibleEndX && 
          y >= visibleStartY && y < visibleEndY) {
        ctx.fillStyle = 'rgba(247, 147, 26, 0.5)';
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    });

    // Draw selection
    if (selection) {
      const startX = Math.min(selection.startX, selection.endX);
      const endX = Math.max(selection.startX, selection.endX);
      const startY = Math.min(selection.startY, selection.endY);
      const endY = Math.max(selection.startY, selection.endY);
      
      ctx.fillStyle = 'rgba(247, 147, 26, 0.3)';
      ctx.fillRect(
        startX * gridSize, 
        startY * gridSize, 
        (endX - startX + 1) * gridSize, 
        (endY - startY + 1) * gridSize
      );
      
      ctx.strokeStyle = 'rgb(247, 147, 26)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(
        startX * gridSize, 
        startY * gridSize, 
        (endX - startX + 1) * gridSize, 
        (endY - startY + 1) * gridSize
      );
    }

    // Draw grid lines
    if (viewTransform.scale > 1) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.2;
      
      for (let x = visibleStartX; x <= visibleEndX; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, visibleStartY * gridSize);
        ctx.lineTo(x * gridSize, visibleEndY * gridSize);
        ctx.stroke();
      }
      
      for (let y = visibleStartY; y <= visibleEndY; y++) {
        ctx.beginPath();
        ctx.moveTo(visibleStartX * gridSize, y * gridSize);
        ctx.lineTo(visibleEndX * gridSize, y * gridSize);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        drawGrid();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    drawGrid();
  }, [pixels, selectedPixels, selection, viewTransform, gridMode, selectionDimensions]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;

    if (gridMode === 'view') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (gridMode === 'select') {
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      
      if (isPixelOwned(x, y)) {
        setClickedPixel({ x, y });
        setPixelDetailsOpen(true);
      } else {
        startSelection(x, y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && gridMode === 'view') {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      panGrid(deltaX, deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (selection && gridMode === 'select') {
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      updateSelection(x, y);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    } else if (selection) {
      completeSelection();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gridMode === 'view') {
      const { x, y } = screenToGrid(e.clientX, e.clientY);
      
      if (isPixelOwned(x, y)) {
        setClickedPixel({ x, y });
        setPixelDetailsOpen(true);
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full" ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-bitcoin" />
            <p className="font-medium">Loading pixel grid...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : gridMode === 'view' ? 'cursor-grab' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      
      <div className="absolute bottom-4 right-4 flex space-x-2 glass p-1 rounded-lg shadow-subtle">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={zoomIn} className="h-9 w-9">
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={zoomOut} className="h-9 w-9">
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={resetView} className="h-9 w-9">
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {(selectedPixels.length > 0 || selection) && (
        <div className="absolute bottom-4 left-4 glass p-2 rounded-lg shadow-subtle animate-fade-in-up">
          <p className="text-sm font-medium">
            {selectedPixels.length} pixels selected
            <span className="ml-2 px-2 py-0.5 bg-bitcoin/10 text-bitcoin rounded-full text-xs font-mono">
              {selectedPixels.length} sats
            </span>
          </p>
          {selectionDimensions && (
            <p className="text-xs text-muted-foreground mt-1">
              Dimensions: {selectionDimensions.width} × {selectionDimensions.height} pixels
            </p>
          )}
        </div>
      )}

      {clickedPixel && (
        <PixelDetailsModal 
          x={clickedPixel.x} 
          y={clickedPixel.y} 
          open={pixelDetailsOpen}
          onOpenChange={setPixelDetailsOpen}
        />
      )}
    </div>
  );
};

export default PixelGrid;
