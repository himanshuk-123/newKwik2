import React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ViewStyle, RefreshControl } from 'react-native';
import { COLORS } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getLeadsByStatus, fetchAndSaveLeadsByStatus } from '../services/LeadService';
import { getDaybook, fetchAndSaveDaybook } from '../services/AppLeadDaybook';
import { useOnlineFirstData } from '../hooks/useOnlineFirstData';
import LeadSearchBar, { useLeadSearch } from '../components/LeadSearchBar';
import { openUrlInBrowser } from '../utils/openUrlInBrowser';
import { share } from '../utils/share';
import { convertDateString } from '../utils/convertDateString';

interface StatusLead {
  lead_uid: string;
  reg_no: string;
  prospect_no: string;
  view_url: string;
  download_url: string;
  added_by_date: string;
  price_update_date: string;
}

interface DayBookData {
  lastmonth: number;
  thismonth: number;
  Today: number;
}

const EMPTY_DAYBOOK: DayBookData = { lastmonth: 0, thismonth: 0, Today: 0 };

interface CounterProps {
  primaryText: string;
  count: string | number;
  backgroundStyle: ViewStyle;
}

const Counter = (props: CounterProps) => {
  return (
    <View style={[styles.counterContainer, props.backgroundStyle]}>
      <Text style={styles.counterPrimaryText}>{props.primaryText}</Text>
      <Text style={styles.counterCount}>{props.count}</Text>
    </View>
  );
};

const ValuationCompletedLeadsPage = () => {
  const { data, isLoading, refreshing, onRefresh } = useOnlineFirstData({
    tag: 'ValuationCompleted',
    initialData: { leads: [] as StatusLead[], dayBook: EMPTY_DAYBOOK },
    readLocal: async () => {
      const [leads, dayBook] = await Promise.all([
        getLeadsByStatus('CompletedLeads'),
        getDaybook(),
      ]);
      return { leads: leads as StatusLead[], dayBook };
    },
    fetchRemote: async (token) => {
      // Ek API fail ho toh bhi doosri ka fresh data save ho jaye
      const results = await Promise.allSettled([
        fetchAndSaveLeadsByStatus(token, 'CompletedLeads'),
        fetchAndSaveDaybook(token),
      ]);
      if (results.every(r => r.status === 'rejected')) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
    },
  });
  const { leads, dayBook } = data;
  const { query, setQuery, filtered } = useLeadSearch(leads);

  const renderHeader = () => (
    <View style={styles.counterStack}>
      <Counter
        backgroundStyle={{ backgroundColor: COLORS.Dashboard.bg.Blue }}
        primaryText="TODAY'S COUNT"
        count={dayBook.Today}
      />
      <Counter
        backgroundStyle={{ backgroundColor: COLORS.Dashboard.bg.Green }}
        primaryText="TDM"
        count={dayBook.thismonth}
      />
      <Counter
        backgroundStyle={{ backgroundColor: COLORS.Dashboard.bg.Orange }}
        primaryText="PREV'S MONTH"
        count={dayBook.lastmonth}
      />
    </View>
  );

  if (isLoading && leads.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.AppTheme.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: StatusLead }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.columnDisplay}>
          <Text style={styles.textMd} numberOfLines={1}>
            Lead Id: <Text style={{ fontWeight: 'bold', color: 'black' }}>{item.lead_uid || 'NA'}</Text>
          </Text>
          <Text style={styles.textMd} numberOfLines={1}>
            Reg. Number : <Text style={{ fontWeight: 'bold', color: 'black' }}>{item.reg_no || 'NA'}</Text>
          </Text>
          <Text style={styles.textMd} numberOfLines={1}>
            Loan Number: <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'black' }}>{item.prospect_no || 'NA'}</Text>
          </Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => openUrlInBrowser(item.view_url)}>
            <Feather name="eye" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openUrlInBrowser(item.download_url)}>
            <Feather name="download-cloud" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => share(item.view_url)}>
            <Feather name="share" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardRowBottom}>
        <View style={styles.columnDisplay}>
          <Text style={styles.textSecondary}>Created Date</Text>
          <Text style={[styles.textMd, { fontWeight: '600', color: COLORS.AppTheme.primary }]}>
            {convertDateString(item.added_by_date)}
          </Text>
        </View>
        <View style={[styles.columnDisplay, { alignItems: 'flex-end' }]}>
          <Text style={styles.textSecondary}>Completed Date</Text>
          <Text style={[styles.textMd, { fontWeight: '600', color: COLORS.Dashboard.text.Green }]}>
            {convertDateString(item.price_update_date)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchWrapper}>
        <LeadSearchBar value={query} onChangeText={setQuery} />
      </View>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filtered}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
        keyExtractor={(item) => item.lead_uid?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.AppTheme.primary]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.center}>
              <Text style={styles.textXl}>{query ? 'No leads match your search.' : 'No completed leads found'}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchWrapper: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  listContent: {
    padding: 10,
    paddingTop: 0,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  columnDisplay: {
    flexDirection: 'column',
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15, // $3 gap approx
  },
  textMd: {
    fontSize: 14,
    color: '#666',
  },
  textXl: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  textSecondary: {
    fontSize: 12,
    color: '#888',
  },
  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  // Counter styles
  counterStack: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  counterContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 85,
    width: 100, // slightly adjusted from Expo 110 to fit different screens
    borderRadius: 8,
    paddingVertical: 10,
    paddingBottom: 15,
  },
  counterPrimaryText: {
    fontSize: 12,
    color: '#333',
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  counterCount: {
    fontSize: 24,
    color: COLORS.AppTheme.primary,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default ValuationCompletedLeadsPage;
