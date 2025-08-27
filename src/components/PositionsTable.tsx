import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EnhancedPosition } from '../lib/dataSelectors';
import { formatCurrency, formatPercent, formatQuantity } from '../lib/dataSelectors';

interface PositionsTableProps {
  positions: EnhancedPosition[];
  baseCurrency: string;
  loading?: boolean;
}

export function PositionsTable({ positions, baseCurrency, loading }: PositionsTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No positions yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Positions will appear here once the bot starts executing trades.
          </p>
        </div>
      </div>
    );
  }

  const getPLIcon = (plPercent?: number) => {
    if (!plPercent) return <Minus className="h-4 w-4 text-gray-400" />;
    if (plPercent > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (plPercent < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPLColor = (plPercent?: number) => {
    if (!plPercent) return 'text-gray-500 dark:text-gray-400';
    if (plPercent > 0) return 'text-green-600 dark:text-green-400';
    if (plPercent < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Positions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Current holdings and performance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Market Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                P/L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {positions.map((position, index) => (
              <tr key={position.symbol} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {position.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {position.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                  {formatQuantity(position.openQty.toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                  {formatCurrency(position.avgCost, baseCurrency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                  {formatCurrency(position.totalCost, baseCurrency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                  {position.currentPrice 
                    ? formatCurrency(position.currentPrice, baseCurrency)
                    : '—'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white font-mono">
                  {position.marketValue 
                    ? formatCurrency(position.marketValue, baseCurrency)
                    : '—'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {position.unrealizedPl !== undefined && position.unrealizedPlPercent !== undefined ? (
                    <div className={`flex items-center justify-end space-x-1 ${getPLColor(position.unrealizedPlPercent)}`}>
                      {getPLIcon(position.unrealizedPlPercent)}
                      <div>
                        <div className="font-mono">
                          {formatCurrency(position.unrealizedPl, baseCurrency)}
                        </div>
                        <div className="text-xs">
                          {formatPercent(position.unrealizedPlPercent)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end space-x-1 text-gray-500 dark:text-gray-400">
                      <Minus className="h-4 w-4" />
                      <span>—</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}