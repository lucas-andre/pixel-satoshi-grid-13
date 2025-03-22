
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  Pencil, 
  Save, 
  Eraser, 
  Undo, 
  X, 
  ImageIcon, 
  Grid, 
  Trash2, 
  Download,
  MousePointer 
} from 'lucide-react';
import { usePixels } from '@/context/PixelContext';
import { Canvas, StaticCanvas, TEvent, Line, Rect, Image as FabricImage } from 'fabric';

interface PixelEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageData: string) => void;
}

const PixelEditor: React.FC<PixelEditorProps> = ({ open, onOpenChange, onSave }) => {
  const { selectedPixels, selectionDimensions } = usePixels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'pixel'>('pixel');
  const [activeTool, setActiveTool] = useState<'pencil' | 'eraser' | 'select'>('pencil');
  const [color, setColor] = useState('#000000');
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [pixelSize, setPixelSize] = useState(10); // Size of each "pixel" in the pixel art
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [gridVisible, setGridVisible] = useState(true);
  
  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current || !selectionDimensions) return;
    
    // Clean up previous canvas instance if it exists
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
    
    const width = selectionDimensions.width * pixelSize;
    const height = selectionDimensions.height * pixelSize;
    
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#FFFFFF',
      selection: false, // Disable group selection
      preserveObjectStacking: true,
    });

    // Initialize with white background
    canvas.renderAll();
    
    // Save initial state
    const initialState = canvas.toDataURL({ 
      format: 'png',
      multiplier: 1
    });
    setCanvasHistory([initialState]);
    setFabricCanvas(canvas);
    
    drawGrid(canvas, width, height, pixelSize);
    
    return () => {
      canvas.dispose();
    };
  }, [open, selectionDimensions, pixelSize]);
  
  // Draw grid lines
  const drawGrid = (canvas: Canvas, width: number, height: number, cellSize: number) => {
    if (!gridVisible) return;
    
    // Clear existing grid lines
    const existingLines = canvas.getObjects().filter(obj => 
      obj.data && obj.data.type === 'gridLine'
    );
    existingLines.forEach(line => canvas.remove(line));
    
    // Draw vertical lines
    for (let i = 0; i <= width; i += cellSize) {
      const line = new Line([i, 0, i, height], {
        stroke: '#DDDDDD',
        selectable: false,
        evented: false,
        data: { type: 'gridLine' }
      });
      canvas.add(line);
    }
    
    // Draw horizontal lines
    for (let i = 0; i <= height; i += cellSize) {
      const line = new Line([0, i, width, i], {
        stroke: '#DDDDDD',
        selectable: false,
        evented: false,
        data: { type: 'gridLine' }
      });
      canvas.add(line);
    }
    
    canvas.renderAll();
  };
  
  // Toggle grid visibility
  const toggleGrid = () => {
    if (!fabricCanvas) return;
    
    setGridVisible(!gridVisible);
    
    if (!gridVisible) {
      const width = selectionDimensions?.width ?? 0;
      const height = selectionDimensions?.height ?? 0;
      drawGrid(fabricCanvas, width * pixelSize, height * pixelSize, pixelSize);
    } else {
      const gridLines = fabricCanvas.getObjects().filter(obj => 
        obj.data && obj.data.type === 'gridLine'
      );
      gridLines.forEach(line => fabricCanvas.remove(line));
      fabricCanvas.renderAll();
    }
  };
  
  // Setup pixel drawing functionality
  useEffect(() => {
    if (!fabricCanvas || !selectionDimensions) return;
    
    // Remove all event listeners
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');
    
    if (activeTab === 'pixel') {
      // Pixel art mode
      fabricCanvas.on('mouse:down', (options: TEvent<MouseEvent>) => {
        if (!options.pointer) return;
        
        // Get x, y coordinates
        const pointer = options.pointer;
        drawPixel(Math.floor(pointer.x / pixelSize), Math.floor(pointer.y / pixelSize));
      });
      
      fabricCanvas.on('mouse:move', (options: TEvent<MouseEvent>) => {
        if (!options.pointer || !fabricCanvas.isDrawingMode) return;
        
        // Get x, y coordinates
        const pointer = options.pointer;
        drawPixel(Math.floor(pointer.x / pixelSize), Math.floor(pointer.y / pixelSize));
      });
      
      fabricCanvas.on('mouse:up', () => {
        // Save state for undo
        if (fabricCanvas) {
          const newState = fabricCanvas.toDataURL({ 
            format: 'png',
            multiplier: 1
          });
          setCanvasHistory(prev => [...prev, newState]);
        }
        
        // Turn off drawing mode
        fabricCanvas.isDrawingMode = false;
      });
    } else if (activeTab === 'draw') {
      // Free drawing mode
      fabricCanvas.freeDrawingBrush.color = color;
      fabricCanvas.freeDrawingBrush.width = activeTool === 'eraser' ? 10 : 2;
      fabricCanvas.isDrawingMode = activeTool !== 'select';
      
      // Save state for undo when mouse is released
      fabricCanvas.on('mouse:up', () => {
        if (fabricCanvas) {
          const newState = fabricCanvas.toDataURL({ 
            format: 'png',
            multiplier: 1
          });
          setCanvasHistory(prev => [...prev, newState]);
        }
      });
    }
  }, [fabricCanvas, activeTab, activeTool, color, selectionDimensions, pixelSize]);
  
  // Draw a single pixel at the specified grid coordinates
  const drawPixel = (gridX: number, gridY: number) => {
    if (!fabricCanvas || !selectionDimensions) return;
    
    // Set drawing mode to make sure we capture mouse movement
    fabricCanvas.isDrawingMode = true;
    
    // Check if we're within bounds
    if (gridX < 0 || gridX >= selectionDimensions.width || 
        gridY < 0 || gridY >= selectionDimensions.height) {
      return;
    }
    
    // Get the existing pixel at this location, if any
    const existingPixel = fabricCanvas.getObjects().find(obj => 
      obj.data && obj.data.type === 'pixel' && 
      obj.data.x === gridX && obj.data.y === gridY
    );
    
    // If we're erasing, remove the pixel if it exists
    if (activeTool === 'eraser') {
      if (existingPixel) {
        fabricCanvas.remove(existingPixel);
      }
      return;
    }
    
    // If a pixel already exists here, remove it so we can redraw
    if (existingPixel) {
      fabricCanvas.remove(existingPixel);
    }
    
    // Create a new pixel (rectangle)
    const rect = new Rect({
      left: gridX * pixelSize,
      top: gridY * pixelSize,
      width: pixelSize,
      height: pixelSize,
      fill: color,
      selectable: false,
      evented: false,
      data: { 
        type: 'pixel',
        x: gridX,
        y: gridY
      }
    });
    
    // Add the pixel to the canvas
    fabricCanvas.add(rect);
    fabricCanvas.renderAll();
  };
  
  const handleUndo = () => {
    if (canvasHistory.length <= 1 || !fabricCanvas) return;
    
    const newHistory = [...canvasHistory];
    newHistory.pop();
    const lastState = newHistory[newHistory.length - 1];
    
    // Load the previous state back onto the canvas
    FabricImage.fromURL(lastState, (img) => {
      fabricCanvas.clear();
      fabricCanvas.add(img);
      
      // Redraw the grid if it was visible
      if (gridVisible) {
        const width = selectionDimensions?.width ?? 0;
        const height = selectionDimensions?.height ?? 0;
        drawGrid(fabricCanvas, width * pixelSize, height * pixelSize, pixelSize);
      }
      
      fabricCanvas.renderAll();
    });
    
    setCanvasHistory(newHistory);
  };
  
  const handleClear = () => {
    if (!fabricCanvas) return;
    
    // Remove all non-grid objects
    const objects = fabricCanvas.getObjects().filter(obj => 
      !obj.data || obj.data.type !== 'gridLine'
    );
    objects.forEach(obj => fabricCanvas.remove(obj));
    
    // Set background back to white
    fabricCanvas.backgroundColor = '#FFFFFF';
    fabricCanvas.renderAll();
    
    // Save new state
    const newState = fabricCanvas.toDataURL({ 
      format: 'png',
      multiplier: 1
    });
    setCanvasHistory(prev => [...prev, newState]);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      
      if (fabricCanvas && event.target?.result) {
        fabricCanvas.clear();
        
        // Load the image onto the canvas
        FabricImage.fromURL(event.target.result as string, (img) => {
          // Scale image to fit canvas while maintaining aspect ratio
          const canvasWidth = fabricCanvas.getWidth();
          const canvasHeight = fabricCanvas.getHeight();
          
          const imgRatio = img.width! / img.height!;
          const canvasRatio = canvasWidth / canvasHeight;
          
          let scaleFactor;
          if (canvasRatio > imgRatio) {
            // Canvas is wider than image
            scaleFactor = canvasHeight / img.height!;
          } else {
            // Canvas is taller than image
            scaleFactor = canvasWidth / img.width!;
          }
          
          img.scale(scaleFactor);
          
          // Center the image
          img.set({
            left: (canvasWidth - img.width! * scaleFactor) / 2,
            top: (canvasHeight - img.height! * scaleFactor) / 2,
            selectable: true,
            centeredScaling: true
          });
          
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          
          // Redraw grid if needed
          if (gridVisible) {
            const width = selectionDimensions?.width ?? 0;
            const height = selectionDimensions?.height ?? 0;
            drawGrid(fabricCanvas, width * pixelSize, height * pixelSize, pixelSize);
          }
          
          fabricCanvas.renderAll();
          
          // Save new state
          const newState = fabricCanvas.toDataURL({ 
            format: 'png',
            multiplier: 1
          });
          setCanvasHistory(prev => [...prev, newState]);
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = () => {
    if (!fabricCanvas) return;
    
    // Temporarily hide grid for saving
    const gridLines = fabricCanvas.getObjects().filter(obj => 
      obj.data && obj.data.type === 'gridLine'
    );
    const gridWasVisible = gridLines.length > 0;
    
    if (gridWasVisible) {
      gridLines.forEach(line => fabricCanvas.remove(line));
    }
    
    // Get image data
    const imageData = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    // Restore grid if it was visible
    if (gridWasVisible && selectionDimensions) {
      drawGrid(
        fabricCanvas, 
        selectionDimensions.width * pixelSize, 
        selectionDimensions.height * pixelSize, 
        pixelSize
      );
    }
    
    // Save the image data
    onSave(imageData);
    onOpenChange(false);
    toast.success('Your pixel art has been saved!');
  };
  
  const handleToolChange = (tool: 'pencil' | 'eraser' | 'select') => {
    setActiveTool(tool);
    
    if (fabricCanvas) {
      if (activeTab === 'draw') {
        // For free drawing mode
        fabricCanvas.isDrawingMode = tool !== 'select';
        if (tool === 'eraser') {
          fabricCanvas.freeDrawingBrush.color = '#FFFFFF';
          fabricCanvas.freeDrawingBrush.width = 10;
        } else {
          fabricCanvas.freeDrawingBrush.color = color;
          fabricCanvas.freeDrawingBrush.width = 2;
        }
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Pixels</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'draw' | 'upload' | 'pixel')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pixel" className="flex items-center justify-center">
              <Grid className="h-4 w-4 mr-2" />
              Pixel Art
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center justify-center">
              <Pencil className="h-4 w-4 mr-2" />
              Free Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center justify-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pixel" className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label htmlFor="pixel-color" className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center">
                  <input
                    id="pixel-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-2 border-transparent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Tool</label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={activeTool === 'pencil' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToolChange('pencil')}
                    title="Draw pixels"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTool === 'eraser' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToolChange('eraser')}
                    title="Erase pixels"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="secondary" size="sm" onClick={handleUndo} disabled={canvasHistory.length <= 1}>
                <Undo className="h-4 w-4 mr-2" /> Undo
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>
              <Button variant="outline" size="sm" onClick={toggleGrid}>
                <Grid className="h-4 w-4 mr-2" /> {gridVisible ? 'Hide Grid' : 'Show Grid'}
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-white" style={{ maxWidth: '100%', maxHeight: '400px', overflowY: 'auto' }}>
              <canvas
                ref={canvasRef}
                className="touch-none"
                style={{ background: '#FFFFFF' }}
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              Tip: Click a cell to draw/erase individual pixels.
            </div>
          </TabsContent>
          
          <TabsContent value="draw" className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label htmlFor="draw-color" className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center">
                  <input
                    id="draw-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-2 border-transparent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Tool</label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={activeTool === 'pencil' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToolChange('pencil')}
                    title="Free draw"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTool === 'eraser' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToolChange('eraser')}
                    title="Eraser"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTool === 'select' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToolChange('select')}
                    title="Selection tool"
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="secondary" size="sm" onClick={handleUndo} disabled={canvasHistory.length <= 1}>
                <Undo className="h-4 w-4 mr-2" /> Undo
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-white" style={{ maxWidth: '100%', maxHeight: '400px', overflowY: 'auto' }}>
              <canvas
                ref={canvasRef}
                className="touch-none"
                style={{ background: '#FFFFFF' }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            {uploadedImage ? (
              <div className="relative">
                <div className="border rounded-lg overflow-hidden" style={{ maxWidth: '100%', maxHeight: '400px', overflowY: 'auto' }}>
                  <canvas
                    ref={canvasRef}
                    className="bg-white"
                    style={{ background: '#FFFFFF' }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-80"
                  onClick={() => {
                    setUploadedImage(null);
                    if (fabricCanvas) {
                      fabricCanvas.clear();
                      fabricCanvas.backgroundColor = '#FFFFFF';
                      fabricCanvas.renderAll();
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted rounded-md p-6 text-center">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an image to place on your pixels
                </p>
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center bg-bitcoin hover:bg-bitcoin-light text-white font-medium h-9 px-4 py-2 rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 2MB
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-bitcoin hover:bg-bitcoin-light text-white">
            <Save className="h-4 w-4 mr-2" /> Save Pixels
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixelEditor;
