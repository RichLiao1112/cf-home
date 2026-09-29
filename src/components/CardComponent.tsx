import React, { useState } from 'react';
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

  const [imgError, setImgError] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  // 智能首选链接
  const isLan = networkContext.networkType === 'lan';
  const primaryLink = isLan && card.lanLink ? card.lanLink : (card.wanLink || card.lanLink || '#');

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (primaryLink && primaryLink !== '#') {
      window.open(primaryLink, card.openInNewWindow ? '_blank' : '_self');
    }
  };

  const getInitial = (str: string) => {
    return str?.trim() ? str.trim().charAt(0).toUpperCase() : '?';
  };

  // 根据标题生成柔和的渐变色托盘
  const getGradientFromTitle = (title: string) => {
    const gradients = [
      'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
      'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30',
      'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
      'from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/30',
      'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className="group relative flex items-center justify-between gap-3.5 p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/[0.07] hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-500/10 hover:-translate-y-0.5 select-none"
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-400 -ml-1"
        title="拖动排序"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* 质感图标底座 */}
      <div className="shrink-0 relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border p-1 shadow-inner transition-transform duration-300 group-hover:scale-105 ${
          card.cover && !imgError
            ? 'bg-slate-950/70 border-white/10'
            : `bg-gradient-to-br ${getGradientFromTitle(card.title)}`
        }`}>
          {card.cover && !imgError ? (
            <img
              src={card.cover}
              alt={card.title}
              className="w-full h-full object-contain rounded-lg"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-bold font-mono tracking-wider">
              {getInitial(card.title)}
            </span>
          )}
        </div>

        {/* 局域网活动微光指示点 */}
        {card.lanLink && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              isLan ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-500'
            }`}
            title={isLan ? 'LAN 局域网可用' : '局域网链接已配置'}
          />
        )}
      </div>

      {/* 标题、描述与状态 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
            {card.title}
          </h4>
          {card.openInNewWindow && (
            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
          )}
        </div>
        {card.description ? (
          <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
            {card.description}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
            {primaryLink.replace(/^https?:\/\//, '').split('/')[0]}
          </p>
        )}
      </div>

      {/* 操作按钮区 */}
      <div className="shrink-0 flex items-center gap-1">
        {/* 编辑 / 删除按钮 (Hover 时浮现) */}
        <div className="hidden group-hover:flex items-center gap-0.5 mr-1 animate-in fade-in duration-100">
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

        {/* LAN 内网直达微胶囊 */}
        {card.lanLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(card.lanLink, card.openInNewWindow ? '_blank' : '_self');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
              isLan
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
            title={`内网直达: ${card.lanLink}`}
          >
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>LAN</span>
          </button>
        )}

        {/* WAN 外网直达微胶囊 */}
        {card.wanLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(card.wanLink, card.openInNewWindow ? '_blank' : '_self');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
              !isLan && !card.lanLink
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
            title={`外网直达: ${card.wanLink}`}
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>WAN</span>
          </button>
        )}
      </div>
    </div>
  );
};
