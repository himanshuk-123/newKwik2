import { run, select } from '../database/db';
import type { AppStepListResponse, AppStepListDataRecord } from './types';
import { apiCall, APP_VERSION } from './ApiClient';
import { getLeadsByStatus } from './LeadService';
import { getStoredUser } from './AuthService';

// ─── API CALL ────────────────────────────────────────────────────────────────

export const fetchAppStepListApi = (
  token: string,
  leadId: string
): Promise<AppStepListResponse> =>
  apiCall<AppStepListResponse>('AppStepList', token, {
    Version: APP_VERSION,
    LeadId: leadId,
    StepName: '',
    DropDownName: '',
  });

// ─── DB SAVE ─────────────────────────────────────────────────────────────────

export const saveAppStepsForAllVehicleTypes = async (token: string): Promise<void> => {
  const allLeads = await getLeadsByStatus('AssignedLeads');
  if (!allLeads.length) return;

  const vehicleTypeMap = new Map<string, string>();
  for (const lead of allLeads) {
    if (lead.vehicle_type_value && !vehicleTypeMap.has(lead.vehicle_type_value)) {
      vehicleTypeMap.set(lead.vehicle_type_value, lead.id);
    }
  }

  for (const [vehicleType, sampleLeadId] of vehicleTypeMap.entries()) {
    try {
      const res = await fetchAppStepListApi(token, sampleLeadId);
      if (res.ERROR !== '0' || !res.DataList) continue;
      await run(
        `INSERT OR REPLACE INTO app_steps (vehicle_type, steps_data, synced_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [vehicleType, JSON.stringify(res.DataList)]
      );
      console.log(`[APP_STEP] Cached for ${vehicleType}: ${res.DataList.length} steps`);
    } catch (e) {
      console.error(`[APP_STEP] Failed for ${vehicleType}:`, e);
    }
  }
};

// ─── DB GET (with API fallback) ──────────────────────────────────────────────

export const getAppSteps = async (vehicleType: string, leadId?: string): Promise<AppStepListDataRecord[] | null> => {
  // 1. Try DB first
  const rows = await select<{ steps_data: string }>(
    'SELECT steps_data FROM app_steps WHERE vehicle_type = ? LIMIT 1',
    [vehicleType]
  );
  if (rows[0]) {
    try {
      const parsed = JSON.parse(rows[0].steps_data);
      if (parsed?.length) {
        console.log(`[APP_STEP] DB hit for ${vehicleType}: ${parsed.length} steps`);
        return parsed;
      }
    } catch {
      console.warn(`[APP_STEP] JSON parse failed for ${vehicleType}`);
    }
  }

  // 2. DB empty — fallback: fetch from API directly and cache
  console.log(`[APP_STEP] DB miss for ${vehicleType}, trying API fallback...`);
  try {
    const user = await getStoredUser();
    if (!user?.token) {
      console.warn('[APP_STEP] No token for API fallback');
      return null;
    }

    // Find a leadId for this vehicleType
    let resolvedLeadId = leadId;
    if (!resolvedLeadId) {
      const leads = await getLeadsByStatus('AssignedLeads');
      const match = leads.find((l: any) => l.vehicle_type_value === vehicleType);
      resolvedLeadId = match?.id;
    }
    if (!resolvedLeadId) {
      console.warn(`[APP_STEP] No lead found for vehicleType: ${vehicleType}`);
      return null;
    }

    const res = await fetchAppStepListApi(user.token, resolvedLeadId);
    if (res.ERROR !== '0' || !res.DataList?.length) {
      console.warn(`[APP_STEP] API fallback returned no data for ${vehicleType}`);
      return null;
    }

    // Cache in DB for next time
    await run(
      'INSERT OR REPLACE INTO app_steps (vehicle_type, steps_data, synced_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [vehicleType, JSON.stringify(res.DataList)]
    );
    console.log(`[APP_STEP] API fallback cached for ${vehicleType}: ${res.DataList.length} steps`);
    return res.DataList;
  } catch (e) {
    console.error(`[APP_STEP] API fallback failed for ${vehicleType}:`, e);
    return null;
  }
};
