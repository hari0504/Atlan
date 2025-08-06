export interface QueryResult {
  id: string;
  query: string;
  columns: string[];
  data: Record<string, unknown>[];
  executionTime: number;
  rowCount: number;
  timestamp: string;
}

export interface PredefinedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  category: string;
}

export interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  executionTime: number;
  isFavorite: boolean;
}

export interface PerformanceMetrics {
  queryExecutionTime: number;
  renderTime: number;
  memoryUsage?: number;
  rowsRendered: number;
}

export type ExportFormat = 'csv' | 'json' | 'sql';

export interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
}
