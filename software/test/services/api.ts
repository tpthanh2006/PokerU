import axios from 'axios';
import { tokenManager } from './tokenManager';

console.log('[API Service] Initializing API service...');  // Track when api.ts is loaded

const api = axios.create({
  baseURL: 'https://48a5-2600-4040-561a-7200-4037-b5e1-792f-b7d3.ngrok-free.app/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this near the top of the file
console.log('[API Service] API instance created:', !!api);

export const setApiAuth = async (token: string, userId?: string) => {
  console.log('[API Service] setApiAuth called with:', { 
    hasToken: !!token,
    hasUserId: !!userId,
    apiExists: !!api 
  });
  if (!token) {
    console.warn('Attempted to set API auth with null token');
    return;
  }

  console.log('Setting API auth:', { 
    tokenPreview: token.substring(0, 20) + '...',
    userId 
  });

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  if (userId) {
    api.defaults.headers.common['X-User-Id'] = userId;
  }
};

export const clearApiAuth = () => {
  console.log('Clearing API auth');
  delete api.defaults.headers.common['Authorization'];
  delete api.defaults.headers.common['X-User-Id'];
  tokenManager.setToken(null);
};

// Add request interceptor
api.interceptors.request.use(request => {
  const authHeader = request.headers['Authorization'] || request.headers['authorization'];
  const userId = request.headers['X-User-Id'];
  
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    hasAuth: !!authHeader,
    hasUserId: !!userId,
    authPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'none',
  });
  return request;
});

// Add response interceptor with limited retries
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 401 && retryCount < 2) {
      originalRequest._retryCount = retryCount + 1;
      console.log(`Got 401, attempt ${retryCount + 1} of 2...`);

      const currentToken = tokenManager.getToken();
      if (!currentToken) {
        console.log('No token available for retry');
        return Promise.reject(error);
      }

      // Update the request's Authorization header with current token
      originalRequest.headers['Authorization'] = `Bearer ${currentToken}`;
      return api(originalRequest);
    }

    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);

// Add function to create a game
export const createGame = async (gameData: CreateGameData) => {
  try {
    console.log('Creating game with data:', gameData);
    
    // No need for additional formatting since we're getting proper data structure
    const response = await api.post('games/', gameData);
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      data: error.response?.data,
      message: error.message,
      status: error.response?.status
    });
    throw {
      error: error.response?.data,
      status: error.response?.status
    };
  }
};

// Add this function to fetch user stats
export const getUserStats = async () => {
  try {
    console.log('\n=== Fetching User Stats ===');
    console.log('Making request to:', 'games/user_stats/');
    console.log('Headers:', {
      Authorization: api.defaults.headers.common['Authorization'] ? 'Set' : 'Not set',
      'X-User-Id': api.defaults.headers.common['X-User-Id']
    });
    
    const response = await api.get('games/user_stats/');
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    console.log('Fetching notifications...');
    const response = await api.get('notifications/');
    console.log('Notifications received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    console.log(`Marking notification ${notificationId} as read...`);
    const response = await api.post(`notifications/${notificationId}/mark_read/`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getCurrentUserId = async (): Promise<string> => {
  const userId = api.defaults.headers.common['X-User-Id'];
  console.log('[API Service] Getting current user ID:', userId);
  
  if (!userId) {
    console.warn('[API Service] No user ID found in headers');
    throw new Error('No user ID available');
  }
  
  return userId as string;
};

// Add this function to get current user's backend info
export const getCurrentUserInfo = async () => {
  try {
    console.log('[API Service] Fetching current user info...');
    const response = await api.get('users/me/');
    console.log('[API Service] Current user info:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API Service] Error fetching current user info:', error);
    throw error;
  }
};

const apiService = {
  ...api,
  setApiAuth,
  clearApiAuth,
  createGame,
  getUserStats,
  getNotifications,
  markNotificationAsRead,
  getCurrentUserId,
  getCurrentUserInfo,
};

export { apiService as api };
export default apiService; 