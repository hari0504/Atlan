import { useState, useCallback, useEffect } from 'react';
import type { QueryResult, QueryHistory, PredefinedQuery } from '../types';
import { getMockDataForQuery, PREDEFINED_QUERIES } from '../data/mockData';
import { measurePerformance, saveToLocalStorage, loadFromLocalStorage } from '../utils';

const QUERY_HISTORY_KEY = 'sql-query-history';
const FAVORITE_QUERIES_KEY = 'favorite-queries';

export const useQueryManager = () => {
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [favoriteQueries, setFavoriteQueries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const history = loadFromLocalStorage<QueryHistory[]>(QUERY_HISTORY_KEY, []);
    const favorites = loadFromLocalStorage<string[]>(FAVORITE_QUERIES_KEY, []);
    setQueryHistory(history);
    setFavoriteQueries(favorites);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    saveToLocalStorage(QUERY_HISTORY_KEY, queryHistory);
  }, [queryHistory]);

  useEffect(() => {
    saveToLocalStorage(FAVORITE_QUERIES_KEY, favoriteQueries);
  }, [favoriteQueries]);

  const executeQuery = useCallback(async (query: string, predefinedId?: string) => {
    if (!query.trim()) {
      setError('Query cannot be empty');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Try to match the query to a predefined query (by normalized SQL)
      const normalizedInput = query.replace(/\s+/g, ' ').trim().toLowerCase();
      const matchedPredefined = PREDEFINED_QUERIES.find(q =>
        normalizedInput === q.query.replace(/\s+/g, ' ').trim().toLowerCase()
        || normalizedInput.includes(q.name.toLowerCase())
      );

      const { result, duration } = measurePerformance(() => {
        if (predefinedId) {
          return getMockDataForQuery(predefinedId);
        }
        if (matchedPredefined) {
          return getMockDataForQuery(matchedPredefined.id);
        }
        // For custom queries, return a simple result
        return {
          id: `custom-${Date.now()}`,
          query,
          columns: ['message', 'status'],
          data: [{ 
            message: 'Custom query executed successfully', 
            status: 'This is a mock result for demonstration purposes'
          }],
          executionTime: Math.floor(Math.random() * 300) + 100,
          rowCount: 1,
          timestamp: new Date().toISOString()
        };
      });

      // Add some realistic delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, Math.max(100, duration)));

      setQueryResult(result);

      // Add to history
      const historyItem: QueryHistory = {
        id: `history-${Date.now()}`,
        query: query.trim(),
        timestamp: new Date().toISOString(),
        executionTime: result.executionTime,
        isFavorite: favoriteQueries.includes(query.trim())
      };

      setQueryHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 queries

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsExecuting(false);
    }
  }, [favoriteQueries]);

  const loadPredefinedQuery = useCallback((queryId: string) => {
    const predefinedQuery = PREDEFINED_QUERIES.find(q => q.id === queryId);
    if (predefinedQuery) {
      setCurrentQuery(predefinedQuery.query);
    }
  }, []);

  const toggleFavorite = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setFavoriteQueries(prev => {
      const newFavorites = prev.includes(trimmedQuery)
        ? prev.filter(q => q !== trimmedQuery)
        : [...prev, trimmedQuery];
      
      // Update history items
      setQueryHistory(prevHistory =>
        prevHistory.map(item =>
          item.query === trimmedQuery
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
      
      return newFavorites;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setQueryHistory([]);
  }, []);

  const clearResults = useCallback(() => {
    setQueryResult(null);
    setError(null);
  }, []);

  const getPredefinedQueries = useCallback((): PredefinedQuery[] => {
    return PREDEFINED_QUERIES;
  }, []);

  const getQueryFromHistory = useCallback((historyId: string): string => {
    const historyItem = queryHistory.find(item => item.id === historyId);
    return historyItem?.query || '';
  }, [queryHistory]);

  return {
    // State
    currentQuery,
    queryResult,
    isExecuting,
    queryHistory,
    favoriteQueries,
    error,
    
    // Actions
    setCurrentQuery,
    executeQuery,
    loadPredefinedQuery,
    toggleFavorite,
    clearHistory,
    clearResults,
    
    // Getters
    getPredefinedQueries,
    getQueryFromHistory
  };
};
