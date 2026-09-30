import React, { useState, useEffect } from 'react';
import { Search, Globe, ChevronRight } from 'lucide-react';
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
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const week = weekDays[now.getDay()];
      setDateStr(`${year}年${month}月${day}日 ${week}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pt-6 sm:pt-10 pb-6 text-center select-none">
      {/* Sun-Panel 经典 Logo + 分割线 + 大秒钟 */}
      <div className="flex items-center justify-center text-white mb-2">
        <span className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-shadow">
          Home
        </span>
        <span className="text-2xl sm:text-4xl lg:text-5xl mx-3 sm:mx-4 opacity-40 font-light text-shadow">
          |
        </span>
        <span className="text-3xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-wider text-shadow">
          {timeStr || '00:00:00'}
        </span>
      </div>

      {/* 日期与服务总览微字 */}
      <p className="text-xs sm:text-sm font-medium text-white/80 tracking-wide text-shadow flex items-center justify-center gap-2 mb-6">
        <span>{dateStr}</span>
        <span className="opacity-40">·</span>
        <span>已连接 {categories.length} 个分类 / {totalCards} 个站点</span>
      </p>

      {/* Sun-Panel 经典圆角毛玻璃搜索框 */}
      <div className="max-w-xl mx-auto px-2 mb-7">
        <div
          onClick={onOpenSearch}
          className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-black/35 hover:bg-black/50 focus-within:bg-black/60 backdrop-blur-xl border border-white/20 hover:border-white/35 transition-all duration-300 shadow-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full">
            <Search className="w-4 h-4 text-white/70 group-hover:text-white transition-colors shrink-0" />
            <span className="text-xs sm:text-sm text-white/60 group-hover:text-white/90 transition-colors truncate">
              搜索服务名称、拼音首字母 (如 <code className="font-mono text-cyan-300">jf</code>)...
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <kbd className="px-2 py-0.5 text-[11px] font-semibold text-white/80 bg-white/10 border border-white/15 rounded-md shadow-inner font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Sun-Panel 悬浮分类 Dock 标签条 */}
      {categories.length > 1 && (
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar max-w-5xl mx-auto px-2">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
              activeCategory === null
                ? 'bg-white/25 text-white font-semibold border-white/40 shadow-lg scale-105'
                : 'bg-black/30 text-white/70 hover:text-white hover:bg-black/50 border-white/10'
            }`}
          >
            全部 ({totalCards})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id === activeCategory ? null : cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
                activeCategory === cat.id
                  ? 'bg-white/25 text-white font-semibold border-white/40 shadow-lg scale-105'
                  : 'bg-black/30 text-white/70 hover:text-white hover:bg-black/50 border-white/10'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.color || '#38BDF8', boxShadow: `0 0 8px ${cat.color || '#38BDF8'}` }}
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

