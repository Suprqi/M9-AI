import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Plan, Role } from "@prisma/client";

import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";

export const SESSION_COOKIE = "m9_session";
const SESSION_TTL_DAYS = 30;

/**
 * The cookie carries a random token; the database stores only its HMAC. A leaked
 * database dump therefore cannot be replayed as a valid session.
 */
function hashToken(token: string): string {
  return createHmac("sha256", getEnv().AUTH_SECRET).update(token).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  companyId: string | null;
  companyName: string | null;
  plan: Plan;
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {}
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta.userAgent?.slice(0, 255) ?? null,
      ip: meta.ip?.slice(0, 45) ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/** Revokes every session for a user — powers "تسجيل الخروج من جميع الأجهزة". */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Resolves the signed-in user. Memoized per-request so a page can call it from
 * several components without extra queries.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: { company: true, subscription: true },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    companyId: user.companyId,
    companyName: user.company?.name ?? null,
    plan: user.subscription?.plan ?? "FREE",
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AppError("FORBIDDEN");
  return user;
}

/** Constant-time comparison helper for any future token checks. */
export function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
