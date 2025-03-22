
import React from 'react';
import { Bitcoin, Moon, Sun, Info, Award, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePixels } from '@/context/PixelContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { 
    totalPixelCount, 
    purchasedPixelCount,
    setGridMode,
    clearSelection
  } = usePixels();
  
  const availablePixels = totalPixelCount - purchasedPixelCount;
  const percentageSold = (purchasedPixelCount / totalPixelCount) * 100;
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { label: 'About', icon: <Info className="h-4 w-4 mr-2" />, action: () => console.log('About clicked') },
    { label: 'Leaderboard', icon: <Award className="h-4 w-4 mr-2" />, action: () => console.log('Leaderboard clicked') },
  ];

  const renderNavLinks = () => (
    <>
      {navItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={item.action}
          className="font-medium transition-all"
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass animate-fade-in-up border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bitcoin className="h-6 w-6 text-bitcoin animate-pulse-subtle" />
          <span className="font-bold text-xl tracking-tight">PixelSats</span>
        </div>

        {/* Stats Section */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Available:</span>{' '}
            <span className="font-mono font-bold">{availablePixels.toLocaleString()}</span>{' '}
            <span className="text-xs text-muted-foreground">pixels</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Sold:</span>{' '}
            <span className="font-mono font-bold">{purchasedPixelCount.toLocaleString()}</span>{' '}
            <span className="text-xs text-muted-foreground">pixels</span>
          </div>
          <div className="text-sm w-32">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">{percentageSold.toFixed(2)}% filled</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-bitcoin h-1.5 rounded-full"
                style={{ width: `${percentageSold}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {renderNavLinks()}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="ml-2"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="default"
            className="ml-4 bg-bitcoin hover:bg-bitcoin-light text-white font-medium"
            onClick={() => {
              setGridMode('select');
              clearSelection();
            }}
          >
            Buy Pixels
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-2">
                      <Bitcoin className="h-6 w-6 text-bitcoin" />
                      <span className="font-bold text-xl">PixelSats</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-4">
                    {navItems.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="justify-start font-medium"
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Available:</span>{' '}
                      <span className="font-mono font-bold">{availablePixels.toLocaleString()}</span>{' '}
                      <span className="text-xs text-muted-foreground">pixels</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Sold:</span>{' '}
                      <span className="font-mono font-bold">{purchasedPixelCount.toLocaleString()}</span>{' '}
                      <span className="text-xs text-muted-foreground">pixels</span>
                    </div>
                    <div className="text-sm w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {percentageSold.toFixed(2)}% filled
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-bitcoin h-1.5 rounded-full"
                          style={{ width: `${percentageSold}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button
                      variant="default"
                      className="w-full bg-bitcoin hover:bg-bitcoin-light text-white font-medium"
                      onClick={() => {
                        setGridMode('select');
                        clearSelection();
                        setIsMenuOpen(false);
                      }}
                    >
                      Buy Pixels
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
