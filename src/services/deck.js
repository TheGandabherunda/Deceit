import { generateSalt, createCardCommitment } from './crypto.js';

export const RANKS = {
  ACE: 'A',
  KING: 'K',
  QUEEN: 'Q',
  JOKER: 'JOKER'
};

export const TARGET_RANKS = [RANKS.ACE, RANKS.KING, RANKS.QUEEN];

/**
 * Generate a fresh 20-card deck:
 * 6 Aces, 6 Kings, 6 Queens, 2 Jokers
 * Each card gets a unique ID, rank, and a cryptographically secure random salt.
 */
export const createDeck = () => {
  const deck = [];
  let idCounter = 1;

  // 6 Aces
  for (let i = 0; i < 6; i++) {
    deck.push({
      id: `c_A_${idCounter++}`,
      rank: RANKS.ACE,
      salt: generateSalt(16)
    });
  }

  // 6 Kings
  for (let i = 0; i < 6; i++) {
    deck.push({
      id: `c_K_${idCounter++}`,
      rank: RANKS.KING,
      salt: generateSalt(16)
    });
  }

  // 6 Queens
  for (let i = 0; i < 6; i++) {
    deck.push({
      id: `c_Q_${idCounter++}`,
      rank: RANKS.QUEEN,
      salt: generateSalt(16)
    });
  }

  // 2 Jokers
  for (let i = 0; i < 2; i++) {
    deck.push({
      id: `c_J_${idCounter++}`,
      rank: RANKS.JOKER,
      salt: generateSalt(16)
    });
  }

  return deck;
};

/**
 * Fisher-Yates shuffle algorithm for true on-the-fly randomness.
 */
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate secure random index
    const randomArray = new Uint32Array(1);
    const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
    cryptoObj.getRandomValues(randomArray);
    const j = randomArray[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Pick random table target: Ace, King, or Queen with true 1/3 odds.
 */
export const rollTableTarget = () => {
  const randomArray = new Uint32Array(1);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
  cryptoObj.getRandomValues(randomArray);
  const index = randomArray[0] % TARGET_RANKS.length;
  return TARGET_RANKS[index];
};


/**
 * Deal 5 cards to each active player from a shuffled 20-card deck.
 * Generates card hash commitments for each player's hand.
 */
export const dealHands = (playerPubkeys) => {
  if (playerPubkeys.length < 2 || playerPubkeys.length > 4) {
    throw new Error('Deceit requires 2 to 4 players');
  }

  const shuffled = shuffleDeck(createDeck());
  const hands = {};
  const commitments = {};

  playerPubkeys.forEach((pk, idx) => {
    const hand = shuffled.slice(idx * 5, (idx + 1) * 5);
    hands[pk] = hand;
    commitments[pk] = hand.map(card => createCardCommitment(card));
  });

  const target = rollTableTarget();

  return {
    target,
    hands,
    commitments
  };
};

/**
 * Check if a revealed card matches the table target.
 * Joker is ALWAYS considered true!
 */
export const isCardTruthful = (card, targetRank) => {
  if (!card) return false;
  if (card.rank === RANKS.JOKER) return true;
  return card.rank === targetRank;
};
