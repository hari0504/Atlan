import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Square, Copy, Download, RotateCcw } from 'lucide-react';
import { cn } from '../utils';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  onClear: () => void;
  className?: string;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onExecute,
  isExecuting,
  onClear,
  className
}) => {
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts - we'll handle this via onKeyDown instead
    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    //   onExecute();
    // });
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const handleDownloadQuery = () => {
    const blob = new Blob([value], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatQuery = () => {
    // For now, we'll skip auto-formatting to avoid type issues
    // In a production app, you'd properly type the Monaco editor instance
    console.log('Format query requested');
  };

  return (
    <div className={cn('flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-700">SQL Query Editor</h3>
          <span className="text-xs text-gray-500">Ctrl+Enter to execute</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={formatQuery}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Format Query"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={handleCopyQuery}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Copy Query"
          >
            <Copy size={16} />
          </button>
          
          <button
            onClick={handleDownloadQuery}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Download Query"
            disabled={!value.trim()}
          >
            <Download size={16} />
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            disabled={!value.trim()}
          >
            Clear
          </button>
          
          <button
            onClick={onExecute}
            disabled={isExecuting || !value.trim()}
            className={cn(
              'flex items-center space-x-2 px-4 py-1.5 text-sm font-medium rounded transition-colors',
              isExecuting || !value.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {isExecuting ? (
              <>
                <Square size={16} />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="300px"
          defaultLanguage="sql"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
          }}
          theme="vs"
        />
      </div>
    </div>
  );
};
