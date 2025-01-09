import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import api from '../services/api';
import { useAuthToken } from '../utils/auth';

interface Profile {
  id: number;
  bio: string;
  phone: string;
  address: string;
  age: number | null;
  profile_image_url: string | null;
  poker_stats: {
    total_games: number;
    total_profit: number;
    total_hours: number;
    average_profit_per_game: number;
    hourly_rate: number;
    roi_percentage: number;
    biggest_win: number;
    biggest_loss: number;
    win_rate: number;
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useAuth();
  const { getAuthTokenAsync } = useAuthToken();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAuthTokenAsync();
        if (!token) {
          setError('Authentication token not available');
          setLoading(false);
          return;
        }

        const response = await api.get('users/profile/');
        setProfile(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isSignedIn, user?.id]);

  return { profile, loading, error };
} 