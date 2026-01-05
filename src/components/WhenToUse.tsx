import { type FC } from 'react';
import { frameworkThemes, type Framework } from '../stores/appStore';
import { frameworkTradeoffs } from '../utils/tradeoffs';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface WhenToUseProps {
  framework: Framework;
}

export const WhenToUse: FC<WhenToUseProps> = ({ framework }) => {
  const theme = frameworkThemes[framework];
  const tradeoff = frameworkTradeoffs[framework];

  return (
    <div 
      className="p-4 rounded-2xl border"
      style={{ 
        borderColor: `${theme.primary}30`,
        backgroundColor: `${theme.primary}05`
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{theme.icon}</span>
        <div>
          <h4 className="font-bold" style={{ color: theme.primary }}>{theme.name}</h4>
          <p className="text-[10px] text-[var(--text-muted)]">{theme.tagline}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] mb-4">
        <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tradeoff.summary}</p>
      </div>

      {/* Best For */}
      <div className="mb-4">
        <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <CheckCircle size={12} /> Best For
        </h5>
        <ul className="space-y-1">
          {tradeoff.bestFor.map((item, i) => (
            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Avoid If */}
      <div>
        <h5 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <XCircle size={12} /> Avoid If
        </h5>
        <ul className="space-y-1">
          {tradeoff.avoidIf.map((item, i) => (
            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <span className="text-rose-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
