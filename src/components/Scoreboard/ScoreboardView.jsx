import React, { useState, useEffect, useMemo } from 'react';
import { useNostr } from '../../context/NostrContext';
import { useProfile } from '../../context/ProfileContext';
import { BloubAvatar } from '../Bloub/BloubAvatar';
import AmbientLight from '../AmbientLight';
import { fetchGlobalScoreboard, getStoredScoreboard } from '../../services/scoreboardService';

export const ScoreboardView = ({ onBack }) => {
  const { pubkey, relays } = useNostr();
  const { profile } = useProfile();

  const [players, setPlayers] = useState(() => getStoredScoreboard());
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPk, setCopiedPk] = useState(null);

  // Sync with Nostr relays on mount
  useEffect(() => {
    setIsSyncing(true);
    const unsubscribe = fetchGlobalScoreboard({
      relays,
      onUpdate: (updatedList) => {
        if (updatedList && updatedList.length > 0) {
          setPlayers(updatedList);
        }
        setIsSyncing(false);
      }
    });

    const timer = setTimeout(() => {
      setIsSyncing(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [relays]);

  // Handle escape key to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onBack) onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleManualRefresh = () => {
    setIsSyncing(true);
    fetchGlobalScoreboard({
      relays,
      onUpdate: (updatedList) => {
        if (updatedList && updatedList.length > 0) {
          setPlayers(updatedList);
        }
        setIsSyncing(false);
      }
    });
    setTimeout(() => setIsSyncing(false), 2500);
  };


  const handleCopyId = (pk) => {
    if (!pk) return;
    navigator.clipboard.writeText(pk);
    setCopiedPk(pk);
    setTimeout(() => setCopiedPk(null), 1800);
  };

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const q = searchQuery.toLowerCase().trim();
    return players.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.pk && p.pk.toLowerCase().includes(q))
    );
  }, [players, searchQuery]);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col antialiased bg-[#050505] relative animate-fade-in select-none">
      {/* Ambient Lighting */}
      <AmbientLight />

      {/* Screen Header */}
      <header className="bg-black/40 backdrop-blur-xl p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] border-b border-white/10 flex items-center justify-between shrink-0 z-40 relative md:h-[72px]">
        {/* Left: Back Button & App Brand */}
        <div className="flex items-center gap-3 z-20">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer"
            title="Return to Hallway"
          >
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            <span>Back</span>
          </button>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:inline" />

          <div className="hidden sm:flex items-center gap-2 text-white tracking-wide text-2xl">
            <span className="font-bold" style={{ fontFamily: '"Gloock", serif' }}>Deceit</span>
            <span className="text-white/20 font-bold select-none leading-none">•</span>
            <span className="font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>Rankings</span>
          </div>
        </div>

        {/* Right: Sync Button & Player Profile Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 z-20">

          <button
            type="button"
            onClick={handleManualRefresh}
            title="Sync latest records from Nostr relays"
            disabled={isSyncing}
            className="h-9 px-3 sm:px-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <span className={`material-symbols-rounded text-base ${isSyncing ? 'animate-spin text-amber-400' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Current Local User Pill (Frameless / No Stroke) */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05]">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <BloubAvatar
                shape={profile.shape}
                color={profile.color}
                expression="idle"
                size={24}
              />
            </div>
            <span className="text-xs font-semibold text-white max-w-[80px] sm:max-w-[120px] truncate">
              {profile.name || 'You'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Scoreboard Content Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 z-10 flex flex-col items-center relative no-scrollbar">
        <div className="w-full max-w-3xl flex flex-col items-center">
          
          {/* Title in Gloock font */}
          <div className="text-center mt-2 mb-6 sm:mb-8">
            <h1 
              className="text-4xl sm:text-6xl md:text-7xl text-white font-normal tracking-tight text-center drop-shadow-[0_4px_30px_rgba(255,255,255,0.2)]"
              style={{ fontFamily: '"Gloock", serif', fontWeight: 400 }}
            >
              Global Scoreboard
            </h1>
            <p 
              className="text-white/50 text-sm sm:text-base font-normal mt-2 sm:mt-2.5 tracking-normal"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ranked by victories
            </p>
          </div>

          {/* Search Bar - Full width */}
          <div className="w-full mb-5">
            <div className="w-full relative">
              <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-base pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player name or ID..."
                className="w-full bg-white/5 rounded-full pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.08] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-rounded text-sm">clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Player Ranking List - Frameless Tiles (NO STROKES) */}
          <div className="w-full space-y-2.5 pb-12">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => {
                const isLocalUser = player.pk === pubkey;
                const rank = index + 1;

                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                return (
                  <div
                    key={player.pk}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all ${
                      isLocalUser
                        ? 'bg-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.04)]'
                        : isFirst
                          ? 'bg-amber-400/[0.08] shadow-[0_0_30px_rgba(251,191,36,0.06)]'
                          : 'bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    {/* Left: Rank + Character Bloub + Name / Pubkey */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                      {/* Rank Badge */}
                      <div className="w-7 sm:w-8 text-center shrink-0 flex items-center justify-center">
                        {isFirst ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center shadow-[0_0_16px_rgba(251,191,36,0.7)]">
                            1
                          </div>
                        ) : isSecond ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 text-black font-bold text-xs sm:text-sm flex items-center justify-center shadow-md">
                            2
                          </div>
                        ) : isThird ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center">
                            3
                          </div>
                        ) : (
                          <span className="text-white/40 text-xs sm:text-sm font-semibold">
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Character Bloub Avatar */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 relative">
                        {isFirst && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 pointer-events-none z-10">
                            <span className="material-symbols-rounded text-base block leading-none">
                              crown
                            </span>
                          </div>
                        )}
                        <BloubAvatar
                          shape={player.shape || 'cercle'}
                          color={player.color || '#3b93f0'}
                          expression={isFirst ? 'victory' : 'idle'}
                          size={48}
                        />
                      </div>

                      {/* Name & Player ID */}
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm sm:text-base truncate">
                            {player.name || 'Anonymous'}
                          </span>
                          {isLocalUser && (
                            <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider shrink-0">
                              You
                            </span>
                          )}
                        </div>

                        {/* Truncated Nostr Pubkey ID with Click to Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyId(player.pk)}
                          title="Click to copy Nostr Pubkey ID"
                          className="text-[11px] text-white/40 hover:text-white/80 transition-colors text-left flex items-center gap-1 cursor-pointer w-fit group mt-0.5"
                        >
                          <span>{player.pk ? `${player.pk.slice(0, 10)}...${player.pk.slice(-4)}` : 'pk-unknown'}</span>
                          <span className="material-symbols-rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedPk === player.pk ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Wins, Defeats & Win Rate Badges (NO STROKES) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Wins Badge */}
                      <div className="flex flex-col items-center px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-500/10 text-center min-w-[56px] sm:min-w-[64px]">
                        <span className="text-emerald-400 font-bold text-sm sm:text-base leading-tight">
                          {player.wins || 0}
                        </span>
                        <span className="text-emerald-300/60 text-[9px] sm:text-[10px] uppercase tracking-wider">
                          Wins
                        </span>
                      </div>

                      {/* Defeats Badge */}
                      <div className="flex flex-col items-center px-3 sm:px-4 py-1.5 rounded-xl bg-rose-500/10 text-center min-w-[56px] sm:min-w-[64px]">
                        <span className="text-rose-400 font-bold text-sm sm:text-base leading-tight">
                          {player.defeats || 0}
                        </span>
                        <span className="text-rose-300/60 text-[9px] sm:text-[10px] uppercase tracking-wider">
                          Defeats
                        </span>
                      </div>

                      {/* Win Rate (Hidden on mobile) */}
                      <div className="hidden md:flex flex-col items-center px-3 py-1.5 rounded-xl bg-white/[0.04] text-center min-w-[60px]">
                        <span className="text-white/80 font-bold text-xs sm:text-sm leading-tight">
                          {player.winRate !== undefined ? `${player.winRate}%` : '0%'}
                        </span>
                        <span className="text-white/40 text-[9px] uppercase tracking-wider">
                          Rate
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                  <span className="material-symbols-rounded text-4xl">leaderboard</span>
                </div>
                <h3 className="text-white font-semibold text-lg">
                  {searchQuery ? 'No matching players found' : 'No public table records yet'}
                </h3>
                <p className="text-white/50 text-xs sm:text-sm max-w-sm font-sans leading-relaxed">
                  {searchQuery 
                    ? 'Try searching with a different player name or Nostr pubkey ID.' 
                    : 'Play matches on public tables to record wins, eliminate opponents, and claim the #1 spot on the global scoreboard!'}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="mt-2 px-8 h-11 bg-white hover:bg-white/90 text-black font-semibold rounded-full text-sm transition-all shadow-xl active:scale-95 cursor-pointer"
                  >
                    Play a Public Match
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Fixed Bottom-Right: Total Player Count */}
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md text-xs text-white/50 pointer-events-none select-none">
        <span className="font-bold text-white">{players.length}</span>
        <span>{players.length === 1 ? 'player' : 'players'} ranked</span>
      </div>
    </div>
  );
};

