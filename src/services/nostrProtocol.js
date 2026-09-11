// Deceit Nostr Event Protocol Definitions
export const KINDS = {
  BEACON: 30311, // NIP-53 Live Activity / Parameterized Replaceable
  SIGNAL: 20001, // NIP-16 Ephemeral: Room joining & player negotiation
  GAME: 20002    // NIP-16 Ephemeral: In-game actions & cryptographic commitments
};

export const createBeaconEvent = ({ roomCode, hostPk, hostName, playerCount, maxPlayers, status, soleSurvivor }) => {
  return {
    kind: KINDS.BEACON,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `deceit-room-${roomCode}`],
      ['status', status], // 'open' | 'playing' | 'closed'
      ['title', `Deceit Room: ${roomCode}`],
      ['p', hostPk, 'host']
    ],
    content: JSON.stringify({
      roomCode,
      hostPk,
      hostName,
      playerCount,
      maxPlayers,
      status, // 'open' | 'playing' | 'closed'
      soleSurvivor: soleSurvivor || null,
      updatedAt: Date.now()
    })
  };
};

export const createSignalEvent = ({ roomCode, senderPk, targetPk, type, payload = {} }) => {
  const tags = [
    ['d', `deceit-${roomCode}`],
    ['h', roomCode]
  ];
  if (targetPk) {
    tags.push(['p', targetPk]);
  }
  return {
    kind: KINDS.SIGNAL,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: JSON.stringify({
      type,
      senderPk,
      roomCode,
      ...payload
    })
  };
};

export const createGameEvent = ({ roomCode, senderPk, targetPk, type, payload = {} }) => {
  const tags = [
    ['d', `deceit-${roomCode}`],
    ['h', roomCode]
  ];
  if (targetPk) {
    tags.push(['p', targetPk]);
  }
  return {
    kind: KINDS.GAME,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: JSON.stringify({
      type,
      senderPk,
      roomCode,
      timestamp: Date.now(),
      ...payload
    })
  };
};
