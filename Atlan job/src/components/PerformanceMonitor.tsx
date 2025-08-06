import React from 'react';
import { Clock, Database, Zap, TrendingUp } from 'lucide-react';
import type { QueryResult } from '../types';
import { formatExecutionTime, formatNumber } from '../utils';

interface PerformanceMonitorProps {
  result: QueryResult | null;
  isExecuting: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  result,
  isExecuting,
  className
}) => {
  const getPerformanceColor = (executionTime: number) => {
    if (executionTime < 100) return 'text-green-600';
    if (executionTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (executionTime: number) => {
    if (executionTime < 100) return 'Excellent';
    if (executionTime < 500) return 'Good';
    if (executionTime < 1000) return 'Fair';
    return 'Slow';
  };

  if (isExecuting) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <Zap className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Executing Query...</h3>
            <p className="text-xs text-blue-700">Please wait while your query is being processed</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <TrendingUp className="text-gray-400" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Performance Monitor</h3>
            <p className="text-xs text-gray-500">Execute a query to see performance metrics</p>
          </div>
        </div>
      </div>
    );
  }

  const performanceColor = getPerformanceColor(result.executionTime);
  const performanceLabel = getPerformanceLabel(result.executionTime);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Performance Metrics</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          performanceColor === 'text-green-600' ? 'bg-green-100 text-green-700' :
          performanceColor === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {performanceLabel}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className={performanceColor} size={16} />
          </div>
          <p className="text-xs text-gray-500 mb-1">Execution Time</p>
          <p className={`text-sm font-semibold ${performanceColor}`}>
            {formatExecutionTime(result.executionTime)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Database className="text-blue-600" size={16} />
          </div>
          <p className="text-xs text-gray-500 mb-1">Rows Returned</p>
          <p className="text-sm font-semibold text-blue-600">
            {formatNumber(result.rowCount)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="text-purple-600" size={16} />
          </div>
          <p className="text-xs text-gray-500 mb-1">Columns</p>
          <p className="text-sm font-semibold text-purple-600">
            {result.columns.length}
          </p>
        </div>
      </div>

      {result.rowCount > 1000 && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-700">
            <Zap size={12} className="inline mr-1" />
            Virtual scrolling enabled for optimal performance with large datasets
          </p>
        </div>
      )}
    </div>
  );
};
