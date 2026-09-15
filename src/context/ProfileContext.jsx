import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNostr } from './NostrContext';
import { DEFAULT_SHAPE, DEFAULT_COLOR, COLORS } from '../components/Bloub/bloubShapes';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'deceit_player_profile';

export const ProfileProvider = ({ children }) => {
  const { pubkey, displayName, updateDisplayName } = useNostr();

  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validColor = COLORS.some((c) => c.hex.toLowerCase() === parsed.color?.toLowerCase())
          ? parsed.color
          : DEFAULT_COLOR;
        const savedName = parsed.name || localStorage.getItem('deceit_name') || '';
        return {
          name: savedName === 'Player' ? '' : savedName,
          color: validColor,
          shape: parsed.shape || DEFAULT_SHAPE
        };
      }
    } catch (e) {
      console.warn('[Deceit:Profile] Failed to parse stored profile:', e);
    }

    const fallbackName = localStorage.getItem('deceit_name') || '';
    return {
      name: fallbackName === 'Player' ? '' : fallbackName,
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

  useEffect(() => {
    const handleAccountRestored = (e) => {
      if (e.detail && e.detail.profile) {
        setProfile({
          name: e.detail.profile.name || '',
          color: e.detail.profile.color || DEFAULT_COLOR,
          shape: e.detail.profile.shape || DEFAULT_SHAPE
        });
      }
    };
    const handleProfileChange = (e) => {
      if (e.detail) {
        setProfile(prev => ({
          name: e.detail.name !== undefined ? e.detail.name : prev.name,
          color: e.detail.color || prev.color,
          shape: e.detail.shape || prev.shape
        }));
      }
    };
    window.addEventListener('deceit:account-restored', handleAccountRestored);
    window.addEventListener('deceit:profile-change', handleProfileChange);
    return () => {
      window.removeEventListener('deceit:account-restored', handleAccountRestored);
      window.removeEventListener('deceit:profile-change', handleProfileChange);
    };
  }, []);

  // Update profile
  const updateProfile = ({ name, color, shape }) => {
    setProfile((prev) => {
      const updated = {
        name: name !== undefined ? name.trim() : prev.name,
        color: color !== undefined ? color : prev.color,
        shape: shape !== undefined ? shape : prev.shape
      };
      return updated;
    });

    const updatedProfile = {
      name: name !== undefined ? name.trim() : profile.name,
      color: color !== undefined ? color : profile.color,
      shape: shape !== undefined ? shape : profile.shape
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      if (name !== undefined) {
        updateDisplayName(updatedProfile.name);
        window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: updatedProfile.name }));
      }
      window.dispatchEvent(new CustomEvent('deceit:profile-change', { detail: updatedProfile }));
    } catch (e) {
      console.warn('[Deceit:Profile] Failed to save profile to localStorage:', e);
    }
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
