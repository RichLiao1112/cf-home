import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Edit2, Trash2, Globe, Wifi, GripVertical } from 'lucide-react';
import { Card, NetworkContext } from '../types';

interface Props {
  card: Card;
  networkContext: NetworkContext;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export const CardComponent: React.FC<Props> = ({ card, networkContext, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // 智能首选链接：内网环境下优先使用 LAN 链接，否则使用 WAN 链接
  const primaryLink = networkContext.networkType === 'lan' && card.lanLink ? card.lanLink : (card.wanLink || card.lanLink || '#');

  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是编辑或删除等小按钮，不触发整体跳转
    if ((e.target as HTMLElement).closest('button')) return;
    if (primaryLink && primaryLink !== '#') {
      window.open(primaryLink, card.openInNewWindow ? '_blank' : '_self');
    }
  };

  const getInitial = (str: string) => {
    return str?.trim() ? str.trim().charAt(0).toUpperCase() : '?';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className="group relative flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 hover:border-cyan-400/40 bg-white/[var(--card-opacity,0.05)] hover:bg-white/[var(--card-hover-opacity,0.12)] backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-500/10 hover:-translate-y-0.5 select-none"
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition cursor-grab active:cursor-grabbing text-slate-400 -ml-1.5"
        title="拖动排序"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 图标 */}
      <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden bg-slate-800/80 border border-white/10 shadow-inner">
        {card.cover ? (
          <img
            src={card.cover}
            alt={card.title}
            className="w-full h-full object-contain p-1 rounded-lg"
            onError={(e) => {
              // 图片加载失败时回退为首字母展示
              (e.target as HTMLElement).style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-cyan-600/30');
            }}
          />
        ) : (
          <span
            className="text-base font-bold text-slate-200"
            style={{ color: card.coverColor || '#38BDF8' }}
          >
            {getInitial(card.title)}
          </span>
        )}
      </div>

      {/* 标题与描述 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
            {card.title}
          </h4>
          {card.openInNewWindow && (
            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity" />
          )}
        </div>
        {card.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{card.description}</p>
        )}
      </div>

      {/* 快捷操作与网络直达按钮 */}
      <div className="shrink-0 flex items-center gap-1">
        {/* 编辑 / 删除按钮 (悬浮时浮现) */}
        <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition"
            title="编辑卡片"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="删除卡片"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* LAN 内网直达按钮 */}
        {card.lanLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(card.lanLink, card.openInNewWindow ? '_blank' : '_self');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
              networkContext.networkType === 'lan'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={`内网直达: ${card.lanLink}`}
          >
            <Wifi className="w-3 h-3" />
            <span>LAN</span>
          </button>
        )}

        {/* WAN 外网直达按钮 */}
        {card.wanLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(card.wanLink, card.openInNewWindow ? '_blank' : '_self');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
              networkContext.networkType === 'wan' && !card.lanLink
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40 hover:bg-cyan-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={`外网直达: ${card.wanLink}`}
          >
            <Globe className="w-3 h-3" />
            <span>WAN</span>
          </button>
        )}
      </div>
    </div>
  );
};
