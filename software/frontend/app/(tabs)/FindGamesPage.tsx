export interface Game {
  id: string;
  title: string;
  hostName: string;
  hostImage: string | null;
  dateTime?: string;
  scheduled_time?: string;
  buyIn: number;
  totalSpots: number;
  playerCount: number;
  private: boolean;
  isHostedByMe: boolean;
  isPlayer: boolean;
  description: string;
  location: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'archived';
  startTime?: string;
  joinedPlayers: {
    id: string;
    name: string;
    image: string | null;
    isHost: boolean;
    isAdmin: boolean;
  }[];
  // Game statistics fields
  finalPot?: number;
  duration?: string;
  winner?: {
    id: string;
    name: string;
    image: string | null;
  };
  playerStats?: {
    playerId: string;
    buyIn: number;
    cashOut: number;
    profit: number;
    position: number;
  }[];
} 