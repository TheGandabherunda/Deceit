import { pool, DEFAULT_RELAYS } from './nostr';
import { KINDS } from './nostrProtocol';

export const SCOREBOARD_TAG = 'deceit-scoreboard-v1';
const SCOREBOARD_STORAGE_KEY = 'deceit_global_scoreboard_v1';
const PROCESSED_MATCHES_KEY = 'deceit_processed_matches_v1';

// Automatically purge legacy test caches
try {
  localStorage.removeItem('deceit_global_scoreboard');
  localStorage.removeItem('deceit_processed_matches');
} catch (e) {}

/**
 * Scoreboard Entry Model:
 * {
 *   pk: string,
 *   name: string,
 *   shape: string,
 *   color: string,
 *   wins: number,
 *   defeats: number,
 *   totalMatches: number,
 *   winRate: number,
 *   lastPlayed: number
 * }
 */

// Load processed match IDs to avoid double-counting
const getProcessedMatchIds = () => {
  try {
    const raw = localStorage.getItem(PROCESSED_MATCHES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
};

const saveProcessedMatchIds = (set) => {
  try {
    const arr = Array.from(set).slice(-500); // Keep last 500 match IDs
    localStorage.setItem(PROCESSED_MATCHES_KEY, JSON.stringify(arr));
  } catch (e) {}
};

// Filter out mock/dummy records if they exist in localStorage from testing
const filterRealPlayers = (list) => {
  if (!Array.isArray(list)) return [];
  const dummyPks = new Set([
    'npub1bluffmaster928471928472918471928471928471928471928471928471928',
    'npub1satoshi8374928174928174928174928174928174928174928174928174928',
    'npub1deadzone4829104829104829104829104829104829104829104829104829104',
    'npub1russianroul592019482019482019482019482019482019482019482019482',
    'npub1bloubboss39104820194820194820194820194820194820194820194820194',
    'npub1wildjoker84019284019284019284019284019284019284019284019284019',
    'npub1pebbleking29401928401928401928401928401928401928401928401928401'
  ]);
  return list.filter(p => p && p.pk && !dummyPks.has(p.pk) && p.name !== 'CipherBlade' && p.name !== 'PhantomRevolver');
};

// Clear cached scoreboard completely
export const clearScoreboard = () => {
  try {
    localStorage.removeItem(SCOREBOARD_STORAGE_KEY);
    localStorage.removeItem(PROCESSED_MATCHES_KEY);
  } catch (e) {}
  return [];
};

// Load cached scoreboard from localStorage (strictly real match records only)
export const getStoredScoreboard = () => {
  try {
    const raw = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
    if (!raw) {
      // If scoreboard cache is empty, also clear processed match IDs so initial relay sync ingests all records
      localStorage.removeItem(PROCESSED_MATCHES_KEY);
      return [];
    }
    const parsed = JSON.parse(raw);
    const cleaned = filterRealPlayers(parsed);
    if (cleaned.length !== parsed.length) {
      saveStoredScoreboard(cleaned);
    }
    return sortScoreboard(cleaned);
  } catch (e) {
    return [];
  }
};

// Save scoreboard to localStorage
export const saveStoredScoreboard = (scoreboard) => {
  try {
    const sorted = sortScoreboard(scoreboard);
    localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(sorted));
    return sorted;
  } catch (e) {
    return scoreboard;
  }
};

// Sort scoreboard: most wins at top, fewest defeats as tie-breaker, then highest win rate
export const sortScoreboard = (list) => {
  return [...list].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.defeats !== b.defeats) return a.defeats - b.defeats;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return (b.lastPlayed || 0) - (a.lastPlayed || 0);
  });
};

/**
 * Process a single match record and update the scoreboard mapping
 */
export const processMatchRecord = (currentScoreboard, matchData) => {
  const { matchId, winner, defeated = [], timestamp = Date.now() } = matchData;
  if (!winner || !winner.pk) return currentScoreboard;

  const processedSet = getProcessedMatchIds();
  if (matchId && processedSet.has(matchId)) {
    return currentScoreboard; // Already counted
  }

  const map = new Map();
  currentScoreboard.forEach(entry => map.set(entry.pk, { ...entry }));

  // 1. Process Winner (+1 Win)
  const existingWinner = map.get(winner.pk) || {
    pk: winner.pk,
    name: winner.name || 'Anonymous',
    shape: winner.shape || 'cercle',
    color: winner.color || '#3b93f0',
    wins: 0,
    defeats: 0,
    totalMatches: 0,
    winRate: 0,
    lastPlayed: timestamp
  };

  existingWinner.wins += 1;
  existingWinner.name = winner.name || existingWinner.name;
  existingWinner.shape = winner.shape || existingWinner.shape;
  existingWinner.color = winner.color || existingWinner.color;
  existingWinner.lastPlayed = Math.max(existingWinner.lastPlayed || 0, timestamp);
  existingWinner.totalMatches = existingWinner.wins + existingWinner.defeats;
  existingWinner.winRate = Math.round((existingWinner.wins / existingWinner.totalMatches) * 100);
  map.set(winner.pk, existingWinner);

  // 2. Process Defeated Players (+1 Defeat each)
  (defeated || []).forEach(loser => {
    if (!loser || !loser.pk || loser.pk === winner.pk) return;

    const existingLoser = map.get(loser.pk) || {
      pk: loser.pk,
      name: loser.name || 'Anonymous',
      shape: loser.shape || 'cercle',
      color: loser.color || '#e8483f',
      wins: 0,
      defeats: 0,
      totalMatches: 0,
      winRate: 0,
      lastPlayed: timestamp
    };

    existingLoser.defeats += 1;
    existingLoser.name = loser.name || existingLoser.name;
    existingLoser.shape = loser.shape || existingLoser.shape;
    existingLoser.color = loser.color || existingLoser.color;
    existingLoser.lastPlayed = Math.max(existingLoser.lastPlayed || 0, timestamp);
    existingLoser.totalMatches = existingLoser.wins + existingLoser.defeats;
    existingLoser.winRate = Math.round((existingLoser.wins / existingLoser.totalMatches) * 100);
    map.set(loser.pk, existingLoser);
  });

  // Mark match ID as processed
  if (matchId) {
    processedSet.add(matchId);
    saveProcessedMatchIds(processedSet);
  }

  const updatedList = Array.from(map.values());
  return saveStoredScoreboard(updatedList);
};

/**
 * Record a locally concluded table match outcome
 */
export const recordPublicMatchOutcome = ({ winner, defeated = [], roomCode, timestamp = Date.now() }) => {
  if (!winner || !winner.pk) return;
  const matchId = `deceit-match-${roomCode || 'pub'}-${timestamp}`;

  const current = getStoredScoreboard();
  const updated = processMatchRecord(current, {
    matchId,
    roomCode,
    winner,
    defeated,
    timestamp
  });

  console.log(`[Scoreboard] Recorded match outcome. Winner: ${winner.name}, Defeated: ${defeated.length}`);
  return updated;
};

/**
 * Validate match record event integrity to prevent fake or forged match injections
 */
export const validateMatchRecordEvent = (event) => {
  if (!event || !event.content || !event.pubkey) return null;
  try {
    const data = JSON.parse(event.content);
    if (!data || !data.winner || !data.winner.pk) return null;
    if (!Array.isArray(data.defeated) || data.defeated.length === 0) return null;

    // Winner pubkey format (64-character hex)
    if (!/^[a-f0-9]{64}$/i.test(data.winner.pk)) return null;

    // Room code must be 4 characters
    const roomCode = (data.roomCode || '').trim();
    if (!roomCode || roomCode.length !== 4) return null;

    // Filter valid opponents who are not the winner
    const validDefeated = data.defeated.filter(d => 
      d && d.pk && /^[a-f0-9]{64}$/i.test(d.pk) && d.pk !== data.winner.pk
    );
    if (validDefeated.length === 0) return null;

    // The signer of the Nostr event must be an actual participant in the table (the host)
    const isParticipant = event.pubkey === data.winner.pk || validDefeated.some(d => d.pk === event.pubkey);
    if (!isParticipant) return null;

    // Timestamp sanity check (cannot be from the future)
    const timestamp = data.timestamp || (event.created_at * 1000);
    if (timestamp > Date.now() + 120000) return null;

    return {
      matchId: data.matchId || event.id,
      roomCode,
      winner: data.winner,
      defeated: validDefeated,
      timestamp
    };
  } catch (e) {
    return null;
  }
};

/**
 * Query Nostr Relays for match record events to build/sync the global scoreboard
 */
export const fetchGlobalScoreboard = ({ relays = DEFAULT_RELAYS, onUpdate } = {}) => {
  const current = getStoredScoreboard();
  let activeScoreboard = [...current];

  if (typeof onUpdate === 'function') {
    onUpdate(activeScoreboard);
  }

  let isClosed = false;
  let sub = null;

  // 1. Immediate fast querySync across all relays to pull historical matches
  (async () => {
    try {
      const events = await pool.querySync(relays, {
        kinds: [KINDS.MATCH_RECORD],
        '#t': [SCOREBOARD_TAG],
        limit: 500
      });

      if (isClosed) return;

      if (Array.isArray(events) && events.length > 0) {
        // Sort chronologically ascending
        const sortedEvents = [...events].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
        let hasNew = false;

        sortedEvents.forEach(event => {
          const validated = validateMatchRecordEvent(event);
          if (!validated) return;

          const processedSet = getProcessedMatchIds();
          if (!processedSet.has(validated.matchId)) {
            activeScoreboard = processMatchRecord(activeScoreboard, validated);
            hasNew = true;
          }
        });

        if (hasNew && typeof onUpdate === 'function') {
          onUpdate(activeScoreboard);
        }
      }
    } catch (err) {
      console.warn('[Scoreboard] querySync error:', err);
    }
  })();

  // 2. Real-time subscription for ongoing matches (object filter for nostr-tools v2)
  try {
    sub = pool.subscribeMany(
      relays,
      {
        kinds: [KINDS.MATCH_RECORD],
        '#t': [SCOREBOARD_TAG],
        limit: 100
      },
      {
        onevent(event) {
          const validated = validateMatchRecordEvent(event);
          if (!validated) return;

          const processedSet = getProcessedMatchIds();
          if (!processedSet.has(validated.matchId)) {
            activeScoreboard = processMatchRecord(activeScoreboard, validated);

            if (typeof onUpdate === 'function') {
              onUpdate(activeScoreboard);
            }
          }
        },
        oneose() {
          console.log(`[Scoreboard] Completed initial relay sync. Total players tracked: ${activeScoreboard.length}`);
          if (typeof onUpdate === 'function') {
            onUpdate(activeScoreboard);
          }
        }
      }
    );
  } catch (err) {
    console.error('[Scoreboard] Failed to subscribe to scoreboard events:', err);
  }

  return () => {
    isClosed = true;
    try {
      if (sub && typeof sub.close === 'function') sub.close();
    } catch (e) {}
  };
};
