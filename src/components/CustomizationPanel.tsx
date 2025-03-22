
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, Move } from 'lucide-react';
import { usePixels } from '@/context/PixelContext';

interface CustomizationPanelProps {
  onPurchase: () => void;
  onCancel: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  onPurchase,
  onCancel
}) => {
  const { 
    selectedPixels, 
    isSelectionLocked, 
    toggleSelectionLock, 
    selectionDimensions 
  } = usePixels();
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="glass rounded-lg p-4 animate-slide-from-right">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Customize Your Pixels</h3>
        <p className="text-sm text-muted-foreground">
          {selectedPixels.length} pixels selected ({selectedPixels.length} sats)
        </p>
        {selectionDimensions && (
          <p className="text-xs text-muted-foreground mt-1">
            Dimensions: {selectionDimensions.width} × {selectionDimensions.height} pixels
          </p>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4 bg-muted/40 rounded-md p-2">
        <div className="text-sm font-medium flex items-center">
          {isSelectionLocked ? (
            <div className="flex items-center text-blue-600">
              <Lock className="h-4 w-4 mr-1" />
              <span>Selection Locked</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600">
              <Unlock className="h-4 w-4 mr-1" />
              <span>Selection Unlocked</span>
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          variant={isSelectionLocked ? "outline" : "secondary"}
          onClick={toggleSelectionLock}
          className="text-xs"
        >
          {isSelectionLocked ? (
            <>
              <Unlock className="h-3.5 w-3.5 mr-1" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 mr-1" />
              Lock
            </>
          )}
        </Button>
      </div>
      
      {isSelectionLocked && (
        <div className="mb-4 bg-blue-50 p-2 rounded-md">
          <div className="flex items-center text-blue-700 text-sm">
            <Move className="h-4 w-4 mr-2" />
            <span>You can now drag the selection to move it</span>
          </div>
        </div>
      )}
      
      <p className="text-sm mb-4">
        You'll be able to upload an image after confirming your selection.
      </p>
      
      <div className="border-t border-border mt-4 pt-4 space-y-4">
        <div>
          <Label htmlFor="nickname">Your Name/Nickname *</Label>
          <Input
            id="nickname"
            placeholder="Satoshi"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-2"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="url">Website URL (optional)</Label>
          <Input
            id="url"
            placeholder="https://your-website.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="bg-bitcoin hover:bg-bitcoin-light text-white"
          disabled={selectedPixels.length === 0 || !nickname}
          onClick={onPurchase}
        >
          Continue ({selectedPixels.length} sats)
        </Button>
      </div>
    </div>
  );
};

export default CustomizationPanel;
