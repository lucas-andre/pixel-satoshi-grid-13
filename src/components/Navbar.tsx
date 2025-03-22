
import React from 'react';
import { MoveVertical, Info, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePixels } from '@/context/PixelContext';

interface NavbarProps {
  onBuyPixelsClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBuyPixelsClick }) => {
  const { purchasedPixelCount, totalPixelCount } = usePixels();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-16 glass border-b border-border px-4 sm:px-6">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-bold flex items-center">
            <MoveVertical className="h-5 w-5 mr-2 text-bitcoin" />
            <span className="hidden sm:inline">Bitcoin Pixels</span>
            <span className="sm:hidden">BTC Pixels</span>
          </div>
          
          <div className="hidden md:flex items-center h-6 bg-muted/50 px-2 rounded-full text-xs text-muted-foreground">
            <span className="font-mono">{purchasedPixelCount.toLocaleString()}</span>
            <span className="mx-1">/</span>
            <span className="font-mono">{totalPixelCount.toLocaleString()}</span>
            <span className="ml-1">pixels claimed</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={onBuyPixelsClick}
          >
            Buy Pixels
          </Button>
          
          <Button variant="ghost" size="icon" title="About">
            <Info className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" title="GitHub">
            <Github className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
