import { useState, useEffect, useCallback } from 'react';
import { Database, AlertCircle, X } from 'lucide-react';
import { SQLEditor } from './components/SQLEditor';
import { ResultsTable } from './components/ResultsTable';
import { Sidebar } from './components/Sidebar';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { useQueryManager } from './hooks/useQueryManager';

function App() {
  const {
    currentQuery,
    queryResult,
    isExecuting,
    queryHistory,
    favoriteQueries,
    error,
    setCurrentQuery,
    executeQuery,
    toggleFavorite,
    clearHistory,
    clearResults,
    getPredefinedQueries
  } = useQueryManager();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [mainSplit, setMainSplit] = useState(0.5); // 0.5 = 50% left/right
  const [isDraggingMainSplit, setIsDraggingMainSplit] = useState(false);

  // Sidebar drag handlers
  const handleSidebarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingSidebar(true);
    e.preventDefault();
  };
  const handleSidebarMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingSidebar) {
      setSidebarWidth(Math.max(200, Math.min(500, e.clientX)));
    }
  }, [isDraggingSidebar]);
  const handleSidebarMouseUp = () => {
    setIsDraggingSidebar(false);
  };
  // Main split drag handlers
  const handleMainSplitMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMainSplit(true);
    e.preventDefault();
  };
  const handleMainSplitMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingMainSplit) {
      const container = document.getElementById('main-content-area');
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setMainSplit(Math.max(0.2, Math.min(0.8, x / rect.width)));
      }
    }
  }, [isDraggingMainSplit]);
  const handleMainSplitMouseUp = () => {
    setIsDraggingMainSplit(false);
  };
  // Attach global mouse events
  useEffect(() => {
    if (isDraggingSidebar) {
      window.addEventListener('mousemove', handleSidebarMouseMove);
      window.addEventListener('mouseup', handleSidebarMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSidebarMouseMove);
        window.removeEventListener('mouseup', handleSidebarMouseUp);
      };
    }
    if (isDraggingMainSplit) {
      window.addEventListener('mousemove', handleMainSplitMouseMove);
      window.addEventListener('mouseup', handleMainSplitMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMainSplitMouseMove);
        window.removeEventListener('mouseup', handleMainSplitMouseUp);
      };
    }
  }, [isDraggingSidebar, isDraggingMainSplit, handleSidebarMouseMove, handleMainSplitMouseMove]);
  const handleExecuteQuery = () => {
    if (currentQuery.trim()) {
      executeQuery(currentQuery);
    }
  };

  const handleLoadQuery = (query: string, predefinedId?: string) => {
    setCurrentQuery(query);
    if (predefinedId) {
      executeQuery(query, predefinedId);
    }
  };

  const handleClearEditor = () => {
    setCurrentQuery('');
    clearResults();
  };

  return (
    <div className="flex h-screen bg-gray-50 select-none">
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: sidebarWidth, minWidth: 200, maxWidth: 500, height: '100%' }} className="flex-shrink-0 h-full relative border-l border-gray-200 bg-white">
          <Sidebar
            predefinedQueries={getPredefinedQueries()}
            queryHistory={queryHistory}
            favoriteQueries={favoriteQueries}
            onLoadQuery={handleLoadQuery}
            onToggleFavorite={toggleFavorite}
            onClearHistory={clearHistory}
          />
          {/* Split bar for sidebar */}
          <div
            style={{ right: 0, top: 0, width: 6, cursor: 'ew-resize', zIndex: 50 }}
            className="absolute h-full bg-gray-200 hover:bg-blue-300 transition-colors"
            onMouseDown={handleSidebarMouseDown}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" id="main-content-area">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <Database size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">SQL Query Interface</h1>
              <span className="text-sm text-gray-500">Atlan Frontend Challenge</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Made with React + TypeScript + Vite
              </span>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Query Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => clearResults()}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Editor and Performance */}
          <div style={{ width: `calc(${mainSplit * 100}% - 3px)` }} className="flex flex-col p-6 space-y-4 overflow-auto h-full">
            <SQLEditor
              value={currentQuery}
              onChange={setCurrentQuery}
              onExecute={handleExecuteQuery}
              isExecuting={isExecuting}
              onClear={handleClearEditor}
              className="flex-shrink-0"
            />
            <PerformanceMonitor
              result={queryResult}
              isExecuting={isExecuting}
              className="flex-shrink-0"
            />
          </div>
          {/* Split bar between editor/results */}
          <div
            style={{ width: 6, cursor: 'ew-resize', zIndex: 50 }}
            className="h-full bg-gray-200 hover:bg-blue-300 transition-colors"
            onMouseDown={handleMainSplitMouseDown}
          />
          {/* Right Panel - Results */}
          <div style={{ width: `calc(${(1 - mainSplit) * 100}% - 3px)` }} className="flex flex-col p-6 pl-0 h-full">
            <ResultsTable
              result={queryResult}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
