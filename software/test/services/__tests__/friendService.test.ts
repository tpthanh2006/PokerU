import { friendService } from '../friendService';
import api from '../api';

// Mock the API module
jest.mock('../api');

describe('FriendService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should send friend request', async () => {
    const mockResponse = {
      data: {
        id: '123',
        sender: { id: '1', username: 'testuser' },
        receiver: { id: '2', username: 'friend' },
        status: 'pending'
      }
    };
    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await friendService.sendFriendRequest('2');
    expect(result).toEqual(mockResponse.data);
    expect(api.post).toHaveBeenCalledWith('friends/request/2/');
  });

  it('should accept friend request', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
    await friendService.acceptFriendRequest('123');
    expect(api.post).toHaveBeenCalledWith('friends/accept/123/');
  });

  it('should follow user', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
    await friendService.followUser('2');
    expect(api.post).toHaveBeenCalledWith('follow/2/');
  });
}); 