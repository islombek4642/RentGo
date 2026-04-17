import * as React from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to track internet connectivity status.
 */
export const useNetwork = () => {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
    });

    return () => removeNetInfoSubscription();
  }, []);

  return { isOffline };
};
