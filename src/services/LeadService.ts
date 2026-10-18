/**
 * LeadService — API call + DB save/get for leads
 * Generic approach: ek hi table `status_leads` with `status_type` column
 * Har status ke liye same functions — no repetition
 */

import { run, select, runBatch } from '../database/db';
import type { LeadListStatuswiseResponse, LeadRecord } from './types';
import { apiCall, APP_VERSION } from './ApiClient';
import { LEAD_STATUS_ID_MAP, type LeadStatusType } from '../constants/LeadStats';
import { incrementOfflineAssignedLeadCount } from './DashboardService';
import { submitCreateLeadApi } from './CreateLead';

// ─── API CALL ────────────────────────────────────────────────────────────────

export const fetchLeadListStatuswiseApi = (
  token: string,
  params: { StatusId?: number } = {}
): Promise<LeadListStatuswiseResponse> =>
  apiCall<LeadListStatuswiseResponse>('LeadListStatuswise', token, {
    Version: APP_VERSION,
    StatusId: params.StatusId ?? 0,
  });

// ─── HELPER: LeadRecord[] to DB rows ─────────────────────────────────────────

const mapLeadToRow = (statusType: string, l: LeadRecord): any[] => [
  statusType,
  String(l.Id),
  l.LeadUId ?? '',
  l.LeadId ?? '',
  l.RegNo ?? '',
  l.ProspectNo ?? '',
  l.CustomerName?.trim() ?? '',
  l.CustomerMobileNo ?? '',
  String(l.CompanyId ?? ''),
  l.companyname ?? '',
  l.Vehicle ?? '',
  String(l.VehicleType ?? ''),
  l.LeadTypeName ?? '',
  l.VehicleTypeValue ?? '',
  String(l.StateId ?? ''),
  l.statename ?? '',
  String(l.City ?? ''),
  l.cityname ?? '',
  String(l.Area ?? ''),
  l.areaname ?? '',
  String(l.ClientCityId ?? ''),
  l.Clientcityname ?? '',
  l.Pincode ?? '',
  l.ChassisNo ?? '',
  l.EngineNo ?? '',
  String(l.StatusId ?? ''),
  l.YardName ?? '',
  l.LeadReportId ? String(l.LeadReportId) : '',
  l.ViewUrl ?? '',
  l.DownLoadUrl ?? '',
  l.AppointmentDate ?? '',
  l.AddedByDate ?? '',
  String(l.RetailBillType ?? ''),
  l.RetailFeesAmount ?? 0,
  String(l.RepoBillType ?? ''),
  l.RepoFeesAmount ?? 0,
  String(l.CandoBillType ?? ''),
  l.CandoFeesAmount ?? 0,
  String(l.AssetBillType ?? ''),
  l.ValuatorName ?? '',
  l.AdminRo ?? '',
  l.QcUpdateDate ?? '',
  l.UpdatedByDate ?? '',
  l.LeadRemark ?? '',
  l.PriceUpdateDate ?? '',
  l.CompletedDate ?? '',
];

const STATUS_LEADS_INSERT_SQL = `INSERT OR REPLACE INTO status_leads (
  status_type, id, lead_uid, lead_id, reg_no, prospect_no,
  customer_name, customer_mobile, company_id, company_name,
  vehicle, vehicle_type_id, vehicle_type_name, vehicle_type_value,
  state_id, state_name, city_id, city_name,
  area_id, area_name, client_city_id, client_city_name,
  pincode, chassis_no, engine_no, status_id,
  yard_name, lead_report_id, view_url, download_url,
  appointment_date, added_by_date,
  retail_bill_type, retail_fees_amount,
  repo_bill_type, repo_fees_amount,
  cando_bill_type, cando_fees_amount,
  asset_bill_type, valuator_name, admin_ro, qc_update_date,
  updated_by_date, lead_remark,
  price_update_date, completed_date
) VALUES (
  ?,?,?,?,?,?,
  ?,?,?,?,
  ?,?,?,?,
  ?,?,?,?,
  ?,?,?,?,
  ?,?,?,?,
  ?,?,?,?,
  ?,?,
  ?,?,
  ?,?,
  ?,?,
  ?,?,?,?,
  ?,?,
  ?,?
)`;

// ─── FETCH + SAVE BY STATUS TYPE (Generic) ───────────────────────────────────

export const fetchAndSaveLeadsByStatus = async (
  token: string,
  statusType: LeadStatusType
): Promise<number> => {
  const statusId = Number(LEAD_STATUS_ID_MAP[statusType]);
  console.log(`[LEAD] Fetching for status: ${statusType} (StatusId: ${statusId})`);
  console.log('Token:', token);
  const res = await fetchLeadListStatuswiseApi(token, { StatusId: statusId });
console.log(`Response of ${statusType}: `,res);
  if (!res.DataRecord?.length) {
    // Is status me koi lead nahi — server empty list pe bhi Error "1" + "No Record" bhejta hai.
    // Purane cached leads hatao, warna completed lead "In Progress" me atki rehti hai.
    // Sirf token/login wale error pe cache rakho, taaki offline data na mite.
    const isAuthError = /token|session|unauthori|login|expire/i.test(res.MESSAGE ?? '');
    if (isAuthError) {
      console.warn(`[LEAD] ${statusType}: auth error, keeping cache:`, res.Error, res.MESSAGE);
      return 0;
    }
    await run("DELETE FROM status_leads WHERE status_type = ? AND id NOT LIKE 'OFFLINE_%'", [statusType]);
    console.log(`[LEAD] ${statusType}: server list empty, cache cleared (${res.Error} ${res.MESSAGE})`);
    return 0;
  }

  if (res.Error !== '0') {
    console.log(`[LEAD] ${statusType}: server error, keeping cache:`, res.Error, res.MESSAGE);
    return 0;
  }

  // Pehle iss statusType ka purana data delete karo (preserve offline created leads)
  await run("DELETE FROM status_leads WHERE status_type = ? AND id NOT LIKE 'OFFLINE_%'", [statusType]);

  await runBatch(
    STATUS_LEADS_INSERT_SQL,
    res.DataRecord.map(l => mapLeadToRow(statusType, l))
  );

  console.log(`[LEAD] ${statusType}: saved ${res.DataRecord.length}`);
  await reconcileOfflineLeads();
  return res.DataRecord.length;
};

// ─── FETCH + SAVE ALL STATUSES (Loop) ────────────────────────────────────────

export const fetchAndSaveAllStatusLeads = async (token: string): Promise<void> => {
  const statusTypes = Object.keys(LEAD_STATUS_ID_MAP) as LeadStatusType[];

  const results = await Promise.allSettled(
    statusTypes.map(st => fetchAndSaveLeadsByStatus(token, st))
  );

  let total = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') total += r.value;
  }
  console.log(`[LEAD] All statuses synced. Total records: ${total}`);
  await reconcileOfflineLeads();
};

// ─── SAVE OFFLINE CREATED LEAD TO LOCAL DB ────────────────────────────────────

export interface SaveOfflineLeadParams {
  payload: any;
  companyName?: string;
  stateName?: string;
  cityName?: string;
  areaName?: string;
  yardName?: string;
  vehicleTypeName?: string;
}

export const saveOfflineCreatedLead = async (params: SaveOfflineLeadParams): Promise<string> => {
  const { payload, companyName, stateName, cityName, areaName, yardName, vehicleTypeName } = params;
  const offlineId = `OFFLINE_${Date.now()}`;
  const regNoUpper = (payload.RegNo || '').toUpperCase();
  const prospectUpper = (payload.ProspectNo || '').toUpperCase();
  const custUpper = (payload.CustomerName || '').toUpperCase();
  const vehicleTypeVal = (payload.VehicleTypeValue || payload.Vehicle || '2W').toUpperCase();

  const row = [
    'AssignedLeads',                      // 1. status_type
    offlineId,                             // 2. id
    regNoUpper || offlineId,              // 3. lead_uid
    offlineId,                             // 4. lead_id
    regNoUpper,                            // 5. reg_no
    prospectUpper,                         // 6. prospect_no
    custUpper,                             // 7. customer_name
    payload.CustomerMobileNo || '',        // 8. customer_mobile
    String(payload.CompanyId || ''),       // 9. company_id
    companyName || '',                     // 10. company_name
    (payload.Vehicle || '').toUpperCase(), // 11. vehicle
    String(payload.VehicleType || ''),     // 12. vehicle_type_id
    vehicleTypeName || '',                 // 13. vehicle_type_name
    vehicleTypeVal,                        // 14. vehicle_type_value ("2W", "3W", etc.)
    String(payload.StateId || ''),         // 15. state_id
    stateName || '',                       // 16. state_name
    String(payload.City || ''),            // 17. city_id
    cityName || '',                        // 18. city_name
    String(payload.Area || ''),            // 19. area_id
    areaName || '',                        // 20. area_name
    String(payload.ClientCityId || ''),    // 21. client_city_id
    cityName || '',                        // 22. client_city_name
    payload.Pincode || '',                 // 23. pincode
    (payload.ChassisNo || '').toUpperCase(),// 24. chassis_no
    (payload.EngineNo || '').toUpperCase(), // 25. engine_no
    '1',                                   // 26. status_id
    yardName || '',                        // 27. yard_name
    '', '', '',                            // 28, 29, 30: report_id, view_url, download_url
    '',                                    // 31. appointment_date
    new Date().toISOString(),              // 32. added_by_date
    '', 0, '', 0, '', 0, '',               // 33-39: billing
    '', '', '', '', '', '', ''             // 40-46: remarks, dates
  ];

  await run(STATUS_LEADS_INSERT_SQL, row);
  await incrementOfflineAssignedLeadCount();
  console.log(`[LEAD] 💾 Saved offline created lead locally to status_leads: ${offlineId} (${regNoUpper})`);
  return offlineId;
};

// ─── HELPER: NORMALIZE REG NO FOR ROBUST MATCHING ────────────────────────────

const normalizeRegNo = (str?: string | null): string => {
  if (!str) return '';
  return str.replace(/[^A-Z0-9]/gi, '').toUpperCase();
};

// ─── RECONCILE OFFLINE LEADS AFTER SERVER SYNC ────────────────────────────────

export const reconcileOfflineLeads = async (): Promise<void> => {
  try {
    // 1. Discover ALL offline lead IDs from image_captures, pending_vehicle_details, AND status_leads
    const imgLeadIds = await select<{ lead_id: string }>(
      "SELECT DISTINCT lead_id FROM image_captures WHERE lead_id LIKE 'OFFLINE_%'"
    );
    const vdLeadIds = await select<{ lead_id: string }>(
      "SELECT DISTINCT lead_id FROM pending_vehicle_details WHERE lead_id LIKE 'OFFLINE_%'"
    );
    const statusLeadIds = await select<{ id: string }>(
      "SELECT DISTINCT id FROM status_leads WHERE id LIKE 'OFFLINE_%'"
    );

    const allOfflineIds = Array.from(
      new Set([
        ...imgLeadIds.map(r => r.lead_id),
        ...vdLeadIds.map(r => r.lead_id),
        ...statusLeadIds.map(r => r.id),
      ])
    ).filter(Boolean);

    if (!allOfflineIds.length) return;

    console.log(`[RECONCILE] 🔍 Found ${allOfflineIds.length} offline lead ID(s) to reconcile:`, allOfflineIds);

    // 2. Fetch all real server leads (non-offline) from status_leads
    const serverLeads = await select<{ id: string; reg_no: string }>(
      "SELECT id, reg_no FROM status_leads WHERE id NOT LIKE 'OFFLINE_%' AND reg_no IS NOT NULL AND reg_no != ''"
    );

    // 3. Fetch pending_leads payloads for fallback reg_no lookup
    const pendingLeadsRows = await select<{ payload: string }>(
      "SELECT payload FROM pending_leads"
    );
    const pendingRegNos: Record<string, string> = {};
    for (const p of pendingLeadsRows) {
      try {
        const parsed = JSON.parse(p.payload);
        if (parsed?.RegNo) {
          const clean = normalizeRegNo(parsed.RegNo);
          if (clean) pendingRegNos[clean] = parsed.RegNo;
        }
      } catch {}
    }

    // 4. Reconcile each offline ID
    for (const offId of allOfflineIds) {
      // Find reg_no for this offId from status_leads
      const statusMatch = await select<{ reg_no: string }>(
        "SELECT reg_no FROM status_leads WHERE id = ? LIMIT 1",
        [offId]
      );
      let rawRegNo = statusMatch[0]?.reg_no || '';
      let cleanRegNo = normalizeRegNo(rawRegNo);

      // Match against serverLeads by normalized reg_no
      let serverMatch = serverLeads.find(
        s => normalizeRegNo(s.reg_no) === cleanRegNo && cleanRegNo.length > 0
      );

      // Fallback: check pending_leads payload map if cleanRegNo was empty
      if (!serverMatch) {
        for (const s of serverLeads) {
          const sClean = normalizeRegNo(s.reg_no);
          if (sClean && pendingRegNos[sClean]) {
            serverMatch = s;
            break;
          }
        }
      }

      if (serverMatch) {
        const realServerId = serverMatch.id;
        console.log(`[RECONCILE] 🔄 Reconciling offline lead ${offId} -> Real Server ID ${realServerId} (RegNo: ${serverMatch.reg_no})`);
        
        await run("UPDATE image_captures SET lead_id = ? WHERE lead_id = ?", [realServerId, offId]);
        await run("UPDATE pending_vehicle_details SET lead_id = ? WHERE lead_id = ?", [realServerId, offId]);

        // Replace stale offId inside JSON payload string in pending_vehicle_details
        const vdRows = await select<{ id: number; payload: string }>(
          "SELECT id, payload FROM pending_vehicle_details WHERE lead_id = ?",
          [realServerId]
        );
        for (const vRow of vdRows) {
          if (vRow.payload && vRow.payload.includes(offId)) {
            const updatedPayload = vRow.payload.replace(new RegExp(offId, 'g'), realServerId);
            await run("UPDATE pending_vehicle_details SET payload = ? WHERE id = ?", [updatedPayload, vRow.id]);
            console.log(`[RECONCILE] ✏️ Updated JSON payload for pending_vehicle_details #${vRow.id}`);
          }
        }

        await run("DELETE FROM status_leads WHERE id = ?", [offId]);
      } else {
        console.warn(`[RECONCILE] ⚠️ Could not find server match for offline lead ${offId} (RegNo: ${rawRegNo || cleanRegNo})`);
      }
    }
  } catch (e) {
    console.error('[RECONCILE] reconcileOfflineLeads failed:', e);
  }
};

// ─── SYNC PENDING OFFLINE CREATED LEADS TO SERVER ────────────────────────────

export const syncPendingLeads = async (token: string): Promise<{ synced: number; failed: number }> => {
  let synced = 0;
  let failed = 0;

  try {
    const pendingLeads = await select<{ id: number; payload: string; retry_count: number }>(
      "SELECT * FROM pending_leads WHERE status = 'pending' AND retry_count < 9 ORDER BY created_at ASC"
    );

    if (!pendingLeads.length) {
      await reconcileOfflineLeads();
      return { synced: 0, failed: 0 };
    }

    console.log(`[LEAD] 🔄 Processing ${pendingLeads.length} pending offline leads...`);

    for (const item of pendingLeads) {
      try {
        const payload = JSON.parse(item.payload);
        console.log(`[LEAD] Submitting offline lead #${item.id}:`, payload.RegNo);
        const res = await submitCreateLeadApi(token, payload);

        const isSuccess = res.ERROR === '0' ||
          res.MESSAGE?.toLowerCase().includes('already') ||
          res.MESSAGE?.toLowerCase().includes('exist');

        // Extract direct server lead ID if returned in API response
        const serverIdFromResponse =
          (res as any).DataRecord?.[0]?.id ||
          (res as any).DataRecord?.[0]?.LeadId ||
          (res as any).LeadId ||
          (res as any).Id ||
          (res as any).id;

        if (isSuccess) {
          await run("UPDATE pending_leads SET status = 'synced', last_tried_at = CURRENT_TIMESTAMP WHERE id = ?", [item.id]);
          synced++;
          console.log(`[LEAD] ✅ Synced offline lead #${item.id} (${payload.RegNo})`, serverIdFromResponse ? `-> Server ID ${serverIdFromResponse}` : '');
        } else {
          await run("UPDATE pending_leads SET retry_count = retry_count + 1, last_tried_at = CURRENT_TIMESTAMP, last_error = ? WHERE id = ?", [res.MESSAGE ?? 'Server error', item.id]);
          failed++;
          console.warn(`[LEAD] ⚠️ Server rejected offline lead #${item.id}:`, res.MESSAGE);
        }
      } catch (e: any) {
        await run("UPDATE pending_leads SET retry_count = retry_count + 1, last_tried_at = CURRENT_TIMESTAMP, last_error = ? WHERE id = ?", [e?.message ?? 'Network error', item.id]);
        failed++;
        console.error(`[LEAD] ❌ Sync error for offline lead #${item.id}:`, e);
      }
    }

    // Delete synced pending leads
    await run("DELETE FROM pending_leads WHERE status = 'synced'");

    // Fetch fresh server assigned leads to populate status_leads and reconcile
    console.log('[LEAD] 🔄 Fetching server assigned leads to obtain real server IDs...');
    await fetchAndSaveLeadsByStatus(token, 'AssignedLeads');
    await reconcileOfflineLeads();
  } catch (e) {
    console.error('[LEAD] syncPendingLeads failed:', e);
  }

  return { synced, failed };
};


// ─── DB GET ──────────────────────────────────────────────────────────────────

/** status_leads table se data — statusType ke basis par */
export const getLeadsByStatus = async (statusType: LeadStatusType): Promise<any[]> => {
  return select(
    'SELECT * FROM status_leads WHERE status_type = ? ORDER BY added_by_date DESC',
    [statusType]
  );
};

/** Kai status ki leads ek saath (Leads In Progress ke liye) */
export const getLeadsByStatuses = async (statusTypes: LeadStatusType[]): Promise<any[]> => {
  if (!statusTypes.length) return [];
  const placeholders = statusTypes.map(() => '?').join(',');
  return select(
    `SELECT * FROM status_leads WHERE status_type IN (${placeholders}) ORDER BY added_by_date DESC`,
    statusTypes
  );
};

/** Har status me kitni leads saved hain — card ke numbers (list ki length ke barabar) */
export const getLeadCountsByStatus = async (
  statusTypes: LeadStatusType[]
): Promise<Record<string, number>> => {
  const counts: Record<string, number> = Object.fromEntries(statusTypes.map(t => [t, 0]));
  if (!statusTypes.length) return counts;
  const placeholders = statusTypes.map(() => '?').join(',');
  const rows = await select<{ status_type: string; total: number }>(
    `SELECT status_type, COUNT(*) AS total FROM status_leads WHERE status_type IN (${placeholders}) GROUP BY status_type`,
    statusTypes
  );
  for (const r of rows) counts[r.status_type] = Number(r.total) || 0;
  return counts;
};

// ─── PENDING LEADS RESET ──────────────────────────────────────────────────────

/**
 * Stuck pending leads reset karo — app startup pe call hoga
 * retry_count >= 15 wale leads ko reset karo (1 hour baad)
 */
export const resetStuckPendingLeads = async (): Promise<void> => {
  const stuck = await select<{ id: number; last_error: string | null }>(
    "SELECT id, last_error FROM pending_leads WHERE status = 'pending' AND retry_count >= 15"
  );
  if (!stuck.length) return;
  console.log(`[LEAD] Resetting ${stuck.length} stuck pending leads (retry_count >= 15)`);
  await run(
    "UPDATE pending_leads SET retry_count = 0 WHERE status = 'pending' AND retry_count >= 5",
    []
  );
};
