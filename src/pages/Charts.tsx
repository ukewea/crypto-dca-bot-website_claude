import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { useSnapshots } from '../lib/dataHooks';
import { useChartData, TIME_RANGES, getUniqueSymbols, downsampleData, formatCurrency } from '../lib/dataSelectors';
import { ErrorDisplay } from '../components/ErrorBoundary';
import { format } from 'date-fns';

export function Charts() {
  const { data: snapshots, loading, error, refetch } = useSnapshots();
  const [selectedTimeRange, setSelectedTimeRange] = useState(TIME_RANGES[2]); // 30d default
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [chartView, setChartView] = useState<'portfolio' | 'symbols'>('portfolio');

  const uniqueSymbols = snapshots ? getUniqueSymbols(snapshots) : [];
  const { portfolioData, symbolData } = useChartData(snapshots || [], selectedTimeRange, selectedSymbols);

  const downsampledPortfolioData = downsampleData(portfolioData);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Portfolio performance over time
          </p>
        </div>
        
        <ErrorDisplay
          error={error}
          title="Failed to load chart data"
          onRetry={refetch}
        />
      </div>
    );
  }

  const handleSymbolToggle = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatTooltipValue = (value: number, name: string) => {
    const currency = snapshots?.[0]?.base_currency || 'USDC';
    return [formatCurrency(value, currency), name];
  };

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    if (selectedTimeRange.value === '24h') {
      return format(date, 'HH:mm');
    } else if (selectedTimeRange.value === '7d') {
      return format(date, 'MMM dd');
    } else {
      return format(date, 'MMM dd');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Portfolio performance over time
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Portfolio performance over time
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No chart data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Charts will appear here once the bot creates portfolio snapshots over time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Charts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Portfolio performance over time
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-6">
          {/* Time Range Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Time Range
            </label>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {TIME_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeRange.value === range.value
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart View Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View
            </label>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setChartView('portfolio')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartView === 'portfolio'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setChartView('symbols')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartView === 'symbols'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                By Symbol
              </button>
            </div>
          </div>

          {/* Symbol Filter (only show for symbols view) */}
          {chartView === 'symbols' && uniqueSymbols.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Symbols ({selectedSymbols.length || 'All'})
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueSymbols.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolToggle(symbol)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedSymbols.length === 0 || selectedSymbols.includes(symbol)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {chartView === 'portfolio' ? 'Portfolio Performance' : 'Performance by Symbol'}
        </h3>

        {downsampledPortfolioData.length > 0 && chartView === 'portfolio' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downsampledPortfolioData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="ts"
                  tickFormatter={formatXAxisTick}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalInvested" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  name="Total Invested"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalMarketValue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                  name="Market Value"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalUnrealizedPl" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={false}
                  name="Unrealized P/L"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {symbolData.length > 0 && chartView === 'symbols' && (
          <div className="space-y-8">
            {symbolData.map(({ symbol, data }) => (
              <div key={symbol} className="h-64">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {symbol}
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={downsampleData(data)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="ts"
                      tickFormatter={formatXAxisTick}
                      className="text-xs"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={formatTooltipValue}
                      labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalInvested" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                      name="Invested"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalMarketValue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                      name="Market Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}