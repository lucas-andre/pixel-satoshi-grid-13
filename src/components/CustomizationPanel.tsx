
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaintBucket, Type, Image as ImageIcon, Upload, X } from 'lucide-react';
import { usePixels } from '@/context/PixelContext';
import { CustomizationType } from '@/types';

interface CustomizationPanelProps {
  onPurchase: () => void;
  onCancel: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  onPurchase,
  onCancel
}) => {
  const { selectedPixels, selectedColor, setSelectedColor } = usePixels();
  const [activeTab, setActiveTab] = useState<CustomizationType>('color');
  const [text, setText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState('');

  const colorPresets = [
    "#F7931A", // Bitcoin Orange
    "#FF9900", // Amber
    "#FFCC00", // Yellow
    "#3490DC", // Blue
    "#9561E2", // Purple
    "#F66D9B", // Pink
    "#38C172", // Green
    "#E3342F", // Red
    "#FFFFFF", // White
    "#000000", // Black
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="glass rounded-lg p-4 animate-slide-from-right">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Customize Your Pixels</h3>
        <p className="text-sm text-muted-foreground">
          {selectedPixels.length} pixels selected ({selectedPixels.length} sats)
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CustomizationType)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="color" className="flex items-center justify-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Color
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center justify-center">
            <Type className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center justify-center">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="color" className="space-y-4">
          <div>
            <Label htmlFor="color-picker">Select Color</Label>
            <div className="flex items-center mt-2">
              <input
                id="color-picker"
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-2 border-transparent focus:border-primary focus:outline-none"
              />
              <Input 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className="ml-3 font-mono"
              />
            </div>
          </div>
          
          <div>
            <Label>Presets</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  className={`h-8 w-full rounded-md transition-transform ${selectedColor === color ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <div>
            <Label htmlFor="text-input">Add Text</Label>
            <Input
              id="text-input"
              placeholder="Your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Text will be sized to fit your selected area.
            </p>
          </div>
          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex items-center mt-2">
              <input
                id="text-color"
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-2 border-transparent focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          {uploadedImage ? (
            <div className="relative">
              <Label>Uploaded Image</Label>
              <div className="mt-2 relative border rounded-md overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="max-w-full h-auto object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-80"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Image will be scaled to fit your selected pixels.
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-md p-6 text-center">
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image to place on your pixels
              </p>
              <Label
                htmlFor="image-upload"
                className="inline-flex items-center justify-center bg-bitcoin hover:bg-bitcoin-light text-white font-medium h-9 px-4 py-2 rounded-md cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-4">
                Maximum file size: 2MB
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
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
          disabled={selectedPixels.length < 1000 || !nickname}
          onClick={onPurchase}
        >
          Purchase ({selectedPixels.length} sats)
        </Button>
      </div>
      
      {selectedPixels.length < 1000 && (
        <p className="text-sm text-destructive mt-2">
          Minimum purchase is 1000 pixels (1000 sats)
        </p>
      )}
    </div>
  );
};

export default CustomizationPanel;
