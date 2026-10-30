import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type ProfileDetails = {
  fullName: string;
  phone: string;
};

const initialProfile: ProfileDetails = {
  fullName: '',
  phone: '',
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
