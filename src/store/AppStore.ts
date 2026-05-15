import { create } from 'zustand';
import { StoredUser, login, logout, getStoredUser } from '../services/AuthService';
import { fetchAndSaveDashboard, getDashboard } from '../services/DashboardService';
import { SyncManager } from '../services/Syncmanager';
import { DashboardRecord, LoginRequest } from '../types/api';
import { useValuationStore } from './valuation.store';
import { useCreateLeadStore } from './CreateLeadStore';

interface AppState {
  // Auth
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginProgress: number;
  loginMessage: string;
  error: string | null;
  isAppReady: boolean;

  // Dashboard
  dashboard: DashboardRecord | null;
  dashboardLoading: boolean;
  myTaskNeedsRefresh: boolean;
  hiddenMyTaskLeadIds: string[];

  // Actions
  loadStoredUser: () => Promise<void>;
  loginUser: (credentials: LoginRequest) => Promise<void>;
  logoutUser: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  markMyTaskNeedsRefresh: () => void;
  consumeMyTaskNeedsRefresh: () => boolean;
  hideLeadFromMyTask: (leadId: string) => void;
  clearHiddenMyTaskLead: (leadId: string) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginProgress: 0,
  loginMessage: '',
  isAppReady: false,
  error: null,
  dashboard: null,
  dashboardLoading: false,
  myTaskNeedsRefresh: false,
  hiddenMyTaskLeadIds: [],

  clearError: () => set({ error: null }),

  markMyTaskNeedsRefresh: () => set({ myTaskNeedsRefresh: true }),

  consumeMyTaskNeedsRefresh: () => {
    const { myTaskNeedsRefresh } = get();
    if (myTaskNeedsRefresh) {
      set({ myTaskNeedsRefresh: false });
    }
    return myTaskNeedsRefresh;
  },

  hideLeadFromMyTask: (leadId: string) => {
    if (!leadId) return;
    set(state => ({
      hiddenMyTaskLeadIds: state.hiddenMyTaskLeadIds.includes(leadId)
        ? state.hiddenMyTaskLeadIds
        : [...state.hiddenMyTaskLeadIds, leadId],
    }));
  },

  clearHiddenMyTaskLead: (leadId: string) => {
    if (!leadId) return;
    set(state => ({
      hiddenMyTaskLeadIds: state.hiddenMyTaskLeadIds.filter(id => id !== leadId),
    }));
  },

  /** App start par — DB mein user hai ya nahi check karo */
  loadStoredUser: async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        // Authenticated — isAppReady abhi false rehega, dashboard fetch ke baad true hoga
        set({ user, isAuthenticated: true });
      } else {
        // Not authenticated — ready hai, login screen dikhao
        set({ user: null, isAuthenticated: false, isAppReady: true });
      }
    } catch (e) {
      console.error('[STORE] loadStoredUser error:', e);
      set({ isAuthenticated: false, isAppReady: true });
    }
  },

  /** Login → API call → DB save → isAuthenticated true */
  loginUser: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null, loginProgress: 5, loginMessage: 'Starting login...' });
    try {
      const user = await login(credentials, ({ progress, message }) => {
        set({ loginProgress: progress, loginMessage: message });
      });
      set({ user, isAuthenticated: true, isLoading: false,isAppReady:true, loginProgress: 100, loginMessage: 'Ready'
       });
      console.log('[APP STORE] User logged in:', user);
    } catch (e: any) {
      set({ error: e.message ?? 'Login failed', isLoading: false, loginProgress: 0, loginMessage: '' });
      throw e;
    }
  },

  /** Logout → sab clear */
  logoutUser: async () => {
    console.log('[STORE] Logout initiated...');
    
    // 1. Destroy SyncManager (stop background upload listener)
    SyncManager.destroy();
    console.log('[STORE] SyncManager destroyed');
    
    // 2. Clear auth + data from storage
    await logout();
    console.log('[STORE] Auth & data cleared');
    
    // 3. Reset other Zustand stores
    useValuationStore.getState().reset();
    useCreateLeadStore.getState().reset();
    
    // 4. Clear app state
    set({
      user: null,
      isAuthenticated: false,
      dashboard: null,
      error: null,
      loginProgress: 0,
      loginMessage: '',
      isLoading: false,
    });
    console.log('[STORE] App state cleared — user should now see Login screen');
  },

  /** Seedha DB se dashboard lo — bas itna */
  fetchDashboard: async () => {
    const { user } = get();

    // ✅ FIX: Removed fragile (user as any)?.id fallback
    // user_id is the correct field from StoredUser interface — use it directly
    // If this is undefined, it means saveUser() didn't work — check AuthService logs
    const userId = user?.user_id;

    if (!userId) {
      console.warn('[STORE] No user_id found in stored user — skipping fetchDashboard');
      console.warn('[STORE] Current user object:', JSON.stringify(user));
      return;
    }

    console.log('[STORE] Using userId for dashboard fetch:', userId);
    set({ dashboardLoading: true,error:null });

    try {
      if (user?.token) {
        await fetchAndSaveDashboard(user.token, String(userId));
      } else {
        console.warn('[STORE] No token found for dashboard refresh — reading cached data only');
      }
    } catch (e: any) {
      console.error('[STORE] Dashboard API refresh failed:', e);
      set({ error: e.message ?? 'Dashboard refresh failed' });
    }

    try {
      const data = await getDashboard(String(userId));
      console.log('[STORE] getDashboard returned:', JSON.stringify(data));
      set({ dashboard: data, dashboardLoading: false });
    } catch (e: any) {
      console.error('[STORE] Local dashboard read failed:', e);
      set({ error: e.message ?? 'Dashboard fetch failed', dashboardLoading: false });
    }
  },
}));