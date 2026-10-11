/**
 * TokenExpiryReminder — token expire hone se pehle din me ek baar popup
 *
 * App start + app foreground me aane par check hota hai.
 * Din ka log user ke button press karne pe save hota hai.
 * "Refresh Token" → RefreshToken API, "Not Now" → kal dobara poochenge.
 */

import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, InteractionManager, ToastAndroid } from 'react-native';
import { useAppStore } from '../store/AppStore';
import { getPendingExpiryReminder, logExpiryReminder } from '../services/TokenService';
import { isNetworkOnline } from '../utils/network';

const expiryMessage = (daysLeft: number): string => {
  if (daysLeft < 0) return 'Your session has expired. Refresh your token to keep using the app.';
  if (daysLeft === 0) return 'Your session expires today. Refresh your token to stay logged in.';
  if (daysLeft === 1) return 'Your session expires tomorrow. Refresh your token to stay logged in.';
  return `Your session expires in ${daysLeft} days. Refresh your token to stay logged in.`;
};

export default function TokenExpiryReminder() {
  const token = useAppStore(state => state.user?.token);
  const expireDate = useAppStore(state => state.user?.token_expire_date);
  const refreshUserToken = useAppStore(state => state.refreshUserToken);
  // Check chal raha hai ya popup screen pe hai — dobara trigger na ho
  const isBusyRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    try {
      if (!(await isNetworkOnline())) {
        await logExpiryReminder(expireDate, 'dismissed');
        ToastAndroid.show('No internet — please refresh when online', ToastAndroid.LONG);
        return;
      }
      await refreshUserToken();
      await logExpiryReminder(expireDate, 'refreshed');
      ToastAndroid.show('Token refreshed successfully', ToastAndroid.SHORT);
    } catch (e: any) {
      console.error('[TOKEN] Refresh failed:', e);
      await logExpiryReminder(expireDate, 'dismissed').catch(() => {});
      Alert.alert('Refresh Failed', e?.message || 'Could not refresh token. Please try again later.');
    } finally {
      isBusyRef.current = false;
    }
  }, [expireDate, refreshUserToken]);

  const handleNotNow = useCallback(() => {
    logExpiryReminder(expireDate, 'dismissed')
      .catch(e => console.error('[TOKEN] Reminder log failed:', e))
      .finally(() => { isBusyRef.current = false; });
  }, [expireDate]);

  const checkExpiry = useCallback(async () => {
    if (isBusyRef.current || !token) return;
    isBusyRef.current = true;
    let shown = false;
    try {
      const daysLeft = await getPendingExpiryReminder(expireDate);
      if (daysLeft === null) return;

      // Login → Dashboard transition khatam hone do, warna Android popup drop kar deta hai
      await new Promise<void>(resolve => InteractionManager.runAfterInteractions(() => resolve()));
      if (AppState.currentState !== 'active') return;

      // Log button press pe hota hai — popup na dikhe toh agli baar phir try hoga
      Alert.alert(
        'Token Expiring',
        expiryMessage(daysLeft),
        [
          { text: 'Not Now', style: 'cancel', onPress: handleNotNow },
          { text: 'Refresh Token', onPress: () => { handleRefresh(); } },
        ],
        { cancelable: false },
      );
      shown = true;
    } catch (e) {
      console.error('[TOKEN] Expiry check failed:', e);
    } finally {
      if (!shown) isBusyRef.current = false;
    }
  }, [token, expireDate, handleNotNow, handleRefresh]);

  useEffect(() => {
    checkExpiry();
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') checkExpiry();
    });
    return () => subscription.remove();
  }, [checkExpiry]);

  return null;
}
