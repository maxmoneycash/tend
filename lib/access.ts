import type { TribeId } from "./tribes";
import { tribes } from "./tribes";

type SessionUser = {
  email?: string;
  org_id?: string;
  [key: string]: unknown;
};

const ORG_ENV: Record<TribeId, string> = {
  ramaytush: "TEND_ORG_RAMAYTUSH",
  muwekma: "TEND_ORG_MUWEKMA",
};

const ADMIN_ENV: Record<TribeId, string> = {
  ramaytush: "TEND_ADMINS_RAMAYTUSH",
  muwekma: "TEND_ADMINS_MUWEKMA",
};

/**
 * A user may administer a tribe's tenant when their Auth0 Organization
 * matches (production path) or their email is on the tribe's allowlist
 * (hackathon path, no org setup required).
 */
export function canAccessTribe(user: SessionUser, tribeId: TribeId): boolean {
  const orgId = process.env[ORG_ENV[tribeId]];
  if (orgId && user.org_id === orgId) return true;

  const allow = (process.env[ADMIN_ENV[tribeId]] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (user.email && allow.includes(user.email.toLowerCase())) return true;

  return false;
}

export function accessibleTribes(user: SessionUser): TribeId[] {
  return (Object.keys(tribes) as TribeId[]).filter((id) =>
    canAccessTribe(user, id),
  );
}
