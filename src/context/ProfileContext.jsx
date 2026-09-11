import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNostr } from './NostrContext';
import { DEFAULT_SHAPE, DEFAULT_COLOR } from '../components/Bloub/bloubShapes';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'deceit_player_profile';

export const ProfileProvider = ({ children }) => {
  const { pubkey, displayName, updateDisplayName } = useNostr();

  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          name: parsed.name || localStorage.getItem('deceit_name') || 'Player',
          color: parsed.color || DEFAULT_COLOR,
          shape: parsed.shape || DEFAULT_SHAPE
        };
      }
    } catch (e) {
      console.warn('[Deceit:Profile] Failed to parse stored profile:', e);
    }

    return {
      name: localStorage.getItem('deceit_name') || 'Player',
      color: DEFAULT_COLOR,
      shape: DEFAULT_SHAPE
    };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Keep profile name in sync with NostrContext displayName & window events
  useEffect(() => {
    if (displayName && displayName !== profile.name) {
      setProfile((prev) => {
        const updated = { ...prev, name: displayName };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [displayName]);

  useEffect(() => {
    const handleNameEvent = (e) => {
      if (e.detail && e.detail !== profile.name) {
        setProfile((prev) => {
          const updated = { ...prev, name: e.detail };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    };
    window.addEventListener('deceit:name-change', handleNameEvent);
    return () => window.removeEventListener('deceit:name-change', handleNameEvent);
  }, [profile.name]);

  // Update profile
  const updateProfile = ({ name, color, shape }) => {
    setProfile((prev) => {
      const updated = {
        name: name !== undefined ? name.trim() : prev.name,
        color: color !== undefined ? color : prev.color,
        shape: shape !== undefined ? shape : prev.shape
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (name !== undefined) {
          updateDisplayName(updated.name);
          window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: updated.name }));
        }
        window.dispatchEvent(new CustomEvent('deceit:profile-change', { detail: updated }));
      } catch (e) {
        console.warn('[Deceit:Profile] Failed to save profile to localStorage:', e);
      }
      return updated;
    });
  };

  const truncatedId = pubkey
    ? `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`
    : 'Connecting...';

  return (
    <ProfileContext.Provider
      value={{
        profile: {
          ...profile,
          pubkey
        },
        truncatedId,
        updateProfile,
        isProfileModalOpen,
        setIsProfileModalOpen
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
