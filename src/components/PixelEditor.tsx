
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  Pencil, 
  Save, 
  X, 
  ImageIcon
} from 'lucide-react';
import { usePixels } from '@/context/PixelContext';
import { 
  Canvas, 
  Image as FabricImage,
  FabricObject
} from 'fabric';

// Define a custom type for objects with data property
interface CustomFabricObject extends FabricObject {
  customData?: {
    type: string;
    x?: number;
    y?: number;
  };
}

interface PixelEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageData: string) => void;
}

const PixelEditor: React.FC<PixelEditorProps> = ({ open, onOpenChange, onSave }) => {
  const { selectionDimensions } = usePixels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'upload'>('upload');
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current || !selectionDimensions) return;
    
    // Clean up previous canvas instance if it exists
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
    
    const width = selectionDimensions.width;
    const height = selectionDimensions.height;
    
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#FFFFFF',
      selection: false,
      preserveObjectStacking: true,
    });
    
    canvas.renderAll();
    setFabricCanvas(canvas);
    
    return () => {
      canvas.dispose();
    };
  }, [open, selectionDimensions]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      
      if (fabricCanvas && event.target?.result) {
        fabricCanvas.clear();
        
        // Load the image onto the canvas
        const imgUrl = event.target.result as string;
        
        // Use promise-based approach
        FabricImage.fromURL(imgUrl).then(img => {
          if (!fabricCanvas) return;
          
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
          fabricCanvas.renderAll();
        }).catch(error => {
          console.error('Error loading image:', error);
          toast.error('Failed to load image');
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = () => {
    if (!fabricCanvas) return;
    
    // Get image data with correct multiplier
    const imageData = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 1,
      quality: 1
    });
    
    // Save the image data
    onSave(imageData);
    onOpenChange(false);
    toast.success('Your image has been saved!');
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please drop an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          
          if (fabricCanvas) {
            fabricCanvas.clear();
            
            const imgUrl = event.target.result as string;
            
            // Use promise-based approach
            FabricImage.fromURL(imgUrl).then(img => {
              if (!fabricCanvas) return;
              
              // Scale image to fit canvas
              const canvasWidth = fabricCanvas.getWidth();
              const canvasHeight = fabricCanvas.getHeight();
              
              const imgRatio = img.width! / img.height!;
              const canvasRatio = canvasWidth / canvasHeight;
              
              let scaleFactor;
              if (canvasRatio > imgRatio) {
                scaleFactor = canvasHeight / img.height!;
              } else {
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
              fabricCanvas.renderAll();
            }).catch(error => {
              console.error('Error loading image:', error);
              toast.error('Failed to load image');
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Pixels with an Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {uploadedImage ? (
            <div className="relative">
              <div 
                className="border rounded-lg overflow-hidden" 
                style={{ 
                  maxWidth: '100%', 
                  height: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="bg-white object-contain max-w-full max-h-full"
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
            <div 
              className="border-2 border-dashed border-muted rounded-md p-8 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload or drag and drop an image to place on your pixels
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
                Maximum file size: 5MB
              </p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Your image will be fitted to your selected area while maintaining aspect ratio.
          </p>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-bitcoin hover:bg-bitcoin-light text-white"
            disabled={!uploadedImage}
          >
            <Save className="h-4 w-4 mr-2" /> Save Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixelEditor;
