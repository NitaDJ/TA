'use client';
import { useState, useEffect, useCallback } from 'react';
import { getLatestData, getFanStatus } from '../lib/api';

export function useSensorData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const result = await getLatestData();
      setData(result);
      setConnected(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, loading, error, connected, refetch: fetch };
}

export function useFanStatus() {
  const [fan, setFan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await getFanStatus();
      setFan(result);
    } catch (err) {
      console.error('Fan status error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { fan, loading, refetch: fetch };
}