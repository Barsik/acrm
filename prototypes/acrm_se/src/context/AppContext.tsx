import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../types';
import { profilePhotoKey } from '../data/profileData';

export type MenuPosition = 'top' | 'left';

const MENU_POSITION_KEY = 'acrm_menu_position';

interface AppContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuPosition: MenuPosition;
  setMenuPosition: (p: MenuPosition) => void;
  profilePhoto: string | null;
  setProfilePhoto: (photo: string | null) => void;
}

const AppContext = createContext<AppContextType>({
  role: null,
  setRole: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {},
  menuPosition: 'top',
  setMenuPosition: () => {},
  profilePhoto: null,
  setProfilePhoto: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const setRole = (r: UserRole | null) => {
    setRoleState(r);
    setProfilePhotoState(r ? localStorage.getItem(profilePhotoKey(r)) : null);
  };

  const setProfilePhoto = (photo: string | null) => {
    setProfilePhotoState(photo);
    if (role) {
      if (photo) localStorage.setItem(profilePhotoKey(role), photo);
      else localStorage.removeItem(profilePhotoKey(role));
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [menuPosition, setMenuPositionState] = useState<MenuPosition>(() => {
    if (typeof window === 'undefined') return 'top';
    return localStorage.getItem(MENU_POSITION_KEY) === 'left' ? 'left' : 'top';
  });

  const setMenuPosition = (p: MenuPosition) => {
    setMenuPositionState(p);
    if (typeof window !== 'undefined') localStorage.setItem(MENU_POSITION_KEY, p);
  };

  return (
    <AppContext.Provider value={{ role, setRole, searchQuery, setSearchQuery, sidebarOpen, setSidebarOpen, menuPosition, setMenuPosition, profilePhoto, setProfilePhoto }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
