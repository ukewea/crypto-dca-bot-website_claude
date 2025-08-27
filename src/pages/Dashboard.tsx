import { DollarSign, TrendingUp, PieChart, Activity } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { PositionsTable } from '../components/PositionsTable';
import { ErrorDisplay } from '../components/ErrorBoundary';
import { useDashboardData } from '../lib/dataHooks';
import { useDashboardKPIs, useEnhancedPositions, formatCurrency, formatPercent } from '../lib/dataSelectors';
import { format } from 'date-fns';

export function Dashboard() {
  const { positions, snapshots, loading, error, refetch } = useDashboardData();
  const kpis = useDashboardKPIs(positions.data);
  const enhancedPositions = useEnhancedPositions(positions.data);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Portfolio overview and current positions
          </p>
        </div>
        
        <ErrorDisplay
          error={error}
          title="Failed to load dashboard data"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Portfolio overview and current positions
          </p>
        </div>
        
        {kpis && (
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>Last updated</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {format(new Date(kpis.lastUpdated), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Invested"
          value={kpis ? formatCurrency(kpis.totalInvested, kpis.baseCurrency) : '—'}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
        />
        
        <KPICard
          title="Market Value"
          value={kpis ? formatCurrency(kpis.totalMarketValue, kpis.baseCurrency) : '—'}
          icon={<PieChart className="h-5 w-5" />}
          loading={loading}
        />
        
        <KPICard
          title="Unrealized P/L"
          value={kpis ? formatCurrency(kpis.totalUnrealizedPl, kpis.baseCurrency) : '—'}
          change={kpis?.totalUnrealizedPlPercent}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={loading}
        />
        
        <KPICard
          title="Positions"
          value={kpis ? kpis.positionCount.toString() : '—'}
          changeLabel="assets"
          icon={<Activity className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Positions Table */}
      <PositionsTable
        positions={enhancedPositions}
        baseCurrency={kpis?.baseCurrency || 'USDC'}
        loading={loading}
      />

      {/* Quick Stats */}
      {kpis && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Performance</p>
              <p className={`text-lg font-semibold ${
                kpis.totalUnrealizedPlPercent >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercent(kpis.totalUnrealizedPlPercent)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Base Currency</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {kpis.baseCurrency}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data Points</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {snapshots.data?.length || 0} snapshots
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}