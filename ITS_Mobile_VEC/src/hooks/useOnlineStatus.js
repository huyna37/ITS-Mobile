import { useState, useEffect } from 'react';

function readNavigatorOnline() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(readNavigatorOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(readNavigatorOnline());
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

export function useNetworkType() {
  const [type, setType] = useState('unknown');

  useEffect(() => {
    if (typeof navigator === 'undefined') return undefined;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return undefined;
    const update = () => setType(conn.effectiveType || conn.type || 'unknown');
    update();
    conn.addEventListener('change', update);
    return () => conn.removeEventListener('change', update);
  }, []);

  return type;
}
