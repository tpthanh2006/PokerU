import { useAuth } from "@clerk/clerk-expo";

export const getAuthTokenAsync = async () => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}; 