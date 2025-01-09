import { useAuth, useUser } from '@clerk/clerk-expo';
import { setApiAuth } from '../services/api';

export const useApiAuth = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const refreshToken = async () => {
    try {
      const token = await getToken();
      if (token && user) {
        await setApiAuth(token, user.id);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  return { refreshToken };
}; 