
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Pencil, Save, Eraser, Undo, X, ImageIcon } from 'lucide-react';
import { usePixels } from '@/context/PixelContext';

interface PixelEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageData: string) => void;
}

const PixelEditor: React.FC<PixelEditorProps> = ({ open, onOpenChange, onSave }) => {
  const { selectedPixels, selectionDimensions } = usePixels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current || !selectionDimensions) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = selectionDimensions.width;
    canvas.height = selectionDimensions.height;
    
    // Initialize with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
  }, [open, selectionDimensions]);
  
  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const endDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    
    // Save to history
    const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, newState]);
  };
  
  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newHistory = [...history];
    newHistory.pop();
    const lastState = newHistory[newHistory.length - 1];
    
    ctx.putImageData(lastState, 0, 0);
    setHistory(newHistory);
  };
  
  const handleClear = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save to history
    const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, newState]);
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
      
      if (canvasRef.current && event.target?.result) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
          // Clear canvas
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image fitted to canvas
          const aspectRatio = img.width / img.height;
          let drawWidth = canvas.width;
          let drawHeight = canvas.width / aspectRatio;
          
          if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * aspectRatio;
          }
          
          const x = (canvas.width - drawWidth) / 2;
          const y = (canvas.height - drawHeight) / 2;
          
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Save to history
          const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory(prev => [...prev, newState]);
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    onSave(imageData);
    onOpenChange(false);
    toast.success('Your pixel art has been saved!');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Pixels</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'draw' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="draw" className="flex items-center justify-center">
              <Pencil className="h-4 w-4 mr-2" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center justify-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw" className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label htmlFor="color-picker" className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center">
                  <input
                    id="color-picker"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-2 border-transparent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="brush-size" className="block text-sm font-medium mb-1">Brush Size</label>
                <input
                  id="brush-size"
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="secondary" size="sm" onClick={handleUndo} disabled={history.length <= 1}>
                <Undo className="h-4 w-4 mr-2" /> Undo
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClear}>
                <Eraser className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden" style={{ maxWidth: '100%', maxHeight: '400px', overflowY: 'auto' }}>
              <canvas
                ref={canvasRef}
                className="touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
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
                  onClick={() => setUploadedImage(null)}
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
