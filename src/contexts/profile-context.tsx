import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type ProfileDetails = {
  fullName: string;
  phone: string;
  email: string;
};

const initialProfile: ProfileDetails = {
  fullName: 'Mali K.',
  phone: '+66 81 234 5678',
  email: 'mali@harnkan.com',
};

const ProfileContext = createContext<{
  profile: ProfileDetails;
  updateProfile: (profile: ProfileDetails) => void;
} | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(initialProfile);
  const contextValue = useMemo(
    () => ({ profile, updateProfile: setProfile }),
    [profile],
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider.');
  }
  return context;
}
