import { type FC, useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, frameworkThemes } from '../stores/appStore';
import { compileJSXToVNode, frameworkTemplates } from '../utils/jsxCompiler';
import type { VNode } from '../core/engine/VDOMSimulator';
import { Code, AlertCircle, CheckCircle, Play, RefreshCw } from 'lucide-react';

interface CodePlaygroundProps {
  onCompile: (oldTree: VNode, newTree: VNode) => void;
}

export const CodePlayground: FC<CodePlaygroundProps> = ({ onCompile }) => {
  const { currentFramework, appTheme } = useAppStore();
  const theme = frameworkThemes[currentFramework];
  
  const [code, setCode] = useState(() => frameworkTemplates[currentFramework]);
  const [compiledTree, setCompiledTree] = useState<VNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Update code when framework changes
  useEffect(() => {
    setCode(frameworkTemplates[currentFramework]);
    setError(null);
    setCompiledTree(null);
  }, [currentFramework]);

  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    setError(null);

    try {
      const result = await compileJSXToVNode(code);
      
      if (result.success && result.vnode) {
        setCompiledTree(result.vnode);
        setError(null);
        
        // Call the callback with old (empty) and new tree
        onCompile(
          { tag: 'div', children: [] }, // Empty old tree
          result.vnode
        );
      } else {
        setError(result.error || 'Compilation failed');
        setCompiledTree(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compilation failed');
      setCompiledTree(null);
    }
      
    setIsCompiling(false);
  }, [code, onCompile]);

  const handleReset = () => {
    setCode(frameworkTemplates[currentFramework]);
    setError(null);
    setCompiledTree(null);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Code Editor Section */}
      <div 
        className="flex-1 flex flex-col rounded-xl border overflow-hidden shadow-lg"
        style={{ borderColor: `${theme.primary}30` }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ 
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}20`
          }}
        >
          <div className="flex items-center gap-2">
            <Code size={14} style={{ color: theme.primary }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
              {theme.name} Code
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors"
            >
              <RefreshCw size={12} />
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompile}
              disabled={isCompiling}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-white text-xs font-bold shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` 
              }}
            >
              {isCompiling ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Play size={12} fill="currentColor" />
              )}
              Compile
            </motion.button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme={appTheme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              scrollbar: { vertical: 'auto', horizontal: 'hidden' }
            }}
          />
        </div>
      </div>

      {/* Status/Output Section */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-400 font-mono">{error}</div>
          </motion.div>
        )}
        
        {compiledTree && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl border flex items-center gap-2"
            style={{ 
              borderColor: `${theme.primary}30`,
              backgroundColor: `${theme.primary}10`
            }}
          >
            <CheckCircle size={16} style={{ color: theme.primary }} />
            <span className="text-sm font-semibold" style={{ color: theme.primary }}>
              Compiled successfully! Click RUN to simulate.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compiled Tree Preview */}
      {compiledTree && (
        <div className="h-28 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-auto p-2">
          <pre className="text-[10px] font-mono text-[var(--text-secondary)]">
            {JSON.stringify(compiledTree, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
