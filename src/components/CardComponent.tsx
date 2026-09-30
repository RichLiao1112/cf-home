import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, ExternalLink, Wifi, Globe } from 'lucide-react';
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

  // Sun-Panel 标志性多彩 Squircle 渐变底座
  const getGradientFromTitle = (title: string) => {
    const gradients = [
      'from-blue-600 via-indigo-600 to-violet-700 shadow-indigo-500/25',
      'from-emerald-500 via-teal-600 to-cyan-700 shadow-teal-500/25',
      'from-amber-500 via-orange-600 to-red-600 shadow-orange-500/25',
      'from-fuchsia-600 via-pink-600 to-rose-600 shadow-pink-500/25',
      'from-sky-500 via-blue-600 to-indigo-700 shadow-blue-500/25',
      'from-violet-600 via-purple-700 to-slate-800 shadow-purple-500/25',
      'from-cyan-500 via-teal-600 to-emerald-700 shadow-cyan-500/25',
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
      className="group relative flex flex-col items-center justify-start w-full cursor-pointer select-none transition-transform duration-200"
      onClick={handleClick}
      title={card.description || card.title}
    >
      {/* 悬浮微型快捷操作工具栏 (编辑 / 删除 / 新标签打开) */}
      <div className="absolute -top-3 right-0 sm:right-1 z-20 hidden group-hover:flex items-center gap-1 bg-black/85 backdrop-blur-xl border border-white/20 rounded-lg p-1 shadow-2xl animate-in fade-in duration-150">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
          className="p-1 rounded-md text-slate-300 hover:text-sky-300 hover:bg-white/10 transition"
          title="编辑应用"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="p-1 rounded-md text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition"
          title="删除应用"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        {card.lanLink && card.wanLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(card.lanLink, card.openInNewWindow ? '_blank' : '_self');
            }}
            className="p-1 rounded-md text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition text-[9px] font-mono"
            title={`内网直达: ${card.lanLink}`}
          >
            LAN
          </button>
        )}
      </div>

      {/* Sun-Panel 经典大圆角 Squircle 图标主体 */}
      <div
        {...attributes}
        {...listeners}
        className="sun-panel-icon w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden flex items-center justify-center relative bg-[#2a2a2a6b] border border-white/15 backdrop-blur-md touch-none"
      >
        {card.cover && !imgError ? (
          <div className="w-full h-full p-2.5 flex items-center justify-center">
            <img
              src={card.cover}
              alt={card.title}
              className="w-full h-full object-contain drop-shadow"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradientFromTitle(card.title)} flex items-center justify-center`}>
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-white drop-shadow-md">
              {getInitial(card.title)}
            </span>
          </div>
        )}

        {/* 状态徽标小光点 (Sun-Panel 右上角网络感知角标) */}
        {card.lanLink && (
          <span
            className="absolute top-1.5 right-1.5 flex h-2 w-2"
            title={isLan ? '当前局域网可用 (LAN)' : '已配置局域网直连'}
          >
            {isLan && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 border border-black/40 ${isLan ? 'bg-emerald-400' : 'bg-emerald-600/70'}`} />
          </span>
        )}
        {!card.lanLink && card.wanLink && (
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400/80 border border-black/40"
            title="公网访问 (WAN)"
          />
        )}
      </div>

      {/* 图标下方单行居中文本 (Sun-Panel 经典 app-icon-text-shadow 阴影) */}
      <div className="w-full text-center mt-2 px-0.5">
        <span className="text-xs sm:text-[13px] font-medium text-white truncate block app-icon-text-shadow tracking-tight select-none">
          {card.title}
        </span>
      </div>
    </div>
  );
};

