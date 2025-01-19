import { joinGame } from '../gameService';
import api from '../api';

jest.mock('../api');

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully join public game', async () => {
    const mockGame = {
      id: '123',
      title: 'Test Game',
      private: false,
      // ... other game properties
    };
    (api.post as jest.Mock).mockResolvedValue({ data: mockGame });

    const result = await joinGame('123');
    expect(result).toHaveProperty('id', '123');
    expect(api.post).toHaveBeenCalledWith('games/123/join/');
  });

  it('should handle friends-only game error', async () => {
    const errorResponse = {
      response: {
        status: 403,
        data: { detail: 'friends_only' }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(errorResponse);

    await expect(joinGame('123')).rejects.toThrow('friends_only');
  });
}); 