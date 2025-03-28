
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bitcoin, Copy, Check, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { purchasePixels, confirmPayment, LIGHTNING_ADDRESS } from '@/utils/api';
import { usePixels } from '@/context/PixelContext';
import { Separator } from '@/components/ui/separator';

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
  url: string;
  setUrl: (url: string) => void;
  onSuccess: () => void;
}

type PurchaseStatus = 'user-info' | 'invoice' | 'confirming' | 'success' | 'error';

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  onOpenChange,
  nickname,
  setNickname,
  url,
  setUrl,
  onSuccess,
}) => {
  const { selectedPixels, selectedColor, refreshPixels } = usePixels();
  const [status, setStatus] = useState<PurchaseStatus>('user-info');
  const [invoice, setInvoice] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateInvoice = async () => {
    if (!nickname.trim()) {
      toast.error("Please enter your name or nickname");
      return;
    }
    
    setStatus('invoice');
    setError('');

    try {
      const purchaseResponse = await purchasePixels({
        pixels: selectedPixels,
        color: selectedColor,
        nickname,
        url,
      });

      if (purchaseResponse.success && purchaseResponse.invoice) {
        setInvoice(purchaseResponse.invoice);
      } else {
        throw new Error(purchaseResponse.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to generate lightning invoice. Please try again.');
      setStatus('error');
    }
  };

  const handleConfirmPayment = async () => {
    setStatus('confirming');
    setError('');

    try {
      const confirmationResponse = await confirmPayment(invoice);

      if (confirmationResponse.success) {
        setStatus('success');
        refreshPixels();
        setTimeout(() => {
          onOpenChange(false);
          onSuccess();
          toast.success("Purchase Successful!", {
            description: `You now own ${selectedPixels.length} pixels on the grid.`,
            duration: 5000,
          });
        }, 3000);
      } else {
        throw new Error(confirmationResponse.message || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      setError('Failed to confirm payment. Please try again.');
      setStatus('error');
    }
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    setCopied(true);
    toast.success("Invoice copied to clipboard");
    
    setTimeout(() => setCopied(false), 3000);
  };

  const resetModal = () => {
    setStatus('user-info');
    setInvoice('');
    setCopied(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetModal();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="glass sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {status === 'user-info' && 'Confirm Your Purchase'}
            {status === 'invoice' && 'Pay with Lightning'}
            {status === 'confirming' && 'Confirming Payment'}
            {status === 'success' && 'Purchase Successful!'}
            {status === 'error' && 'Payment Error'}
          </DialogTitle>
        </DialogHeader>

        {status === 'user-info' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pixels</span>
                <span className="font-mono font-bold">{selectedPixels.length}</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price per Pixel</span>
                <span className="font-mono">1 sat</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center font-medium">
                <span>Total Amount</span>
                <span className="text-lg font-mono text-bitcoin">
                  {selectedPixels.length} <span className="text-xs">sats</span>
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
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
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-bitcoin hover:bg-bitcoin-light text-white"
                onClick={handleGenerateInvoice}
                disabled={!nickname.trim()}
              >
                <Bitcoin className="h-4 w-4 mr-2" />
                Pay with Lightning
              </Button>
            </div>
          </div>
        )}

        {status === 'invoice' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Pay the Lightning invoice to claim your pixels
              </p>
              
              <div className="bg-muted/70 p-3 rounded-md font-mono text-xs flex items-center justify-center mb-3">
                <span className="text-muted-foreground">{LIGHTNING_ADDRESS}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-1"
                  onClick={() => {
                    navigator.clipboard.writeText(LIGHTNING_ADDRESS);
                    toast.success("Lightning address copied to clipboard");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="bg-white/20 p-3 rounded-md font-mono text-xs overflow-x-auto text-muted-foreground">
                {invoice}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center shadow-subtle"
                  onClick={copyInvoice}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                After paying, click the button below to confirm your purchase
              </p>
              <Button 
                className="bg-bitcoin hover:bg-bitcoin-light text-white w-full"
                onClick={handleConfirmPayment}
              >
                I've Paid the Invoice
              </Button>
            </div>
          </div>
        )}

        {status === 'confirming' && (
          <div className="text-center py-6">
            <RefreshCw className="h-10 w-10 text-bitcoin animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Confirming Payment</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium mb-2">Purchase Successful!</p>
            <p className="text-sm text-muted-foreground mb-6">
              You now own {selectedPixels.length} pixels on the grid.
            </p>
            <Button 
              className="bg-bitcoin hover:bg-bitcoin-light text-white"
              onClick={() => {
                onOpenChange(false);
                onSuccess();
              }}
            >
              Customize My Pixels
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6">
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Payment Error</p>
            <p className="text-sm text-destructive mb-6">
              {error || 'Something went wrong with your payment.'}
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStatus('user-info')}
              >
                Try Again
              </Button>
              <Button 
                variant="default"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
