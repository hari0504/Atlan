import type { QueryResult, ExportFormat } from '../types';

// Utility function to format execution time
export const formatExecutionTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// Utility function to format numbers with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Utility function to truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Utility function to detect column data types
export const detectColumnType = (data: Record<string, unknown>[], columnKey: string): 'string' | 'number' | 'date' | 'boolean' => {
  if (data.length === 0) return 'string';
  
  const sampleValue = data[0][columnKey];
  
  if (typeof sampleValue === 'boolean') return 'boolean';
  if (typeof sampleValue === 'number') return 'number';
  if (typeof sampleValue === 'string') {
    // Check if it's a date string
    if (/^\d{4}-\d{2}-\d{2}/.test(sampleValue)) return 'date';
  }
  
  return 'string';
};

// Export data to different formats
export const exportData = (result: QueryResult, format: ExportFormat): string => {
  switch (format) {
    case 'csv':
      return exportToCSV(result);
    case 'json':
      return JSON.stringify(result.data, null, 2);
    case 'sql':
      return exportToSQL(result);
    default:
      return '';
  }
};

const exportToCSV = (result: QueryResult): string => {
  if (result.data.length === 0) return '';
  
  const headers = result.columns.join(',');
  const rows = result.data.map(row => 
    result.columns.map(col => {
      const value = row[col];
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

const exportToSQL = (result: QueryResult): string => {
  if (result.data.length === 0) return '';
  
  const tableName = 'query_result';
  const columns = result.columns.join(', ');
  
  const values = result.data.map(row => {
    const rowValues = result.columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      return String(value);
    }).join(', ');
    return `(${rowValues})`;
  });
  
  return `INSERT INTO ${tableName} (${columns}) VALUES\n${values.join(',\n')};`;
};

// Performance monitoring utilities
export const measurePerformance = <T>(fn: () => T): { result: T; duration: number } => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
};

// Local storage utilities for query history
export const saveToLocalStorage = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Debounce utility for search
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// CSS class utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
