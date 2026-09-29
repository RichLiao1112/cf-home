import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { NetworkContext, Category } from '../types';

interface Props {
  networkContext: NetworkContext;
  categories: Category[];
  totalCards: number;
  onOpenSearch: () => void;
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const HeroSection: React.FC<Props> = ({
  networkContext,
  categories,
  totalCards,
  onOpenSearch,
  activeCategory,
  onSelectCategory,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);

      if (hours >= 5 && hours < 12) setGreeting('早上好');
      else if (hours >= 12 && hours < 18) setGreeting('下午好');
      else if (hours >= 18 && hours < 23) setGreeting('晚上好');
      else setGreeting('夜深了');
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pt-6 pb-4">
      {/* 顶部状态与问候 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {greeting}
            </span>
            <span className="text-sm font-medium text-slate-400 font-mono">
              {timeStr}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>已收录</span>
            <span className="font-semibold font-mono text-sky-300">
              {categories.length}
            </span>
            <span>个分类 ·</span>
            <span className="font-semibold font-mono text-sky-300">
              {totalCards}
            </span>
            <span>个家庭服务与站点</span>
          </p>
        </div>

        {/* 客户端网络感知徽标 */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm border transition-all bg-slate-900/60 border-white/[0.08] text-slate-300">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  networkContext.networkType === 'lan' ? 'bg-emerald-400' : 'bg-sky-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  networkContext.networkType === 'lan' ? 'bg-emerald-500' : 'bg-sky-500'
                }`}
              />
            </span>
            <span className="text-xs font-medium">
              {networkContext.networkType === 'lan' ? '局域网直连 (LAN)' : '公网加速 (WAN)'}
            </span>
            <span className="text-[10px] opacity-60 font-mono pl-1 border-l border-white/10">
              {networkContext.clientIP}
            </span>
          </div>
        </div>
      </div>

      {/* 居中搜索条 (Raycast / Spotlight 风格) */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full group flex items-center justify-between px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer text-left border bg-slate-900/60 hover:bg-slate-800/80 border-white/10 hover:border-sky-400/30 text-slate-300 shadow-sky-950/20"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 transition-transform group-hover:scale-110 text-sky-300" />
            <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
              搜索服务名称、拼音缩写 (如 <code className="font-mono text-sky-300">jf</code>)、内网地址...
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded-md shadow-inner font-mono">
              ⌘ K
            </kbd>
          </div>
        </button>
      </div>

      {/* 快速分类平滑锚点过滤条 */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === null
                ? 'bg-slate-800 text-sky-200 border border-sky-400/30 shadow-sm'
                : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
            }`}
          >
            全部服务 ({totalCards})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id === activeCategory ? null : cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-sky-200 border border-sky-400/30 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.color || '#38BDF8' }}
              />
              <span>{cat.title}</span>
              <span className="text-[10px] opacity-60">({cat.cards.length})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
