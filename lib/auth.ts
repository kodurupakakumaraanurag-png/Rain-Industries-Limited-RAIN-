import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'VIEWER';
  department?: string;
  avatar?: string;
}

const COOKIE_NAME = 'rain_crm_session';

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 10);
}

export async function setSessionCookie(user: UserSession) {
  const cookieStore = cookies();
  const sessionData = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatar: user.avatar,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Base64 encode for simple cookie storage
  const encoded = Buffer.from(sessionData).toString('base64');

  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    if (parsed.exp && parsed.exp < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      department: parsed.department,
      avatar: parsed.avatar,
    };
  } catch (error) {
    return null;
  }
}

// Role Authorization checks
export function hasRole(session: UserSession | null, allowedRoles: string[]): boolean {
  if (!session) return false;
  return allowedRoles.includes(session.role);
}

export function canManageUsers(session: UserSession | null): boolean {
  return session?.role === 'ADMIN';
}

export function canEditLeads(session: UserSession | null): boolean {
  if (!session) return false;
  return ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(session.role);
}

export function canDeleteLeads(session: UserSession | null): boolean {
  if (!session) return false;
  return ['ADMIN', 'SALES_MANAGER'].includes(session.role);
}
