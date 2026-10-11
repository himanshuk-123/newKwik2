import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import { COLORS } from "../constants/Colors";
import { getLeadsByStatus, fetchAndSaveLeadsByStatus } from "../services/LeadService";
import { useOnlineFirstData } from "../hooks/useOnlineFirstData";
import LeadSearchBar, { useLeadSearch } from "../components/LeadSearchBar";
import { convertDateString } from "../utils/convertDateString";
interface StatusLead {
  lead_uid: string;
  reg_no: string;
  customer_name: string;
  added_by_date: string;
  qc_update_date: string;
}

const LeadsInProgress = () => {
  const { data: leads, isLoading, refreshing, onRefresh } = useOnlineFirstData<StatusLead[]>({
    tag: "LeadsInProgress",
    initialData: [],
    readLocal: () => getLeadsByStatus("RoConfirmationLeads") as Promise<StatusLead[]>,
    fetchRemote: (token) => fetchAndSaveLeadsByStatus(token, "RoConfirmationLeads"),
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
        keyExtractor={(item) => item.lead_uid}
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
              <Text style={styles.statusText}>pending with qc</Text>
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
  container: {
    gap: 14,
  },
  card: {
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
  statusText: {
    fontSize: 14,
    color: COLORS.Dashboard.text.Orange,
    fontWeight: "700",
    textTransform: "capitalize",
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
