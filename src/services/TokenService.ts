/**
 * TokenService — token expiry + RefreshToken API
 *
 * - Login / RefreshToken API ka ExpireDate `users.token_expire_date` me save hota hai
 * - Expiry se TOKEN_EXPIRY_REMINDER_DAYS din pehle se popup dikhta hai
 * - `token_expiry_reminders` table me har din ka log — popup din me sirf ek baar
 */

import { run, select } from '../database/db';
import { apiCall } from './ApiClient';
import type { RefreshTokenResponse } from './types';

/** Expiry se kitne din pehle reminder popup shuru ho */
export const TOKEN_EXPIRY_REMINDER_DAYS = 3

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, '0');

// ─── DATE HELPERS ────────────────────────────────────────────────────────────

/**
 * Server dates do format me aate hain:
 *  - Login:        "11/10/2026 9:24:44 PM"  (M/D/YYYY h:mm:ss AM/PM)
 *  - RefreshToken: "2028-05-07 21:51:35"    (YYYY-MM-DD HH:mm:ss)
 * Dono ko device local time ka Date bana do.
 */
export const parseServerDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const str = value.trim();

  const us = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (us) {
    const [, month, day, year, h, m, s, ampm] = us;
    let hours = Number(h);
    if (ampm) {
      const isPm = ampm.toUpperCase() === 'PM';
      if (hours === 12) hours = isPm ? 12 : 0;
      else if (isPm) hours += 12;
    }
    return new Date(Number(year), Number(month) - 1, Number(day), hours, Number(m), Number(s ?? 0));
  }

  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const [, year, month, day, h, m, s] = iso;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(h ?? 0), Number(m ?? 0), Number(s ?? 0));
  }

  console.warn('[TOKEN] Unrecognised ExpireDate format:', value);
  return null;
};

/** DB me ek hi format: "YYYY-MM-DD HH:mm:ss" (local time) */
export const normalizeExpireDate = (value?: string | null): string | null => {
  const d = parseServerDate(value);
  if (!d) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** Calendar days left (aaj = 0, kal = 1, expire ho chuka = negative) */
export const daysUntil = (expire: Date, now = new Date()): number => {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(expire.getFullYear(), expire.getMonth(), expire.getDate()).getTime();
  return Math.round((b - a) / DAY_MS);
};

// ─── API CALL ────────────────────────────────────────────────────────────────

export const refreshTokenApi = (token: string): Promise<RefreshTokenResponse> =>
  apiCall<RefreshTokenResponse>('RefreshToken', token, {
    tokenid: token,
    Version: 1,
  });

// ─── REFRESH + DB SAVE ───────────────────────────────────────────────────────

export const refreshToken = async (
  currentToken: string,
  userId: string,
): Promise<{ token: string; expireDate: string | null }> => {
  const res = await refreshTokenApi(currentToken);
  console.log('[TOKEN] RefreshToken response:', res.ERROR, res.STATUSCODE, res.MESSAGE, res.ExpireDate);

  if (res.ERROR !== '0' || res.STATUSCODE !== '1' || !res.TOKENID) {
    throw new Error(res.MESSAGE || 'Token refresh failed');
  }

  const expireDate = normalizeExpireDate(res.ExpireDate);
  await run(
    'UPDATE users SET token = ?, token_expire_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [res.TOKENID, expireDate, userId],
  );
  console.log('[TOKEN] ✅ Token refreshed, new expiry:', expireDate);
  return { token: res.TOKENID, expireDate };
};

// ─── DAILY REMINDER CHECK ────────────────────────────────────────────────────

/**
 * Popup dikhana hai ya nahi:
 *  - expiry TOKEN_EXPIRY_REMINDER_DAYS din ya usse kam door ho
 *  - aur aaj ka log `token_expiry_reminders` me na ho
 * Returns days left, ya null agar popup nahi dikhana.
 */
export const getPendingExpiryReminder = async (
  expireDate?: string | null,
): Promise<number | null> => {
  const expire = parseServerDate(expireDate);
  if (!expire) {
    console.log('[TOKEN] Reminder skipped — no expiry date saved:', expireDate);
    return null;
  }

  const daysLeft = daysUntil(expire);
  if (daysLeft > TOKEN_EXPIRY_REMINDER_DAYS) {
    console.log(`[TOKEN] Reminder skipped — ${daysLeft} days left (reminder at ${TOKEN_EXPIRY_REMINDER_DAYS})`);
    return null;
  }

  const rows = await select<{ reminder_date: string; action: string }>(
    'SELECT reminder_date, action FROM token_expiry_reminders WHERE reminder_date = ? LIMIT 1',
    [todayKey()],
  );
  if (rows.length) {
    console.log(`[TOKEN] Reminder skipped — already handled today (${rows[0].action})`);
    return null;
  }

  console.log(`[TOKEN] Reminder due — ${daysLeft} days left`);
  return daysLeft;
};

/** Aaj ka log — user ke button press karne pe save, taaki aaj dobara popup na aaye */
export const logExpiryReminder = async (
  expireDate: string | null | undefined,
  action: 'refreshed' | 'dismissed',
): Promise<void> => {
  await run(
    `INSERT INTO token_expiry_reminders (reminder_date, expire_date, action)
     VALUES (?, ?, ?)
     ON CONFLICT(reminder_date) DO UPDATE SET action = excluded.action`,
    [todayKey(), expireDate ?? null, action],
  );
  console.log(`[TOKEN] Reminder logged for today: ${action}`);
};

export const clearExpiryReminders = () => run('DELETE FROM token_expiry_reminders', []);
