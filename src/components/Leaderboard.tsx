
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchLeaderboard } from '@/utils/api';
import { LeaderboardEntry } from '@/types';
import { Separator } from '@/components/ui/separator';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <Card className="glass glass-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-bitcoin" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={entry.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${index === 0 ? 'bg-bitcoin/20 text-bitcoin' : index === 1 ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground'} font-medium text-sm`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{entry.nickname}</div>
                      {entry.url && (
                        <a 
                          href={entry.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-bitcoin hover:text-bitcoin-light flex items-center"
                        >
                          {entry.url.replace(/^https?:\/\//, '').slice(0, 20)}
                          {entry.url.replace(/^https?:\/\//, '').length > 20 && '...'}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">{entry.totalPixels.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.totalSpent.toLocaleString()} sats
                    </div>
                  </div>
                </div>
                {index < entries.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
