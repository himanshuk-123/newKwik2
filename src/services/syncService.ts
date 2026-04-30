import { run, runBatch } from '../database/db';
import { STATE_CITY_LIST } from '../constants/StateCityList';

// ─── Service imports ─────────────────────────────────────────────────────────
import { fetchAndSaveDashboard } from './DashboardService';
import { saveCompanies } from './CompanyService';
import { saveAllVehicleTypes } from './VehicleTypeService';
import { saveAllYards } from './YardService';
import { fetchAndSaveAllStatusLeads } from './LeadService';
import { saveAppStepsForAllVehicleTypes } from './AppStepService';
import { fetchAndSaveCompletedLeads } from './AppLeadCompleted';
import { fetchAndSaveDaybook } from './AppLeadDaybook';
import { syncAllDropdownsForCategory, syncPendingVehicleDetails, syncMMVWarmup } from './VehicleDetailService';

// Re-export for backward compatibility
export { fetchAreasForCity } from './AreaService';
export { syncPendingLeads, resetStuckPendingLeads } from './LeadService';
export { saveAppStepsForAllVehicleTypes } from './AppStepService';
export { syncPendingVehicleDetails } from './VehicleDetailService';

export type SyncProgress = {
  stage: 'states' | 'core' | 'appSteps' | 'pendingQueue' | 'finalizing' | 'done';
  message: string;
  progress: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SYNC
// ─────────────────────────────────────────────────────────────────────────────
  
export const syncAllData = async (
  token: string,
  userId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<void> => {
  console.log('[SYNC] Starting sync...');

  const report = (stage: SyncProgress['stage'], message: string, progress: number) => {
    onProgress?.({ stage, message, progress });
  };

  // Step 1: States/Cities — local constants, no API (instant)
  report('states', 'Preparing local master data...', 45);
  await syncStatesAndCities();

  // Step 1.5: Companies first (vehicle types depend on company ids)
  await syncCompanies(token);

  // Step 2: ALL independent API syncs in parallel — login blocking time 15-20s → 3-5s
  // NOTE: syncAppSteps depends on leads being in DB, so it runs in Step 3
  report('core', 'Syncing dashboard and master data...', 60);
  await Promise.allSettled([
    syncDashboard(token, userId),
    syncYards(token),
    syncAllVehicleTypes(token),
    syncStatusLeads(token),
    syncCompletedLeads(token),
    syncDaybook(token),
    syncDropdowns(token),
  ]);

  // Step 2b: App Steps — needs leads in DB first (depends on syncStatusLeads)
  report('appSteps', 'Preparing checklist steps...', 75);
  await syncAppSteps(token);

  console.log('[SYNC] All API syncs done.');

  // Step 3: Pending queue sync — depends on above data being present
  report('pendingQueue', 'Syncing pending offline data...', 88);
  await syncPendingVehicleDetailsQueue(token);

  // Step 4: MMV warmup (background, non-blocking)
  // Login fast rahe, but VehicleDetails ke Make/Model/Variant caches fill hote rahein.
  report('finalizing', 'Finalizing login setup...', 96);
  syncMMVWarmup(token).catch((e: unknown) =>
    console.error('[SYNC] MMV warmup failed:', e)
  );

  report('done', 'Data ready.', 100);
  console.log('[SYNC] All done.');
};

// ─────────────────────────────────────────────────────────────────────────────
// STATES & CITIES — Constants se (0 API calls)
// ─────────────────────────────────────────────────────────────────────────────

const syncStatesAndCities = async (): Promise<void> => {
  try {
    const stateList = STATE_CITY_LIST.STATE_LIST.CircleList;
    const cityList = STATE_CITY_LIST.CITY_LIST.DataRecord;

    if (stateList.length) {
      await runBatch(
        'INSERT OR REPLACE INTO states (id, name) VALUES (?, ?)',
        stateList.map(s => [String(s.id), s.name])
      );
    }
    if (cityList.length) {
      await runBatch(
        'INSERT OR REPLACE INTO cities (id, name, state_id) VALUES (?, ?, ?)',
        cityList.map(c => [String(c.id), c.name, String(c.stateid ?? '')])
      );
    }
    console.log(`[SYNC] States: ${stateList.length}, Cities: ${cityList.length} done.`);
  } catch (e) {
    console.error('[SYNC] States/Cities failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const syncDashboard = async (token: string, userId: string): Promise<void> => {
  try {
    await fetchAndSaveDashboard(token, userId);
    await updateSyncMeta('dashboard');
  } catch (e) {
    console.error('[SYNC] Dashboard failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────────────────────────────────────

const syncCompanies = async (token: string): Promise<void> => {
  try {
    await saveCompanies(token);
    await updateSyncMeta('companies');
  } catch (e) {
    console.error('[SYNC] Companies failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLE TYPES
// ─────────────────────────────────────────────────────────────────────────────

const syncAllVehicleTypes = async (token: string): Promise<void> => {
  try {
    await saveAllVehicleTypes(token);
    await updateSyncMeta('vehicle_types');
  } catch (e) {
    console.error('[SYNC] Vehicle types failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// YARDS
// ─────────────────────────────────────────────────────────────────────────────

const syncYards = async (token: string): Promise<void> => {
  try {
    await saveAllYards(token);
    await updateSyncMeta('yards');
  } catch (e) {
    console.error('[SYNC] Yards failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS LEADS (har status ka alag data — ek table, generic loop)
// ─────────────────────────────────────────────────────────────────────────────

const syncStatusLeads = async (token: string): Promise<void> => {
  try {
    await fetchAndSaveAllStatusLeads(token);
    await updateSyncMeta('status_leads');
  } catch (e) {
    console.error('[SYNC] Status Leads failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APP STEPS
// ─────────────────────────────────────────────────────────────────────────────

const syncAppSteps = async (token: string): Promise<void> => {
  try {
    await saveAppStepsForAllVehicleTypes(token);
    await updateSyncMeta('app_steps');
  } catch (e) {
    console.error('[SYNC] App Steps failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETED LEADS (AppLeadCompleted API)
// ─────────────────────────────────────────────────────────────────────────────

const syncCompletedLeads = async (token: string): Promise<void> => {
  try {
    await fetchAndSaveCompletedLeads(token);
    await updateSyncMeta('completed_leads');
  } catch (e) {
    console.error('[SYNC] Completed Leads failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DAYBOOK (AppLeadDaybook API)
// ─────────────────────────────────────────────────────────────────────────────

const syncDaybook = async (token: string): Promise<void> => {
  try {
    await fetchAndSaveDaybook(token);
    await updateSyncMeta('daybook');
  } catch (e) {
    console.error('[SYNC] Daybook failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

const updateSyncMeta = async (apiName: string): Promise<void> => {
  await run(
    `INSERT OR REPLACE INTO sync_meta (api_name, last_synced_at, status) VALUES (?, CURRENT_TIMESTAMP, 'synced')`,
    [apiName]
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWNS (FuelType, VehicleTypeMode, ColorsType) — VehicleDetails ke liye
// ─────────────────────────────────────────────────────────────────────────────

const syncDropdowns = async (token: string): Promise<void> => {
  try {
    // Sab common vehicle categories ke liye sync
    const categories = ['2W', '3W', '4W', 'CV', 'FE', 'CE', 'REPO'];
    await Promise.allSettled(
      categories.map(cat => syncAllDropdownsForCategory(token, cat))
    );
    await updateSyncMeta('dropdown_cache');
    console.log('[SYNC] Dropdowns synced for all categories.');
  } catch (e) {
    console.error('[SYNC] Dropdowns failed:', e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PENDING VEHICLE DETAILS — Offline queue sync
// ─────────────────────────────────────────────────────────────────────────────

const syncPendingVehicleDetailsQueue = async (token: string): Promise<void> => {
  try {
    const result = await syncPendingVehicleDetails(token);
    if (result.synced > 0 || result.failed > 0) {
      console.log(`[SYNC] Vehicle details: ${result.synced} synced, ${result.failed} failed`);
    }
  } catch (e) {
    console.error('[SYNC] Pending vehicle details sync failed:', e);
  }
};
