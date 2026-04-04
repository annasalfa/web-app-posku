'use client';

import {useSyncExternalStore} from 'react';

export function useOnlineStatus() {
  return useSyncExternalStore(subscribeToConnectivity, getOnlineSnapshot, getOnlineServerSnapshot);
}

export function useMounted() {
  return useSyncExternalStore(subscribeToMount, getMountedSnapshot, getMountedServerSnapshot);
}

function subscribeToConnectivity(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return window.navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

function subscribeToMount() {
  return () => undefined;
}

function getMountedSnapshot() {
  return true;
}

function getMountedServerSnapshot() {
  return false;
}
