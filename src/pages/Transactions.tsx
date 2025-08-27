import { useState } from 'react';
import { ArrowUpDown, Filter, ExternalLink, Clock } from 'lucide-react';
import { useTransactions } from '../lib/dataHooks';
import { ErrorDisplay } from '../components/ErrorBoundary';
import { formatCurrency, formatQuantity } from '../lib/dataSelectors';
import { format } from 'date-fns';

export function Transactions() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const { data: transactions, loading, error, refetch } = useTransactions(selectedSymbol || undefined);

  // Get unique symbols for filter
  const uniqueSymbols = Array.from(new Set(transactions?.map(t => t.symbol) || [])).sort();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete transaction history
          </p>
        </div>
        
        <ErrorDisplay
          error={error}
          title="Failed to load transaction data"
          onRetry={refetch}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete transaction history
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4">
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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete transaction history
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <ArrowUpDown className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Transaction history will appear here once the bot starts executing trades.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getOrderTypeColor = (orderType: string) => {
    if (orderType.includes('MOCK')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete transaction history
          </p>
        </div>

        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
          <p>{transactions.length} transactions</p>
        </div>
      </div>

      {/* Controls */}
      {uniqueSymbols.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <label htmlFor="symbol-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Symbol:
              </label>
            </div>
            <select
              id="symbol-filter"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Symbols</option>
              {uniqueSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Iteration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction, index) => (
                <tr key={`${transaction.ts}-${transaction.symbol}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>
                        {format(new Date(transaction.ts), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {transaction.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.exchange}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.side === 'BUY' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {transaction.side}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900 dark:text-white">
                    {formatQuantity(transaction.qty)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900 dark:text-white">
                    {formatCurrency(transaction.price)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.quote_spent)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(transaction.order_type)}`}>
                      {transaction.order_type}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      #{transaction.iteration_id.split('#')[1]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}