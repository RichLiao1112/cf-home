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

      {/* 经典大圆角 Squircle 图标主体 - 纯净透明毛玻璃 */}
      <div
        {...attributes}
        {...listeners}
        className="sun-panel-icon w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden flex items-center justify-center relative bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.12)] transition-all duration-300 touch-none"
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/15 to-white/5">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-white text-shadow">
              {getInitial(card.title)}
            </span>
          </div>
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

