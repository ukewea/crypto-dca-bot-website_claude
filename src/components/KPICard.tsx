import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function KPICard({ title, value, change, changeLabel, icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-blue-600 dark:text-blue-400">{icon}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor(change)}`}>
            {getChangeIcon(change)}
            <span>
              {Math.abs(change).toFixed(2)}%
              {changeLabel && (
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  {changeLabel}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}