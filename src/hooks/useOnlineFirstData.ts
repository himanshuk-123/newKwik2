/**
 * useOnlineFirstData — screen focus pe data load karne ka common pattern
 *
 * 1. Cached DB data turant dikhao (offline me bhi screen khali na rahe)
 * 2. Online hai → API se fetch → DB me save → DB se dobara read karke dikhao
 * 3. Offline hai / API fail → cached data hi dikhta rahega
 *
 * Pull-to-refresh bhi yahi flow use karta hai.
 */

import { useCallback, useRef, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../store/AppStore';
import { isNetworkOnline } from '../utils/network';

interface Options<T> {
  /** Log prefix, e.g. 'QCLeads' */
  tag: string;
  initialData: T;
  /** Local DB se read */
  readLocal: () => Promise<T>;
  /** API call + DB save */
  fetchRemote: (token: string) => Promise<unknown>;
}

export function useOnlineFirstData<T>({ tag, initialData, readLocal, fetchRemote }: Options<T>) {
  const token = useAppStore(state => state.user?.token);
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Latest callbacks refs me — taaki inline functions se focus effect baar-baar na chale
  const readLocalRef = useRef(readLocal);
  const fetchRemoteRef = useRef(fetchRemote);
  readLocalRef.current = readLocal;
  fetchRemoteRef.current = fetchRemote;

  const load = useCallback(
    async (isActive: () => boolean, fromPullToRefresh: boolean) => {
      // Step 1: cached data
      try {
        const cached = await readLocalRef.current();
        if (isActive()) setData(cached);
      } catch (e) {
        console.error(`[${tag}] DB read error:`, e);
      }

      // Step 2: online → API → DB → re-read
      const online = await isNetworkOnline().catch(() => false);
      if (!isActive()) return;
      setIsOffline(!online);

      if (!online || !token) {
        console.log(`[${tag}] Offline — showing cached data`);
        if (fromPullToRefresh) {
          ToastAndroid.show('Offline — showing cached data', ToastAndroid.SHORT);
        }
        return;
      }

      try {
        await fetchRemoteRef.current(token);
        const fresh = await readLocalRef.current();
        if (isActive()) setData(fresh);
        console.log(`[${tag}] ✅ Fetched from server & saved`);
      } catch (e) {
        console.error(`[${tag}] API fetch failed, showing cached data:`, e);
        if (isActive()) {
          ToastAndroid.show('Could not reach server — showing cached data', ToastAndroid.SHORT);
        }
      }
    },
    [tag, token],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      load(() => active, false).finally(() => {
        if (active) setIsLoading(false);
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(() => true, true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { data, isLoading, refreshing, isOffline, onRefresh };
}
