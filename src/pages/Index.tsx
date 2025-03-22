
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PixelGrid from '@/components/PixelGrid';
import CustomizationPanel from '@/components/CustomizationPanel';
import PurchaseModal from '@/components/PurchaseModal';
import PixelEditor from '@/components/PixelEditor';
import Leaderboard from '@/components/Leaderboard';
import { PixelProvider, usePixels } from '@/context/PixelContext';
import { Bitcoin } from 'lucide-react';
import { toast } from 'sonner';
import { savePixelContent } from '@/utils/api';

const PixelGridApp: React.FC = () => {
  const { 
    gridMode, 
    setGridMode, 
    clearSelection, 
    selectedPixels, 
    selectionDimensions, 
    selectedColor,
    refreshPixels 
  } = usePixels();
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPixelEditor, setShowPixelEditor] = useState(false);
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');

  const handleBuyPixels = () => {
    setGridMode('select');
    toast.info("Select an area on the canvas");
  };

  const handlePurchase = () => {
    if (selectedPixels.length === 0) {
      toast.error("Please select some pixels first");
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleCancel = () => {
    setGridMode('view');
    clearSelection();
  };

  const handlePurchaseSuccess = () => {
    setShowPixelEditor(true);
  };

  const handlePixelContentSave = async (content: string) => {
    try {
      const pixelIds = selectedPixels.map(p => `pixel-${p.x}-${p.y}`);
      
      await savePixelContent(pixelIds, content);
      
      refreshPixels();
      
      setGridMode('view');
      clearSelection();
      setShowPixelEditor(false);
      toast.success('Your pixel art has been saved permanently!');
    } catch (error) {
      console.error('Error saving pixel content:', error);
      toast.error('Failed to save your pixel art. Please try again.');
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar onBuyPixelsClick={handleBuyPixels} />
      
      <main className="flex-1 pt-16 flex">
        <div className="flex-1 relative">
          <PixelGrid />
          
          {gridMode === 'select' && (
            <div className="absolute top-4 right-4 w-72">
              <div className="glass rounded-lg p-4 animate-slide-from-right">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">Select Your Pixels</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPixels.length} pixels selected ({selectedPixels.length} sats)
                  </p>
                  {selectionDimensions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Dimensions: {selectionDimensions.width} × {selectionDimensions.height} pixels
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    className="bg-bitcoin hover:bg-bitcoin-light text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={selectedPixels.length === 0}
                    onClick={handlePurchase}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {gridMode === 'view' && (
            <div className="absolute top-4 left-4 w-80 z-10">
              <Leaderboard />
            </div>
          )}
          
          {gridMode === 'view' && (
            <div className="absolute bottom-16 right-4">
              <button
                onClick={handleBuyPixels}
                className="bg-bitcoin hover:bg-bitcoin-light text-white font-medium rounded-full p-4 shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Bitcoin className="h-5 w-5" />
                <span>Buy Pixels</span>
              </button>
            </div>
          )}
        </div>
      </main>
      
      <PurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        nickname={nickname}
        setNickname={setNickname}
        url={url}
        setUrl={setUrl}
        onSuccess={handlePurchaseSuccess}
      />
      
      <PixelEditor
        open={showPixelEditor}
        onOpenChange={setShowPixelEditor}
        onSave={handlePixelContentSave}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <PixelProvider>
      <PixelGridApp />
    </PixelProvider>
  );
};

export default Index;
