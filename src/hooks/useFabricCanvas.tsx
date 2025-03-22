
import { useEffect, useState, useRef } from 'react';
import { Canvas } from 'fabric';

export function useFabricCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  dependencies: any[] = []
) {
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !width || !height) return;
    
    // Clean up previous canvas instance if it exists
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
    
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
  }, [width, height, ...dependencies]);

  return fabricCanvas;
}
