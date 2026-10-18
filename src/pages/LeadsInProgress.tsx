import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import { COLORS } from "../constants/Colors";
import { getLeadsByStatuses, fetchAndSaveLeadsByStatus } from "../services/LeadService";
import { IN_PROGRESS_STAGES } from "../constants/LeadStats";
import { useOnlineFirstData } from "../hooks/useOnlineFirstData";
import LeadSearchBar, { useLeadSearch } from "../components/LeadSearchBar";
import { convertDateString } from "../utils/convertDateString";
interface StatusLead {
  id: string;
  status_type: string;
  lead_uid: string;
  reg_no: string;
  customer_name: string;
  added_by_date: string;
  qc_update_date: string;
}

interface InProgressLead extends StatusLead {
  stageLabel: string;
  stageColor: string;
}

// Stage ke hisaab se label ka rang
const STAGE_COLORS: Record<string, string> = {
  RoConfirmationLeads: COLORS.Dashboard.text.Blue,
  QCLeads: COLORS.Dashboard.text.Orange,
  QCHoldLeads: "#dc2626",
  PricingLeads: COLORS.Dashboard.text.Green,
};

const STAGE_TYPES = IN_PROGRESS_STAGES.map(s => s.statusType);
const STAGE_BY_TYPE = new Map(IN_PROGRESS_STAGES.map(s => [s.statusType as string, s]));

/** Saare pending stages ki leads → ek list, har lead pe uska stage. Ek lead do stage me ho toh aage wala. */
const readInProgressLeads = async (): Promise<InProgressLead[]> => {
  const rows = (await getLeadsByStatuses(STAGE_TYPES)) as StatusLead[];
  const byLead = new Map<string, StatusLead>();
  for (const row of rows) {
    const key = row.id || row.lead_uid;
    const existing = byLead.get(key);
    const order = STAGE_BY_TYPE.get(row.status_type)?.order ?? 0;
    const existingOrder = existing ? STAGE_BY_TYPE.get(existing.status_type)?.order ?? 0 : -1;
    if (order > existingOrder) byLead.set(key, row);
  }
  return Array.from(byLead.values()).map(row => ({
    ...row,
    stageLabel: STAGE_BY_TYPE.get(row.status_type)?.label ?? "In Progress",
    stageColor: STAGE_COLORS[row.status_type] ?? COLORS.Dashboard.text.Orange,
  }));
};

/** Saare stages ek saath fetch — ek fail ho toh baaki ka fresh data phir bhi save ho */
const fetchInProgressLeads = async (token: string): Promise<void> => {
  const results = await Promise.allSettled(
    STAGE_TYPES.map(statusType => fetchAndSaveLeadsByStatus(token, statusType)),
  );
  if (results.every(r => r.status === "rejected")) {
    throw (results[0] as PromiseRejectedResult).reason;
  }
};

const LeadsInProgress = () => {
  const { data: leads, isLoading, refreshing, onRefresh } = useOnlineFirstData<InProgressLead[]>({
    tag: "LeadsInProgress",
    initialData: [],
    readLocal: readInProgressLeads,
    fetchRemote: fetchInProgressLeads,
  });
  const { query, setQuery, filtered } = useLeadSearch(leads);

  // Cache khali ho tabhi full-screen loader; warna cached list + top spinner
  if (isLoading && leads.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.AppTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrapper}>
        <LeadSearchBar value={query} onChangeText={setQuery} />
      </View>
      <FlatList
        data={filtered}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id || item.lead_uid}
        style={styles.screen}
        contentContainerStyle={styles.pagePadding}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[COLORS.AppTheme.primary]} />
        }
        renderItem={({ item: lead }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.leftColumn}>
                <Text style={styles.textMdPrimary} numberOfLines={1}>
                  Lead Id: <Text style={styles.textBold}>{lead.lead_uid}</Text>
                </Text>
                <Text style={styles.textMdPrimary} numberOfLines={1}>
                  Reg. Number: <Text style={styles.textBold}>{lead.reg_no}</Text>
                </Text>
                <Text style={styles.textMdSecondary} numberOfLines={1}>
                  Name: <Text style={styles.textUpper}>{lead.customer_name}</Text>
                </Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.textLabel}>Created Date</Text>
                <Text style={styles.textValue}>{convertDateString(lead.added_by_date)}</Text>
              </View>
            </View>

            <View style={styles.cardRowBottom}>
              <View style={[styles.stageBadge, { borderColor: lead.stageColor }]}>
                <Text style={[styles.statusText, { color: lead.stageColor }]}>{lead.stageLabel}</Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.textLabel}>Valuated Date</Text>
                <Text style={styles.textValue}>{convertDateString(lead.qc_update_date) || 'NA'}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noLeadsContainer}>
            <Text style={styles.noLeadsText}>{query ? "No leads match your search." : "No leads in progress"}</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
};
export default LeadsInProgress;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "white",
  },
  pagePadding: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  leftColumn: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  rightColumn: {
    gap: 4,
    alignItems: "flex-end",
  },
  textMdPrimary: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  textMdSecondary: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  textBold: {
    fontSize: 14,
    color: COLORS.AppTheme.primary,
    fontWeight: "700",
  },
  textUpper: {
    fontSize: 14,
    color: COLORS.AppTheme.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  textLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  textValue: {
    fontSize: 16,
    color: COLORS.AppTheme.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  stageBadge: {
    flexShrink: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  noLeadsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  noLeadsText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
