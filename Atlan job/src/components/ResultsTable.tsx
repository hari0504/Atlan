import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Download, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import type { QueryResult } from '../types';
import { cn, formatNumber, exportData, detectColumnType } from '../utils';

interface ResultsTableProps {
  result: QueryResult | null;
  className?: string;
}

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
}

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 48;

export const ResultsTable: React.FC<ResultsTableProps> = ({ result, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedData = useMemo(() => {
    if (!result) return [];

    let data = result.data;

    // Apply search filter
    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        let result = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          result = aVal - bVal;
        } else {
          result = String(aVal).localeCompare(String(bVal));
        }
        
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return data;
  }, [result, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!result) return;

    const exportResult = {
      ...result,
      data: filteredAndSortedData
    };

    const content = exportData(exportResult, format);
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const extension = format;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg', className)}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <Search size={48} />
          </div>
          <p className="text-gray-600">No query results to display</p>
          <p className="text-sm text-gray-500">Execute a query to see results here</p>
        </div>
      </div>
    );
  }

  const TableRow: React.FC<TableRowProps> = ({ index, style }) => {
    const row = filteredAndSortedData[index];
    
    return (
      <div style={style} className="flex border-b border-gray-100 hover:bg-gray-50">
        {result.columns.map((column, colIndex) => {
          const value = row[column];
          const columnType = detectColumnType([row], column);
          
          return (
            <div
              key={column}
              className={cn(
                'flex-1 px-4 py-2 text-sm truncate',
                columnType === 'number' && 'text-right font-mono',
                columnType === 'date' && 'font-mono',
                colIndex === 0 && 'sticky left-0 bg-white z-10'
              )}
              title={String(value)}
            >
              {value === null || value === undefined ? (
                <span className="text-gray-400 italic">NULL</span>
              ) : (
                String(value)
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-gray-700">Query Results</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatNumber(filteredAndSortedData.length)} rows</span>
            {searchTerm && (
              <>
                <span>•</span>
                <span>filtered from {formatNumber(result.rowCount)}</span>
              </>
            )}
            <span>•</span>
            <span>{result.executionTime}ms</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="    Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Export buttons */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          
          <button
            onClick={() => handleExport('json')}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <Download size={16} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Headers */}
      <div className="flex bg-gray-100 border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
        {result.columns.map((column, index) => (
          <div
            key={column}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 flex items-center justify-between',
              index === 0 && 'sticky left-0 bg-gray-100 z-20'
            )}
            onClick={() => handleSort(column)}
          >
            <span className="truncate">{column}</span>
            {sortColumn === column && (
              <div className="ml-2 flex-shrink-0">
                {sortDirection === 'asc' ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table Body with Virtualization */}
      <div className="flex-1 overflow-auto" style={{height: '100%'}}>
        {filteredAndSortedData.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Filter className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">No matching results</p>
              <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          </div>
        ) : (
          <List
            height={window.innerHeight - 220} // Use available space minus header/footer
            itemCount={filteredAndSortedData.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            className="query-results-table"
          >
            {TableRow}
          </List>
        )}
      </div>

      {/* Footer with performance info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Displaying {formatNumber(Math.min(filteredAndSortedData.length, 100))} of {formatNumber(filteredAndSortedData.length)} rows
        {filteredAndSortedData.length > 1000 && (
          <span className="ml-2 text-blue-600">• Virtual scrolling enabled for performance</span>
        )}
      </div>
    </div>
  );
};
