import { useState, useEffect, useCallback } from 'react';
import type { PositionsCurrent, Snapshot, TransactionLine, PriceLine } from '../types';
import { fetchJSON, fetchNDJSON, fileExists, DataError } from './fileReaders';

// Generic data fetching hook
export function useDataFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  refreshInterval?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as DataError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

// Positions current hook
export function usePositionsCurrent(refreshInterval = 30000) {
  return useDataFetch(
    () => fetchJSON<PositionsCurrent>('positions_current.json'),
    [],
    refreshInterval
  );
}

// Snapshots hook
export function useSnapshots(limit?: number) {
  return useDataFetch(
    () => fetchNDJSON<Snapshot>('snapshots.ndjson', { limit }),
    [limit]
  );
}

// Transactions hook
export function useTransactions(symbol?: string, limit = 1000) {
  return useDataFetch(
    async () => {
      const exists = await fileExists('transactions.ndjson');
      if (!exists) return [];
      
      const transactions = await fetchNDJSON<TransactionLine>('transactions.ndjson', { limit });
      return symbol 
        ? transactions.filter(t => t.symbol === symbol)
        : transactions;
    },
    [symbol, limit]
  );
}

// Prices hook
export function usePrices(symbol?: string, limit = 10000) {
  return useDataFetch(
    async () => {
      const exists = await fileExists('prices.ndjson');
      if (!exists) return [];
      
      const prices = await fetchNDJSON<PriceLine>('prices.ndjson', { limit });
      return symbol 
        ? prices.filter(p => p.symbol === symbol)
        : prices;
    },
    [symbol, limit]
  );
}

// Combined dashboard data hook
export function useDashboardData() {
  const positions = usePositionsCurrent();
  const snapshots = useSnapshots(100); // Last 100 snapshots for mini-chart

  return {
    positions,
    snapshots,
    loading: positions.loading || snapshots.loading,
    error: positions.error || snapshots.error,
    refetch: () => {
      positions.refetch();
      snapshots.refetch();
    }
  };
}

// Theme hook
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check for saved preference
    const saved = localStorage.getItem('dca-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dca-theme', newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, toggleTheme };
}