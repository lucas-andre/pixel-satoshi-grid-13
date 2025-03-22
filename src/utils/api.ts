
import { Pixel, PixelPurchase, LeaderboardEntry } from '@/types';

// This is a placeholder API module that will be replaced with actual API calls
// when we connect to the backend

// Lightning address setting
export const LIGHTNING_ADDRESS = "orfeu@lawallet.ar";

export async function fetchPixels(): Promise<Pixel[]> {
  // In a real implementation, this would fetch from an API endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
}

export async function purchasePixels(purchase: PixelPurchase): Promise<{ 
  success: boolean;
  invoice?: string;
  message?: string;
}> {
  console.log('Purchase request:', purchase);
  console.log('Using Lightning address:', LIGHTNING_ADDRESS);
  
  // In development, just simulate a successful purchase
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        invoice: 'lnbc1500n1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaztrnwngzn3kdzw5hydlzf03qdgm2hdq27cqv3agm2awhz5se903vruatfhq77w3ls4evs3ch9zw97j25emudupq63nyw24cg27h2rspk28uwq',
        message: 'Payment invoice generated'
      });
    }, 1000);
  });
}

export async function confirmPayment(invoiceId: string): Promise<{
  success: boolean;
  pixels?: Pixel[];
  message?: string;
}> {
  console.log('Confirming payment for invoice:', invoiceId);
  
  // For development, simulate payment confirmation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Payment confirmed'
      });
    }, 1500);
  });
}

export async function savePixelContent(pixelIds: string[], content: string): Promise<{
  success: boolean;
  message?: string;
}> {
  console.log('Saving pixel content for pixels:', pixelIds);
  
  // For development, simulate successful save
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Pixel content saved successfully'
      });
    }, 1000);
  });
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  // Mock leaderboard data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'user1', nickname: 'Satoshi', totalPixels: 10000, totalSpent: 10000, url: 'https://bitcoin.org' },
        { id: 'user2', nickname: 'Hal Finney', totalPixels: 8500, totalSpent: 8500, url: 'https://en.wikipedia.org/wiki/Hal_Finney_(computer_scientist)' },
        { id: 'user3', nickname: 'Vitalik', totalPixels: 5000, totalSpent: 5000 },
        { id: 'user4', nickname: 'Anonymous', totalPixels: 3000, totalSpent: 3000 },
        { id: 'user5', nickname: 'BitcoinMiner', totalPixels: 2500, totalSpent: 2500, url: 'https://example.com' },
      ]);
    }, 1000);
  });
}

export async function getPixelDetails(x: number, y: number): Promise<{
  pixel?: Pixel;
  owner?: {
    nickname: string;
    url?: string;
    totalPixels: number;
  };
  message?: string;
}> {
  console.log(`Fetching details for pixel at (${x}, ${y})`);
  
  // Mock pixel details
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({
          pixel: {
            id: `pixel-${x}-${y}`,
            x,
            y,
            color: '#F7931A',
            ownerId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          owner: {
            nickname: 'Satoshi',
            url: 'https://bitcoin.org',
            totalPixels: 10000,
          }
        });
      } else {
        resolve({
          message: 'Pixel not owned'
        });
      }
    }, 500);
  });
}
