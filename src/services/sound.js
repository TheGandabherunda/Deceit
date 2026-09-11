import spinAudio from '../assets/spin.mp3';
import emptyAudio from '../assets/empty.mp3';
import shotAudio from '../assets/shot.mp3';
import shellAudio from '../assets/shell.mp3';
import clockAudio from '../assets/clock.mp3';
import timerAudio from '../assets/timer.mp3';
import suspenseAudio from '../assets/suspense.mp3';
import cardsShuffleAudio from '../assets/cards-shuffle.mp3';
import cardFlipAudio from '../assets/card-flip.mp3';
import cardTakeAudio from '../assets/card-take.mp3';
import startAudio from '../assets/start.mp3';
import winAudio from '../assets/win.mp3';
import failAudio from '../assets/fail.mp3';
import liarAudio from '../assets/liar.mp3';

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.timerAudioObj = null;
    this.timerTimeout = null;
    this.timerCancelled = false;
    this.startAudioObj = null;
    this.startAudioTimeout = null;
    this.startAudioCancelled = false;
    this.winAudioObj = null;
    this.failAudioObj = null;

    // Roulette sequence state
    this.rouletteAudios = [];
    this.rouletteTimeouts = [];
    this.isRouletteCancelled = false;

    // Active generic audio objects
    this.activeAudios = new Set();
    this.hasUserInteracted = false;

    // Global UI Hover Audio state
    this.hoverAudioUrl = '/sounds/hover.mp3';
    this.hoverBuffer = null;
    this.rawHoverData = null;
    this.hoverAudioPool = [];
    this.hoverPoolIdx = 0;
    this.lastHoverTime = 0;
    this.loadHoverBuffer();
  }

  loadHoverBuffer() {
    if (typeof window === 'undefined') return;
    try {
      fetch(this.hoverAudioUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((data) => {
          if (this.ctx) {
            this.ctx.decodeAudioData(data.slice(0), (buffer) => {
              this.hoverBuffer = buffer;
            }, () => {});
          } else {
            this.rawHoverData = data;
          }
        })
        .catch(() => {});

      // Pre-create audio element pool for instant response
      for (let i = 0; i < 6; i++) {
        const a = new Audio(this.hoverAudioUrl);
        a.volume = 0.45;
        a.preload = 'auto';
        this.hoverAudioPool.push(a);
      }
    } catch (e) {}
  }

  playHover() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastHoverTime < 25) return;
    this.lastHoverTime = now;

    // 1. Web Audio API with decoded buffer (ultra-low latency)
    if (this.ctx && this.ctx.state === 'running' && this.hoverBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.hoverBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {}
    }

    // 2. HTMLAudioElement pool fallback
    try {
      if (this.hoverAudioPool && this.hoverAudioPool.length > 0) {
        const audio = this.hoverAudioPool[this.hoverPoolIdx];
        this.hoverPoolIdx = (this.hoverPoolIdx + 1) % this.hoverAudioPool.length;
        audio.currentTime = 0;
        const p = audio.play();
        if (p !== undefined) p.catch(() => {});
      }
    } catch (e) {}
  }

  init() {
    if (!this.hasUserInteracted) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          this.ctx = new AudioContext();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch (e) {}
    }
    if (this.ctx && this.rawHoverData && !this.hoverBuffer) {
      try {
        const dataCopy = this.rawHoverData.slice(0);
        this.ctx.decodeAudioData(dataCopy, (buffer) => {
          this.hoverBuffer = buffer;
          this.rawHoverData = null;
        }, () => {});
      } catch (e) {}
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAllAudio();
    }
    return this.muted;
  }

  // Play audio asset with volume control and safe procedural fallback
  playAudioFile(src, volume = 1.0, fallbackFn = null, soundName = 'audio') {
    if (this.muted) {
      return;
    }
    try {
      const audio = new Audio(src);
      audio.volume = Math.min(1.0, Math.max(0.0, volume));
      this.activeAudios.add(audio);

      const cleanup = () => this.activeAudios.delete(audio);
      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });

      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          this.activeAudios.delete(audio);
          // If browser blocked autoplay before user clicked document, ignore silently
          if (err && err.name === 'NotAllowedError') {
            return;
          }
          console.warn(`[Deceit:Audio] Playback blocked for "${soundName}":`, err.message);
          if (fallbackFn && this.hasUserInteracted) fallbackFn();
        });
      }
    } catch (e) {
      if (fallbackFn && this.hasUserInteracted) fallbackFn();
    }
  }

  // Soft card deal / slide
  playCardSlide() {
    if (this.muted || !this.hasUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Card shuffle during setting cards
  playCardShuffle() {
    console.log('[Deceit:Audio] 🎴 Playing card shuffle sound (cards-shuffle.mp3)');
    this.playAudioFile(cardsShuffleAudio, 0.9, () => this.playCardSlide(), 'cards-shuffle.mp3');
  }

  // Card flip when revealing cards
  playCardFlip() {
    this.playAudioFile(cardFlipAudio, 1.0, () => this.playCardSnap(), 'card-flip.mp3');
  }

  // Card take when selecting card
  playCardTake() {
    console.log('[Deceit:Audio] 🃏 Playing card take sound (card-take.mp3)');
    this.playAudioFile(cardTakeAudio, 0.9, () => this.playCardSlide(), 'card-take.mp3');
  }

  // Room entrance / join audio (start.mp3)
  playStartAudio(onComplete = null) {
    this.stopStartAudio();
    this.startAudioCancelled = false;
    if (this.muted) {
      console.log('[Deceit:Audio] 🚪 Entrance audio (start.mp3) skipped (muted).');
      if (onComplete) onComplete();
      return null;
    }
    try {
      console.log('[Deceit:Audio] 🚪 Playing table entrance audio (start.mp3, ~13.58s)...');
      const audio = new Audio(startAudio);
      audio.volume = 0.85;
      this.startAudioObj = audio;
      this.activeAudios.add(audio);

      let completed = false;
      const handleEnd = () => {
        if (this.startAudioCancelled || completed) return;
        completed = true;
        console.log('[Deceit:Audio] 🚪 Table entrance audio completed!');
        if (this.startAudioTimeout) {
          clearTimeout(this.startAudioTimeout);
          this.startAudioTimeout = null;
        }
        this.activeAudios.delete(audio);
        this.startAudioObj = null;
        if (onComplete) onComplete();
      };

      audio.addEventListener('ended', handleEnd, { once: true });
      // Guarantee fallback at exactly 13.7 seconds (audio is ~13.58s)
      this.startAudioTimeout = setTimeout(handleEnd, 13700);

      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[Deceit:Audio] Autoplay blocked start.mp3, completing entrance state immediately:', err.message);
          handleEnd();
        });
      }
      return audio;
    } catch (e) {
      console.warn('[Deceit:Audio] Error initializing start.mp3:', e.message);
      if (onComplete) onComplete();
      return null;
    }
  }

  stopStartAudio() {
    this.startAudioCancelled = true;
    if (this.startAudioObj) {
      console.log('[Deceit:Audio] 🚪 Stopping table entrance audio.');
      try {
        this.startAudioObj.pause();
        this.startAudioObj.currentTime = 0;
      } catch (e) {}
      this.activeAudios.delete(this.startAudioObj);
      this.startAudioObj = null;
    }
    if (this.startAudioTimeout) {
      clearTimeout(this.startAudioTimeout);
      this.startAudioTimeout = null;
    }
  }

  // Chip clink / Card snap
  playCardSnap() {
    if (this.muted || !this.hasUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Call Liar audio (liar.mp3)
  playCallLiar() {
    console.log('[Deceit:Audio] 🗣️ Playing Liar audio (liar.mp3)...');
    this.playAudioFile(liarAudio, 0.95, null, 'liar.mp3');
  }

  // Bullet casing / shell ejection
  playShell() {
    this.playAudioFile(shellAudio, 0.85);
  }

  // Full 12-second challenge timer sound (timer.mp3)
  playChallengeTimer(onComplete = null) {
    this.stopChallengeTimer();
    this.timerCancelled = false;
    if (this.muted) {
      if (onComplete) {
        this.timerTimeout = setTimeout(() => {
          if (!this.timerCancelled && onComplete) onComplete();
        }, 12500);
      }
      return null;
    }

    try {
      console.log('[Deceit:Audio] ⏱️ Playing 12-second challenge timer (timer.mp3)...');
      const audio = new Audio(timerAudio);
      audio.volume = 0.85;
      this.timerAudioObj = audio;
      this.activeAudios.add(audio);

      let completed = false;
      const handleEnd = () => {
        if (this.timerCancelled || completed) return;
        completed = true;
        console.log('[Deceit:Audio] ⏱️ 12-second challenge timer audio completed naturally.');
        if (this.timerTimeout) {
          clearTimeout(this.timerTimeout);
          this.timerTimeout = null;
        }
        this.activeAudios.delete(audio);
        this.timerAudioObj = null;
        if (onComplete) onComplete();
      };

      audio.addEventListener('ended', handleEnd, { once: true });
      // Guarantee fallback at exactly 12.6 seconds (audio is ~12.5s) in case audio ended event does not fire
      this.timerTimeout = setTimeout(handleEnd, 12600);

      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay policy fallback
          this.timerTimeout = setTimeout(handleEnd, 12500);
        });
      }

      return audio;
    } catch (e) {
      if (onComplete) {
        this.timerTimeout = setTimeout(() => {
          if (!this.timerCancelled && onComplete) onComplete();
        }, 12500);
      }
      return null;
    }
  }

  // Stop challenge timer sound immediately (e.g. when user clicks Challenge or Pass)
  stopChallengeTimer() {
    this.timerCancelled = true;
    if (this.timerAudioObj) {
      console.log('[Deceit:Audio] ⏱️ Stopped challenge timer audio.');
      try {
        this.timerAudioObj.pause();
        this.timerAudioObj.currentTime = 0;
      } catch (e) {}
      this.activeAudios.delete(this.timerAudioObj);
      this.timerAudioObj = null;
    }
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
      this.timerTimeout = null;
    }
  }

  isPlayingChallengeTimer() {
    return !!this.timerAudioObj && !this.timerAudioObj.paused;
  }

  // Clock ticking
  playClockTick() {
    this.playAudioFile(clockAudio, 0.35);
  }

  // Revolver cylinder spin
  playCylinderSpin() {
    this.playAudioFile(spinAudio, 1.0, () => this.synthCylinderSpin());
  }

  // Full cinematic Russian Roulette audio sequence
  // Order: spin.mp3 -> immediately clock.mp3 -> 4.5s suspense.mp3 -> shot.mp3 (+ shell.mp3) or empty.mp3
  playRouletteSequence({ isDead, onClockStart, onSuspenseStart, onTriggerPull, onShellEject, onSequenceEnd }) {
    console.log(`[Deceit:Audio] 🎲 Russian Roulette Audio Sequence initiated. isDead=${isDead}`);
    this.stopRouletteSequence();
    this.isRouletteCancelled = false;

    const safeTimeout = (fn, delay) => {
      const id = setTimeout(() => {
        if (!this.isRouletteCancelled) fn();
      }, delay);
      this.rouletteTimeouts.push(id);
      return id;
    };

    const registerAudio = (src, vol = 1.0) => {
      const audio = new Audio(src);
      audio.volume = Math.min(1.0, Math.max(0.0, vol));
      this.rouletteAudios.push(audio);
      this.activeAudios.add(audio);
      return audio;
    };

    if (this.muted) {
      console.log('[Deceit:Audio] 🎲 Roulette audio muted, using timeout fallbacks.');
      let endCalled = false;
      if (onClockStart) safeTimeout(onClockStart, 1800);
      if (onSuspenseStart) safeTimeout(onSuspenseStart, 3000);
      if (onTriggerPull) safeTimeout(onTriggerPull, 7600);
      if (onShellEject && isDead) safeTimeout(onShellEject, 8800);
      if (onSequenceEnd) {
        safeTimeout(() => {
          if (endCalled || this.isRouletteCancelled) return;
          endCalled = true;
          onSequenceEnd();
        }, 9800);
      }
      return;
    }

    // Step 1: Revolver cylinder spin sound
    console.log('[Deceit:Audio] 🔄 Playing revolver spin (spin.mp3)...');
    const spinAudioObj = registerAudio(spinAudio, 1.0);

    let clockStarted = false;
    let clockTimeoutId = null;

    const startClock = () => {
      if (this.isRouletteCancelled || clockStarted) return;
      clockStarted = true;
      if (clockTimeoutId) clearTimeout(clockTimeoutId);
      if (onClockStart) onClockStart();

      // Step 2: Clock sound immediately after spin (hammer cocked)
      const clockAudioObj = registerAudio(clockAudio, 0.85);

      let suspenseStarted = false;
      let suspenseTimeoutId = null;

      const startSuspense = () => {
        if (this.isRouletteCancelled || suspenseStarted) return;
        suspenseStarted = true;
        if (suspenseTimeoutId) clearTimeout(suspenseTimeoutId);
        if (onSuspenseStart) onSuspenseStart();

        // Step 3: Play 4.5-second suspense audio before trigger pull
        const suspenseAudioObj = registerAudio(suspenseAudio, 0.95);

        let triggerPulled = false;
        let triggerTimeoutId = null;

        const pullTrigger = () => {
          if (this.isRouletteCancelled || triggerPulled) return;
          triggerPulled = true;
          if (triggerTimeoutId) clearTimeout(triggerTimeoutId);
          if (onTriggerPull) onTriggerPull();

          if (isDead) {
            // Step 4a: SHOT BANG!
            const shotAudioObj = registerAudio(shotAudio, 1.0);

            let shellPlayed = false;
            let shellTimeoutId = null;

            const playShellSound = () => {
              if (this.isRouletteCancelled || shellPlayed) return;
              shellPlayed = true;
              if (shellTimeoutId) clearTimeout(shellTimeoutId);
              if (onShellEject) onShellEject();

              // Step 5: Spent shell casing hits floor
              const shellAudioObj = registerAudio(shellAudio, 0.85);

              let sequenceEnded = false;
              let endTimeoutId = null;

              const finishSequence = () => {
                if (this.isRouletteCancelled || sequenceEnded) return;
                sequenceEnded = true;
                if (endTimeoutId) clearTimeout(endTimeoutId);
                if (onSequenceEnd) onSequenceEnd();
              };

              shellAudioObj.addEventListener('ended', finishSequence, { once: true });
              endTimeoutId = safeTimeout(finishSequence, 2200);

              shellAudioObj.play().catch(() => {
                finishSequence();
              });
            };

            shotAudioObj.addEventListener('ended', playShellSound, { once: true });
            shellTimeoutId = safeTimeout(playShellSound, 1200);

            shotAudioObj.play().catch(() => {
              if (this.hasUserInteracted) this.synthGunshot();
              playShellSound();
            });

          } else {
            // Step 4b: EMPTY CLICK (Survived)
            const emptyAudioObj = registerAudio(emptyAudio, 1.0);

            let sequenceEnded = false;
            let endTimeoutId = null;

            const finishSequence = () => {
              if (this.isRouletteCancelled || sequenceEnded) return;
              sequenceEnded = true;
              if (endTimeoutId) clearTimeout(endTimeoutId);
              if (onSequenceEnd) onSequenceEnd();
            };

            emptyAudioObj.addEventListener('ended', finishSequence, { once: true });
            endTimeoutId = safeTimeout(finishSequence, 1600);

            emptyAudioObj.play().catch(() => {
              if (this.hasUserInteracted) this.synthEmptyChamberClick();
              finishSequence();
            });
          }
        };

        // Listen for suspense audio to finish (~4.57s)
        suspenseAudioObj.addEventListener('ended', pullTrigger, { once: true });
        triggerTimeoutId = safeTimeout(pullTrigger, 4700);

        suspenseAudioObj.play().catch(() => {
          pullTrigger();
        });
      };

      clockAudioObj.addEventListener('ended', startSuspense, { once: true });
      suspenseTimeoutId = safeTimeout(startSuspense, 1400);

      clockAudioObj.play().catch(() => {
        startSuspense();
      });
    };

    spinAudioObj.addEventListener('ended', startClock, { once: true });
    clockTimeoutId = safeTimeout(startClock, 2200);

    spinAudioObj.play().catch(() => {
      if (this.hasUserInteracted) this.synthCylinderSpin();
      startClock();
    });
  }

  stopRouletteSequence() {
    this.isRouletteCancelled = true;
    if (this.rouletteTimeouts.length > 0) {
      this.rouletteTimeouts.forEach(t => clearTimeout(t));
      this.rouletteTimeouts = [];
    }
    if (this.rouletteAudios.length > 0) {
      this.rouletteAudios.forEach(audio => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
        this.activeAudios.delete(audio);
      });
      this.rouletteAudios = [];
    }
  }

  stopAllAudio() {
    console.log('[Deceit:Audio] 🛑 Stopping ALL audio and sound timers.');
    this.stopStartAudio();
    this.stopChallengeTimer();
    this.stopRouletteSequence();
    this.stopWin();
    this.stopFail();
    this.activeAudios.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    });
    this.activeAudios.clear();
  }

  synthCylinderSpin() {
    if (this.muted || !this.hasUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const clicks = 8;
    for (let i = 0; i < clicks; i++) {
      const delay = i * 0.06 * (1 + i * 0.1);
      setTimeout(() => {
        this.playMechanicalTick();
      }, delay * 1000);
    }
  }

  playMechanicalTick() {
    if (this.muted || !this.hasUserInteracted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'highpass' in osc ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(3200 + Math.random() * 400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.015);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.015);
  }

  // Metallic Empty Chamber "CLICK" (Survival)
  playEmptyChamberClick() {
    this.playAudioFile(emptyAudio, 1.0, () => this.synthEmptyChamberClick());
  }

  synthEmptyChamberClick() {
    if (this.muted || !this.hasUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Thunderous Gunshot BANG (Elimination)
  playGunshot() {
    this.playAudioFile(shotAudio, 1.0, () => this.synthGunshot());
  }

  synthGunshot() {
    if (this.muted || !this.hasUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const t = this.ctx.currentTime;

    // 1. Noise blast (explosion powder)
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 1.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // 2. Low boom punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.6);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    noise.start(t);
    subOsc.start(t);
    subOsc.stop(t + 0.6);
  }

  // Win audio (win.mp3) - Played for winner
  playWin() {
    this.stopWin();
    this.stopFail();
    if (this.muted) {
      console.log('[Deceit:Audio] 🏆 Win audio muted.');
      return null;
    }
    try {
      console.log('[Deceit:Audio] 🏆 Playing victory sound (win.mp3) for sole survivor!');
      const audio = new Audio(winAudio);
      audio.volume = 0.9;
      this.winAudioObj = audio;
      this.activeAudios.add(audio);
      const cleanup = () => this.activeAudios.delete(audio);
      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });
      audio.play().catch((err) => {
        this.activeAudios.delete(audio);
        console.warn('[Deceit:Audio] Failed to autoplay win.mp3:', err.message);
      });
      return audio;
    } catch (e) {
      console.warn('[Deceit:Audio] Error loading win.mp3:', e.message);
      return null;
    }
  }

  stopWin() {
    if (this.winAudioObj) {
      console.log('[Deceit:Audio] 🏆 Stopped win audio.');
      try {
        this.winAudioObj.pause();
        this.winAudioObj.currentTime = 0;
      } catch (e) {}
      this.activeAudios.delete(this.winAudioObj);
      this.winAudioObj = null;
    }
  }

  // Fail audio (fail.mp3) - Played for loser
  playFail() {
    this.stopWin();
    this.stopFail();
    if (this.muted) {
      console.log('[Deceit:Audio] 💀 Fail audio muted.');
      return null;
    }
    try {
      console.log('[Deceit:Audio] 💀 Playing defeat sound (fail.mp3) for eliminated player!');
      const audio = new Audio(failAudio);
      audio.volume = 0.9;
      this.failAudioObj = audio;
      this.activeAudios.add(audio);
      const cleanup = () => this.activeAudios.delete(audio);
      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });
      audio.play().catch((err) => {
        this.activeAudios.delete(audio);
        console.warn('[Deceit:Audio] Failed to autoplay fail.mp3:', err.message);
      });
      return audio;
    } catch (e) {
      console.warn('[Deceit:Audio] Error loading fail.mp3:', e.message);
      return null;
    }
  }

  stopFail() {
    if (this.failAudioObj) {
      console.log('[Deceit:Audio] 💀 Stopped fail audio.');
      try {
        this.failAudioObj.pause();
        this.failAudioObj.currentTime = 0;
      } catch (e) {}
      this.activeAudios.delete(this.failAudioObj);
      this.failAudioObj = null;
    }
  }
}

export const sound = new SoundFX();

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    sound.hasUserInteracted = true;
    sound.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('pointerdown', unlockAudio, { passive: true });

  // Global hover audio for all interactive UI elements in the website
  const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [role="radio"], [role="tab"], .cursor-pointer, [tabindex]:not([tabindex="-1"])';

  let lastHoveredElement = null;

  document.addEventListener('mouseover', (e) => {
    if (!e.target || !(e.target instanceof Element)) return;
    const target = e.target.closest(INTERACTIVE_SELECTOR);
    if (!target) {
      lastHoveredElement = null;
      return;
    }
    if (target === lastHoveredElement) {
      return; // Same element, ignore inner DOM boundary crossings
    }
    lastHoveredElement = target;

    // Skip disabled elements
    if (target.disabled || target.getAttribute('aria-disabled') === 'true') {
      return;
    }

    sound.playHover();
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    lastHoveredElement = null;
  });
}
