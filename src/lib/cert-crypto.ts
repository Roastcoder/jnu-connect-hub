// Ed25519 certificate signing/verification using tweetnacl.
// We use a deterministic seed for the demo signer so the public key is stable
// across reloads. In production the private key would live on the server only.
import nacl from "tweetnacl";

const SEED_HEX = "4a4e55434f4e4e454354454432353531395349474e494e474b45592d76312e30"; // "JNUCONNECTED25519SIGNINGKEY-v1.0"

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function bytesToHex(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}
function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

const seed = hexToBytes(SEED_HEX).slice(0, 32);
const kp = nacl.sign.keyPair.fromSeed(seed);

export const CERT_PUBLIC_KEY_HEX = bytesToHex(kp.publicKey);
export const CERT_SIGNER = "Registrar, Jaipur National University";
export const CERT_ALGO = "Ed25519";

export interface CertPayload {
  code: string;
  holder: string;
  regId: string;
  event: string;
  type: string;
  position?: string;
  date: string;
  issuedAt: string;
}

export function canonicalPayload(p: CertPayload): string {
  // Stable JSON — keys sorted, no whitespace.
  const ordered: Record<string, string | undefined> = {
    code: p.code, date: p.date, event: p.event, holder: p.holder,
    issuedAt: p.issuedAt, position: p.position, regId: p.regId, type: p.type,
  };
  return JSON.stringify(ordered);
}

export function signCertificate(p: CertPayload): string {
  const msg = utf8(canonicalPayload(p));
  return bytesToHex(nacl.sign.detached(msg, kp.secretKey));
}

export function verifySignature(p: CertPayload, sigHex: string, pubKeyHex = CERT_PUBLIC_KEY_HEX): boolean {
  try {
    const msg = utf8(canonicalPayload(p));
    return nacl.sign.detached.verify(msg, hexToBytes(sigHex), hexToBytes(pubKeyHex));
  } catch {
    return false;
  }
}

export function shortSig(hex: string): string {
  return hex.length > 16 ? `${hex.slice(0, 8)}…${hex.slice(-6)}` : hex;
}
