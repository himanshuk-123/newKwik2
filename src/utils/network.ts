import NetInfo from '@react-native-community/netinfo';

/** Connected + internet reachable (unknown ko online maano, Syncmanager jaisa) */
export const isNetworkOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
};
