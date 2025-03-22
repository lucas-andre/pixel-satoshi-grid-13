
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PixelGrid from '@/components/PixelGrid';
import CustomizationPanel from '@/components/CustomizationPanel';
import PurchaseModal from '@/components/PurchaseModal';
import Leaderboard from '@/components/Leaderboard';
import { PixelProvider, usePixels } from '@/context/PixelContext';
import { bitcoin } from 'lucide-react';

const PixelGridApp: React.FC = () => {
  const { gridMode, setGridMode, clearSelection } = usePixels();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  const handleCancel = () => {
    setGridMode('view');
    clearSelection();
  };

  const handlePurchaseSuccess = () => {
    setGridMode('view');
    clearSelection();
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 flex">
        <div className="flex-1 relative">
          <PixelGrid />
          
          {gridMode === 'select' && (
            <div className="absolute top-4 right-4 w-72">
              <CustomizationPanel 
                onPurchase={handlePurchase}
                onCancel={handleCancel}
              />
            </div>
          )}
          
          {gridMode === 'view' && (
            <div className="absolute top-4 left-4 w-80 z-10">
              <Leaderboard />
            </div>
          )}
        </div>
      </main>
      
      <PurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        nickname={nickname}
        url={url}
        text={text}
        image={image}
        onSuccess={handlePurchaseSuccess}
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
