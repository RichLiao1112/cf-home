import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Wifi, X } from 'lucide-react';
import { Card, Category, NetworkContext } from '../types';
import { matchSearch } from '../utils/pinyin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  networkContext: NetworkContext;
}

interface SearchItem {
  card: Card;
  categoryTitle: string;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  networkContext,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 整理扁平化卡片列表
  const allItems: SearchItem[] = categories.flatMap((cat) =>
    cat.cards.map((card) => ({
      card,
      categoryTitle: cat.title,
    }))
  );

  // 根据拼音与关键词筛选
  const filtered = allItems.filter(({ card, categoryTitle }) => {
    if (!query.trim()) return true;
    return (
      matchSearch(card.title, query) ||
      matchSearch(card.description || '', query) ||
      matchSearch(categoryTitle, query) ||
      matchSearch(card.wanLink || '', query) ||
      matchSearch(card.lanLink || '', query)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          const target =
            networkContext.networkType === 'lan' && selected.card.lanLink
              ? selected.card.lanLink
              : (selected.card.wanLink || selected.card.lanLink);
          if (target) {
            window.open(target, selected.card.openInNewWindow ? '_blank' : '_self');
            onClose();
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, networkContext, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="glass-modal relative w-full max-w-2xl rounded-2xl z-10 overflow-hidden flex flex-col max-h-[75vh]">
        {/* 顶部搜索框 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="键入以搜索卡片、网址、分类，支持拼音与首字母 (例如 jf 搜索 Jellyfin)..."
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索结果列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((item, index) => {
            const isSelected = index === selectedIndex;
            const card = item.card;
            const primaryLink =
              networkContext.networkType === 'lan' && card.lanLink
                ? card.lanLink
                : (card.wanLink || card.lanLink);

            return (
              <div
                key={card.id}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  if (primaryLink) {
                    window.open(primaryLink, card.openInNewWindow ? '_blank' : '_self');
                    onClose();
                  }
                }}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/15 border border-white/25 text-white backdrop-blur-md'
                    : 'hover:bg-white/10 border border-transparent text-white/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    {card.cover ? (
                      <img src={card.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-white">
                        {card.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {card.title}
                      </span>
                      <span className="text-[10px] text-white/70 bg-white/10 border border-white/15 px-1.5 py-0.5 rounded-md">
                        {item.categoryTitle}
                      </span>
                    </div>
                    {card.description && (
                      <p className="text-xs text-white/60 truncate mt-0.5">{card.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {card.lanLink && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                      <Wifi className="w-2.5 h-2.5" />
                      LAN
                    </span>
                  )}
                  {card.wanLink && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      <Globe className="w-2.5 h-2.5" />
                      WAN
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              没有找到匹配项
            </div>
          )}
        </div>

        {/* 底部快捷键提示 */}
        <div className="px-4 py-2.5 bg-black/20 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ 切换选中</span>
            <span>↵ 打开链接</span>
            <span>ESC 关闭</span>
          </div>
          <span>共 {filtered.length} 个结果</span>
        </div>
      </div>
    </div>
  );
};
