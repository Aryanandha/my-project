import { supabase } from '../lib/supabaseClient';

export interface ProfileData {
  name: string;
  phone: string;
  role: string;
  serviceName?: string;
  bio?: string;
  location?: string;
  price?: string;
  profileImage?: string;
  bannerImage?: string;
}

export interface Profile extends ProfileData {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  search?: string;
  location?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  profiles: Profile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class ProfileService {
  private getAuthHeaders() {
    const session = supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session}`,
      'Content-Type': 'application/json'
    };
  }

  async createProfile(profileData: ProfileData): Promise<Profile> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profiles`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profileData.name,
            phone: profileData.phone,
            role: profileData.role,
            service_name: profileData.serviceName,
            bio: profileData.bio,
            location: profileData.location,
            price: profileData.price,
            profile_image: profileData.profileImage,
            banner_image: profileData.bannerImage
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const result = await response.json();
      return this.transformProfile(result.profile);
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<ProfileData>): Promise<Profile> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profiles`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profileData.name,
            phone: profileData.phone,
            role: profileData.role,
            service_name: profileData.serviceName,
            bio: profileData.bio,
            location: profileData.location,
            price: profileData.price,
            profile_image: profileData.profileImage,
            banner_image: profileData.bannerImage
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      return this.transformProfile(result.profile);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async getProfile(profileId: string): Promise<Profile> {
    try {
      const session = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session.data.session?.access_token) {
        headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profiles/${profileId}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const result = await response.json();
      return this.transformProfile(result.profile);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async searchProfiles(filters: SearchFilters = {}): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.role) params.set('role', filters.role);
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.offset) params.set('offset', filters.offset.toString());

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search profiles');
      }

      const result = await response.json();
      
      return {
        profiles: result.profiles.map((profile: any) => this.transformProfile(profile)),
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Search profiles error:', error);
      throw error;
    }
  }

  private transformProfile(dbProfile: any): Profile {
    return {
      id: dbProfile.id,
      email: dbProfile.email || '',
      name: dbProfile.name,
      phone: dbProfile.phone,
      role: dbProfile.role,
      serviceName: dbProfile.service_name,
      bio: dbProfile.bio,
      location: dbProfile.location,
      price: dbProfile.price,
      profileImage: dbProfile.profile_image,
      bannerImage: dbProfile.banner_image,
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at
    };
  }
}

export const profileService = new ProfileService();