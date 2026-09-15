import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { pool, getOrCreateKeys, getUserRelays, DEFAULT_RELAYS, publishEvent, hexToBytes } from '../services/nostr';
import { KINDS, createBeaconEvent } from '../services/nostrProtocol';

const NostrContext = createContext(null);

export const NostrProvider = ({ children }) => {
  const [displayName, setDisplayName] = useState(localStorage.getItem('deceit_name') || '');
  const [pubkey, setPubkey] = useState(null);
  const [privKeyHex, setPrivKeyHex] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [isExtension, setIsExtension] = useState(false);
  const [relays, setRelays] = useState(DEFAULT_RELAYS);
  const [publicRooms, setPublicRooms] = useState({});
  const [isRelayConnected, setIsRelayConnected] = useState(false);

  const subRef = useRef(null);

  // Initialize identity
  useEffect(() => {
    const initAuth = async () => {
      const storedExt = localStorage.getItem('deceit_nip07');
      if (storedExt && window.nostr) {
        try {
          const pk = await window.nostr.getPublicKey();
          setPubkey(pk);
          setIsExtension(true);
          const r = await getUserRelays();
          setRelays(r);
          setIsRelayConnected(true);
          console.log(`[Deceit:Auth] Logged in via NIP-07 extension: pubkey=${pk.slice(0, 8)}... name="${displayName}"`);
          return;
        } catch (e) {
          console.warn('[Deceit:Auth] Extension login failed, falling back to guest keys:', e);
        }
      }

      const { pk, privKeyHex: hex, sk } = getOrCreateKeys();
      setPubkey(pk);
      setPrivKeyHex(hex);
      setSecretKey(sk);
      setIsExtension(false);
      setRelays(DEFAULT_RELAYS);
      setIsRelayConnected(true);
      console.log(`[Deceit:Auth] Initialized guest keys: pubkey=${pk.slice(0, 8)}... name="${displayName}"`);
    };

    initAuth();
  }, []);

  // Sync state on account restoration
  useEffect(() => {
    const handleAccountRestored = (e) => {
      if (e.detail && e.detail.identity) {
        const { privKeyHex: hex, pubkey: pk } = e.detail.identity;
        try {
          const sk = hexToBytes(hex);
          setPrivKeyHex(hex);
          setSecretKey(sk);
          setPubkey(pk);
          setIsExtension(false);
          if (e.detail.profile?.name) {
            setDisplayName(e.detail.profile.name);
          }
          console.log(`[Deceit:Auth] Account restored in memory: pubkey=${pk.slice(0, 8)}... name="${e.detail.profile?.name}"`);
        } catch (err) {
          console.error('[Deceit:Auth] Failed to apply restored account keys in NostrContext:', err);
        }
      }
    };
    window.addEventListener('deceit:account-restored', handleAccountRestored);
    return () => window.removeEventListener('deceit:account-restored', handleAccountRestored);
  }, []);

  // Update display name
  const updateDisplayName = (name) => {
    const trimmed = (name || '').trim();
    setDisplayName(trimmed);
    localStorage.setItem('deceit_name', trimmed);
  };

  // Switch to extension login
  const loginWithExtension = async () => {
    if (!window.nostr) throw new Error('No Nostr extension found');
    const pk = await window.nostr.getPublicKey();
    localStorage.setItem('deceit_nip07', 'true');
    setPubkey(pk);
    setIsExtension(true);
    const r = await getUserRelays();
    setRelays(r);
    return pk;
  };

  // Switch to guest keys
  const loginAsGuest = () => {
    localStorage.removeItem('deceit_nip07');
    const { pk, privKeyHex: hex, sk } = getOrCreateKeys();
    setPubkey(pk);
    setPrivKeyHex(hex);
    setSecretKey(sk);
    setIsExtension(false);
    return pk;
  };

  // Subscribe to Hallway public rooms (kind 30311)
  useEffect(() => {
    if (!relays || relays.length === 0) return;

    try {
      if (subRef.current) {
        try { subRef.current.close(); } catch (e) {}
        subRef.current = null;
      }

      const requests = relays.map(url => ({
        url,
        filter: {
          kinds: [KINDS.BEACON],
          limit: 100
        }
      }));

      subRef.current = pool.subscribeMap(requests, {
        onevent(event) {
          try {
            const dTag = event.tags.find(t => t[0] === 'd')?.[1];
            if (!dTag || !dTag.startsWith('deceit-room-')) return;

            const roomCode = dTag.replace('deceit-room-', '').toUpperCase();
            let parsed = {};
            try {
              parsed = JSON.parse(event.content);
            } catch (e) {
              return;
            }

            const status = event.tags.find(t => t[0] === 'status')?.[1] || parsed.status || 'open';
            const now = Math.floor(Date.now() / 1000);

            // Filter out beacons older than 2 minutes unless it's a recently ended game
            if (now - event.created_at > 120) return;

            setPublicRooms(prev => {
              const existing = prev[roomCode];
              if (existing && existing.createdAt > event.created_at) return prev;

              return {
                ...prev,
                [roomCode]: {
                  roomCode,
                  hostPk: event.pubkey,
                  hostName: parsed.hostName || 'Anonymous',
                  playerCount: parsed.playerCount || 1,
                  maxPlayers: parsed.maxPlayers || 4,
                  status, // 'open' | 'playing' | 'closed'
                  soleSurvivor: parsed.soleSurvivor || null,
                  createdAt: event.created_at,
                  updatedAt: parsed.updatedAt || Date.now()
                }
              };
            });
          } catch (err) {
            console.warn('[Nostr] Error parsing beacon event:', err);
          }
        }
      });
    } catch (err) {
      console.error('[Nostr] Failed to subscribe to beacons:', err);
    }

    return () => {
      if (subRef.current) {
        try { subRef.current.close(); } catch (e) {}
      }
    };
  }, [relays]);

  // Publish / Update Room Beacon
  const broadcastRoomBeacon = useCallback(async ({ roomCode, hostName, playerCount, maxPlayers, status, soleSurvivor }) => {
    if (!pubkey) return;

    const eventTemplate = createBeaconEvent({
      roomCode,
      hostPk: pubkey,
      hostName: hostName || displayName || 'Host',
      playerCount,
      maxPlayers,
      status,
      soleSurvivor
    });

    const sk = isExtension ? 'extension' : (secretKey || privKeyHex);
    try {
      await publishEvent(eventTemplate, sk, relays);
      console.log(`[Nostr] Broadcasted room beacon for ${roomCode} with status: ${status}`);
    } catch (err) {
      console.error('[Nostr] Failed to broadcast beacon:', err);
    }
  }, [pubkey, displayName, isExtension, secretKey, privKeyHex, relays]);

  return (
    <NostrContext.Provider value={{
      displayName,
      updateDisplayName,
      pubkey,
      privKeyHex,
      secretKey,
      isExtension,
      relays,
      publicRooms,
      isRelayConnected,
      loginWithExtension,
      loginAsGuest,
      broadcastRoomBeacon
    }}>
      {children}
    </NostrContext.Provider>
  );
};

export const useNostr = () => useContext(NostrContext);
