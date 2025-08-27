import { useMemo } from 'react';
import type { PositionsCurrent, Snapshot, ChartDataPoint, SymbolChartData, TimeRange } from '../types';

// Time range options
export const TIME_RANGES: TimeRange[] = [
  { label: '24h', value: '24h', hours: 24 },
  { label: '7d', value: '7d', hours: 24 * 7 },
  { label: '30d', value: '30d', hours: 24 * 30 },
  { label: 'All', value: 'all' },
];

// Utility functions
export function formatCurrency(amount: string | number, currency = 'USDC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace('$', `$${currency === 'USDC' ? '' : currency + ' '}`);
}

export function formatPercent(percent: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format(percent / 100);
}

export function formatQuantity(qty: string): string {
  const num = parseFloat(qty);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(num);
}

// Dashboard selectors
export interface DashboardKPIs {
  totalInvested: number;
  totalMarketValue: number;
  totalUnrealizedPl: number;
  totalUnrealizedPlPercent: number;
  baseCurrency: string;
  lastUpdated: string;
  positionCount: number;
}

export function useDashboardKPIs(positionsCurrent: PositionsCurrent | null): DashboardKPIs | null {
  return useMemo(() => {
    if (!positionsCurrent) return null;

    const totalInvested = parseFloat(positionsCurrent.total_quote_invested);
    
    // Calculate market value and P/L from positions
    let totalMarketValue = 0;
    let hasMarketData = false;

    positionsCurrent.positions.forEach(pos => {
      if (pos.market_value) {
        totalMarketValue += parseFloat(pos.market_value);
        hasMarketData = true;
      } else if (pos.price && pos.open_quantity) {
        // Fallback calculation
        totalMarketValue += parseFloat(pos.price) * parseFloat(pos.open_quantity);
        hasMarketData = true;
      }
    });

    // If no market data available, use invested amount as fallback
    if (!hasMarketData) {
      totalMarketValue = totalInvested;
    }

    const totalUnrealizedPl = totalMarketValue - totalInvested;
    const totalUnrealizedPlPercent = totalInvested > 0 ? (totalUnrealizedPl / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalMarketValue,
      totalUnrealizedPl,
      totalUnrealizedPlPercent,
      baseCurrency: positionsCurrent.base_currency,
      lastUpdated: positionsCurrent.updated_at,
      positionCount: positionsCurrent.positions.length,
    };
  }, [positionsCurrent]);
}

// Enhanced position data for the table
export interface EnhancedPosition {
  symbol: string;
  openQty: number;
  totalCost: number;
  avgCost: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPl?: number;
  unrealizedPlPercent?: number;
}

export function useEnhancedPositions(positionsCurrent: PositionsCurrent | null): EnhancedPosition[] {
  return useMemo(() => {
    if (!positionsCurrent?.positions) return [];

    return positionsCurrent.positions.map(pos => {
      const openQty = parseFloat(pos.open_quantity); // Use 'open_quantity' from bot data
      const totalCost = parseFloat(pos.total_cost);
      const avgCost = pos.avg_cost ? parseFloat(pos.avg_cost) : totalCost / openQty; // Calculate if not present
      
      let currentPrice: number | undefined;
      let marketValue: number | undefined;
      let unrealizedPl: number | undefined;
      let unrealizedPlPercent: number | undefined;

      if (pos.price) {
        currentPrice = parseFloat(pos.price);
      }

      if (pos.market_value) {
        marketValue = parseFloat(pos.market_value);
        unrealizedPl = marketValue - totalCost;
        unrealizedPlPercent = totalCost > 0 ? (unrealizedPl / totalCost) * 100 : 0;
      } else if (currentPrice && openQty > 0) {
        // Fallback calculation
        marketValue = currentPrice * openQty;
        unrealizedPl = marketValue - totalCost;
        unrealizedPlPercent = totalCost > 0 ? (unrealizedPl / totalCost) * 100 : 0;
      }

      return {
        symbol: pos.symbol,
        openQty,
        totalCost,
        avgCost,
        currentPrice,
        marketValue,
        unrealizedPl,
        unrealizedPlPercent,
      };
    });
  }, [positionsCurrent]);
}

// Chart data selectors
export function useChartData(
  snapshots: Snapshot[],
  timeRange: TimeRange,
  selectedSymbols: string[] = []
): { portfolioData: ChartDataPoint[]; symbolData: SymbolChartData[] } {
  return useMemo(() => {
    if (!snapshots.length) {
      return { portfolioData: [], symbolData: [] };
    }

    // Filter by time range
    let filteredSnapshots = snapshots;
    if (timeRange.hours) {
      const cutoffTime = Date.now() - (timeRange.hours * 60 * 60 * 1000);
      filteredSnapshots = snapshots.filter(s => 
        new Date(s.ts).getTime() >= cutoffTime
      );
    }

    // Sort by timestamp
    filteredSnapshots.sort((a, b) => 
      new Date(a.ts).getTime() - new Date(b.ts).getTime()
    );

    // Build portfolio data
    const portfolioData: ChartDataPoint[] = filteredSnapshots.map(snapshot => ({
      ts: snapshot.ts,
      timestamp: new Date(snapshot.ts).getTime(),
      totalInvested: parseFloat(snapshot.total_quote_invested),
      totalMarketValue: parseFloat(snapshot.total_market_value),
      totalUnrealizedPl: parseFloat(snapshot.total_unrealized_pl),
    }));

    // Build per-symbol data
    const symbolMap = new Map<string, ChartDataPoint[]>();
    
    filteredSnapshots.forEach(snapshot => {
      snapshot.positions.forEach(pos => {
        if (selectedSymbols.length === 0 || selectedSymbols.includes(pos.symbol)) {
          if (!symbolMap.has(pos.symbol)) {
            symbolMap.set(pos.symbol, []);
          }
          
          symbolMap.get(pos.symbol)!.push({
            ts: snapshot.ts,
            timestamp: new Date(snapshot.ts).getTime(),
            totalInvested: parseFloat(pos.total_cost),
            totalMarketValue: parseFloat(pos.market_value),
            totalUnrealizedPl: parseFloat(pos.unrealized_pl),
          });
        }
      });
    });

    const symbolData: SymbolChartData[] = Array.from(symbolMap.entries()).map(
      ([symbol, data]) => ({ symbol, data })
    );

    return { portfolioData, symbolData };
  }, [snapshots, timeRange, selectedSymbols]);
}

// Data downsampling for performance
export function downsampleData<T extends { timestamp: number }>(
  data: T[], 
  maxPoints: number = 1000
): T[] {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

// Get unique symbols from snapshots
export function getUniqueSymbols(snapshots: Snapshot[]): string[] {
  const symbolSet = new Set<string>();
  snapshots.forEach(snapshot => {
    snapshot.positions.forEach(pos => symbolSet.add(pos.symbol));
  });
  return Array.from(symbolSet).sort();
}