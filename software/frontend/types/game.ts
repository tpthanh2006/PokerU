export interface CreateGameData {
  title: string;
  description: string;
  location: string;
  scheduled_time: string;  // ISO string
  buy_in: number;
  slots: number;
  blinds: number;
  amount_reserved: number;
  private: boolean;
} 