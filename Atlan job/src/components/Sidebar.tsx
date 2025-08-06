import React, { useState } from 'react';
import { Clock, Star, StarOff, Play, BookOpen, Users, Package, BarChart3, Zap } from 'lucide-react';
import type { PredefinedQuery, QueryHistory } from '../types';
import { cn, formatExecutionTime, truncateText } from '../utils';

interface SidebarProps {
  predefinedQueries: PredefinedQuery[];
  queryHistory: QueryHistory[];
  favoriteQueries: string[];
  onLoadQuery: (query: string, predefinedId?: string) => void;
  onToggleFavorite: (query: string) => void;
  onClearHistory: () => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'customers':
      return <Users size={16} />;
    case 'orders':
    case 'products':
      return <Package size={16} />;
    case 'analytics':
      return <BarChart3 size={16} />;
    case 'performance':
      return <Zap size={16} />;
    default:
      return <BookOpen size={16} />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  predefinedQueries,
  queryHistory,
  onLoadQuery,
  onToggleFavorite,
  onClearHistory,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'queries' | 'history' | 'favorites'>('queries');

  const groupedQueries = predefinedQueries.reduce((acc, query) => {
    if (!acc[query.category]) {
      acc[query.category] = [];
    }
    acc[query.category].push(query);
    return acc;
  }, {} as Record<string, PredefinedQuery[]>);

  const favoriteHistoryItems = queryHistory.filter(item => item.isFavorite);

  const renderPredefinedQueries = () => (
    <div className="space-y-4">
      {Object.entries(groupedQueries).map(([category, queries]) => (
        <div key={category}>
          <div className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded">
            {getCategoryIcon(category)}
            <span>{category}</span>
          </div>
          <div className="mt-2 space-y-1">
            {queries.map(query => (
              <div
                key={query.id}
                className="group p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 cursor-pointer transition-all"
                onClick={() => onLoadQuery(query.query, query.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{query.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{query.description}</p>
                    <div className="text-xs font-mono text-gray-400 whitespace-pre-line break-words max-w-full overflow-y-auto" style={{wordBreak: 'break-word', overflowWrap: 'anywhere', maxHeight: '4.5em'}}>
                      {query.query}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:text-blue-700 transition-opacity">
                    <Play size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderQueryHistory = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold text-gray-700">Recent Queries</h3>
        {queryHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        )}
      </div>
      
      {queryHistory.length === 0 ? (
        <div className="px-3 py-8 text-center">
          <Clock className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-600">No query history yet</p>
          <p className="text-xs text-gray-500">Execute queries to see them here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {queryHistory.slice(0, 20).map(item => (
            <div
              key={item.id}
              className="group p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1"
                  onClick={() => onLoadQuery(item.query)}
                >
                  <div className="text-xs font-mono text-gray-600 mb-1">
                    {truncateText(item.query.replace(/\s+/g, ' '), 80)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{formatExecutionTime(item.executionTime)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.query);
                  }}
                  className={cn(
                    'p-1 transition-colors',
                    item.isFavorite
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-yellow-500'
                  )}
                >
                  {item.isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-2">
      <h3 className="px-3 text-sm font-semibold text-gray-700">Favorite Queries</h3>
      
      {favoriteHistoryItems.length === 0 ? (
        <div className="px-3 py-8 text-center">
          <Star className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-600">No favorite queries yet</p>
          <p className="text-xs text-gray-500">Star queries to save them here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favoriteHistoryItems.map(item => (
            <div
              key={item.id}
              className="group p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1"
                  onClick={() => onLoadQuery(item.query)}
                >
                  <div className="text-xs font-mono text-gray-600 mb-1">
                    {truncateText(item.query.replace(/\s+/g, ' '), 80)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{formatExecutionTime(item.executionTime)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.query);
                  }}
                  className="p-1 text-yellow-500 hover:text-yellow-600 transition-colors"
                >
                  <Star size={14} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('flex flex-col bg-white border-r border-gray-200', className)}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('queries')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'queries'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <BookOpen size={16} className="inline mr-2" />
          Queries
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Clock size={16} className="inline mr-2" />
          History
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'favorites'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Star size={16} className="inline mr-2" />
          Favorites
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'queries' && renderPredefinedQueries()}
        {activeTab === 'history' && renderQueryHistory()}
        {activeTab === 'favorites' && renderFavorites()}
      </div>
    </div>
  );
};
