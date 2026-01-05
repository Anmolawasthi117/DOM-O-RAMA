import type { FC } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePanelProps {
  code: string;
  title: string;
  variant?: 'old' | 'new';
}

export const CodePanel: FC<CodePanelProps> = ({ code, title, variant = 'old' }) => {
  const isOld = variant === 'old';
  const borderColor = isOld ? 'border-red-500/30' : 'border-emerald-500/30';
  const labelColor = isOld ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  const iconColor = isOld ? 'text-red-500' : 'text-emerald-500';
  const accentDot = isOld ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className={`flex flex-col h-full bg-slate-900/80 backdrop-blur-sm rounded-xl border ${borderColor} overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl group`}>
      {/* Header - Codesandbox-like */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${accentDot} opacity-80`}></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${labelColor}`}>
            {title}
          </span>
        </div>
        <svg className={`w-4 h-4 ${iconColor} opacity-50 group-hover:opacity-100 transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      {/* Code Area */}
      <div className="flex-1 overflow-auto text-xs font-mono relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', fontSize: '11px', lineHeight: '1.5' }}
            showLineNumbers
            lineNumberStyle={{ minWidth: '2em', paddingRight: '1em', color: '#475569', fontSize: '10px' }}
          >
            {code}
         </SyntaxHighlighter>
      </div>
    </div>
  );
};
