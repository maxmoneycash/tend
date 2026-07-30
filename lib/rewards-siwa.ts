// ╔══════════════════════════════════════════════════════════════════╗
// ║ Content Rewards — Auth (SIWA + JWT)                             ║
// ║ FORKED FROM: forsety/packages/auth/src/                         ║
// ║                                                                  ║
// ║ Sign In With Aptos: wallet signs a structured message,          ║
// ║ server verifies Ed25519 signature, issues JWT.                  ║
// ║ No passwords. Wallet address = identity.                        ║
// ╚══════════════════════════════════════════════════════════════════╝

import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ── Types ─────────────────────────────────────────────────

export interface AuthConfig {
  jwtSecret: string;       // 256-bit secret for HS256
  jwtExpiresIn?: string;   // default: "7d"
  domain: string;          // e.g. "contentrewards.xyz"
  statement?: string;      // human-readable sign-in statement
}

export interface AuthMessage {
  domain: string;
  address: string;
  statement: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
  chainId: number;
}

export interface AuthSession {
  address: string;
  role: "brand" | "creator" | "admin";
  token: string;
  expiresAt: Date;
}

export interface SIWAPayload extends JWTPayload {
  address: string;
  role: string;
  chainId: number;
}

// ── Nonce store (in production, use Redis or DB) ──────────

const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

// ── SIWA Functions ────────────────────────────────────────

/**
 * Generate a nonce for SIWA. The nonce is tied to the wallet address
 * and expires after 5 minutes.
 */
export function generateNonce(address: string): string {
  const nonce = randomBytes(16).toString("hex");
  nonceStore.set(address.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
  });
  return nonce;
}

/**
 * Create the structured message that the wallet will sign.
 * Format follows EIP-4361 / SIWA conventions.
 */
export function createAuthMessage(
  config: AuthConfig,
  address: string,
  nonce: string,
  chainId: number = 1, // 1 = mainnet, 2 = testnet
): AuthMessage {
  const now = new Date();
  const expiry = new Date(now.getTime() + 5 * 60 * 1000);

  return {
    domain: config.domain,
    address,
    statement:
      config.statement ||
      "Sign in to Content Rewards. This request will not trigger a blockchain transaction.",
    nonce,
    issuedAt: now.toISOString(),
    expirationTime: expiry.toISOString(),
    chainId,
  };
}

/**
 * Serialize the auth message to the string that gets signed.
 * This must match exactly what the frontend passes to Petra's signMessage.
 */
export function serializeMessage(msg: AuthMessage): string {
  return [
    `${msg.domain} wants you to sign in with your Aptos account:`,
    msg.address,
    "",
    msg.statement,
    "",
    `URI: https://${msg.domain}`,
    `Version: 1`,
    `Chain ID: ${msg.chainId}`,
    `Nonce: ${msg.nonce}`,
    `Issued At: ${msg.issuedAt}`,
    `Expiration Time: ${msg.expirationTime}`,
  ].join("\n");
}

/**
 * Verify a SIWA signature. In Aptos, the wallet signs with Ed25519.
 * We verify using @aptos-labs/ts-sdk.
 *
 * NOTE: The actual Ed25519 verification requires the Aptos SDK.
 * This function validates the nonce + expiry and delegates crypto
 * verification to the Aptos SDK's `verifySignature`.
 */
export async function verifyAuthMessage(
  address: string,
  message: AuthMessage,
  signatureHex: string,
  publicKeyHex: string,
): Promise<boolean> {
  // 1. Verify nonce matches what we issued
  const stored = nonceStore.get(address.toLowerCase());
  if (!stored) return false;
  if (stored.nonce !== message.nonce) return false;
  if (Date.now() > stored.expiresAt) {
    nonceStore.delete(address.toLowerCase());
    return false;
  }

  // 2. Verify message hasn't expired
  const expiry = new Date(message.expirationTime).getTime();
  if (Date.now() > expiry) return false;

  // 3. Verify Ed25519 signature using Aptos SDK
  // Import dynamically to keep this module lightweight
  try {
    const { Ed25519PublicKey, Ed25519Signature } = await import(
      "@aptos-labs/ts-sdk"
    );
    const pubKey = new Ed25519PublicKey(publicKeyHex);
    const sig = new Ed25519Signature(signatureHex);
    const messageBytes = new TextEncoder().encode(serializeMessage(message));
    const valid = pubKey.verifySignature({ message: messageBytes, signature: sig });

    // Consume the nonce (one-time use)
    if (valid) {
      nonceStore.delete(address.toLowerCase());
    }
    return valid;
  } catch (err) {
    console.error("SIWA verification error:", err);
    return false;
  }
}

// ── JWT Functions (from Forsety jwt.ts) ───────────────────

/**
 * Sign a JWT with the user's address and role.
 */
export async function signJwt(
  config: AuthConfig,
  address: string,
  role: "brand" | "creator" | "admin" = "creator",
  chainId: number = 1,
): Promise<string> {
  const secret = new TextEncoder().encode(config.jwtSecret);
  const token = await new SignJWT({
    address,
    role,
    chainId,
  } as SIWAPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn || "7d")
    .setIssuer(config.domain)
    .setSubject(address)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT.
 */
export async function verifyJwt(
  config: AuthConfig,
  token: string,
): Promise<SIWAPayload | null> {
  try {
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.domain,
    });
    return payload as SIWAPayload;
  } catch {
    return null;
  }
}

/**
 * Extract session from Authorization header.
 * Expects: "Bearer <token>"
 */
export async function getSession(
  config: AuthConfig,
  authHeader: string | null,
): Promise<SIWAPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyJwt(config, token);
}

// ── Middleware helper ──────────────────────────────────────

/**
 * Express/Next.js middleware pattern.
 * Returns the authenticated session or throws 401.
 */
export async function requireAuth(
  config: AuthConfig,
  authHeader: string | null,
): Promise<SIWAPayload> {
  const session = await getSession(config, authHeader);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Role check middleware.
 */
export async function requireRole(
  config: AuthConfig,
  authHeader: string | null,
  requiredRole: "brand" | "creator" | "admin",
): Promise<SIWAPayload> {
  const session = await requireAuth(config, authHeader);
  if (session.role !== requiredRole && session.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}
