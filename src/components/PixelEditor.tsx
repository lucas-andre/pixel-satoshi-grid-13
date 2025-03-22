
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { usePixels } from '@/context/PixelContext';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';

interface PixelEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageData: string) => void;
}

const PixelEditor: React.FC<PixelEditorProps> = ({ 
  open, 
  onOpenChange, 
  onSave 
}) => {
  const { selectionDimensions } = usePixels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Initialize canvas with our custom hook
  const fabricCanvas = useFabricCanvas(
    canvasRef, 
    selectionDimensions?.width || 0, 
    selectionDimensions?.height || 0, 
    [open]
  );
  
  const handleImageUpload = (imgData: string) => {
    setUploadedImage(imgData);
  };
  
  const handleImageRemove = () => {
    setUploadedImage(null);
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#FFFFFF';
      fabricCanvas.renderAll();
    }
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Pixels with an Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ImagePreview 
            canvasRef={canvasRef}
            fabricCanvas={fabricCanvas}
            uploadedImage={uploadedImage}
            onImageRemove={handleImageRemove}
            width={selectionDimensions?.width || 0}
            height={selectionDimensions?.height || 0}
          />
          
          <ImageUploader 
            uploadedImage={uploadedImage}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
          
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
