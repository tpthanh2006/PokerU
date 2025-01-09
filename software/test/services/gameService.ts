import api, { setApiAuth } from './api';
import { Game } from '../app/(home)/(tabs)/FindGamesPage';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  console.log('Setting auth token:', token ? 'token present' : 'no token');
  setApiAuth(token, null);
};

const transformGameData = (gameData: any, userId?: string): Game => {
  try {
    console.log('Starting game transformation:', {
      id: gameData.id,
      title: gameData.title,
      host: gameData.host,
      inputFields: Object.keys(gameData)
    });

    if (!gameData || typeof gameData !== 'object') {
      throw new Error('Invalid game data received');
    }

    // Transform the host data
    const hostData = gameData.host || {};
    const hostName = hostData.username || hostData.email || 'Unknown Host';
    const hostImage = hostData.image_url || null;

    // Format the date if time_start exists
    const startTime = gameData.time_start || gameData.scheduled_time;
    const dateTime = startTime ? new Date(startTime).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) : undefined;

    const transformedGame: Game = {
      id: String(gameData.id),
      title: gameData.title || 'Untitled Game',
      hostName: hostName,
      hostImage: hostImage,
      dateTime: dateTime,
      scheduled_time: startTime,
      buyIn: parseFloat(gameData.buy_in) || 0,
      totalSpots: parseInt(gameData.slots) || 0,
      private: gameData.private || false,
      isHostedByMe: gameData.is_hosted_by_me || false,
      isPlayer: gameData.is_player || false,
      playerCount: gameData.player_count || 0,
      description: gameData.description || '',
      location: gameData.location || '',
      status: gameData.status || 'upcoming',
      startTime: startTime,
      joinedPlayers: gameData.players?.map((player: any) => {
        console.log('Processing player:', {
          player,
          user_id: player.user_id,
          host_id: gameData.host.id,
          image_url: player.image_url,
          host_image: hostData.image_url
        });
        
        const isHost = player.user_id === gameData.host.id;
        const playerImage = player.image_url || (isHost ? hostData.image_url : null);
        
        return {
          id: String(player.id),
          name: player.username || 'Unknown Player',
          image: playerImage,
          isHost: isHost,
          isAdmin: player.is_admin
        };
      }) || []
    };

    console.log('Transformed game:', transformedGame);
    return transformedGame;
  } catch (error) {
    console.error('Error transforming game data:', error);
    throw error;
  }
};

export const fetchGames = async (): Promise<Game[]> => {
  try {
    console.log('Fetching games...');
    const response = await api.get('games/');
    console.log('Raw games response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchGames:', error);
    throw error;
  }
};

export const fetchGameById = async (id: string): Promise<Game> => {
  try {
    console.log('Fetching game by ID:', id);
    const response = await api.get(`games/${id}/`);
    console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
    
    // Use the existing transformGameData function
    const game = transformGameData(response.data);
    console.log('Transformed game data:', {
      id: game.id,
      status: game.status,
      playerCount: game.joinedPlayers?.length,
      players: game.joinedPlayers
    });
    
    return game;
  } catch (error) {
    console.error('Error fetching game by ID:', error);
    throw error;
  }
};

export const createGame = async (gameData: Partial<Game>): Promise<Game> => {
  try {
    console.log('Creating game with data:', gameData);

    const formattedData = {
      title: gameData.title || '',
      slots: String(gameData.totalSpots || 0),
      private: Boolean(gameData.private),
      buy_in: String(gameData.buyIn || 0),
      time_start: gameData.dateTime,
      description: gameData.description || '',
      blinds: "0",
      amount_reserved: "0",
      location: gameData.location || '',
    };

    console.log('Formatted data for API:', formattedData);

    const response = await api.post('games/', formattedData);
    
    console.log('Create game response:', {
      status: response.status,
      data: response.data
    });

    return transformGameData(response.data);
  } catch (error: any) {
    console.error('Create game error:', {
      error: error?.response?.data || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export const updateGame = async (gameId: string, updates: Partial<Game>): Promise<Game | undefined> => {
  try {
    console.log('Updating game:', {
      gameId,
      updates
    });

    // Format the data for the API
    const formattedUpdates = {
      ...(updates.buyIn !== undefined && { buy_in: String(updates.buyIn) }),
      ...(updates.totalSpots !== undefined && { slots: String(updates.totalSpots) }),
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.rules !== undefined && { rules: updates.rules }),
      ...(updates.private !== undefined && { private: updates.private }),
    };

    console.log('Formatted updates:', formattedUpdates);

    const response = await api.patch(`games/${gameId}/`, formattedUpdates);
    
    console.log('Update response:', {
      status: response.status,
      data: response.data
    });

    return transformGameData(response.data);
  } catch (error: any) {
    console.error('Update game error:', {
      error: error?.response?.data || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export const deleteGame = async (gameId: string): Promise<void> => {
  try {
    console.log('Deleting game:', gameId);
    
    const response = await api.delete(`games/${gameId}/`);
    
    console.log('Delete response:', {
      status: response.status
    });
  } catch (error: any) {
    console.error('Delete game error:', {
      error: error?.response?.data || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export const joinGame = async (gameId: string): Promise<Game> => {
  try {
    console.log('Joining game:', gameId);
    
    const response = await api.post(`games/${gameId}/join/`);
    
    console.log('Join game response:', {
      status: response.status,
      data: response.data
    });

    return transformGameData(response.data);
  } catch (error: any) {
    console.error('Join game error:', {
      error: error?.response?.data || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export const removePlayer = async (gameId: string, playerId: string) => {
  try {
    console.log('Admin removing player:', { gameId, playerId });
    const response = await api.post(`games/${gameId}/remove_player/`, {
      player_id: playerId
    });
    return transformGameData(response.data);
  } catch (error) {
    console.error('Error removing player:', error);
    throw error;
  }
};

export const leaveGame = async (gameId: string) => {
  try {
    console.log('Player leaving game:', gameId);
    const response = await api.post(`games/${gameId}/leave/`);
    return transformGameData(response.data);
  } catch (error) {
    console.error('Error leaving game:', error);
    throw error;
  }
};

export const toggleAdmin = async (gameId: string, playerId: string): Promise<Game> => {
  try {
    console.log('Toggling admin status:', { gameId, playerId });
    
    const response = await api.post(`games/${gameId}/toggle_admin/`, {
      player_id: playerId
    });
    
    console.log('Toggle admin response:', {
      status: response.status,
      data: response.data
    });

    return transformGameData(response.data);
  } catch (error: any) {
    console.error('Toggle admin error:', {
      error: error?.response?.data || error.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export const checkGameAccess = async (gameId: string): Promise<'admin' | 'player' | 'none'> => {
  try {
    const game = await fetchGameById(gameId);
    const { user } = useUser();
    
    if (game.host.id === user?.id) return 'admin';
    
    const playerStatus = game.joinedPlayers.find(p => p.id === user?.id);
    if (playerStatus?.isAdmin) return 'admin';
    if (playerStatus) return 'player';
    
    return 'none';
  } catch (error) {
    console.error('Error checking game access:', error);
    return 'none';
  }
};

export const fetchUserGames = async (): Promise<Game[]> => {
  try {
    const response = await api.get('games/my_games/');
    const games = response.data.map(transformGameData);
    
    // Sort by date (soonest first)
    return games.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return [];
  }
};

interface GameStats {
  buyIn: number;
  cashOut: number;
  hoursPlayed: number;
}

export const submitGameStats = async (gameId: string, stats: GameStats): Promise<void> => {
  try {
    console.log('Submitting game stats:', { gameId, stats });
    await api.post(`games/${gameId}/stats/`, {
      buyIn: stats.buyIn,
      cashOut: stats.cashOut,
      hoursPlayed: stats.hoursPlayed
    });
  } catch (error) {
    console.error('Error submitting game stats:', error);
    throw error;
  }
}; 