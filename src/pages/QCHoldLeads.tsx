import React from "react";
import {
  ActivityIndicator,
  Linking,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { COLORS } from "../constants/Colors";
import { getLeadsByStatus, fetchAndSaveLeadsByStatus } from "../services/LeadService";
import { useOnlineFirstData } from "../hooks/useOnlineFirstData";
import LeadSearchBar, { useLeadSearch } from "../components/LeadSearchBar";
import { convertDateString } from "../utils/convertDateString";

interface StatusLead {
  lead_uid: string;
  reg_no: string;
  prospect_no: string;
  view_url: string;
  added_by_date: string;
  updated_by_date: string;
  lead_remark: string;
}

const openUrlInBrowser = async (url?: string) => {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error("[QCHoldLeads] Failed to open URL:", error);
  }
};

const LeadCard = ({ lead }: { lead: StatusLead }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.topLeftComponent}>
          <Text style={styles.textMdSecondary} numberOfLines={1}>
            Lead Id: <Text style={styles.textBold}>{lead.lead_uid || "NA"}</Text>
          </Text>
          <Text style={styles.textMdSecondary} numberOfLines={1}>
            Reg. Number: <Text style={styles.textBold}>{lead.reg_no || "NA"}</Text>
          </Text>
          <Text style={styles.textMdSecondary} numberOfLines={1}>
            Loan Number: <Text style={styles.textBold}>{lead.prospect_no || "NA"}</Text>
          </Text>
          <View style={styles.remarkRow}>
            <Text style={styles.textMdSecondary}>hold remark: </Text>
            <Text style={[styles.textBold, styles.remarkText]}>{lead.lead_remark || "NA"}</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => openUrlInBrowser(lead.view_url)}>
            <Feather name="eye" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardRowBottom}>
        <View style={styles.bottomLeftColumn}>
          <Text style={styles.textMdSecondary}>Created Date</Text>
          <Text style={styles.textMdPrimary}>
            {convertDateString(lead.added_by_date)}
          </Text>
        </View>
        <View style={styles.bottomRightColumn}>
          <Text style={[styles.textMdSecondary, styles.textRight]}>
            Completed Date
          </Text>
          <Text style={[styles.textMdPrimary, styles.textCompleted]}>
            {convertDateString(lead.updated_by_date)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function QCHoldLeads() {
  const { data: qcHoldLeads, isLoading, refreshing, onRefresh } = useOnlineFirstData<StatusLead[]>({
    tag: "QCHoldLeads",
    initialData: [],
    readLocal: () => getLeadsByStatus("QCHoldLeads") as Promise<StatusLead[]>,
    fetchRemote: (token) => fetchAndSaveLeadsByStatus(token, "QCHoldLeads"),
  });
  const { query, setQuery, filtered } = useLeadSearch(qcHoldLeads);

  return (
    <View style={styles.screen}>
      <View style={styles.pagePadding}>
        <LeadSearchBar value={query} onChangeText={setQuery} />
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.AppTheme.primary} />
            <Text style={styles.loaderText}>Loading...</Text>
          </View>
        )}
        <FlatList
          data={filtered}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.lead_uid}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.AppTheme.primary]} />
          }
          renderItem={({ item }) => <LeadCard lead={item} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.noLeadsContainer}>
                <Text style={styles.noLeadsText}>{query ? "No leads match your search." : "No leads found."}</Text>
              </View>
            ) : null
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  pagePadding: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  topLeftComponent: {
    flex: 1,
    flexDirection: "column",
    gap: 6,
    paddingRight: 8,
  },
  iconRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bottomLeftColumn: {
    flexDirection: "column",
  },
  bottomRightColumn: {
    flexDirection: "column",
  },
  textMdSecondary: {
    fontSize: 14,
    color:"#0c0c0c",
    fontWeight: "600",
  },
  textMdPrimary: {
    fontSize: 14,
    color: COLORS.AppTheme.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  textBold: {
    fontWeight: "500",
    color: "#4c4d4e",
  },
  textRight: {
    textAlign: "right",
  },
  textCompleted: {
    color: COLORS.Dashboard?.text?.Green || COLORS.AppTheme.primary,
  },
  remarkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  remarkText: {
    flex: 1,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  noLeadsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noLeadsText: {
    fontSize: 16,
    color: "#6b7280",
  },
});