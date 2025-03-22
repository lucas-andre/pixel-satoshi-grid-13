
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPixelDetails } from '@/utils/api';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PixelDetailsModalProps {
  x: number;
  y: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PixelDetailsModal: React.FC<PixelDetailsModalProps> = ({ 
  x, 
  y, 
  open, 
  onOpenChange 
}) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<{
    pixel?: {
      color: string;
    };
    owner?: {
      nickname: string;
      url?: string;
      totalPixels: number;
    };
    message?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setLoading(true);
      getPixelDetails(x, y)
        .then(data => {
          setDetails(data);
        })
        .catch(error => {
          console.error('Failed to fetch pixel details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [x, y, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass animate-scale-in sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center">
            Pixel Details
            <span className="ml-2 px-2 py-0.5 text-xs font-mono bg-muted rounded-md">
              X: {x}, Y: {y}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-bitcoin" />
            <p className="text-sm text-muted-foreground">Loading pixel details...</p>
          </div>
        ) : details.owner ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: details.pixel?.color || '#F7931A' }}
              ></div>
              <div>
                <h3 className="font-semibold">{details.owner.nickname}</h3>
                {details.owner.url && (
                  <a 
                    href={details.owner.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-bitcoin hover:text-bitcoin-light flex items-center"
                  >
                    {details.owner.url.replace(/^https?:\/\//, '').slice(0, 30)}
                    {details.owner.url.replace(/^https?:\/\//, '').length > 30 && '...'}
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-muted-foreground">Total Pixels</p>
                <p className="font-mono font-bold text-lg">
                  {details.owner.totalPixels.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-muted-foreground">Total Spent</p>
                <p className="font-mono font-bold text-lg text-bitcoin">
                  {details.owner.totalPixels.toLocaleString()} <span className="text-xs">sats</span>
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">This pixel is not yet owned</p>
            <Button 
              className="bg-bitcoin hover:bg-bitcoin-light text-white"
              onClick={() => {
                onOpenChange(false);
                // Here we would typically trigger the purchase flow
              }}
            >
              Buy This Pixel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PixelDetailsModal;
