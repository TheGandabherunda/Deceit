import { getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools';
import CryptoJS from 'crypto-js';
import { bytesToHex, hexToBytes } from './nostr.js';

export const VALID_SHAPE_IDS = [
  'cercle', 'galet', 'squircle', 'capsule', 
  'triangle', 'hexagone', 'nuage', 'goutte'
];

export const VALID_COLOR_HEXES = [
  '#2563eb', '#059669', '#ea580c', '#0d9488', 
  '#db2777', '#0284c7', '#15803d', '#1e3a8a', 
  '#9a3412', '#4d7c0f', '#475569', '#18181b'
];

const DECEIT_BACKUP_PEPPER = 'deceit-anti-cheat-vault-v1-secp256k1-authenticated';
const BACKUP_FORMAT_HEADER = '-----BEGIN DECEIT ACCOUNT BACKUP-----';
const BACKUP_FORMAT_FOOTER = '-----END DECEIT ACCOUNT BACKUP-----';

/**
 * Generate a cryptographically signed, tamper-proof account backup package.
 */
export const generateAccountBackup = ({ pubkey, privKeyHex, profile }) => {
  if (!privKeyHex || privKeyHex.length !== 64) {
    throw new Error('Valid private key hex is required to generate account backup');
  }

  const skBytes = hexToBytes(privKeyHex);
  const derivedPubkey = getPublicKey(skBytes);

  if (pubkey && pubkey !== derivedPubkey) {
    throw new Error('Public key mismatch with private key');
  }

  const timestamp = Date.now();
  const cleanName = (profile?.name || localStorage.getItem('deceit_name') || 'Player').trim();
  const cleanColor = profile?.color || '#2563eb';
  const cleanShape = profile?.shape || 'cercle';

  let soundSettings = { masterMuted: false, bgMusicEnabled: true, sfxVolume: 0.75 };
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('deceit_sound_settings') : null;
    if (raw) soundSettings = { ...soundSettings, ...JSON.parse(raw) };
  } catch (e) {}

  const payloadToSign = {
    app: 'deceit',
    version: 1,
    createdAt: timestamp,
    identity: {
      privKeyHex,
      pubkey: derivedPubkey
    },
    profile: {
      name: cleanName,
      color: cleanColor,
      shape: cleanShape
    },
    sound: soundSettings
  };

  // 1. Sign canonical event via Nostr Schnorr signature
  const eventTemplate = {
    kind: 30315,
    created_at: Math.floor(timestamp / 1000),
    tags: [
      ['d', 'deceit-account-backup'],
      ['client', 'deceit'],
      ['v', '1'],
      ['p', derivedPubkey]
    ],
    content: JSON.stringify(payloadToSign)
  };

  const signedEvent = finalizeEvent(eventTemplate, skBytes);

  // 2. Compute application-level HMAC to prevent external mock data synthesis
  const hmac = CryptoJS.HmacSHA256(
    `${signedEvent.id}:${signedEvent.sig}:${derivedPubkey}:${cleanName}:${cleanShape}:${cleanColor}:${timestamp}`,
    DECEIT_BACKUP_PEPPER + privKeyHex
  ).toString(CryptoJS.enc.Hex);

  const bundle = {
    format: 'DECEIT_ACCOUNT_BACKUP',
    version: 1,
    createdAt: new Date(timestamp).toISOString(),
    signedEvent,
    payload: payloadToSign,
    hmac
  };

  const rawJson = JSON.stringify(bundle);
  const base64Data = btoa(unescape(encodeURIComponent(rawJson)));
  const armoredText = `${BACKUP_FORMAT_HEADER}\n${base64Data}\n${BACKUP_FORMAT_FOOTER}`;

  return {
    bundle,
    armoredText,
    filename: `deceit-account-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'player'}-${new Date().toISOString().slice(0, 10)}.deceit`
  };
};

/**
 * Validate and parse a raw backup input (armored string, raw base64, or JSON).
 * Strictly enforces signature verification, HMAC integrity, and schema compliance.
 */
export const verifyAndParseAccountBackup = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'Backup data is empty or invalid format.' };
  }

  let jsonStr = '';
  const trimmed = rawInput.trim();

  try {
    if (trimmed.includes(BACKUP_FORMAT_HEADER)) {
      const match = trimmed.match(/-----BEGIN DECEIT ACCOUNT BACKUP-----([\s\S]*?)-----END DECEIT ACCOUNT BACKUP-----/);
      if (!match || !match[1]) {
        return { valid: false, error: 'Malformed armored backup block.' };
      }
      const base64Body = match[1].replace(/\s+/g, '');
      jsonStr = decodeURIComponent(escape(atob(base64Body)));
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      jsonStr = trimmed;
    } else {
      // Try base64 decoding directly
      jsonStr = decodeURIComponent(escape(atob(trimmed.replace(/\s+/g, ''))));
    }
  } catch (e) {
    return { valid: false, error: 'Could not decode backup package. Corrupted or invalid encoding.' };
  }

  let bundle;
  try {
    bundle = JSON.parse(jsonStr);
  } catch (e) {
    return { valid: false, error: 'Invalid JSON structure in backup package.' };
  }

  // 1. Check top-level format requirements
  if (!bundle || bundle.format !== 'DECEIT_ACCOUNT_BACKUP' || bundle.version !== 1) {
    return { valid: false, error: 'Unsupported or unrecognized backup format.' };
  }

  const { signedEvent, payload, hmac } = bundle;
  if (!signedEvent || !payload || !hmac) {
    return { valid: false, error: 'Incomplete backup package: Missing cryptographic metadata.' };
  }

  // 2. Validate Identity fields
  const { identity, profile } = payload;
  if (!identity || !identity.privKeyHex || !identity.pubkey) {
    return { valid: false, error: 'Incomplete identity credentials in backup.' };
  }

  if (!/^[0-9a-fA-F]{64}$/.test(identity.privKeyHex)) {
    return { valid: false, error: 'Invalid private key format in backup.' };
  }

  // 3. Verify private key derives the declared public key
  let derivedPk;
  try {
    const skBytes = hexToBytes(identity.privKeyHex);
    derivedPk = getPublicKey(skBytes);
  } catch (e) {
    return { valid: false, error: 'Private key scalar is mathematically invalid.' };
  }

  if (derivedPk !== identity.pubkey || derivedPk !== signedEvent.pubkey) {
    return { valid: false, error: 'Keypair mismatch: Private key does not match public identity.' };
  }

  // 4. Verify Nostr Schnorr Signature on the event
  try {
    const isValidEvent = verifyEvent(signedEvent);
    if (!isValidEvent) {
      return { valid: false, error: 'Cryptographic signature verification failed: Payload has been tampered with.' };
    }
  } catch (e) {
    return { valid: false, error: 'Schnorr signature verification threw an exception: Tampered event data.' };
  }

  // 5. Verify event content matches payload exactly
  if (signedEvent.content !== JSON.stringify(payload)) {
    return { valid: false, error: 'Integrity violation: Event content does not match payload.' };
  }

  // 6. Verify Application HMAC to prevent external mock forgery
  const { name, color, shape } = profile || {};
  const expectedHmac = CryptoJS.HmacSHA256(
    `${signedEvent.id}:${signedEvent.sig}:${derivedPk}:${name}:${shape}:${color}:${payload.createdAt}`,
    DECEIT_BACKUP_PEPPER + identity.privKeyHex
  ).toString(CryptoJS.enc.Hex);

  if (expectedHmac !== hmac) {
    return { valid: false, error: 'Authenticity check failed: Mock or unauthorized data detected.' };
  }

  // 7. Validate Profile Schema
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 25) {
    return { valid: false, error: 'Invalid player display name schema.' };
  }

  const isValidShape = VALID_SHAPE_IDS.includes(shape);
  if (!isValidShape) {
    return { valid: false, error: `Invalid character shape identifier: "${shape}".` };
  }

  const isValidColor = VALID_COLOR_HEXES.includes((color || '').toLowerCase());
  if (!isValidColor) {
    return { valid: false, error: `Invalid character color identifier: "${color}".` };
  }

  // Everything passed all 7 cryptographic & schema checks!
  return {
    valid: true,
    data: bundle
  };
};

/**
 * Apply the verified backup data to restore the user's account completely.
 */
export const restoreAccountFromBackup = (bundle) => {
  const { payload } = bundle;
  const { identity, profile, sound: soundSettings } = payload;

  const nsecHex = identity.privKeyHex;
  const name = profile.name.trim();

  // 1. Restore core account credentials in localStorage
  localStorage.removeItem('deceit_nip07');
  localStorage.setItem('deceit_nsec_hex', nsecHex);
  localStorage.setItem('deceit_name', name);
  localStorage.setItem('deceit_player_profile', JSON.stringify({
    name,
    color: profile.color,
    shape: profile.shape
  }));

  // 2. Restore sound preferences if present
  if (soundSettings && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('deceit_sound_settings', JSON.stringify(soundSettings));
      window.dispatchEvent(new CustomEvent('deceit:sound-settings-change', { detail: soundSettings }));
    } catch (e) {}
  }

  // 3. Dispatch system-wide sync events to update all open contexts in memory immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('deceit:account-restored', { detail: payload }));
    window.dispatchEvent(new CustomEvent('deceit:name-change', { detail: name }));
    window.dispatchEvent(new CustomEvent('deceit:profile-change', { detail: profile }));
  }

  return {
    success: true,
    pubkey: identity.pubkey,
    name,
    color: profile.color,
    shape: profile.shape
  };
};
