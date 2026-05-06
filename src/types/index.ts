export interface MovieQuote {
  id: string;
  rank: number;
  name: string;
  quote: string;
  author: string;
  role: string;
  price: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
  premiereDate?: string;
}

export interface Award {
  name: string;
  predictedWinner: string;
  dividend: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  balance: number;
  medal?: 'gold' | 'silver' | 'bronze';
}
