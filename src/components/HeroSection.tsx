import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, Rows } from 'lucide-react';
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isWrapMode, setIsWrapMode] = useState<boolean>(() => {
    return localStorage.getItem('cf_home_dock_wrap') === 'true';
  });

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories, isWrapMode]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0 && !isWrapMode) {
      scrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const toggleWrapMode = () => {
    setIsWrapMode((prev) => {
      const next = !prev;
      localStorage.setItem('cf_home_dock_wrap', String(next));
      return next;
    });
  };

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
          className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] focus-within:bg-white/[0.18] backdrop-blur-2xl border border-white/20 hover:border-white/35 transition-all duration-300 shadow-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full">
            <Search className="w-4 h-4 text-white/70 group-hover:text-white transition-colors shrink-0" />
            <span className="text-xs sm:text-sm text-white/60 group-hover:text-white/90 transition-colors truncate">
              搜索服务名称、拼音首字母 (如 <code className="font-mono text-cyan-300">jf</code>)...
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <kbd className="px-2 py-0.5 text-[11px] font-semibold text-white/80 bg-white/10 border border-white/20 rounded-md shadow-inner font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Sun-Panel 悬浮分类 Dock 标签条 */}
      {categories.length > 1 && (
        <div className="relative max-w-[1600px] mx-auto px-2 sm:px-6">
          {/* 左侧平滑滚动按钮 (当有左侧内容可滚动且非平铺模式时显示) */}
          {!isWrapMode && canScrollLeft && (
            <div className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 flex items-center pr-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent h-full">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-full glass-btn-secondary text-white shadow-lg transition"
                title="向左滚动"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 右侧平滑滚动按钮 (当有右侧内容可滚动且非平铺模式时显示) */}
          {!isWrapMode && canScrollRight && (
            <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 flex items-center pl-3 bg-gradient-to-l from-black/60 via-black/20 to-transparent h-full">
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-full glass-btn-secondary text-white shadow-lg transition"
                title="向右滚动"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onWheel={handleWheel}
            className={`w-full no-scrollbar py-1.5 transition-all ${
              isWrapMode
                ? 'flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-1'
                : 'overflow-x-auto scroll-smooth'
            }`}
          >
            <div className={isWrapMode ? 'contents' : 'flex items-center gap-1.5 sm:gap-2 px-4 w-fit min-w-max mx-auto'}>
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all backdrop-blur-md border ${
                  activeCategory === null
                    ? 'bg-white/25 text-white font-semibold border-white/40 shadow-lg scale-105'
                    : 'bg-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.16] border-white/15'
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
                      : 'bg-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.16] border-white/15'
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

              {/* 展开/折叠显示模式切换按钮 */}
              <button
                type="button"
                onClick={toggleWrapMode}
                className="shrink-0 p-1.5 rounded-xl text-xs text-white/70 hover:text-white glass-btn-secondary transition"
                title={isWrapMode ? '切换为单行横向滚动' : '切换为多行全部展开'}
              >
                {isWrapMode ? <Rows className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

