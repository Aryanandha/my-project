import { useState, useEffect } from 'react';
import { profileService, type Profile, type SearchFilters, type SearchResult } from '../services/profileService';

export const useProfileSearch = (filters: SearchFilters = {}) => {
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = async (searchFilters: SearchFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.searchProfiles(searchFilters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      searchProfiles(filters);
    }
  }, []);

  return {
    data,
    loading,
    error,
    searchProfiles,
    refetch: () => searchProfiles(filters)
  };
};

export const useProfile = (profileId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.getProfile(id);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    }
  }, [profileId]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    refetch: () => profileId && fetchProfile(profileId)
  };
};

export const useProfileMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (profileData: Omit<Profile, 'id' | 'email' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.createProfile(profileData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Omit<Profile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.updateProfile(profileData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createProfile,
    updateProfile,
    loading,
    error
  };
};