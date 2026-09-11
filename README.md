# DECEIT 🃏🔫

A high-stakes, decentralized multiplayer bluffing card game powered by **Nostr** and Russian Roulette mechanics.

Play cards in the dead zone. Bluff the target, call out liars, survive the 6-chamber revolver, and dominate the table.

---

## 🎯 Gameplay & Features

- **Pure Nostr Peer-to-Peer Multiplayer**: Zero central servers, accounts, or databases. Encrypted game signaling over public Nostr relays.
- **Collaborative Consensus Lobby**: Table starts only when all seated players ready up.
- **Dynamic Table Sizes**: Public matchmaking for **2 Players (Duel)**, **3 Players (Triad)**, and **4 Players (Full Table)** with queue size segregation and 2-player fallback option.
- **Private Tables**: Create or join passwordless 4-letter room code tables to play with friends.
- **The "Dominance" Score System**:
  - `+50 Points`: Successfully calling out a Liar (guessed right).
  - `+20 Points`: Getting away with a lie (uncalled bluff).
  - `+10 Points`: Safely playing the truth.
  - `-50 Points`: Falsely accusing someone (they told the truth).
  - `-50 Points`: Getting caught in a lie.
- **Disconnection & Reconnection Grace Period**:
  - Persistent table connection with session recovery across page refreshes.
  - 30-second reconnection grace period if an opponent disconnects.
  - If timeout expires, the player with the higher Dominance Score wins the match!
- **Interactive Audio Engine**:
  - 13.5s atmospheric table entrance sequence.
  - 12s ticking challenge countdown when a player empties their hand.
  - 4.5s suspense building audio before Russian Roulette trigger pull.
  - Card shuffle, card take, cylinder spin, hammer cock, gunshot flash, and shell casing drops.
  - Victory and defeat soundscapes.

---

## 📜 Rules Summary

1. **The 20-Card Deck**: 6 Aces, 6 Kings, 6 Queens, and 2 Jokers.
2. **Table Target**: Each round rolls a target rank (Ace, King, or Queen). Jokers are wild and always truthful.
3. **Playing Cards**: Players play 1–3 cards face-down, claiming they match the target.
4. **Calling Liar**: The next player can challenge ("Liar!") or play their own cards.
5. **Revolver Penalty**: If Liar is called and cards are revealed:
   - If truthful: The Accuser faces their personal 6-chamber revolver.
   - If a bluff: The Liar faces their personal revolver.
6. **Survival & Elimination**:
   - Empty chamber (`*CLICK*`): Survives, chamber count decreases by 1, and survivor deals the next round.
   - Live round (`BANG!`): Eliminated. Last player standing is the **Sole Survivor**!

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS + Tailwind utilities
- **Typography**: Gloock (Serif) & Inter (Mono/Sans)
- **Multiplayer / Networking**: Nostr (`nostr-tools`) via WebSocket relays (`wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.primal.net`)
- **Cryptography**: Schnorr signatures, SHA-256 card commitments, AES hand encryption
- **Audio**: Web Audio API & HTML5 Audio with precise sequencing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/TheGandabherunda/Deceit.git
cd Deceit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Building for Production

```bash
npm run build
```

---

## 📄 License
MIT License
