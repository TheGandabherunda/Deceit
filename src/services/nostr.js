import { SimplePool, generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools';

export const bytesToHex = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
export const hexToBytes = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

export const pool = new SimplePool();

export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net'
];

export const getOrCreateKeys = () => {
  let privKeyHex = localStorage.getItem('deceit_nsec_hex');
  if (!privKeyHex) {
    const sk = generateSecretKey();
    privKeyHex = bytesToHex(sk);
    localStorage.setItem('deceit_nsec_hex', privKeyHex);
  }
  const sk = hexToBytes(privKeyHex);
  const pk = getPublicKey(sk);
  return { sk, pk, privKeyHex };
};

export const getUserRelays = async () => {
  let userRelays = [...DEFAULT_RELAYS];
  const isExtension = !!localStorage.getItem('deceit_nip07');

  if (isExtension && window.nostr && window.nostr.getRelays) {
    try {
      const extRelays = await window.nostr.getRelays();
      if (extRelays && Object.keys(extRelays).length > 0) {
        const activeExtRelays = Object.keys(extRelays).filter(r => extRelays[r].read || extRelays[r].write);
        if (activeExtRelays.length > 0) {
          userRelays = activeExtRelays;
        }
      }
    } catch (e) {
      console.warn('[Nostr] Failed to fetch relays from extension:', e);
    }
  }
  return userRelays;
};

export const signEvent = (eventTemplate, sk) => {
  if (!sk) {
    throw new Error('signEvent failed: secret key (sk) is missing or undefined');
  }
  // Ensure secret key is a Uint8Array
  const secretKeyBytes = typeof sk === 'string' ? hexToBytes(sk) : sk;
  return finalizeEvent(eventTemplate, secretKeyBytes);
};

export const publishEvent = async (eventTemplate, sk, relays = DEFAULT_RELAYS) => {
  try {
    let signedEvent;
    if (sk === 'extension') {
      if (!window.nostr || !window.nostr.signEvent) {
        throw new Error('Nostr extension not available for signing');
      }
      signedEvent = await window.nostr.signEvent(eventTemplate);
    } else {
      signedEvent = signEvent(eventTemplate, sk);
    }

    const isQuietSignal = signedEvent.kind === 20001 && (
      signedEvent.content.includes('"type":"HEARTBEAT"') || 
      signedEvent.content.includes('"type":"ROSTER_SYNC"')
    );

    if (!isQuietSignal) {
      console.log(`[Deceit:Nostr] Publishing event kind=${signedEvent.kind} id=${signedEvent.id.slice(0, 8)}... to ${relays.length} relays:`, signedEvent.tags);
    }
    const pub = pool.publish(relays, signedEvent);
    if (Array.isArray(pub)) {
      const results = await Promise.allSettled(pub);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      if (!isQuietSignal) {
        console.log(`[Deceit:Nostr] Published kind=${signedEvent.kind} (${successful}/${relays.length} relays responded successfully)`);
      }
    } else if (pub && typeof pub.then === 'function') {
      await pub;
      if (!isQuietSignal) {
        console.log(`[Deceit:Nostr] Published kind=${signedEvent.kind} successfully`);
      }
    }
    return signedEvent;
  } catch (err) {
    console.error('[Deceit:Nostr] publishEvent failed:', err);
    throw err;
  }
};
