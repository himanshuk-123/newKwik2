import { loginApi } from '../services/ApiClient';
import { LoginRequest, LoginResponse } from '../types/api';
import { select, run } from '../database/db';
import { syncAllData } from './syncService';
import RNFS from 'react-native-fs';

export interface StoredUser {
  id: number;
  user_id: string;
  login_user_id: string;
  mobile: string;
  email: string;
  shop_name: string;
  token: string;
  role_id: number;
  role_name: string;
  sub_role_id: number;
  sub_role_name: string;
  profile_image: string;
  otp_check: string;
}

export type LoginProgress = {
  stage: 'authenticating' | 'savingUser' | 'syncing' | 'finalizing' | 'done';
  message: string;
  progress: number;
};

/** Save login response to local DB */
const saveUser = async (res: LoginResponse): Promise<void> => {
  await run(
    `INSERT OR REPLACE INTO users
      (user_id, login_user_id, mobile, email, shop_name, token,
       role_id, role_name, sub_role_id, sub_role_name, otp_check, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      res.USERID,
      res.LoginUserId,
      res.MOBILENUMBER,
      res.EMAIL,
      res.SHOPNAME,
      res.TOKENID,
      res.RoleId,
      res.RoleName,
      res.SubRoleId,
      res.SubRoleName,
      res.OTPCheck,
    ]
  );
};

/** Get saved user from local DB */
export const getStoredUser = async (): Promise<StoredUser | null> => {
  const rows = await select<StoredUser>('SELECT * FROM users LIMIT 1');
  return rows[0] ?? null;
};

/** Login — calls API, saves to DB, returns stored user */
export const login = async (
  credentials: LoginRequest,
  onProgress?: (progress: LoginProgress) => void
): Promise<StoredUser> => {
  onProgress?.({ stage: 'authenticating', message: 'Authenticating...', progress: 15 });
  const res = await loginApi(credentials);
  console.log('[AuthService] Login API response:', res);

  if (res.ERROR !== '0' || res.STATUSCODE !== '1') {
    throw new Error(res.MESSAGE || 'Login failed');
  }

  onProgress?.({ stage: 'savingUser', message: 'Saving account...', progress: 35 });
  await saveUser(res);

  onProgress?.({ stage: 'syncing', message: 'Syncing workspace data...', progress: 45 });
  await syncAllData(res.TOKENID, res.USERID, (syncProgress) => {
    onProgress?.({
      stage: 'syncing',
      message: syncProgress.message,
      progress: syncProgress.progress,
    });
  });

  onProgress?.({ stage: 'finalizing', message: 'Finishing setup...', progress: 98 });
  const user = await getStoredUser();
  if (!user) throw new Error('Failed to retrieve saved user');
  onProgress?.({ stage: 'done', message: 'Ready', progress: 100 });
  return user;
};

/** Clear user on logout */
export const logout = async (): Promise<void> => {
  // ── User & dashboard data ──
  await run('DELETE FROM users', []);
  await run('DELETE FROM dashboard', []);
  await run('DELETE FROM status_leads', []);
  await run('DELETE FROM completed_leads', []);
  await run('DELETE FROM daybook', []);
  // await run('DELETE FROM pending_leads', []);
  await run("UPDATE sync_meta SET status = 'pending', last_synced_at = NULL", []);

  // ── Image & vehicle detail queues ──
  await run('DELETE FROM pending_vehicle_details', []);
await run("DELETE FROM image_captures WHERE upload_status = 'uploaded'", []);
try {
  const leadsDir = `${RNFS.DocumentDirectoryPath}/kwikcheck/leads`;
  const exists = await RNFS.exists(leadsDir);
  if (exists) {
    const pendingLeads = await select<{ lead_id: string }>(
      "SELECT DISTINCT lead_id FROM image_captures WHERE upload_status IN ('pending', 'failed', 'uploading')"
    );
    const pendingLeadIds = new Set(pendingLeads.map(r => r.lead_id));
    const dirs = await RNFS.readDir(leadsDir);
    for (const dir of dirs) {
      if (!pendingLeadIds.has(dir.name)) {
        await RNFS.unlink(dir.path).catch(() => {});
      }
    }
  }
} catch (e) {
  console.warn('[Auth] Failed to delete local files:', e);
}
};