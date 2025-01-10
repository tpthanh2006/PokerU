import api from './api';

export interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
  receiver: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

class FriendService {
  async sendFriendRequest(userId: string): Promise<FriendRequest> {
    try {
      const response = await api.post(`friends/request/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      await api.post(`friends/accept/${requestId}/`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async declineFriendRequest(requestId: string): Promise<void> {
    try {
      await api.post(`friends/decline/${requestId}/`);
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  }

  async removeFriend(userId: string): Promise<void> {
    try {
      await api.delete(`friends/${userId}/`);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  async followUser(userId: string): Promise<void> {
    try {
      await api.post(`follow/${userId}/`);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    try {
      await api.delete(`follow/${userId}/`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getFriends(): Promise<any[]> {
    try {
      const response = await api.get('friends/');
      return response.data;
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  async getFollowers(): Promise<any[]> {
    try {
      const response = await api.get('followers/');
      return response.data;
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  async getFollowing(): Promise<any[]> {
    try {
      const response = await api.get('following/');
      return response.data;
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }
}

export const friendService = new FriendService(); 