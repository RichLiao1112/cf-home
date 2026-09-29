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

  // 生成优雅底座色彩 (Linear 莫兰迪哑光科技冷调 - 调淡柔和)
  const getGradientFromTitle = (title: string) => {
    const gradients = [
      'from-slate-800/60 to-slate-900/70 text-slate-200 border-white/10',
      'from-indigo-950/50 to-slate-900/65 text-indigo-300 border-indigo-500/20',
      'from-emerald-950/50 to-slate-900/65 text-emerald-300 border-emerald-500/20',
      'from-sky-950/50 to-slate-900/65 text-sky-300 border-sky-500/20',
      'from-amber-950/50 to-slate-900/65 text-amber-300 border-amber-500/20',
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
      className="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer select-none touch-manipulation hover:-translate-y-0.5 bg-slate-900/30 hover:bg-slate-800/50 border border-white/[0.07] hover:border-sky-400/30 backdrop-blur-xl shadow-sm hover:shadow-sky-500/5"
    >
      {/* 拖拽手柄 (常驻展示) */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center opacity-40 hover:!opacity-100 group-hover:opacity-75 transition-opacity cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200 -ml-1 shrink-0 touch-none"
        title="拖动排序"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* 质感图标底座 */}
      <div className="shrink-0 relative">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center overflow-hidden border p-1 shadow-inner transition-transform duration-300 group-hover:scale-105 ${
          card.cover && !imgError
            ? 'bg-slate-900/50 border-white/10'
            : `bg-gradient-to-br ${getGradientFromTitle(card.title)}`
        }`}>
          {card.cover && !imgError ? (
            <img
              src={card.cover}
              alt={card.title}
              className="w-full h-full object-contain rounded-md"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-base font-bold font-mono tracking-wider">
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
          <h4 className="text-sm font-semibold transition-colors truncate text-slate-100 group-hover:text-sky-300">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-white/10 transition"
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
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-all shrink-0 ${
              isLan
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
            title={`内网直达: ${card.lanLink}`}
          >
            <Wifi className="w-2.5 h-2.5 text-emerald-400" />
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
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-all shrink-0 ${
              !isLan && !card.lanLink
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
            }`}
            title={`外网直达: ${card.wanLink}`}
          >
            <Globe className="w-2.5 h-2.5 text-sky-400" />
            <span>WAN</span>
          </button>
        )}
      </div>
    </div>
  );
};
