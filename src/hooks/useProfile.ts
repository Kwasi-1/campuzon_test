// useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { extractData, extractError } from '@/lib/api';
import type { User, UserActivity } from '@/types-new'; 
import { profileAddressesService } from '@/services/profileAddressesService';
import toast from 'react-hot-toast';


export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
  activities: () => [...profileKeys.all, 'activities'] as const, // <-- Add this
};


export function useMyActivities() {
  return useQuery({
    queryKey: profileKeys.activities(),
    queryFn: async () => {
      const response = await api.get('/user/me/activity');
      const data = extractData<{ activities: UserActivity[] }>(response);
      return data.activities;
    },
  });
}


export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const response = await api.get('/user/me');
      // Fix: Correctly type and unwrap the nested user object
      const data = extractData<{ user: User }>(response);
      return data.user; 
    },
  });
}

export function useMyAddresses() {
  return useQuery({
    queryKey: profileKeys.addresses(),
    queryFn: () => profileAddressesService.getAddresses(),
    staleTime: 5 * 60 * 1000,
  });
}



export function useUserLocation(providedUser?: User | null) {
  const { data: fetchedUser, isLoading: profileLoading } = useProfile();
  const { data: addresses, isLoading: addressLoading } = useMyAddresses();

  const user = providedUser || fetchedUser;

  const isResident = !!user?.hallID;
  const residencyData = isResident ? user?.residence?.name : null;

  return {
    isLoading: (!providedUser && profileLoading) || (!isResident && addressLoading),
    isResident,
    user,
    residency: isResident ? {
      hall: residencyData,
      institution: user?.institution,
    } : null,
    savedAddresses: !isResident ? addresses : [],
    displayLocation: isResident 
      ? residencyData || (user as any)?.residenceName || "Campus Resident"
      : addresses?.find(a => a.isDefault)?.name || addresses?.[0]?.name || "No address saved"
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.patch('/user/me', data);
      // Fix: Unwrap the nested user object here too
      const responseData = extractData<{ user: User }>(response);
      return responseData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(extractError(error));
    },
  });
}