import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from "react-native";
// @ts-ignore
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// @ts-ignore
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../constants/Colors";
import ClubSvg from "../assets/Club-svg";
import HSVG from "../assets/H-Svg";
import { useNavigation } from "@react-navigation/native";
import { fetchAndSaveLeadsByStatus, getLeadCountsByStatus } from "../services/LeadService";
import type { LeadStatusType } from "../constants/LeadStats";
import { useOnlineFirstData } from "../hooks/useOnlineFirstData";

/**
 * Har card ka number = usi list me kitni leads hain (jo card dabane pe khulti hai).
 * AppLeadCompleted API use nahi karte — wo user-specific nahi tha, numbers list se match nahi karte the.
 */
const CARD_STATUSES: LeadStatusType[] = ["QCLeads", "PricingLeads", "QCHoldLeads", "CompletedLeads"];

const EMPTY_COUNTS: Record<string, number> = Object.fromEntries(CARD_STATUSES.map(s => [s, 0]));

/** Charon list ek saath fetch — ek fail ho toh baaki ka fresh data phir bhi save ho */
const fetchCardLists = async (token: string): Promise<void> => {
  const results = await Promise.allSettled(
    CARD_STATUSES.map(statusType => fetchAndSaveLeadsByStatus(token, statusType)),
  );
  if (results.every(r => r.status === "rejected")) {
    throw (results[0] as PromiseRejectedResult).reason;
  }
};

interface LeadCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  onPress: () => void;
}

const LeadCard = ({ title, count, icon, onPress }: LeadCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{count} </Text>
          <Text style={styles.reportsText}>Reports</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CompletedLeads() {
  const navigation = useNavigation<any>();
  const { data: counts, isLoading, refreshing, onRefresh } = useOnlineFirstData({
    tag: "CompletedLeads",
    initialData: EMPTY_COUNTS,
    readLocal: () => getLeadCountsByStatus(CARD_STATUSES),
    fetchRemote: fetchCardLists,
  });

  const handleNavigation = (pageName: string) => {
    console.log("Navigate to:", pageName);
    // Placeholder for navigation logic
    navigation.navigate(pageName);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.AppTheme.primary]} />
      }
    >
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.AppTheme.primary} />
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      )}
      <View style={styles.grid}>
        <LeadCard
          title="QC Pending"
          count={counts.QCLeads ?? 0}
          icon={<ClubSvg />}
          onPress={() => handleNavigation("QCLeads")}
        />
        <LeadCard
          title="QC Completed"
          count={counts.PricingLeads ?? 0}
          icon={<HSVG />}
          onPress={() => handleNavigation("QCCompletedLeads")}
        />
        <LeadCard
          title="QC Hold"
          count={counts.QCHoldLeads ?? 0}
          icon={
            <MaterialIcons
              name="pause"
              size={75}
              color={COLORS.AppTheme.primary}
            />
          }
          onPress={() => handleNavigation("QCHoldLeads")}
        />
        <LeadCard
          title="Completed Lead"
          count={counts.CompletedLeads ?? 0}
          icon={
            <MaterialCommunityIcons
              name="check-decagram"
              size={75}
              color={COLORS.AppTheme.primary}
            />
          }
          onPress={() => handleNavigation("ValuationCompletedLeads")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // gap: 16,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  card: {
    width: '48%',
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180,
      marginBottom: 16,

  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  iconContainer: {
    marginVertical: 7,
    justifyContent: "center",
    alignItems: "center",
    height: 75,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  countText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.AppTheme.primary,
  },
  reportsText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4b5563",
  },
});
