import { type FC, useMemo } from 'react';
import { frameworkThemes, type Framework } from '../stores/appStore';
import { tradeoffCategories, frameworkTradeoffs } from '../utils/tradeoffs';

interface TradeoffChartProps {
  framework1: Framework;
  framework2: Framework;
}

export const TradeoffChart: FC<TradeoffChartProps> = ({ framework1, framework2 }) => {
  const theme1 = frameworkThemes[framework1];
  const theme2 = frameworkThemes[framework2];
  const data1 = frameworkTradeoffs[framework1];
  const data2 = frameworkTradeoffs[framework2];

  const chartData = useMemo(() => {
    return tradeoffCategories.map(cat => ({
      category: cat.name,
      shortName: cat.name.split(' ')[0],
      score1: data1.scores[cat.id],
      score2: data2.scores[cat.id]
    }));
  }, [data1, data2]);

  // SVG Radar Chart
  const size = 280;
  const center = size / 2;
  const radius = 100;
  const angleStep = (Math.PI * 2) / chartData.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const createPath = (scores: number[]) => {
    return scores.map((score, i) => {
      const { x, y } = getPoint(i, score);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  };

  const path1 = createPath(chartData.map(d => d.score1));
  const path2 = createPath(chartData.map(d => d.score2));

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme1.primary }} />
          <span className="text-sm font-bold">{theme1.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme2.primary }} />
          <span className="text-sm font-bold">{theme2.name}</span>
        </div>
      </div>

      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {[2, 4, 6, 8, 10].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            fill="none"
            stroke="var(--border-primary)"
            strokeWidth={level === 10 ? 2 : 1}
            strokeDasharray={level === 10 ? '0' : '4 4'}
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {chartData.map((_, i) => {
          const { x, y } = getPoint(i, 10);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border-primary)"
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Data paths */}
        <path
          d={path2}
          fill={`${theme2.primary}30`}
          stroke={theme2.primary}
          strokeWidth={2}
        />
        <path
          d={path1}
          fill={`${theme1.primary}30`}
          stroke={theme1.primary}
          strokeWidth={2}
        />

        {/* Labels */}
        {chartData.map((d, i) => {
          const { x, y } = getPoint(i, 12);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-[var(--text-secondary)]"
            >
              {d.shortName}
            </text>
          );
        })}
      </svg>

      {/* Score Comparison Table */}
      <div className="mt-4 w-full max-w-md">
        {chartData.map(d => (
          <div key={d.category} className="flex items-center gap-2 py-1 border-b border-[var(--border-primary)]">
            <span className="text-xs text-[var(--text-muted)] w-24 truncate">{d.category}</span>
            <div className="flex-1 flex items-center gap-1">
              <div className="w-8 text-right text-xs font-bold" style={{ color: theme1.primary }}>{d.score1}</div>
              <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex">
                <div className="h-full" style={{ width: `${d.score1 * 10}%`, backgroundColor: theme1.primary }} />
              </div>
              <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex justify-end">
                <div className="h-full" style={{ width: `${d.score2 * 10}%`, backgroundColor: theme2.primary }} />
              </div>
              <div className="w-8 text-left text-xs font-bold" style={{ color: theme2.primary }}>{d.score2}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
