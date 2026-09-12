import { pool, DEFAULT_RELAYS } from './nostr';
import { KINDS } from './nostrProtocol';

const SCOREBOARD_STORAGE_KEY = 'deceit_global_scoreboard';
const PROCESSED_MATCHES_KEY = 'deceit_processed_matches';

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

// Load cached scoreboard from localStorage (strictly real public match records only)
export const getStoredScoreboard = () => {
  try {
    const raw = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
    if (!raw) return [];
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
 * Process a single public match record and update the scoreboard mapping
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
 * Record a locally concluded public table match outcome
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

  console.log(`[Scoreboard] Recorded public match outcome. Winner: ${winner.name}, Defeated: ${defeated.length}`);
  return updated;
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

  try {
    const sub = pool.subscribeMany(
      relays,
      [
        {
          kinds: [KINDS.MATCH_RECORD],
          '#t': ['deceit-scoreboard'],
          limit: 300
        }
      ],
      {
        onevent(event) {
          try {
            const data = JSON.parse(event.content);
            if (!data || !data.winner || !data.winner.pk) return;

            const matchId = data.matchId || event.id;
            activeScoreboard = processMatchRecord(activeScoreboard, {
              matchId,
              roomCode: data.roomCode,
              winner: data.winner,
              defeated: data.defeated || [],
              timestamp: data.timestamp || (event.created_at * 1000)
            });

            if (typeof onUpdate === 'function') {
              onUpdate(activeScoreboard);
            }
          } catch (err) {
            console.warn('[Scoreboard] Failed to parse match event:', err);
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

    return () => {
      try {
        sub.close();
      } catch (e) {}
    };
  } catch (err) {
    console.error('[Scoreboard] Failed to subscribe to scoreboard events:', err);
    return () => {};
  }
};
