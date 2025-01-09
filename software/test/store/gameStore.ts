import { create } from 'zustand';
import { Game } from '../app/(home)/(tabs)/FindGamesPage';
import { fetchGames, createGame } from '../services/gameService';
import api from '../services/api';

interface GameStore {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  addGame: (game: Partial<Game>) => Promise<void>;
}

export const useGameStore = create<GameStore>((set) => ({
  games: [],
  loading: false,
  error: null,
  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const games = await fetchGames();
      set({ games, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch games', loading: false });
    }
  },
  addGame: async (gameData) => {
    set({ loading: true, error: null });
    try {
      const newGame = await createGame(gameData);
      set((state) => ({
        games: [newGame, ...state.games],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create game', loading: false });
    }
  },
}));

export const getAllGames = async (): Promise<Game[]> => {
  try {
    console.log('Attempting to fetch games from:', api.defaults.baseURL);
    const response = await api.get('games/');
    console.log('Raw API response:', response);

    if (!response.data) {
      console.log('No data in response');
      return [];
    }

    // Transform the API response to match our Game interface
    const transformedGames = response.data.map((game: any) => ({
      id: game.id.toString(),
      hostName: game.host?.username || 'Unknown Host',
      hostImage: 'https://i.pravatar.cc/150?img=1',
      dateTime: new Date(game.time_start).toLocaleString(),
      buyIn: parseFloat(game.buy_in),
      totalSpots: game.slots,
      private: game.private,
      playerCount: 0, // You might want to get this from the backend
      title: game.title,
      description: game.description,
    }));

    console.log('Transformed games:', transformedGames);
    return transformedGames;
  } catch (error) {
    console.error('Detailed fetch error:', error);
    throw error;
  }
}; 