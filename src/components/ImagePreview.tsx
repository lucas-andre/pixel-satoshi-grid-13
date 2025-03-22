
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Canvas, Image as FabricImage } from 'fabric';

interface ImagePreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvas: Canvas | null;
  uploadedImage: string | null;
  onImageRemove: () => void;
  width: number; 
  height: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  canvasRef,
  fabricCanvas,
  uploadedImage,
  onImageRemove,
  width,
  height
}) => {
  useEffect(() => {
    if (!fabricCanvas || !uploadedImage) return;
    
    fabricCanvas.clear();
    
    // Load the image onto the canvas
    FabricImage.fromURL(uploadedImage).then(img => {
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
    });
  }, [fabricCanvas, uploadedImage]);

  if (!uploadedImage) {
    return null;
  }

  return (
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
        onClick={onImageRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ImagePreview;
