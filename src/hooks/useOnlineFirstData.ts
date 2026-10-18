/**
 * useOnlineFirstData — screen focus pe data load karne ka common pattern
 *
 * Online  → pehle API se fresh data (loader dikhega) → DB me save → wahi dikhao.
 *           Purana cached data beech me nahi dikhta.
 * Offline / API fail → local DB (cached) data dikhao.
 * Slow network → SLOW_NETWORK_MS ke baad cached data dikhao, API ka jawab aate hi fresh data se replace.
 *
 * Screen khuli ho tab real-time refresh:
 *  - internet wapas aaye (offline → online)
 *  - app background se wapas aaye
 * Pull-to-refresh bhi yahi flow use karta hai.
 */

import { useCallback, useRef, useState } from 'react';
import { AppState, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../store/AppStore';
import { isNetworkOnline } from '../utils/network';

/** Itni der me API jawab na de toh cached data dikha do (fresh baad me aa jayega) */
const SLOW_NETWORK_MS = 20000;

interface Options<T> {
  /** Log prefix, e.g. 'QCLeads' */
  tag: string;
  initialData: T;
  /** Local DB se read */
  readLocal: () => Promise<T>;
  /** API call + DB save */
  fetchRemote: (token: string) => Promise<unknown>;
}

type LoadReason = 'focus' | 'pull' | 'reconnect' | 'foreground';

export function useOnlineFirstData<T>({ tag, initialData, readLocal, fetchRemote }: Options<T>) {
  const token = useAppStore(state => state.user?.token);
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Latest callbacks refs me — taaki inline functions se focus effect baar-baar na chale
  const readLocalRef = useRef(readLocal);
  const fetchRemoteRef = useRef(fetchRemote);
  const initialDataRef = useRef(initialData);
  readLocalRef.current = readLocal;
  fetchRemoteRef.current = fetchRemote;

  // Ek waqt me ek hi load — reconnect + foreground ek saath aaye toh double API call na ho
  const inFlightRef = useRef<Promise<void> | null>(null);

  const showCached = useCallback(
    async (isActive: () => boolean) => {
      try {
        const cached = await readLocalRef.current();
        if (isActive()) setData(cached);
      } catch (e) {
        console.error(`[${tag}] DB read error:`, e);
      }
    },
    [tag],
  );

  const load = useCallback(
    (isActive: () => boolean, reason: LoadReason): Promise<void> => {
      // Load pehle se chal raha hai → uske khatam hone ke baad DB se (ab fresh) data dikhao
      if (inFlightRef.current) return inFlightRef.current.then(() => showCached(isActive));

      const run = async () => {
        const online = await isNetworkOnline().catch(() => false);
        if (!isActive()) return;
        setIsOffline(!online);

        // Offline → seedha cached data
        if (!online || !token) {
          console.log(`[${tag}] Offline — showing cached data`);
          await showCached(isActive);
          if (reason === 'pull') {
            ToastAndroid.show('Offline — showing cached data', ToastAndroid.SHORT);
          }
          return;
        }

        // Online → API se fresh data
        const fetchAndRead = async () => {
          await fetchRemoteRef.current(token);
          const fresh = await readLocalRef.current();
          if (isActive()) setData(fresh);
          console.log(`[${tag}] ✅ Fresh data from server (${reason})`);
        };

        let timer: ReturnType<typeof setTimeout> | undefined;
        const slowNetwork = new Promise<'slow'>(resolve => {
          timer = setTimeout(() => resolve('slow'), SLOW_NETWORK_MS);
        });
        const fetchTask = fetchAndRead().then(() => 'done' as const);

        try {
          const first = await Promise.race([fetchTask, slowNetwork]);
          if (first === 'slow') {
            // Network slow — abhi cached dikhao; fetch chalta rahega aur aate hi update karega
            console.log(`[${tag}] Slow network — showing cached data while fetching`);
            await showCached(isActive);
            if (isActive()) ToastAndroid.show('Slow network — showing saved data', ToastAndroid.SHORT);
            fetchTask.catch(e => console.error(`[${tag}] Background fetch failed:`, e));
          }
        } catch (e) {
          console.error(`[${tag}] API fetch failed, showing cached data:`, e);
          await showCached(isActive);
          if (isActive()) {
            ToastAndroid.show('Could not reach server — showing saved data', ToastAndroid.SHORT);
          }
        } finally {
          if (timer) clearTimeout(timer);
        }
      };

      const task = run().finally(() => {
        inFlightRef.current = null;
      });
      inFlightRef.current = task;
      return task;
    },
    [tag, token, showCached],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const isActive = () => active;

      // Pichli visit ka data mat dikhao — loader, phir sirf fresh (ya offline me cached) data
      setData(initialDataRef.current);
      setIsLoading(true);
      load(isActive, 'focus').finally(() => {
        if (active) setIsLoading(false);
      });

      // Real-time: internet wapas aate hi fresh data
      let wasOnline: boolean | null = null;
      const unsubscribeNet = NetInfo.addEventListener(state => {
        const online = Boolean(state.isConnected && state.isInternetReachable !== false);
        if (wasOnline === false && online) {
          console.log(`[${tag}] Back online — refreshing`);
          load(isActive, 'reconnect');
        }
        wasOnline = online; // pehla event sirf starting state note karta hai
      });

      // Real-time: app background se wapas aaye toh fresh data
      const appStateSub = AppState.addEventListener('change', next => {
        if (next === 'active') load(isActive, 'foreground');
      });

      return () => {
        active = false;
        unsubscribeNet();
        appStateSub.remove();
      };
    }, [load, tag]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(() => true, 'pull');
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { data, isLoading, refreshing, isOffline, onRefresh };
}
