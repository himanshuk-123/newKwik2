/**
 * VehicleTypeService — API call + DB save/get for vehicle types
 */

import { run, select, runBatch } from '../database/db';
import type { CompanyVehicleTypeResponse } from './types';
import { apiCall } from './ApiClient';
import { getCompanyIds } from './CompanyService';

// ─── API CALL ────────────────────────────────────────────────────────────────

export const fetchCompanyVehicleTypesApi = (
  token: string,
  companyId: string | number
): Promise<CompanyVehicleTypeResponse> =>
  apiCall<CompanyVehicleTypeResponse>(`CompanyVehicleList?companyId=${companyId}`, token, {});

// ─── DB SAVE ─────────────────────────────────────────────────────────────────

export const saveAllVehicleTypes = async (token: string): Promise<number> => {
  const companies = await getCompanyIds();
  if (!companies.length) return 0;

  // ✅ Pehle saara data fetch karo — DELETE nahi
  const results = await Promise.allSettled(
    companies.map(async c => {
      const res = await fetchCompanyVehicleTypesApi(token, c.id);
      if (res.Error !== '0' || !res.DataRecord?.length) return [];
      return res.DataRecord.map(v => [String(v.id), String(c.id), v.name, v.name1 ?? '']);
    })
  );

  const allRows: any[][] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allRows.push(...r.value);
    if (r.status === 'rejected') {
      console.error('[VEHICLE_TYPE] Company fetch failed:', r.reason);
    }
  }

  // ✅ Agar koi data nahi aaya — purana data safe rakho
  if (!allRows.length) {
    console.warn('[VEHICLE_TYPE] No fresh rows fetched. Keeping existing local vehicle_types data.');
    return 0;
  }

  // ✅ Data confirmed hai — ab DELETE karo phir INSERT
  await run('DELETE FROM vehicle_types');
  await runBatch(
    'INSERT OR REPLACE INTO vehicle_types (id, company_id, name, vehicle_categories) VALUES (?, ?, ?, ?)',
    allRows
  );

  console.log(`[VEHICLE_TYPE] Saved: ${allRows.length}`);
  return allRows.length;
};

// ─── DB GET ──────────────────────────────────────────────────────────────────

export const getVehicleTypes = async (
  companyId?: string
): Promise<{ id: string; name: string; company_id: string; vehicle_categories: string }[]> => {
  if (companyId) {
    return select(
      'SELECT id, name, company_id, vehicle_categories FROM vehicle_types WHERE company_id = ? ORDER BY name',
      [companyId]
    );
  }
  return select('SELECT id, name, company_id, vehicle_categories FROM vehicle_types ORDER BY name');
};