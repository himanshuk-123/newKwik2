/**
 * Vehicle-type-specific tyre field name mapping.
 * SAFETY NET ONLY: Used as last resort if API doesn't provide Appcolumn for tyres.
 * Tyre numbers differ per vehicle type (2W has 2 tyres, 4W has 4, etc.)
 */
export const TYRE_MAPPING: Record<string, { name: string; field: string }[]> = {
  "2W": [
    { name: "Front Tyre Image", field: "Tyre1" },
    { name: "Rear Tyre Image", field: "Tyre3" },
  ],
  "3W": [
    { name: "Front Tyre Image", field: "Tyre1" },
    { name: "Rear Left Tyre Image", field: "Tyre3" },
    { name: "Rear Right Tyre Image", field: "Tyre4" },
  ],
  "4W": [
    { name: "Front Left Tyre Image", field: "Tyre1" },
    { name: "Front Right Tyre Image", field: "Tyre2" },
    { name: "Rear Right Tyre Image", field: "Tyre3" },
    { name: "Rear Left Tyre Image", field: "Tyre4" },
  ],
  "FE": [
    { name: "Front Left Tyre Image", field: "Tyre1" },
    { name: "Front Right Tyre Image", field: "Tyre2" },
    { name: "Rear Right Tyre Image", field: "Tyre3" },
    { name: "Rear Left Tyre Image", field: "Tyre4" },
  ],
  "CV": [
    { name: "Front Left Tyre Image", field: "Tyre1" },
    { name: "Front Right Tyre Image", field: "Tyre2" },
    { name: "Rear Right Tyre Image", field: "Tyre3" },
    { name: "Rear Left Tyre Image", field: "Tyre4" },
  ],
  "CE": [
    { name: "Front Left Tyre Image", field: "Tyre1" },
    { name: "Front Right Tyre Image", field: "Tyre2" },
    { name: "Rear Right Tyre Image", field: "Tyre3" },
    { name: "Rear Left Tyre Image", field: "Tyre4" },
  ],
};

const loggedResolveAppColumns = new Set<string>();

const logResolveAppColumn = (key: string, message: string, method: 'log' | 'warn' = 'log') => {
  if (!__DEV__) return;
  if (loggedResolveAppColumns.has(key)) return;
  loggedResolveAppColumns.add(key);
  console[method](message);
};

/**
 * Resolve the correct API field name for a step.
 * STRATEGY (Matching Expo app): Trust API appColumn completely.
 * Priority: Appcolumn from API → TYRE_MAPPING (for tyre vehicle-type-specific) → "Other"
 *
 * This keeps it simple and reliable. If API doesn't return appColumn, it's a data issue,
 * not a fallback mapping maintenance issue.
 */
export const resolveAppColumn = (
  sideName: string,
  appcolumn: string | null | undefined,
  vehicleType: string
): string => {
  // 1. PRIMARY: Use appColumn from API (this should be reliable)
  if (appcolumn) {
    logResolveAppColumn(
      `api:${vehicleType}:${sideName}:${appcolumn}`,
      `[resolveAppColumn] ✓ Using API appColumn for "${sideName}": ${appcolumn}`
    );
    return appcolumn;
  }

  // 2. FALLBACK for tyres: Use vehicle-type-specific mapping
  const tyreEntry = TYRE_MAPPING[vehicleType.toUpperCase()]?.find(
    t => t.name.toLowerCase() === sideName.toLowerCase()
  );
  if (tyreEntry) {
    logResolveAppColumn(
      `tyre:${vehicleType}:${sideName}:${tyreEntry.field}`,
      `[resolveAppColumn] ✓ Using TYRE_MAPPING for "${sideName}" (${vehicleType}): ${tyreEntry.field}`
    );
    return tyreEntry.field;
  }

  // 3. LAST RESORT: "Other" (server accepts OtherBase64 as catch-all)
  logResolveAppColumn(
    `other:${vehicleType}:${sideName}`,
    `[resolveAppColumn] ⚠️ NO API appColumn for "${sideName}" (${vehicleType}) — using "Other". Check if API is returning appColumn correctly!`,
    'warn'
  );
  return "Other";
};
