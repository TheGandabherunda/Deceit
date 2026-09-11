import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNostr } from './NostrContext';
import { pool, DEFAULT_RELAYS, publishEvent } from '../services/nostr';
import { KINDS, createSignalEvent, createGameEvent } from '../services/nostrProtocol';
import { dealHands, isCardTruthful, rollTableTarget } from '../services/deck';
import { createCardCommitment, verifyCardCommitment, encryptHand, decryptHand, sha256 } from '../services/crypto';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { pubkey, privKeyHex, secretKey, isExtension, displayName, relays, broadcastRoomBeacon, publicRooms } = useNostr();

  // Matchmaking State
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingStatus, setMatchmakingStatus] = useState('');
  const [queueCount, setQueueCount] = useState(1);
  const [matchmakingSize, setMatchmakingSize] = useState(2);
  const [showSizeFallback, setShowSizeFallback] = useState(false);
  const matchmakingSubRef = useRef(null);
  const matchmakingIntervalRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);
  const hardTimeoutRef = useRef(null);
  const isMatchmakingRef = useRef(false);
  const matchmakingSizeRef = useRef(2);
  useEffect(() => { isMatchmakingRef.current = isMatchmaking; }, [isMatchmaking]);
  useEffect(() => { matchmakingSizeRef.current = matchmakingSize; }, [matchmakingSize]);

  // Room Info
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [gameState, setGameState] = useState('none'); // 'none' | 'lobby' | 'playing' | 'ended'
  const [players, setPlayers] = useState([]); // [{ pk, name, isAlive, cardCount, isHost }]

  // Turn & Table State
  const [roundNumber, setRoundNumber] = useState(1);
  const [tableTarget, setTableTarget] = useState('A'); // 'A' | 'K' | 'Q'
  const [chambersRemaining, setChambersRemaining] = useState(6);
  const [turnIndex, setTurnIndex] = useState(0);
  const [activePlayerPk, setActivePlayerPk] = useState(null);
  const [pileCount, setPileCount] = useState(0);
  const [lastPlay, setLastPlay] = useState(null); // { playerPk, claimedRank, cardCount, cardHashes, turnId }
  
  // Local Player Hand & Selection
  const [localHand, setLocalHand] = useState([]); // [{ id, rank, salt }]
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  // Reveal & Penalty Modals
  const [pendingReveal, setPendingReveal] = useState(null); // { accuserPk, accusedPk, cards, isTruth, designatedLoserPk }
  const [isRouletteActive, setIsRouletteActive] = useState(false);
  const [rouletteVictim, setRouletteVictim] = useState(null);
  const [rouletteResult, setRouletteResult] = useState(null); // { isDead, chambersBefore, chambersAfter }
  const [actionBanner, setActionBanner] = useState(null);
  const [soleSurvivor, setSoleSurvivor] = useState(null);
  const [isStartAudioPlaying, setIsStartAudioPlaying] = useState(false);
  const [disconnectedPeer, setDisconnectedPeer] = useState(null); // { pk, name, countdown }
  const [endGameReason, setEndGameReason] = useState(null); // { type: 'disconnect' | 'survival', ... }

  // Screen shake & flash
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Refs for asynchronous event handlers
  const roomCodeRef = useRef(null);
  const isHostRef = useRef(false);
  const playersRef = useRef([]);
  const localHandRef = useRef([]);
  const lastPlayRef = useRef(null);
  const turnIndexRef = useRef(0);
  const tableTargetRef = useRef('A');
  const chambersRef = useRef(6);
  const hostHandsStorageRef = useRef({}); // Host retains round hands for verification
  const subRef = useRef(null);
  const roundNumberRef = useRef(1);
  const joinIntervalRef = useRef(null);
  const rosterSyncIntervalRef = useRef(null);
  const eventHandlerRef = useRef(null);
  const localLastPlayedCardsRef = useRef(null);
  const localLastPlayTruthRef = useRef(null); // { turnId, isTruth, playerPk }
  const gameStateRef = useRef('none');
  const soleSurvivorRef = useRef(null);
  const isPublicRef = useRef(false);
  const activePlayerPkRef = useRef(null);
  const pileCountRef = useRef(0);
  const lastSeenMapRef = useRef({});
  const disconnectedPeerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const disconnectTimerRef = useRef(null);
  const gameStartTimeRef = useRef(Date.now());

  // Helper function refs to avoid stale closures / circular references
  const handleCallLiarRef = useRef(null);
  const handlePlayCardsRef = useRef(null);
  const startRevolverRouletteRef = useRef(null);
  const verifyRevealedCardsRef = useRef(null);
  const dealNewRoundRef = useRef(null);
  const publishRevealRef = useRef(null);
  const executeRouletteOutcomeRef = useRef(null);
  const handlePassEscapeRef = useRef(null);
  const checkAllPlayersReadyRef = useRef(null);
  const startGameRef = useRef(null);
  const readyCountdownRef = useRef(null);
  const adjustDominanceScoreRef = useRef(null);
  const resolveDisconnectionWinnerRef = useRef(null);
  const leaveRoomRef = useRef(null);
  const processedEventIdsRef = useRef(new Set());
  const processedActionsRef = useRef(new Set());
  const resolvedTurnIdsRef = useRef(new Set());
  const isResumeSessionRef = useRef(false);
  const resumeTimestampRef = useRef(0);
  const revealTimeoutRef = useRef(null);
  const rouletteNextRoundTimeoutRef = useRef(null);
  const rouletteGameOverTimeoutRef = useRef(null);

  useEffect(() => { roomCodeRef.current = roomCode; }, [roomCode]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { isPublicRef.current = isPublic; }, [isPublic]);
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { localHandRef.current = localHand; }, [localHand]);
  useEffect(() => { lastPlayRef.current = lastPlay; }, [lastPlay]);
  useEffect(() => { turnIndexRef.current = turnIndex; }, [turnIndex]);
  useEffect(() => { tableTargetRef.current = tableTarget; }, [tableTarget]);
  useEffect(() => { chambersRef.current = chambersRemaining; }, [chambersRemaining]);
  useEffect(() => { roundNumberRef.current = roundNumber; }, [roundNumber]);
  useEffect(() => { soleSurvivorRef.current = soleSurvivor; }, [soleSurvivor]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { activePlayerPkRef.current = activePlayerPk; }, [activePlayerPk]);
  useEffect(() => { pileCountRef.current = pileCount; }, [pileCount]);

  // Show action banner with auto-hide
  const triggerBanner = useCallback((text, duration = 3000) => {
    setActionBanner(text);
    setTimeout(() => {
      setActionBanner(prev => (prev === text ? null : prev));
    }, duration);
  }, []);

  // Publish Nostr Signed Event helper
  const publishSigned = useCallback(async (eventTemplate) => {
    return publishEvent(
      eventTemplate,
      isExtension ? 'extension' : secretKey || privKeyHex,
      relays
    );
  }, [isExtension, secretKey, privKeyHex, relays]);

  const publishSignal = useCallback(async (type, payload = {}, targetPk = null) => {
    if (!roomCodeRef.current || !pubkey) return;
    if (type !== 'HEARTBEAT' && type !== 'ROSTER_SYNC') {
      console.log(`[Deceit:Signal:Out] Publishing signal "${type}" in room ${roomCodeRef.current}:`, payload);
    }
    const template = createSignalEvent({
      roomCode: roomCodeRef.current,
      senderPk: pubkey,
      targetPk,
      type,
      payload
    });
    try {
      await publishSigned(template);
    } catch (e) {
      console.error('[Deceit:Signal:Out] Error publishing signal event:', e);
    }
  }, [pubkey, publishSigned]);

  const publishGameAction = useCallback(async (type, payload = {}, targetPk = null) => {
    if (!roomCodeRef.current || !pubkey) return;
    console.log(`[Deceit:Game:Out] Publishing game action "${type}" in room ${roomCodeRef.current}:`, payload);
    const template = createGameEvent({
      roomCode: roomCodeRef.current,
      senderPk: pubkey,
      targetPk,
      type,
      payload
    });
    try {
      const signedEvent = await publishSigned(template);
      if (signedEvent && signedEvent.id) {
        processedEventIdsRef.current.add(signedEvent.id);
      }
    } catch (e) {
      console.error('[Deceit:Game:Out] Error publishing game action event:', e);
    }
  }, [pubkey, publishSigned]);

  // Screen shake trigger on gunshot
  const triggerGunshotEffects = useCallback(() => {
    setIsFlashActive(true);
    setIsShaking(true);
    setTimeout(() => setIsFlashActive(false), 700);
    setTimeout(() => setIsShaking(false), 700);
  }, []);

  // Create a new room
  const createRoom = useCallback((code, isPub = false, isResume = false) => {
    const cleanCode = code.toUpperCase().trim();
    console.log(`[Deceit:Table] 🚪 Creating table ${cleanCode} as Host (isResume=${isResume}, name: "${displayName || 'Host'}", pubkey: ${pubkey?.slice(0, 8)}...). Entering table phase active.`);
    sound.stopWin();
    sound.stopFail();
    if (!isResume) {
      setIsStartAudioPlaying(true);
      sound.playStartAudio(() => {
        console.log('[Deceit:Table] 🚪 Table entrance audio completed! Revealing action buttons.');
        setIsStartAudioPlaying(false);
      });
    } else {
      setIsStartAudioPlaying(false);
    }
    setRoomCode(cleanCode);
    roomCodeRef.current = cleanCode;
    setIsHost(true);
    isHostRef.current = true;
    setIsPublic(isPub);
    isPublicRef.current = isPub;

    if (!isResume) {
      setGameState('lobby');
      gameStateRef.current = 'lobby';
      setChambersRemaining(6);
      setRoundNumber(1);
      setSoleSurvivor(null);
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      if (rouletteNextRoundTimeoutRef.current) {
        clearTimeout(rouletteNextRoundTimeoutRef.current);
        rouletteNextRoundTimeoutRef.current = null;
      }
      if (rouletteGameOverTimeoutRef.current) {
        clearTimeout(rouletteGameOverTimeoutRef.current);
        rouletteGameOverTimeoutRef.current = null;
      }
      processedEventIdsRef.current.clear();
      processedActionsRef.current.clear();
      resolvedTurnIdsRef.current.clear();

      try {
        localStorage.setItem('deceit_active_session', JSON.stringify({
          roomCode: cleanCode,
          isHost: true,
          isPublic: isPub,
          gameState: 'lobby',
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    if (!isResume || !playersRef.current || playersRef.current.length === 0) {
      const initialPlayers = [{
        pk: pubkey,
        name: displayName || 'Host',
        isAlive: true,
        cardCount: 0,
        isHost: true,
        chambersRemaining: 6,
        isReady: false,
        dominanceScore: 0
      }];
      setPlayers(initialPlayers);
      playersRef.current = initialPlayers;
      console.log(`[Deceit:Roster] Initial host roster:`, initialPlayers.map(p => p.name));
    }

    if (isPub) {
      broadcastRoomBeacon({
        roomCode: cleanCode,
        hostName: displayName || 'Host',
        playerCount: 1,
        maxPlayers: 4,
        status: 'open',
        soleSurvivor: null
      });
    }
  }, [pubkey, displayName, broadcastRoomBeacon]);

  // Join an existing room by code
  const joinRoom = useCallback((code, isPub = false, isResume = false) => {
    const cleanCode = code.toUpperCase().trim();
    console.log(`[Deceit:Table] 🚪 Joining table ${cleanCode} as Guest (isResume=${isResume}, name: "${displayName || 'Gambler'}", pubkey: ${pubkey?.slice(0, 8)}...). Entering table phase active.`);
    sound.stopWin();
    sound.stopFail();
    if (!isResume) {
      setIsStartAudioPlaying(true);
      sound.playStartAudio(() => {
        console.log('[Deceit:Table] 🚪 Table entrance audio completed! Revealing action buttons.');
        setIsStartAudioPlaying(false);
      });
    } else {
      setIsStartAudioPlaying(false);
    }
    setRoomCode(cleanCode);
    roomCodeRef.current = cleanCode;
    setIsHost(false);
    isHostRef.current = false;
    setIsPublic(isPub);
    isPublicRef.current = isPub;

    if (!isResume) {
      setGameState('lobby');
      gameStateRef.current = 'lobby';
      setChambersRemaining(6);
      setSoleSurvivor(null);
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      if (rouletteNextRoundTimeoutRef.current) {
        clearTimeout(rouletteNextRoundTimeoutRef.current);
        rouletteNextRoundTimeoutRef.current = null;
      }
      if (rouletteGameOverTimeoutRef.current) {
        clearTimeout(rouletteGameOverTimeoutRef.current);
        rouletteGameOverTimeoutRef.current = null;
      }
      processedEventIdsRef.current.clear();
      processedActionsRef.current.clear();
      resolvedTurnIdsRef.current.clear();

      try {
        localStorage.setItem('deceit_active_session', JSON.stringify({
          roomCode: cleanCode,
          isHost: false,
          isPublic: isPub,
          gameState: 'lobby',
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    if (!isResume || !playersRef.current || playersRef.current.length === 0) {
      // Initial local player representation
      const me = {
        pk: pubkey,
        name: displayName || 'Gambler',
        isAlive: true,
        cardCount: 0,
        isHost: false,
        chambersRemaining: 6,
        isReady: false,
        dominanceScore: 0
      };
      setPlayers([me]);
      playersRef.current = [me];
    }

    if (joinIntervalRef.current) {
      clearInterval(joinIntervalRef.current);
    }

    let attempts = 0;
    const sendJoin = async () => {
      attempts++;
      console.log(`[Deceit:Join] Sending JOIN_REQUEST for room ${cleanCode} (attempt #${attempts})`);
      await publishSignal('JOIN_REQUEST', {
        displayName: displayName || 'Gambler'
      });
    };

    // Initial join attempt after slight delay for subscription connection
    setTimeout(sendJoin, 300);

    // Retry every 1500ms until other players (host) are in the roster
    joinIntervalRef.current = setInterval(() => {
      if (roomCodeRef.current !== cleanCode) {
        clearInterval(joinIntervalRef.current);
        joinIntervalRef.current = null;
        return;
      }

      // Check if we have received a roster with other players
      const hasPeers = playersRef.current.some(p => p.pk !== pubkey);
      if (hasPeers) {
        console.log(`[Deceit:Join] Roster confirmed! Joined room ${cleanCode} with players:`, playersRef.current.map(p => p.name));
        clearInterval(joinIntervalRef.current);
        joinIntervalRef.current = null;
      } else if (attempts < 10) {
        sendJoin();
      } else {
        console.warn(`[Deceit:Join] Join timeout (15s) reached for room ${cleanCode}`);
        clearInterval(joinIntervalRef.current);
        joinIntervalRef.current = null;
        triggerBanner('Unable to reach table host (15s timeout). Returning to hallway.', 4000);
        if (leaveRoomRef.current) {
          leaveRoomRef.current();
        }
      }
    }, 1500);
  }, [displayName, pubkey, publishSignal, triggerBanner]);

  // Automated Public Matchmaking Queue
  const startMatchmaking = useCallback((targetSize = 2) => {
    if (!pubkey) return;
    if (isMatchmakingRef.current) return;

    sound.stopWin();
    sound.stopFail();
    setIsMatchmaking(true);
    isMatchmakingRef.current = true;
    setMatchmakingSize(targetSize);
    setShowSizeFallback(false);
    setQueueCount(1);
    setMatchmakingStatus(`Scanning for ${targetSize}-player public tables...`);

    // Clean up any lingering previous matchmaking subscriptions or intervals
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    if (matchmakingSubRef.current) {
      try { matchmakingSubRef.current.close(); } catch (e) {}
      matchmakingSubRef.current = null;
    }
    if (matchmakingIntervalRef.current) {
      clearInterval(matchmakingIntervalRef.current);
      matchmakingIntervalRef.current = null;
    }

    // Setup matchmaking fallback timeout: 5s for 3/4 players, 12s for 2 players
    const fallbackDelay = targetSize > 2 ? 5000 : 12000;
    console.log(`[Deceit:Matchmaking] ⏱️ Started ${fallbackDelay / 1000}s fallback timeout for targetSize ${targetSize}`);
    fallbackTimeoutRef.current = setTimeout(() => {
      if (isMatchmakingRef.current) {
        console.log(`[Deceit:Matchmaking] ⏰ ${fallbackDelay / 1000}s timeout reached: Displaying fallback dialog.`);
        setShowSizeFallback(true);
      }
    }, fallbackDelay);

    // Universal 30-second matchmaking timeout
    hardTimeoutRef.current = setTimeout(() => {
      if (isMatchmakingRef.current) {
        console.log(`[Deceit:Matchmaking] ⏰ 30s universal matchmaking timeout reached.`);
        setMatchmakingStatus('Search timed out (30s). No active players found.');
        setShowSizeFallback(true);
      }
    }, 30000);

    // 1. Check if an active open public room already exists (< targetSize players & fresh within 30s)
    const activeRooms = Object.values(publicRooms || {}).filter(r => 
      r.status === 'open' && 
      r.playerCount < targetSize && 
      (r.maxPlayers || 4) === targetSize &&
      (Math.floor(Date.now() / 1000) - (r.createdAt || 0)) < 30
    );

    if (activeRooms.length > 0) {
      activeRooms.sort((a, b) => b.playerCount - a.playerCount);
      const targetRoom = activeRooms[0];
      console.log(`[Deceit:Matchmaking] Found open public table ${targetRoom.roomCode} (${targetRoom.playerCount}/${targetSize} players). Auto-joining...`);
      setMatchmakingStatus(`Table found! Joining ${targetSize}-player match...`);
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
      setTimeout(() => {
        setIsMatchmaking(false);
        isMatchmakingRef.current = false;
        setShowSizeFallback(false);
        joinRoom(targetRoom.roomCode, true);
      }, 600);
      return;
    }

    // 2. No open table found yet -> enter Nostr matchmaking queue
    console.log(`[Deceit:Matchmaking] Entering Nostr matchmaking queue for ${targetSize} players...`);
    setMatchmakingStatus(`Waiting for ${targetSize} players (1/${targetSize} ready)...`);

    const waitingPeers = {
      [pubkey]: { name: displayName || 'Player', targetSize, lastSeen: Date.now() }
    };

    const cleanupMatchmaking = () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
      if (matchmakingSubRef.current) {
        try { matchmakingSubRef.current.close(); } catch (e) {}
        matchmakingSubRef.current = null;
      }
      if (matchmakingIntervalRef.current) {
        clearInterval(matchmakingIntervalRef.current);
        matchmakingIntervalRef.current = null;
      }
    };

    const sendQueuePing = async () => {
      if (!isMatchmakingRef.current) return;
      const pingEvent = {
        kind: KINDS.SIGNAL,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', 'deceit-matchmaking-queue'],
          ['h', 'MATCHMAKING']
        ],
        content: JSON.stringify({
          type: 'QUEUE_PING',
          senderPk: pubkey,
          name: displayName || 'Player',
          targetSize,
          timestamp: Date.now()
        })
      };
      try {
        await publishSigned(pingEvent);
      } catch (e) {}
    };

    let matchTriggered = false;

    // Subscribe to matchmaking queue signal with multi-tag filtering for 100% relay compatibility
    const requests = relays.flatMap(url => [
      {
        url,
        filter: {
          kinds: [KINDS.SIGNAL],
          '#d': ['deceit-matchmaking-queue'],
          since: Math.floor(Date.now() / 1000) - 20
        }
      },
      {
        url,
        filter: {
          kinds: [KINDS.SIGNAL],
          '#h': ['MATCHMAKING'],
          since: Math.floor(Date.now() / 1000) - 20
        }
      }
    ]);

    try {
      const sub = pool.subscribeMap(requests, {
        onevent(event) {
          if (!isMatchmakingRef.current || matchTriggered) return;
          try {
            const data = JSON.parse(event.content);
            const now = Date.now();

            if (data.type === 'QUEUE_PING' && data.senderPk) {
              waitingPeers[data.senderPk] = {
                name: data.name || 'Player',
                targetSize: data.targetSize || 2,
                lastSeen: now
              };

              // Purge stale peers (> 6s since last ping)
              Object.keys(waitingPeers).forEach(pk => {
                if (now - waitingPeers[pk].lastSeen > 6000) {
                  delete waitingPeers[pk];
                }
              });

              // Filter peers matching the current target table size
              const matchingPks = Object.keys(waitingPeers).filter(pk => 
                (waitingPeers[pk].targetSize || 2) === targetSize
              ).sort();

              setQueueCount(matchingPks.length);

              if (matchingPks.length < targetSize) {
                setMatchmakingStatus(`Waiting for ${targetSize} players (${matchingPks.length}/${targetSize} ready)...`);
              } else {
                setMatchmakingStatus(`All ${targetSize} players found! Organizing table...`);

                // Deterministic host: lowest pubkey in ASCII order among matching peers
                const hostPk = matchingPks[0];
                const matchedGroup = matchingPks.slice(0, targetSize);

                if (pubkey === hostPk) {
                  matchTriggered = true;
                  cleanupMatchmaking();
                  setIsMatchmaking(false);
                  isMatchmakingRef.current = false;
                  setShowSizeFallback(false);

                  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                  let newRoomCode = '';
                  for (let i = 0; i < 4; i++) {
                    newRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
                  }

                  console.log(`[Deceit:Matchmaking] Host ${pubkey.slice(0, 8)} creating ${targetSize}-player public table ${newRoomCode} for`, matchedGroup);

                  // Broadcast MATCH_FOUND so all peers join
                  publishSigned({
                    kind: KINDS.SIGNAL,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                      ['d', 'deceit-matchmaking-queue'],
                      ['h', 'MATCHMAKING']
                    ],
                    content: JSON.stringify({
                      type: 'MATCH_FOUND',
                      roomCode: newRoomCode,
                      hostPk,
                      targetSize,
                      matchedPlayers: matchedGroup
                    })
                  }).catch(() => {});

                  createRoom(newRoomCode, true);
                }
              }
            } else if (data.type === 'QUEUE_LEAVE' && data.senderPk) {
              delete waitingPeers[data.senderPk];
              const matchingPks = Object.keys(waitingPeers).filter(pk => 
                (waitingPeers[pk].targetSize || 2) === targetSize
              );
              setQueueCount(matchingPks.length);
              if (matchingPks.length < targetSize) {
                setMatchmakingStatus(`Waiting for ${targetSize} players (${matchingPks.length}/${targetSize} ready)...`);
              }
            } else if (data.type === 'MATCH_FOUND' && data.roomCode) {
              if ((!data.matchedPlayers || data.matchedPlayers.includes(pubkey)) && pubkey !== data.hostPk) {
                matchTriggered = true;
                cleanupMatchmaking();
                setIsMatchmaking(false);
                isMatchmakingRef.current = false;
                setShowSizeFallback(false);
                console.log(`[Deceit:Matchmaking] Peer joined matched ${data.targetSize || targetSize}-player table ${data.roomCode}`);
                setMatchmakingStatus('Entering table...');
                joinRoom(data.roomCode, true);
              }
            }
          } catch (e) {}
        }
      });
      matchmakingSubRef.current = sub;
    } catch (err) {
      console.warn('[Deceit:Matchmaking] Failed to subscribe to queue:', err);
    }

    sendQueuePing();
    matchmakingIntervalRef.current = setInterval(sendQueuePing, 2000);
  }, [pubkey, displayName, relays, publicRooms, createRoom, joinRoom, publishSigned]);

  // Cancel Matchmaking
  const cancelMatchmaking = useCallback(() => {
    console.log('[Deceit:Matchmaking] Cancelling matchmaking search...');
    setIsMatchmaking(false);
    isMatchmakingRef.current = false;
    setMatchmakingStatus('');
    setQueueCount(1);
    setShowSizeFallback(false);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    if (matchmakingSubRef.current) {
      try { matchmakingSubRef.current.close(); } catch (e) {}
      matchmakingSubRef.current = null;
    }
    if (matchmakingIntervalRef.current) {
      clearInterval(matchmakingIntervalRef.current);
      matchmakingIntervalRef.current = null;
    }
    if (pubkey) {
      publishSigned({
        kind: KINDS.SIGNAL,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', 'deceit-matchmaking-queue'],
          ['h', 'MATCHMAKING']
        ],
        content: JSON.stringify({
          type: 'QUEUE_LEAVE',
          senderPk: pubkey
        })
      }).catch(() => {});
    }
  }, [pubkey, publishSigned]);

  // Switch from 3/4 player search to 2-player match
  const switchTo2PlayerMatch = useCallback(() => {
    console.log('[Deceit:Matchmaking] User accepted switch to 2-player match.');
    setShowSizeFallback(false);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    cancelMatchmaking();
    setTimeout(() => {
      startMatchmaking(2);
    }, 200);
  }, [cancelMatchmaking, startMatchmaking]);

  // Session Persistence: Auto-rejoin on page refresh if session still active (< 45s)
  const sessionRestoredRef = useRef(false);
  useEffect(() => {
    if (!pubkey || sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;

    try {
      const saved = localStorage.getItem('deceit_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const ageSec = (Date.now() - (parsed.timestamp || 0)) / 1000;
        if (parsed && parsed.roomCode && parsed.gameState !== 'ended' && ageSec < 45) {
          isResumeSessionRef.current = true;
          resumeTimestampRef.current = parsed.timestamp || Date.now();
          console.log(`[Deceit:Session] 🔄 Resuming active table ${parsed.roomCode} (isHost=${parsed.isHost}, isPublic=${parsed.isPublic}, gameState=${parsed.gameState}, age=${Math.round(ageSec)}s)`);

          // Restore deduplication sets so past round events are never replayed
          if (Array.isArray(parsed.processedActionKeys)) {
            parsed.processedActionKeys.forEach(k => processedActionsRef.current.add(k));
          }
          if (Array.isArray(parsed.processedEventIds)) {
            parsed.processedEventIds.forEach(id => processedEventIdsRef.current.add(id));
          }
          if (Array.isArray(parsed.resolvedTurnIds)) {
            parsed.resolvedTurnIds.forEach(t => resolvedTurnIdsRef.current.add(t));
          }

          if (parsed.gameState === 'playing') {
            setGameState('playing');
            gameStateRef.current = 'playing';
            if (Array.isArray(parsed.localHand)) {
              setLocalHand(parsed.localHand);
              localHandRef.current = parsed.localHand;
            }
            if (parsed.roundNumber) {
              setRoundNumber(parsed.roundNumber);
              roundNumberRef.current = parsed.roundNumber;
            }
            if (parsed.tableTarget) {
              setTableTarget(parsed.tableTarget);
              tableTargetRef.current = parsed.tableTarget;
            }
            if (parsed.chambersRemaining !== undefined) {
              setChambersRemaining(parsed.chambersRemaining);
              chambersRef.current = parsed.chambersRemaining;
            }
            if (Array.isArray(parsed.players) && parsed.players.length > 0) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }
            if (parsed.lastPlay) {
              setLastPlay(parsed.lastPlay);
              lastPlayRef.current = parsed.lastPlay;
            }
            if (parsed.activePlayerPk) {
              setActivePlayerPk(parsed.activePlayerPk);
              activePlayerPkRef.current = parsed.activePlayerPk;
            }
            if (parsed.pileCount !== undefined) {
              setPileCount(parsed.pileCount);
              pileCountRef.current = parsed.pileCount;
            }
            if (parsed.localLastPlayedCards) {
              localLastPlayedCardsRef.current = parsed.localLastPlayedCards;
            }
          }
          if (parsed.isHost) {
            createRoom(parsed.roomCode, parsed.isPublic, true);
          } else {
            joinRoom(parsed.roomCode, parsed.isPublic, true);
          }
        } else {
          localStorage.removeItem('deceit_active_session');
        }
      }
    } catch (e) {
      console.warn('[Deceit:Session] Error restoring session:', e);
    }
  }, [pubkey, createRoom, joinRoom]);

  // Continuously persist active session updates to localStorage
  useEffect(() => {
    if (!roomCode || gameState === 'ended' || gameState === 'none') {
      if (gameState === 'ended') {
        try { localStorage.removeItem('deceit_active_session'); } catch (e) {}
      }
      return;
    }
    try {
      localStorage.setItem('deceit_active_session', JSON.stringify({
        roomCode,
        isHost,
        isPublic,
        gameState,
        roundNumber,
        tableTarget,
        chambersRemaining,
        localHand,
        players,
        lastPlay,
        activePlayerPk,
        pileCount,
        localLastPlayedCards: localLastPlayedCardsRef.current,
        processedActionKeys: Array.from(processedActionsRef.current).slice(-150),
        processedEventIds: Array.from(processedEventIdsRef.current).slice(-150),
        resolvedTurnIds: Array.from(resolvedTurnIdsRef.current).slice(-50),
        timestamp: Date.now()
      }));
    } catch (e) {}
  }, [roomCode, isHost, isPublic, gameState, roundNumber, tableTarget, chambersRemaining, localHand, players, lastPlay, activePlayerPk, pileCount]);

  // Toggle Public / Private room
  const togglePublic = useCallback(() => {
    if (!isHostRef.current || !roomCodeRef.current) return;
    const nextPublic = !isPublic;
    setIsPublic(nextPublic);

    broadcastRoomBeacon({
      roomCode: roomCodeRef.current,
      hostName: displayName || 'Host',
      playerCount: playersRef.current.length,
      maxPlayers: 4,
      status: nextPublic ? (gameState === 'playing' ? 'playing' : 'open') : 'closed',
      soleSurvivor: null
    });
  }, [isPublic, displayName, gameState, broadcastRoomBeacon]);

  // Lobby Heartbeat & Inactivity Watchdog (30s max wait in lobby)
  useEffect(() => {
    if (gameState !== 'lobby' || !roomCode) {
      if (rosterSyncIntervalRef.current) {
        clearInterval(rosterSyncIntervalRef.current);
        rosterSyncIntervalRef.current = null;
      }
      return;
    }

    // 1. Lobby heartbeat & host roster broadcast every 2.5s
    rosterSyncIntervalRef.current = setInterval(() => {
      if (gameStateRef.current === 'lobby' && roomCodeRef.current) {
        publishSignal('HEARTBEAT', { timestamp: Date.now() }).catch(() => {});
        if (isHostRef.current && playersRef.current.length > 0) {
          publishSignal('ROSTER_SYNC', { players: playersRef.current }).catch(() => {});
        }
      }
    }, 2500);

    // 2. Watchdog: check for inactive peers in lobby every 2s (30s limit)
    const lobbyWatchdog = setInterval(() => {
      if (gameStateRef.current !== 'lobby' || !roomCodeRef.current) return;
      const now = Date.now();

      if (isHostRef.current) {
        // Host checks guests: if any guest is silent for > 30s, drop them from table
        const inactiveGuests = playersRef.current.filter(p => !p.isHost && (now - (lastSeenMapRef.current[p.pk] || now)) > 30000);
        if (inactiveGuests.length > 0) {
          inactiveGuests.forEach(g => {
            console.log(`[Deceit:Lobby] Guest ${g.name} silent for > 30s. Removing from table.`);
            triggerBanner(`${g.name} timed out (30s) and was removed from table.`, 3000);
          });
          const updated = playersRef.current.filter(p => !inactiveGuests.some(g => g.pk === p.pk));
          playersRef.current = updated;
          setPlayers(updated);
          publishSignal('ROSTER_SYNC', { players: updated }).catch(() => {});
        }
      } else {
        // Guest checks host: if host is silent for > 30s, notify and exit lobby
        const hostPlayer = playersRef.current.find(p => p.isHost);
        if (hostPlayer && (now - (lastSeenMapRef.current[hostPlayer.pk] || now)) > 30000) {
          console.warn(`[Deceit:Lobby] Host ${hostPlayer.name} silent for > 30s in lobby. Exiting room.`);
          triggerBanner('Table host disconnected (30s timeout). Returning to hallway.', 4000);
          if (leaveRoomRef.current) {
            leaveRoomRef.current();
          }
        }
      }
    }, 2000);

    return () => {
      if (rosterSyncIntervalRef.current) {
        clearInterval(rosterSyncIntervalRef.current);
        rosterSyncIntervalRef.current = null;
      }
      clearInterval(lobbyWatchdog);
    };
  }, [isHost, gameState, roomCode, publishSignal, triggerBanner]);

  // Deal a new round (Host action)
  const dealNewRound = useCallback((roundNum, currentPlayers) => {
    sound.stopChallengeTimer();
    sound.stopStartAudio();
    setIsStartAudioPlaying(false);
    if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
      console.log(`[Deceit:Round:Deal] Game has ended or sole survivor declared. Suppressing round deal.`);
      return;
    }
    const living = currentPlayers.filter(p => p.isAlive);
    console.log(`[Deceit:Round:Deal] Host dealing round ${roundNum}. Living players: ${living.length}`);
    if (living.length <= 1) return;

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (rouletteNextRoundTimeoutRef.current) {
      clearTimeout(rouletteNextRoundTimeoutRef.current);
      rouletteNextRoundTimeoutRef.current = null;
    }
    processedActionsRef.current.add(`deal_round_${roundNum}`);

    const livingPks = living.map(p => p.pk);
    const { target, hands, commitments } = dealHands(livingPks);

    hostHandsStorageRef.current = hands;
    localLastPlayedCardsRef.current = null;
    setTableTarget(target);
    tableTargetRef.current = target;
    setPileCount(0);
    setLastPlay(null);
    lastPlayRef.current = null;
    setSelectedCardIds([]);
    setPendingReveal(null);
    setIsRouletteActive(false);
    setRoundNumber(roundNum);
    roundNumberRef.current = roundNum;

    // Host local hand assignment (guaranteed match)
    const hostPk = livingPks.find(pk => pk === pubkey || isHostRef.current);
    const hostHand = hands[pubkey] || (hostPk ? hands[hostPk] : null);
    if (hostHand) {
      console.log(`[Deceit:Hand] Host assigned local hand (${hostHand.length} cards):`, hostHand.map(c => c.rank));
      setLocalHand(hostHand);
      localHandRef.current = hostHand;
    } else {
      console.error('[Deceit:Hand] Could not find host hand in dealt hands!', { pubkey, livingPks, handKeys: Object.keys(hands) });
    }

    // Encrypt hands for peers
    const encryptedHands = {};
    const hostSecret = sha256(`${roomCodeRef.current}:${roundNum}`);
    livingPks.forEach(pk => {
      encryptedHands[pk] = encryptHand(hands[pk], pk, hostSecret);
    });

    const initialTurnPk = living[0].pk;
    setActivePlayerPk(initialTurnPk);
    setTurnIndex(0);

    // Reset card counts while preserving each player's individual chambersRemaining and dominanceScore!
    const updatedPlayers = currentPlayers.map(p => ({
      ...p,
      cardCount: p.isAlive ? 5 : 0,
      chambersRemaining: p.chambersRemaining !== undefined ? p.chambersRemaining : 6,
      isReady: false,
      dominanceScore: p.dominanceScore !== undefined ? p.dominanceScore : 0
    }));
    setPlayers(updatedPlayers);
    playersRef.current = updatedPlayers;

    console.log(`[Deceit:Gameplay] 🎴 Host dealing round ${roundNum}. Playing card shuffle sound (cards-shuffle.mp3) and displaying respective cards.`);
    sound.playCardShuffle();
    triggerBanner(`Round ${roundNum}: Target is ${target === 'A' ? 'Aces' : target === 'K' ? 'Kings' : 'Queens'}!`);

    publishGameAction('DEAL_ROUND', {
      roundNumber: roundNum,
      tableTarget: target,
      commitments,
      encryptedHands,
      activeTurnPk: initialTurnPk,
      players: updatedPlayers
    });
  }, [pubkey, publishGameAction, triggerBanner]);

  // Starts the game once all players are ready
  const startGame = useCallback(() => {
    if (playersRef.current.length < 2) return;
    sound.stopStartAudio();
    sound.stopWin();
    sound.stopFail();
    setIsStartAudioPlaying(false);
    setGameState('playing');
    gameStateRef.current = 'playing';
    setChambersRemaining(6);
    setRoundNumber(1);
    setPileCount(0);
    setLastPlay(null);
    setPendingReveal(null);
    setIsRouletteActive(false);

    if (isPublicRef.current && roomCodeRef.current) {
      broadcastRoomBeacon({
        roomCode: roomCodeRef.current,
        hostName: displayName || 'Host',
        playerCount: playersRef.current.length,
        maxPlayers: 4,
        status: 'playing'
      });
    }

    dealNewRound(1, playersRef.current, 6);
  }, [displayName, broadcastRoomBeacon, dealNewRound]);

  useEffect(() => { startGameRef.current = startGame; }, [startGame]);
  useEffect(() => { dealNewRoundRef.current = dealNewRound; }, [dealNewRound]);

  // Check if all seated players are ready
  const checkAllPlayersReady = useCallback((currentRoster) => {
    if (gameStateRef.current !== 'lobby') return;
    const living = currentRoster.filter(p => p.isAlive);
    const allReady = living.length >= 2 && living.every(p => p.isReady);

    if (allReady) {
      console.log(`[Deceit:Ready] All ${living.length} players are READY! Starting game in 1 second...`);
      triggerBanner('All players ready! Starting game...', 2500);

      // Deterministic dealer: Host or lowest pubkey
      const leaderPk = living.find(p => p.isHost)?.pk || living.map(p => p.pk).sort()[0];
      if (pubkey === leaderPk) {
        if (readyCountdownRef.current) clearTimeout(readyCountdownRef.current);
        readyCountdownRef.current = setTimeout(() => {
          if (gameStateRef.current === 'lobby') {
            console.log('[Deceit:Ready] Dealer launching game!');
            if (startGameRef.current) {
              startGameRef.current();
            }
          }
        }, 1000);
      }
    } else {
      if (readyCountdownRef.current) {
        clearTimeout(readyCountdownRef.current);
        readyCountdownRef.current = null;
      }
    }
  }, [pubkey, triggerBanner]);

  useEffect(() => { checkAllPlayersReadyRef.current = checkAllPlayersReady; }, [checkAllPlayersReady]);

  // Universal Player Ready Toggle (Every seated player can toggle ready)
  const togglePlayerReady = useCallback(() => {
    if (!pubkey || gameStateRef.current !== 'lobby') return;
    const me = playersRef.current.find(p => p.pk === pubkey);
    const nextReady = me ? !me.isReady : true;
    console.log(`[Deceit:Ready] Local player toggled isReady to: ${nextReady}`);

    const updated = playersRef.current.map(p => 
      p.pk === pubkey ? { ...p, isReady: nextReady } : p
    );
    playersRef.current = updated;
    setPlayers(updated);

    publishSignal('PLAYER_READY', { playerPk: pubkey, isReady: nextReady });
    checkAllPlayersReady(updated);
  }, [pubkey, publishSignal, checkAllPlayersReady]);

  // Dominance Score Adjustment
  const adjustDominanceScore = useCallback((targetPk, delta, reason) => {
    if (!targetPk) return;
    console.log(`[Deceit:Dominance] Adjusting score for ${targetPk.slice(0, 8)}: ${delta > 0 ? '+' : ''}${delta} pts (${reason})`);

    let nextScore = 0;
    const updated = playersRef.current.map(p => {
      if (p.pk === targetPk) {
        const s = (p.dominanceScore || 0) + delta;
        nextScore = s;
        return { ...p, dominanceScore: s };
      }
      return p;
    });

    playersRef.current = updated;
    setPlayers(updated);

    const targetName = updated.find(p => p.pk === targetPk)?.name || 'Player';
    const sign = delta > 0 ? '+' : '';
    triggerBanner(`${sign}${delta} pts to ${targetName}: ${reason}`, 3500);

    publishSignal('SCORE_UPDATE', {
      playerPk: targetPk,
      delta,
      reason,
      newScore: nextScore
    });
  }, [publishSignal, triggerBanner]);

  useEffect(() => { adjustDominanceScoreRef.current = adjustDominanceScore; }, [adjustDominanceScore]);

  // Resolve Winner when Opponent Disconnects & Timeout Expires (Strict 30s)
  const resolveDisconnectionWinner = useCallback((disconnectedPk) => {
    sound.stopChallengeTimer();
    sound.stopRouletteSequence();
    sound.stopStartAudio();

    const all = playersRef.current;
    const disconnectedPlayer = all.find(p => p.pk === disconnectedPk);
    const localPlayer = all.find(p => p.pk === pubkey);

    const livingRemaining = all.filter(p => p.isAlive && p.pk !== disconnectedPk);
    if (livingRemaining.length > 1) {
      // 3 or 4 player match where 2+ players remain active
      console.log(`[Deceit:Disconnect] Player ${disconnectedPlayer?.name} timed out (30s). Eliminating player and continuing match for ${livingRemaining.length} remaining players.`);
      const updated = all.map(p => p.pk === disconnectedPk ? { ...p, isAlive: false } : p);
      playersRef.current = updated;
      setPlayers(updated);
      triggerBanner(`⚠️ ${disconnectedPlayer?.name || 'Player'} timed out (30s) and was eliminated!`, 4000);
      if (isHostRef.current) {
        publishSignal('ROSTER_SYNC', { players: updated }).catch(() => {});
      }
      return;
    }

    const discScore = disconnectedPlayer?.dominanceScore || 0;
    const localScore = localPlayer?.dominanceScore || 0;

    // Rule: whoever has more points will win; if tied, connected player wins
    let winner = localPlayer;
    if (disconnectedPlayer && discScore > localScore) {
      winner = disconnectedPlayer;
    }

    console.log(`[Deceit:Disconnect] Dominance Winner declared: ${winner?.name} (${winner?.dominanceScore || 0} pts)`);
    soleSurvivorRef.current = winner;
    gameStateRef.current = 'ended';

    setSoleSurvivor(winner);
    setGameState('ended');
    setEndGameReason({
      type: 'disconnect',
      disconnectedName: disconnectedPlayer?.name || 'Opponent',
      winnerName: winner?.name,
      winnerScore: winner?.dominanceScore || 0,
      discScore,
      localScore
    });

    try {
      localStorage.removeItem('deceit_active_session');
    } catch (e) {}

    if (winner?.pk === pubkey) {
      sound.playWin();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    } else {
      sound.playFail();
    }

    triggerBanner(`Game Over: ${winner?.name} won by Dominance Score! (${winner?.dominanceScore || 0} pts)`, 6000);
  }, [pubkey, triggerBanner, publishSignal]);

  useEffect(() => { resolveDisconnectionWinnerRef.current = resolveDisconnectionWinner; }, [resolveDisconnectionWinner]);

  // Reset table to lobby for rematch without forcing players to leave
  const resetToLobby = useCallback(() => {
    sound.stopWin();
    sound.stopFail();
    sound.stopStartAudio();
    sound.stopChallengeTimer();
    sound.stopRouletteSequence();

    setGameState('lobby');
    gameStateRef.current = 'lobby';
    setSoleSurvivor(null);
    soleSurvivorRef.current = null;
    setEndGameReason(null);
    setPendingReveal(null);
    setIsRouletteActive(false);
    setRouletteResult(null);
    setChambersRemaining(6);
    setRoundNumber(1);
    setLocalHand([]);
    setSelectedCardIds([]);
    setLastPlay(null);
    setPileCount(0);

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (rouletteNextRoundTimeoutRef.current) {
      clearTimeout(rouletteNextRoundTimeoutRef.current);
      rouletteNextRoundTimeoutRef.current = null;
    }
    if (rouletteGameOverTimeoutRef.current) {
      clearTimeout(rouletteGameOverTimeoutRef.current);
      rouletteGameOverTimeoutRef.current = null;
    }
    processedEventIdsRef.current.clear();
    processedActionsRef.current.clear();

    const resetPlayers = playersRef.current.map(p => ({
      ...p,
      isAlive: true,
      cardCount: 0,
      chambersRemaining: 6,
      isReady: false
    }));
    setPlayers(resetPlayers);
    playersRef.current = resetPlayers;

    publishSignal('RESET_TO_LOBBY', { players: resetPlayers });
  }, [publishSignal]);

  // Play Cards Action (Local player or Peer)
  const handlePlayCards = useCallback((playerPk, claimedRank, cardCount, cardHashes, playedCards = null) => {
    sound.playCardTake();

    // Check if the previous player had emptied their hand and was not challenged!
    const previousPlay = lastPlayRef.current;
    if (previousPlay && previousPlay.playerPk !== playerPk) {
      const prevPlayer = playersRef.current.find(p => p.pk === previousPlay.playerPk);
      if (prevPlayer && prevPlayer.cardCount === 0) {
        console.log(`[Deceit:Game:EmptyHand] ${prevPlayer.name} already emptied hand! Player ${playerPk.slice(0, 8)} passed without challenging!`);
        if (handlePassEscapeRef.current) {
          handlePassEscapeRef.current(playerPk, prevPlayer.pk);
        }
        return;
      }
    }

    // Check if the local player's previous play went uncalled!
    if (playerPk !== pubkey && localLastPlayTruthRef.current) {
      if (localLastPlayTruthRef.current.isTruth === false) {
        console.log('[Deceit:Dominance] Peer played cards! Local bluff uncalled: +20 pts (Getting away with a lie)');
        if (adjustDominanceScoreRef.current) {
          adjustDominanceScoreRef.current(pubkey, 20, 'Getting away with a lie');
        }
      } else {
        console.log('[Deceit:Dominance] Peer played cards! Local truth play safe: +10 pts (Safely playing the truth)');
        if (adjustDominanceScoreRef.current) {
          adjustDominanceScoreRef.current(pubkey, 10, 'Safely playing the truth');
        }
      }
      localLastPlayTruthRef.current = null;
    }

    // Remove played cards from local hand if it's local player
    if (playerPk === pubkey) {
      setLocalHand(prev => prev.filter(c => !selectedCardIds.includes(c.id)));
      setSelectedCardIds([]);
    }

    const turnId = `turn_${Date.now()}`;
    processedActionsRef.current.add(`play_${turnId}`);
    const newPlay = {
      playerPk,
      claimedRank,
      cardCount,
      cardHashes,
      turnId,
      playedCards: playedCards || null
    };

    if (playerPk === pubkey && playedCards) {
      localLastPlayedCardsRef.current = { turnId, cards: playedCards };
      const isTruth = playedCards.every(c => isCardTruthful(c, tableTargetRef.current));
      localLastPlayTruthRef.current = { turnId, isTruth, playerPk: pubkey };
      console.log(`[Deceit:Dominance] Recorded local play truthfulness: isTruth=${isTruth} for turnId ${turnId}`);
    }

    console.log(`[Deceit:Game:Play] Player ${playerPk.slice(0, 8)} played ${cardCount} cards (claimed: ${claimedRank}) for turnId: ${turnId}`, {
      hasPlayedCards: !!playedCards,
      cardHashes
    });

    setLastPlay(newPlay);
    lastPlayRef.current = newPlay;
    setPileCount(prev => prev + cardCount);

    // Update player card count
    let updatedPlayers = playersRef.current.map(p => {
      if (p.pk === playerPk) {
        return { ...p, cardCount: Math.max(0, p.cardCount - cardCount) };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    playersRef.current = updatedPlayers;

    const playerName = playersRef.current.find(p => p.pk === playerPk)?.name || 'Player';
    triggerBanner(`${playerName} played ${cardCount} card${cardCount > 1 ? 's' : ''}`);

    // Determine next living player clockwise
    const living = updatedPlayers.filter(p => p.isAlive);
    const currentIndex = living.findIndex(p => p.pk === playerPk);
    const nextIndex = (currentIndex + 1) % living.length;
    const nextPlayer = living[nextIndex];

    console.log(`[Deceit:Game:Play] Turn moves to ${nextPlayer?.name} (${nextPlayer?.pk?.slice(0, 8)})`);
    setActivePlayerPk(nextPlayer.pk);
    setTurnIndex(nextIndex);

    publishGameAction('PLAY_CARDS', {
      playerPk,
      claimedRank,
      cardCount,
      cardHashes,
      turnId,
      nextTurnPk: nextPlayer.pk,
      players: updatedPlayers
    });

    const thisPlayer = updatedPlayers.find(p => p.pk === playerPk);
    const hasEmptiedHand = thisPlayer && thisPlayer.cardCount === 0;

    if (hasEmptiedHand && playerPk === pubkey) {
      // Local player emptied hand against opponent, play 12s challenge timer audio
      sound.playChallengeTimer();
    }
  }, [pubkey, selectedCardIds, triggerBanner, publishGameAction]);

  // Local Player Clicks "Play Selected Cards"
  const playSelectedCards = useCallback(() => {
    if (activePlayerPk !== pubkey) return;
    if (selectedCardIds.length === 0 || selectedCardIds.length > 3) return;

    const cardsToPlay = localHand.filter(c => selectedCardIds.includes(c.id));
    const cardHashes = cardsToPlay.map(c => createCardCommitment(c));

    console.log(`[Deceit:Game:Play] Local player confirmed play of ${cardsToPlay.length} cards:`, cardsToPlay.map(c => `${c.rank}${c.suit || ''}`), cardHashes);
    handlePlayCards(pubkey, tableTarget, cardsToPlay.length, cardHashes, cardsToPlay);
  }, [activePlayerPk, pubkey, selectedCardIds, localHand, tableTarget, handlePlayCards]);

  // Execute Roulette Outcome
  const executeRouletteOutcome = useCallback((victimPk, isDead, chambersBefore, chambersAfter) => {
    if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
      console.log(`[Deceit:Roulette:Outcome] Suppressed because game has ended or sole survivor declared.`);
      return;
    }

    console.log(`[Deceit:Roulette:Outcome] Executing outcome for victim ${victimPk?.slice(0, 8)}: isDead=${isDead}, personal gun: ${chambersBefore} -> ${chambersAfter}, isHost=${isHostRef.current}`);
    
    // Cancel any pending reveal transition timeout since gun pull result is executing now
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setPendingReveal(null);

    // 1. Host ALWAYS broadcasts GUN_PULL_RESULT immediately to all peers first!
    if (isHostRef.current) {
      console.log(`[Deceit:Roulette:Out] Host broadcasting GUN_PULL_RESULT:`, {
        victimPk,
        isDead,
        chambersBefore,
        chambersAfter
      });
      publishGameAction('GUN_PULL_RESULT', {
        victimPk,
        isDead,
        chambersBefore,
        chambersAfter
      });
    }

    // Keep spinning until sequence triggers the pull
    setIsRouletteActive(true);
    setRouletteVictim(victimPk);
    setRouletteResult(null);

    const victimName = playersRef.current.find(p => p.pk === victimPk)?.name || 'Player';

    // Orchestrate the requested audio & visual sequence:
    // spin.mp3 -> immediately clock.mp3 -> after few milliseconds -> shot.mp3 (+ shell.mp3) or empty.mp3
    let sequenceHandled = false;
    sound.playRouletteSequence({
      isDead,
      onClockStart: () => {
        triggerBanner(`${victimName} holds their breath... hammer pulled back!`, 1800);
      },
      onSuspenseStart: () => {
        triggerBanner(`Suspense building... ${victimName} faces the personal revolver!`, 4600);
      },
      onTriggerPull: () => {
        setRouletteResult({ isDead, chambersBefore, chambersAfter });

        if (isDead) {
          triggerGunshotEffects();

          // Eliminate victim and set their chambers to 0
          const updated = playersRef.current.map(p => {
            if (p.pk === victimPk) return { ...p, isAlive: false, cardCount: 0, chambersRemaining: 0 };
            return p;
          });
          setPlayers(updated);
          playersRef.current = updated;

          triggerBanner(`BANG! ${victimName} was eliminated!`, 4000);
        } else {
          // Update ONLY the victim's personal revolver chambers
          const updated = playersRef.current.map(p => {
            if (p.pk === victimPk) return { ...p, chambersRemaining: chambersAfter };
            return p;
          });
          setPlayers(updated);
          playersRef.current = updated;

          triggerBanner(`*CLICK* Chamber empty! ${victimName} survived! (${chambersAfter}/6 left in their gun)`, 4000);
        }
      },
      onShellEject: () => {
        // Spent casing hits the floor
      },
      onSequenceEnd: () => {
        if (sequenceHandled) return;
        sequenceHandled = true;

        const updated = playersRef.current;
        const living = updated.filter(p => p.isAlive);

        if (living.length <= 1) {
          // Sole Survivor!
          let winner = null;
          if (living.length === 1) {
            winner = living[0];
          } else {
            // If all local players marked dead or 1-player corrupted roster.
            // The dead victim can NEVER be the sole survivor!
            winner = updated.find(p => p.pk !== victimPk) 
              || playersRef.current.find(p => p.pk !== victimPk)
              || (lastPlayRef.current?.playerPk !== victimPk ? playersRef.current.find(p => p.pk === lastPlayRef.current?.playerPk) : null);
          }

          if (!winner || (isDead && winner.pk === victimPk)) {
            const alternate = updated.find(p => p.pk !== victimPk) || playersRef.current.find(p => p.pk !== victimPk);
            winner = alternate || { name: 'Opponent', pk: 'opponent' };
          }

          console.log(`[Deceit:Game:End] SOLE SURVIVOR: ${winner.name} (${winner.pk.slice(0, 8)})`);
          soleSurvivorRef.current = winner;
          gameStateRef.current = 'ended';

          // Immediately stop any lingering timers/audio sequences
          sound.stopChallengeTimer();
          sound.stopRouletteSequence();

          if (rouletteGameOverTimeoutRef.current) {
            clearTimeout(rouletteGameOverTimeoutRef.current);
            rouletteGameOverTimeoutRef.current = null;
          }
          rouletteGameOverTimeoutRef.current = setTimeout(() => {
            rouletteGameOverTimeoutRef.current = null;
            setIsRouletteActive(false);
            setSoleSurvivor(winner);
            setGameState('ended');

            if (winner.pk === pubkey) {
              sound.playWin();
              confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            } else {
              sound.playFail();
            }
          }, 1000);

          if (isHostRef.current && isPublic && roomCodeRef.current) {
            broadcastRoomBeacon({
              roomCode: roomCodeRef.current,
              hostName: displayName || 'Host',
              playerCount: updated.length,
              maxPlayers: 4,
              status: 'closed',
              soleSurvivor: winner.name
            });
          }
        } else {
          // Next round with living players (> 1 left)
          if (gameStateRef.current !== 'playing' || soleSurvivorRef.current) {
            console.log('[Deceit:Roulette:Outcome] Game is no longer playing. Cancelling next round deal.');
            return;
          }
          if (rouletteNextRoundTimeoutRef.current) {
            clearTimeout(rouletteNextRoundTimeoutRef.current);
            rouletteNextRoundTimeoutRef.current = null;
          }
          rouletteNextRoundTimeoutRef.current = setTimeout(() => {
            rouletteNextRoundTimeoutRef.current = null;
            if (gameStateRef.current !== 'playing' || soleSurvivorRef.current) return;
            console.log(`[Deceit:Roulette:Outcome] Dismissing roulette modal, dealing round ${roundNumberRef.current + 1}...`);
            setIsRouletteActive(false);
            if (isHostRef.current && dealNewRoundRef.current) {
              dealNewRoundRef.current(roundNumberRef.current + 1, updated);
            }
          }, 1500);
        }
      }
    });
  }, [triggerGunshotEffects, triggerBanner, isPublic, displayName, broadcastRoomBeacon, publishGameAction, pubkey]);

  // Russian Roulette Penalty Phase
  const startRevolverRoulette = useCallback((victimPk, reason) => {
    sound.stopChallengeTimer();
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
      console.log(`[Deceit:Roulette:Start] Suppressed because game has ended or sole survivor declared.`);
      return;
    }

    setPendingReveal(null);
    setIsRouletteActive(true);
    setRouletteVictim(victimPk);
    setRouletteResult(null);

    const victim = playersRef.current.find(p => p.pk === victimPk);
    const victimName = victim?.name || 'Victim';
    const victimChambers = victim?.chambersRemaining !== undefined ? victim.chambersRemaining : 6;

    console.log(`[Deceit:Roulette:Start] Personal gun penalty for ${victimName} (${victimPk?.slice(0, 8)}). Chambers in gun: ${victimChambers}. Reason: "${reason}". isHost=${isHostRef.current}`);
    triggerBanner(`${victimName} faces their personal revolver! (${victimChambers}/6 chambers left)`, 5000);

    // If host, calculate dynamic 1-in-chambers odds on the victim's personal gun immediately so the sequence runs in sync on both peers
    if (isHostRef.current) {
      const isDead = Math.random() < (1 / victimChambers);
      const nextChambers = isDead ? 0 : Math.max(1, victimChambers - 1);
      console.log(`[Deceit:Roulette:Roll] Host rolled ${victimName}'s revolver: isDead=${isDead}, chambers: ${victimChambers} -> ${nextChambers}`);

      if (executeRouletteOutcomeRef.current) {
        executeRouletteOutcomeRef.current(victimPk, isDead, victimChambers, nextChambers);
      }
    }
  }, [triggerBanner]);

  // Verify Revealed Cards
  const verifyRevealedCards = useCallback((revealedCards, accuserPk, accusedPk) => {
    const target = tableTargetRef.current;
    const lp = lastPlayRef.current;

    console.log(`[Deceit:Game:Verify] Verifying revealed cards against target "${target}":`, {
      revealedCards,
      accuserPk: accuserPk?.slice(0, 8),
      accusedPk: accusedPk?.slice(0, 8),
      committedHashes: lp?.cardHashes
    });

    // Check anti-cheat hash commitment match
    let cheatDetected = false;
    if (lp && lp.cardHashes && lp.cardHashes.length > 0) {
      if (revealedCards.length !== lp.cardHashes.length) {
        console.warn(`[Deceit:AntiCheat] Revealed count (${revealedCards.length}) does not match committed (${lp.cardHashes.length})!`);
        cheatDetected = true;
      } else {
        revealedCards.forEach((c, idx) => {
          if (!verifyCardCommitment(c, lp.cardHashes[idx])) {
            console.warn(`[Deceit:AntiCheat] Hash commitment mismatch for card at index ${idx}:`, c, lp.cardHashes[idx]);
            cheatDetected = true;
          }
        });
      }
    }

    // Check truthfulness: All cards must be target or JOKER
    const isTruth = !cheatDetected && revealedCards.length > 0 && revealedCards.every(c => isCardTruthful(c, target));
    const designatedLoserPk = isTruth ? accuserPk : accusedPk;
    const loserName = playersRef.current.find(p => p.pk === designatedLoserPk)?.name || 'Loser';

    // Action-Based Dominance Scoring:
    // +50: Successfully calling out a Liar (accuser guessed right)
    // -50: Getting caught in a lie (accused lied)
    // -50: Falsely accusing someone (accuser guessed wrong)
    // +10: Safely playing the truth (accused was truthful)
    const updatedScores = playersRef.current.map(p => {
      let score = p.dominanceScore || 0;
      if (!isTruth) {
        if (p.pk === accuserPk) score += 50;
        if (p.pk === accusedPk) score -= 50;
      } else {
        if (p.pk === accuserPk) score -= 50;
        if (p.pk === accusedPk) score += 10;
      }
      return { ...p, dominanceScore: score };
    });
    playersRef.current = updatedScores;
    setPlayers(updatedScores);

    const accuserName = updatedScores.find(p => p.pk === accuserPk)?.name || 'Accuser';
    const accusedName = updatedScores.find(p => p.pk === accusedPk)?.name || 'Accused';

    if (!isTruth) {
      console.log(`[Deceit:Dominance] +50 pts to ${accuserName} (Guessed Liar) & -50 pts to ${accusedName} (Caught in lie)`);
      triggerBanner(`🎯 ${accuserName} +50 pts (Called Liar!) • ${accusedName} -50 pts (Caught lying)`, 4500);
    } else {
      console.log(`[Deceit:Dominance] -50 pts to ${accuserName} (False accusation) & +10 pts to ${accusedName} (Truth played)`);
      triggerBanner(`❌ ${accuserName} -50 pts (False accusation) • ${accusedName} +10 pts (Truth played)`, 4500);
    }

    console.log(`[Deceit:Game:Verdict] Cards check complete! isTruth=${isTruth}, cheatDetected=${cheatDetected}, designatedLoser=${loserName} (${designatedLoserPk?.slice(0, 8)})`);

    setPendingReveal({
      accuserPk,
      accusedPk,
      cards: revealedCards,
      isTruth,
      cheatDetected,
      designatedLoserPk
    });

    // After brief reveal stinger (3800ms), move to the gun penalty phase
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    revealTimeoutRef.current = setTimeout(() => {
      revealTimeoutRef.current = null;
      console.log(`[Deceit:Game:Transition] Transitioning from reveal modal to Russian Roulette for ${designatedLoserPk?.slice(0, 8)}...`);
      if (startRevolverRouletteRef.current) {
        startRevolverRouletteRef.current(designatedLoserPk, isTruth ? 'Challenger failed challenge' : 'Caught lying');
      }
    }, 3800);
  }, [triggerBanner]);

  // Publish Revealed Cards
  const publishReveal = useCallback((turnId, revealedCards, accuserPk, accusedPk) => {
    console.log(`[Deceit:Game:Reveal] Executing publishReveal for turnId ${turnId}:`, {
      revealedCardsCount: revealedCards?.length,
      accuserPk: accuserPk?.slice(0, 8),
      accusedPk: accusedPk?.slice(0, 8)
    });

    if (turnId) {
      processedActionsRef.current.add(`reveal_${turnId}`);
      resolvedTurnIdsRef.current.add(turnId);
    }

    // Run verification & display modal locally immediately for the revealer!
    if (verifyRevealedCardsRef.current) {
      verifyRevealedCardsRef.current(revealedCards, accuserPk, accusedPk);
    }

    // Broadcast REVEAL_CARDS to all peers
    publishGameAction('REVEAL_CARDS', {
      turnId,
      revealedCards,
      accuserPk,
      accusedPk
    });
  }, [publishGameAction]);

  // Call Liar Action
  const handleCallLiar = useCallback((accuserPk, accusedPk, targetTurnId, targetHashes) => {
    sound.stopChallengeTimer();
    localLastPlayTruthRef.current = null; // Challenged! Uncalled bonus does not apply

    if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
      console.log(`[Deceit:Game:Liar] Suppressed because game has ended or sole survivor declared.`);
      return;
    }

    if (
      !targetTurnId ||
      processedActionsRef.current.has(`liar_${targetTurnId}`) ||
      resolvedTurnIdsRef.current.has(targetTurnId)
    ) {
      console.log(`[Deceit:Game:Liar] Suppressed duplicate CALL_LIAR for turn ${targetTurnId}`);
      return;
    }

    processedActionsRef.current.add(`liar_${targetTurnId}`);

    sound.playCallLiar();
    const accuserName = playersRef.current.find(p => p.pk === accuserPk)?.name || 'Someone';
    const accusedName = playersRef.current.find(p => p.pk === accusedPk)?.name || 'Opponent';
    console.log(`[Deceit:Game:Liar] ${accuserName} (${accuserPk?.slice(0, 8)}) calls LIAR on ${accusedName} (${accusedPk?.slice(0, 8)})! turnId=${targetTurnId}`);
    triggerBanner(`${accuserName} calls LIAR on ${accusedName}!`, 4000);

    publishGameAction('CALL_LIAR', {
      accuserPk,
      accusedPk,
      targetTurnId,
      targetHashes
    });

    // If local player is the accused, reveal cards immediately
    if (accusedPk === pubkey) {
      const lp = lastPlayRef.current;
      const myPlayedCards = (localLastPlayedCardsRef.current?.turnId === targetTurnId ? localLastPlayedCardsRef.current.cards : null)
        || lp?.playedCards
        || [];
      console.log(`[Deceit:Game:Liar] Accused is local player! Revealing ${myPlayedCards.length} cards:`, myPlayedCards);
      if (publishRevealRef.current) {
        publishRevealRef.current(targetTurnId, myPlayedCards, accuserPk, accusedPk);
      }
    }
  }, [pubkey, triggerBanner, publishGameAction]);

  // Pass / Accept opponent's escape when they have emptied their hand
  const handlePassEscape = useCallback((passerPk, escapedPk) => {
    sound.stopChallengeTimer();

    // Check if the local player safely escaped uncalled
    if (localLastPlayTruthRef.current) {
      if (localLastPlayTruthRef.current.isTruth === false) {
        console.log('[Deceit:Dominance] Hand emptied with bluff uncalled! +20 pts (Getting away with a lie)');
        if (adjustDominanceScoreRef.current) {
          adjustDominanceScoreRef.current(pubkey, 20, 'Getting away with a lie');
        }
      } else {
        console.log('[Deceit:Dominance] Hand emptied with truth uncalled! +10 pts (Safely playing the truth)');
        if (adjustDominanceScoreRef.current) {
          adjustDominanceScoreRef.current(pubkey, 10, 'Safely playing the truth');
        }
      }
      localLastPlayTruthRef.current = null;
    }

    if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
      console.log(`[Deceit:Game:Escape] Suppressed because game has ended or sole survivor declared.`);
      return;
    }

    const escapedPlayer = playersRef.current.find(p => p.pk === escapedPk);
    const passerPlayer = playersRef.current.find(p => p.pk === passerPk);
    const escapedName = escapedPlayer?.name || 'Opponent';
    const passerName = passerPlayer?.name || 'Challenger';

    console.log(`[Deceit:Game:Escape] ${passerName} passed! ${escapedName} safely emptied their hand!`);
    triggerBanner(`${escapedName} safely emptied their hand! ${passerName} faces the revolver!`, 4500);

    publishGameAction('SAFE_ESCAPE', {
      winnerPk: escapedPk,
      loserPk: passerPk
    });

    if (isHostRef.current) {
      setTimeout(() => {
        if (startRevolverRouletteRef.current) {
          startRevolverRouletteRef.current(passerPk, `${escapedName} safely emptied their hand`);
        }
      }, 1000);
    }
  }, [pubkey, triggerBanner, publishGameAction]);

  // Wire helper function refs to keep them fresh and avoid stale closures
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { handleCallLiarRef.current = handleCallLiar; }, [handleCallLiar]);
  useEffect(() => { handlePlayCardsRef.current = handlePlayCards; }, [handlePlayCards]);
  useEffect(() => { startRevolverRouletteRef.current = startRevolverRoulette; }, [startRevolverRoulette]);
  useEffect(() => { verifyRevealedCardsRef.current = verifyRevealedCards; }, [verifyRevealedCards]);
  useEffect(() => { dealNewRoundRef.current = dealNewRound; }, [dealNewRound]);
  useEffect(() => { publishRevealRef.current = publishReveal; }, [publishReveal]);
  useEffect(() => { executeRouletteOutcomeRef.current = executeRouletteOutcome; }, [executeRouletteOutcome]);
  useEffect(() => { handlePassEscapeRef.current = handlePassEscape; }, [handlePassEscape]);

  // Card Selection toggle
  const toggleCardSelection = useCallback((cardId) => {
    setSelectedCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      if (prev.length >= 3) {
        triggerBanner('Maximum 3 cards can be played per turn');
        return prev;
      }
      sound.playCardTake();
      return [...prev, cardId];
    });
  }, [triggerBanner]);

  // Event handler callback ref - updates continuously without causing subscription teardown
  useEffect(() => {
    eventHandlerRef.current = (event) => {
      try {
        if (event.pubkey === pubkey) {
          // Ignore own echoed events
          return;
        }

        // Deduplicate incoming Nostr events across relays by cryptographic event.id
        if (event.id) {
          if (processedEventIdsRef.current.has(event.id)) {
            return;
          }
          processedEventIdsRef.current.add(event.id);
          if (processedEventIdsRef.current.size > 2000) {
            const first = processedEventIdsRef.current.values().next().value;
            processedEventIdsRef.current.delete(first);
          }
        }

        // Guard against replayed historical events (> 45s old) from relays
        if (event.created_at && event.created_at < Math.floor(Date.now() / 1000) - 45) {
          return;
        }

        // Track heartbeat & activity for peer
        lastSeenMapRef.current[event.pubkey] = Date.now();
        if (disconnectedPeerRef.current && disconnectedPeerRef.current.pk === event.pubkey) {
          const reconnectedName = disconnectedPeerRef.current.name;
          console.log(`[Deceit:Disconnect] Opponent ${reconnectedName} reconnected!`);
          disconnectedPeerRef.current = null;
          setDisconnectedPeer(null);
          triggerBanner(`🟢 ${reconnectedName} reconnected! Resuming game...`, 3500);
        }

        let parsed = null;
        try {
          parsed = JSON.parse(event.content);
        } catch (e) {
          return;
        }
        const { type } = parsed;

        // Signaling
        if (event.kind === KINDS.SIGNAL) {
          if (type !== 'HEARTBEAT' && type !== 'ROSTER_SYNC') {
            console.log(`[Deceit:Signal:In] Received signal "${type}" from ${event.pubkey.slice(0, 8)}...:`, parsed);
          }

          if (type === 'JOIN_REQUEST' && isHostRef.current) {
            const newPk = parsed.senderPk || event.pubkey;
            const senderName = parsed.displayName || 'Gambler';
            console.log(`[Deceit:Signal:In] Host processing JOIN_REQUEST from "${senderName}" (${newPk.slice(0, 8)}...)`);

            let currentRoster = [...playersRef.current];
            const existingIdx = currentRoster.findIndex(p => p.pk === newPk);

            if (existingIdx >= 0) {
              currentRoster[existingIdx] = {
                ...currentRoster[existingIdx],
                name: senderName
              };
            } else if (currentRoster.length < 4) {
              currentRoster.push({
                pk: newPk,
                name: senderName,
                isAlive: true,
                cardCount: 5,
                isHost: false,
                chambersRemaining: 6,
                isReady: false,
                dominanceScore: 0
              });
              console.log(`[Deceit:Roster] Added player "${senderName}". New roster size: ${currentRoster.length}`);
            } else {
              console.warn(`[Deceit:Roster] Room is full (4 players). Rejecting join request.`);
              return;
            }

            playersRef.current = currentRoster;
            setPlayers(currentRoster);

            if (isPublicRef.current && roomCodeRef.current) {
              broadcastRoomBeacon({
                roomCode: roomCodeRef.current,
                hostName: displayName || 'Host',
                playerCount: currentRoster.length,
                maxPlayers: 4,
                status: gameStateRef.current === 'playing' ? 'playing' : 'open',
                soleSurvivor: null
              });
            }

            // Host ALWAYS responds with ROSTER_SYNC so the peer receives the roster
            console.log(`[Deceit:Signal:Out] Host broadcasting ROSTER_SYNC:`, currentRoster.map(p => p.name));
            publishSignal('ROSTER_SYNC', { players: currentRoster });

            // If table is actively in playing state, broadcast GAME_STATE_SYNC for reconnecting peers
            if (gameStateRef.current === 'playing') {
              console.log(`[Deceit:Signal:Out] Table actively playing! Host broadcasting GAME_STATE_SYNC:`, {
                roundNumber: roundNumberRef.current,
                tableTarget: tableTargetRef.current,
                activePlayerPk: activePlayerPkRef.current,
                pileCount: pileCountRef.current
              });
              publishSignal('GAME_STATE_SYNC', {
                roundNumber: roundNumberRef.current,
                tableTarget: tableTargetRef.current,
                chambersRemaining: chambersRef.current,
                activePlayerPk: activePlayerPkRef.current,
                pileCount: pileCountRef.current,
                lastPlay: lastPlayRef.current,
                players: currentRoster
              });
            }

          } else if (type === 'ROSTER_SYNC') {
            const isRosterChanged = !playersRef.current || 
              playersRef.current.length !== parsed.players?.length ||
              parsed.players?.some((p, i) => p.pk !== playersRef.current[i]?.pk || p.isReady !== playersRef.current[i]?.isReady || p.isAlive !== playersRef.current[i]?.isAlive);
            if (isRosterChanged) {
              console.log(`[Deceit:Signal:In] Processing ROSTER_SYNC with ${parsed.players?.length} players:`, parsed.players?.map(p => p.name));
            }
            if (Array.isArray(parsed.players) && parsed.players.length > 0) {
              const myLocal = playersRef.current.find(p => p.pk === pubkey);
              const syncedPlayers = parsed.players.map(p => {
                if (p.pk === pubkey && myLocal?.isReady) {
                  return { ...p, isReady: true };
                }
                return p;
              });
              setPlayers(syncedPlayers);
              playersRef.current = syncedPlayers;

              // Check if joining peer is now confirmed in roster
              if (syncedPlayers.some(p => p.pk === pubkey)) {
                if (joinIntervalRef.current) {
                  console.log(`[Deceit:Join] Confirmed in roster! Stopping retry interval.`);
                  clearInterval(joinIntervalRef.current);
                  joinIntervalRef.current = null;
                }
              }

              if (checkAllPlayersReadyRef.current) {
                checkAllPlayersReadyRef.current(syncedPlayers);
              }
            }

          } else if (type === 'PLAYER_READY') {
            const targetPk = parsed.playerPk || event.pubkey;
            const nextReady = Boolean(parsed.isReady);
            console.log(`[Deceit:Signal:In] Player ${targetPk.slice(0, 8)} set isReady=${nextReady}`);
            const updated = playersRef.current.map(p => 
              p.pk === targetPk ? { ...p, isReady: nextReady } : p
            );
            playersRef.current = updated;
            setPlayers(updated);
            if (checkAllPlayersReadyRef.current) {
              checkAllPlayersReadyRef.current(updated);
            }

          } else if (type === 'GAME_STATE_SYNC') {
            console.log(`[Deceit:Signal:In] Processing GAME_STATE_SYNC:`, parsed);
            sound.stopStartAudio();
            setIsStartAudioPlaying(false);
            setGameState('playing');
            gameStateRef.current = 'playing';
            if (parsed.roundNumber) {
              setRoundNumber(parsed.roundNumber);
              roundNumberRef.current = parsed.roundNumber;
            }
            if (parsed.tableTarget) {
              setTableTarget(parsed.tableTarget);
              tableTargetRef.current = parsed.tableTarget;
            }
            if (parsed.chambersRemaining !== undefined) {
              setChambersRemaining(parsed.chambersRemaining);
              chambersRef.current = parsed.chambersRemaining;
            }
            if (parsed.activePlayerPk) {
              setActivePlayerPk(parsed.activePlayerPk);
              activePlayerPkRef.current = parsed.activePlayerPk;
            }
            if (parsed.pileCount !== undefined) {
              setPileCount(parsed.pileCount);
              pileCountRef.current = parsed.pileCount;
            }
            if (parsed.lastPlay !== undefined) {
              setLastPlay(parsed.lastPlay);
              lastPlayRef.current = parsed.lastPlay;
            }
            if (Array.isArray(parsed.players) && parsed.players.length > 0) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }

          } else if (type === 'LEAVE_ROOM' && isHostRef.current) {
            const leavingPk = parsed.playerPk || event.pubkey;
            console.log(`[Deceit:Signal:In] Player left: ${leavingPk.slice(0, 8)}...`);
            const updated = playersRef.current.filter(p => p.pk !== leavingPk);
            playersRef.current = updated;
            setPlayers(updated);
            publishSignal('ROSTER_SYNC', { players: updated });
            if (checkAllPlayersReadyRef.current) {
              checkAllPlayersReadyRef.current(updated);
            }

          } else if (type === 'START_GAME') {
            console.log(`[Deceit:Signal:In] START_GAME received`);
            sound.stopStartAudio();
            setIsStartAudioPlaying(false);
            setGameState('playing');
            if (parsed.players && !playersRef.current.some(p => p.cardCount > 0)) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }

          } else if (type === 'SCORE_UPDATE') {
            const { playerPk: pPk, delta, reason, newScore } = parsed;
            console.log(`[Deceit:Signal:In] Received SCORE_UPDATE for ${pPk?.slice(0, 8)}: ${delta > 0 ? '+' : ''}${delta} pts (${reason})`);
            const updated = playersRef.current.map(p => {
              if (p.pk === pPk) {
                return { ...p, dominanceScore: newScore !== undefined ? newScore : (p.dominanceScore || 0) + delta };
              }
              return p;
            });
            playersRef.current = updated;
            setPlayers(updated);
            if (pPk !== pubkey) {
              const pName = updated.find(p => p.pk === pPk)?.name || 'Player';
              const sign = delta > 0 ? '+' : '';
              triggerBanner(`${sign}${delta} pts to ${pName}: ${reason}`, 3500);
            }

          } else if (type === 'RESET_TO_LOBBY') {
            sound.stopWin();
            sound.stopFail();
            sound.stopStartAudio();
            sound.stopChallengeTimer();
            sound.stopRouletteSequence();
            setGameState('lobby');
            gameStateRef.current = 'lobby';
            setSoleSurvivor(null);
            soleSurvivorRef.current = null;
            setEndGameReason(null);
            setPendingReveal(null);
            setIsRouletteActive(false);
            setRouletteResult(null);
            setChambersRemaining(6);
            setRoundNumber(1);
            setLocalHand([]);
            setSelectedCardIds([]);
            setLastPlay(null);
            setPileCount(0);
            if (Array.isArray(parsed.players)) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }
          }
        }

        // Game Actions
        if (event.kind === KINDS.GAME) {
          // If we resumed an ongoing session, drop historical events created before reload
          if (isResumeSessionRef.current && resumeTimestampRef.current > 0) {
            const eventTimeMs = (event.created_at || 0) * 1000;
            if (eventTimeMs < resumeTimestampRef.current - 2000) {
              return;
            }
          }

          if (gameStateRef.current === 'ended' || soleSurvivorRef.current) {
            return;
          }

          console.log(`[Deceit:Game:In] Received action "${type}" from ${event.pubkey.slice(0, 8)}...:`, parsed);

          if (type === 'DEAL_ROUND') {
            const dealKey = `deal_round_${parsed.roundNumber}`;
            if (processedActionsRef.current.has(dealKey) || (parsed.roundNumber < roundNumberRef.current)) {
              console.log(`[Deceit:Game:In] Ignoring duplicate or stale DEAL_ROUND ${parsed.roundNumber}`);
              return;
            }
            processedActionsRef.current.add(dealKey);

            // Clear any lingering timeouts from prior rounds
            if (revealTimeoutRef.current) {
              clearTimeout(revealTimeoutRef.current);
              revealTimeoutRef.current = null;
            }
            if (rouletteNextRoundTimeoutRef.current) {
              clearTimeout(rouletteNextRoundTimeoutRef.current);
              rouletteNextRoundTimeoutRef.current = null;
            }
            if (rouletteGameOverTimeoutRef.current) {
              clearTimeout(rouletteGameOverTimeoutRef.current);
              rouletteGameOverTimeoutRef.current = null;
            }

            setRoundNumber(parsed.roundNumber);
            setTableTarget(parsed.tableTarget);
            setChambersRemaining(parsed.chambersLeft || 6);
            setPileCount(0);
            setLastPlay(null);
            setSelectedCardIds([]);
            setPendingReveal(null);
            setIsRouletteActive(false);
            setActivePlayerPk(parsed.activeTurnPk);
            if (parsed.players) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }

            // Decrypt peer hand
            if (!isHostRef.current && parsed.encryptedHands) {
              const hostSecret = sha256(`${roomCodeRef.current}:${parsed.roundNumber}`);
              const myCipher = parsed.encryptedHands[pubkey] || 
                Object.entries(parsed.encryptedHands).find(([k]) => k.toLowerCase() === (pubkey || '').toLowerCase())?.[1];

              if (myCipher) {
                const hand = decryptHand(myCipher, pubkey, hostSecret);
                if (hand) {
                  console.log(`[Deceit:Hand] Peer decrypted local hand (${hand.length} cards):`, hand.map(c => c.rank));
                  setLocalHand(hand);
                  const expectedCommitments = parsed.commitments?.[pubkey] || [];
                  const valid = hand.every((c, i) => createCardCommitment(c) === expectedCommitments[i]);
                  if (!valid) {
                    console.warn('[Deceit:AntiCheat] Dealt hand hash does not match dealer commitment!');
                  }
                } else {
                  console.error('[Deceit:Hand] Failed to decrypt hand cipher with host secret!');
                }
              } else {
                console.error('[Deceit:Hand] Could not find cipher for pubkey in encryptedHands:', { pubkey, keys: Object.keys(parsed.encryptedHands) });
              }
            }
            sound.stopStartAudio();
            setIsStartAudioPlaying(false);
            setGameState('playing');
            console.log(`[Deceit:Gameplay] 🎴 Peer received DEAL_ROUND ${parsed.roundNumber}. Playing card shuffle sound (cards-shuffle.mp3) and displaying respective cards.`);
            sound.playCardShuffle();
            triggerBanner(`Round ${parsed.roundNumber}: Target is ${parsed.tableTarget === 'A' ? 'Aces' : parsed.tableTarget === 'K' ? 'Kings' : 'Queens'}!`);

          } else if (type === 'PLAY_CARDS') {
            const playKey = `play_${parsed.turnId}`;
            if (
              !parsed.turnId ||
              processedActionsRef.current.has(playKey) ||
              resolvedTurnIdsRef.current.has(parsed.turnId)
            ) {
              console.log(`[Deceit:Game:In] Ignoring duplicate or past PLAY_CARDS for turn ${parsed.turnId}`);
              return;
            }
            processedActionsRef.current.add(playKey);

            sound.playCardTake();

            // Check if local player's previous play went uncalled!
            if (localLastPlayTruthRef.current) {
              if (localLastPlayTruthRef.current.isTruth === false) {
                console.log('[Deceit:Dominance] Peer chose to play cards! Local bluff uncalled: +20 pts (Getting away with a lie)');
                if (adjustDominanceScoreRef.current) {
                  adjustDominanceScoreRef.current(pubkey, 20, 'Getting away with a lie');
                }
              } else {
                console.log('[Deceit:Dominance] Peer chose to play cards! Local truth play safe: +10 pts (Safely playing the truth)');
                if (adjustDominanceScoreRef.current) {
                  adjustDominanceScoreRef.current(pubkey, 10, 'Safely playing the truth');
                }
              }
              localLastPlayTruthRef.current = null;
            }

            setPileCount(prev => prev + parsed.cardCount);
            setLastPlay(parsed);
            if (parsed.players) {
              setPlayers(parsed.players);
              playersRef.current = parsed.players;
            }
            setActivePlayerPk(parsed.nextTurnPk);

            const pName = playersRef.current.find(p => p.pk === parsed.playerPk)?.name || 'Player';
            triggerBanner(`${pName} played ${parsed.cardCount} card${parsed.cardCount > 1 ? 's' : ''}`);

            // If a player emptied their hand and I am not the challenger, play 12s timer audio
            if (parsed.players) {
              const playedPlayer = parsed.players.find(p => p.pk === parsed.playerPk);
              if (playedPlayer && playedPlayer.cardCount === 0 && parsed.nextTurnPk !== pubkey) {
                sound.playChallengeTimer();
              }
            }

          } else if (type === 'CALL_LIAR') {
            const liarKey = `liar_${parsed.targetTurnId}`;
            if (
              !parsed.targetTurnId ||
              processedActionsRef.current.has(liarKey) ||
              resolvedTurnIdsRef.current.has(parsed.targetTurnId)
            ) {
              console.log(`[Deceit:Game:In] Suppressing duplicate or already-resolved CALL_LIAR for turn ${parsed.targetTurnId}`);
              return;
            }
            processedActionsRef.current.add(liarKey);
            resolvedTurnIdsRef.current.add(parsed.targetTurnId);

            sound.stopChallengeTimer();
            localLastPlayTruthRef.current = null; // Challenged! Uncalled bonus does not apply
            sound.playCallLiar();
            const accuserName = playersRef.current.find(p => p.pk === parsed.accuserPk)?.name || 'Someone';
            const accusedName = playersRef.current.find(p => p.pk === parsed.accusedPk)?.name || 'Opponent';
            console.log(`[Deceit:Game:In] Received CALL_LIAR: ${accuserName} challenged ${accusedName} (targetTurn: ${parsed.targetTurnId})`);
            triggerBanner(`${accuserName} calls LIAR on ${accusedName}!`, 4000);

            if (parsed.accusedPk === pubkey) {
              const lp = lastPlayRef.current;
              const myPlayedCards = (localLastPlayedCardsRef.current?.turnId === parsed.targetTurnId ? localLastPlayedCardsRef.current.cards : null)
                || lp?.playedCards
                || [];
              console.log(`[Deceit:Game:Liar] Local player is accused! Revealing ${myPlayedCards.length} cards:`, myPlayedCards);
              if (publishRevealRef.current) {
                publishRevealRef.current(parsed.targetTurnId, myPlayedCards, parsed.accuserPk, parsed.accusedPk);
              }
            }

          } else if (type === 'REVEAL_CARDS') {
            const revealKey = `reveal_${parsed.turnId}`;
            if (!parsed.turnId || processedActionsRef.current.has(revealKey)) {
              console.log(`[Deceit:Game:In] Ignoring duplicate REVEAL_CARDS for turn ${parsed.turnId}`);
              return;
            }
            processedActionsRef.current.add(revealKey);
            if (parsed.turnId) resolvedTurnIdsRef.current.add(parsed.turnId);

            console.log(`[Deceit:Game:In] Received REVEAL_CARDS:`, parsed);
            if (verifyRevealedCardsRef.current) {
              verifyRevealedCardsRef.current(parsed.revealedCards || [], parsed.accuserPk, parsed.accusedPk);
            }

          } else if (type === 'GUN_PULL_RESULT') {
            const gunKey = `gun_${parsed.timestamp || ''}_${parsed.victimPk}_${parsed.chambersAfter}`;
            if (processedActionsRef.current.has(gunKey)) {
              console.log(`[Deceit:Game:In] Ignoring duplicate GUN_PULL_RESULT`);
              return;
            }
            processedActionsRef.current.add(gunKey);

            if (revealTimeoutRef.current) {
              clearTimeout(revealTimeoutRef.current);
              revealTimeoutRef.current = null;
            }
            setPendingReveal(null);

            console.log(`[Deceit:Game:In] Received GUN_PULL_RESULT from host:`, parsed);
            if (!isHostRef.current && executeRouletteOutcomeRef.current) {
              executeRouletteOutcomeRef.current(parsed.victimPk, parsed.isDead, parsed.chambersBefore, parsed.chambersAfter);
            }

          } else if (type === 'SAFE_ESCAPE') {
            const escapeKey = `escape_${parsed.winnerPk}_${parsed.loserPk}_${roundNumberRef.current}`;
            if (processedActionsRef.current.has(escapeKey)) {
              console.log(`[Deceit:Game:In] Ignoring duplicate SAFE_ESCAPE`);
              return;
            }
            processedActionsRef.current.add(escapeKey);

            sound.stopChallengeTimer();
            const winnerName = playersRef.current.find(p => p.pk === parsed.winnerPk)?.name || 'Opponent';
            const loserName = playersRef.current.find(p => p.pk === parsed.loserPk)?.name || 'Challenger';
            console.log(`[Deceit:Game:In] Received SAFE_ESCAPE: ${winnerName} won round, ${loserName} faces gun`);
            triggerBanner(`${winnerName} safely emptied their hand! ${loserName} faces the revolver!`, 4500);

            if (isHostRef.current) {
              setTimeout(() => {
                if (startRevolverRouletteRef.current) {
                  startRevolverRouletteRef.current(parsed.loserPk, `${winnerName} safely emptied their hand`);
                }
              }, 1000);
            }
          }
        }
      } catch (err) {
        console.warn('[Deceit:Game] Error processing relay message:', err);
      }
    };
  });

  // Handle Incoming Nostr Events - Stable subscription lifecycle
  useEffect(() => {
    if (!roomCode || !relays || relays.length === 0 || !pubkey) return;

    console.log(`[Deceit:Sub] Starting subscription for room "${roomCode}" on relays:`, relays);
    let isCancelled = false;

    if (subRef.current) {
      try { subRef.current.close(); } catch (e) {}
      subRef.current = null;
    }

    // Only listen for live events in this table session
    // If resuming an ongoing game, only listen from right now (- 2s buffer)
    // so we NEVER pull in past round actions that were already resolved!
    const subSince = isResumeSessionRef.current
      ? Math.floor(Date.now() / 1000) - 2
      : Math.floor(Date.now() / 1000) - 25;
    const requests = relays.flatMap(url => [
      { url, filter: { kinds: [KINDS.SIGNAL, KINDS.GAME], '#d': [`deceit-${roomCode}`], since: subSince } },
      { url, filter: { kinds: [KINDS.SIGNAL, KINDS.GAME], '#h': [roomCode], since: subSince } },
      { url, filter: { kinds: [KINDS.SIGNAL, KINDS.GAME], '#p': [pubkey], since: subSince } }
    ]);

    try {
      const sub = pool.subscribeMap(requests, {
        onevent(event) {
          if (isCancelled) return;
          if (eventHandlerRef.current) {
            eventHandlerRef.current(event);
          }
        },
        onclose() {
          console.log(`[Deceit:Sub] Subscription closed for room ${roomCode}`);
        }
      });
      subRef.current = sub;
    } catch (err) {
      console.error('[Deceit:Sub] Error creating subscription:', err);
    }

    return () => {
      isCancelled = true;
      console.log(`[Deceit:Sub] Unsubscribing from room ${roomCode}`);
      if (subRef.current) {
        try { subRef.current.close(); } catch (e) {}
        subRef.current = null;
      }
    };
  }, [roomCode, relays, pubkey]);

  // Disconnection Watchdog & Active Game Heartbeat (Strict 30-Second Limit)
  useEffect(() => {
    if (gameState !== 'playing' || !roomCode) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (disconnectTimerRef.current) {
        clearInterval(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
      setDisconnectedPeer(null);
      disconnectedPeerRef.current = null;
      return;
    }

    gameStartTimeRef.current = Date.now();
    playersRef.current.forEach(p => {
      lastSeenMapRef.current[p.pk] = Date.now();
    });

    // 1. Send periodic heartbeat every 2s during active gameplay
    heartbeatIntervalRef.current = setInterval(() => {
      if (gameStateRef.current === 'playing' && roomCodeRef.current) {
        publishSignal('HEARTBEAT', { timestamp: Date.now() }).catch(() => {});
      }
    }, 2000);

    // 2. Watchdog: check for silent opponents every 1s (Strict 30s limit)
    disconnectTimerRef.current = setInterval(() => {
      if (gameStateRef.current !== 'playing' || !roomCodeRef.current) return;
      const now = Date.now();
      const livingOpponents = playersRef.current.filter(p => p.isAlive && p.pk !== pubkey);

      for (const opp of livingOpponents) {
        const lastSeen = lastSeenMapRef.current[opp.pk] || gameStartTimeRef.current;
        const silentMs = now - lastSeen;

        // Detect silence after 8s (4 missed heartbeats, tab switch tolerance), strictly enforce 30s total wait
        if (silentMs >= 8000) {
          const remaining = Math.max(0, 30 - Math.floor(silentMs / 1000));

          if (!disconnectedPeerRef.current || disconnectedPeerRef.current.pk !== opp.pk) {
            console.warn(`[Deceit:Disconnect] Opponent ${opp.name} (${opp.pk.slice(0, 8)}) silent for ${Math.round(silentMs/1000)}s. Starting 30s reconnection timer (${remaining}s remaining)...`);
            const discObj = { pk: opp.pk, name: opp.name, countdown: remaining };
            disconnectedPeerRef.current = discObj;
            setDisconnectedPeer(discObj);
            triggerBanner(`⚠️ ${opp.name} disconnected! Waiting for reconnection (${remaining}s)...`, 3000);
          } else {
            setDisconnectedPeer(prev => prev ? { ...prev, countdown: remaining } : null);

            if (remaining <= 0) {
              console.log(`[Deceit:Disconnect] 30s reconnection timer expired for ${opp.name}! Deciding winner by Dominance Score.`);
              disconnectedPeerRef.current = null;
              setDisconnectedPeer(null);
              if (resolveDisconnectionWinnerRef.current) {
                resolveDisconnectionWinnerRef.current(opp.pk);
              }
              break;
            }
          }
        }
      }
    }, 1000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (disconnectTimerRef.current) {
        clearInterval(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    };
  }, [gameState, roomCode, pubkey, publishSignal, triggerBanner]);

  // Leave room
  const leaveRoom = useCallback(() => {
    console.log(`[Deceit:Room] Leaving room ${roomCodeRef.current}`);
    try {
      localStorage.removeItem('deceit_active_session');
    } catch (e) {}
    sound.stopAllAudio();
    setIsStartAudioPlaying(false);
    if (joinIntervalRef.current) {
      clearInterval(joinIntervalRef.current);
      joinIntervalRef.current = null;
    }
    if (rosterSyncIntervalRef.current) {
      clearInterval(rosterSyncIntervalRef.current);
      rosterSyncIntervalRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (disconnectTimerRef.current) {
      clearInterval(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    if (subRef.current) {
      try { subRef.current.close(); } catch (e) {}
      subRef.current = null;
    }

    if (pubkey && roomCodeRef.current) {
      publishSignal('LEAVE_ROOM', { playerPk: pubkey }).catch(() => {});
    }

    setDisconnectedPeer(null);
    disconnectedPeerRef.current = null;
    setEndGameReason(null);
    setRoomCode(null);
    roomCodeRef.current = null;
    setIsHost(false);
    isHostRef.current = false;
    setIsPublic(false);
    isPublicRef.current = false;
    setGameState('none');
    gameStateRef.current = 'none';
    setSoleSurvivor(null);
    soleSurvivorRef.current = null;
    setPlayers([]);
    setLocalHand([]);
    setSelectedCardIds([]);
    setLastPlay(null);
    setPendingReveal(null);
    setIsRouletteActive(false);

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (rouletteNextRoundTimeoutRef.current) {
      clearTimeout(rouletteNextRoundTimeoutRef.current);
      rouletteNextRoundTimeoutRef.current = null;
    }
    if (rouletteGameOverTimeoutRef.current) {
      clearTimeout(rouletteGameOverTimeoutRef.current);
      rouletteGameOverTimeoutRef.current = null;
    }
    processedEventIdsRef.current.clear();
    processedActionsRef.current.clear();
  }, [pubkey, publishSignal]);

  useEffect(() => { leaveRoomRef.current = leaveRoom; }, [leaveRoom]);

  return (
    <GameContext.Provider value={{
      roomCode,
      isHost,
      isPublic,
      gameState,
      players,
      roundNumber,
      tableTarget,
      chambersRemaining,
      turnIndex,
      activePlayerPk,
      pileCount,
      lastPlay,
      localHand,
      selectedCardIds,
      pendingReveal,
      isRouletteActive,
      rouletteVictim,
      rouletteResult,
      actionBanner,
      soleSurvivor,
      endGameReason,
      disconnectedPeer,
      isShaking,
      isFlashActive,
      isStartAudioPlaying,
      isMatchmaking,
      matchmakingStatus,
      queueCount,
      matchmakingSize,
      showSizeFallback,
      switchTo2PlayerMatch,
      startMatchmaking,
      cancelMatchmaking,
      createRoom,
      joinRoom,
      togglePublic,
      startGame,
      togglePlayerReady,
      playSelectedCards,
      handleCallLiar,
      handlePassEscape,
      toggleCardSelection,
      adjustDominanceScore,
      resetToLobby,
      leaveRoom
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  return context || {};
};
