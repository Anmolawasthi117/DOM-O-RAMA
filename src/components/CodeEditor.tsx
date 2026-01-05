import type { FC } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, Lock, Edit3 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface CodeEditorProps {
  code: string;
  onChange?: (value: string) => void;
  title: string;
  variant: 'old' | 'new';
  readOnly?: boolean;
  error?: string | null;
}

export const CodeEditor: FC<CodeEditorProps> = ({
  code,
  onChange,
  title,
  variant,
  readOnly = false,
  error = null
}) => {
  const { appTheme } = useAppStore();
  const isOld = variant === 'old';

  const borderColor = isOld 
    ? 'border-red-500/30 hover:border-red-500/50' 
    : 'border-emerald-500/30 hover:border-emerald-500/50';
  
  const labelBg = isOld 
    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  
  const accentDot = isOld ? 'bg-red-500' : 'bg-emerald-500';

  const handleEditorChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-sm rounded-xl border ${borderColor} overflow-hidden shadow-xl transition-all duration-300 group`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${accentDot} opacity-80`}></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-secondary)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-secondary)]"></span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${labelBg}`}>
            {title}
          </span>
          {readOnly && (
            <Lock size={12} className="text-[var(--text-muted)]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Edit3 size={12} className="text-[var(--accent-primary)] opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
          <FileCode size={14} className={`${isOld ? 'text-red-500' : 'text-emerald-500'} opacity-50 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-3 py-1.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={code}
          onChange={handleEditorChange}
          theme={appTheme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            folding: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: readOnly ? 'none' : 'line',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
              verticalScrollbarSize: 6
            },
            padding: { top: 8, bottom: 8 }
          }}
        />
      </div>
    </div>
  );
};
