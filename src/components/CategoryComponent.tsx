import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Edit3, Trash2, Folder } from 'lucide-react';
import { Category, Card, NetworkContext } from '../types';
import { CardComponent } from './CardComponent';

interface Props {
  category: Category;
  desktopColumns: number;
  networkContext: NetworkContext;
  onAddCard: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CategoryComponent: React.FC<Props> = ({
  category,
  desktopColumns,
  networkContext,
  onAddCard,
  onEditCategory,
  onDeleteCategory,
  onEditCard,
  onDeleteCard,
}) => {
  const accentColor = category.color || '#38BDF8';

  // 动态列样式映射 (1 - 8 列，智能响应式分级)
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 5: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
      case 7: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7';
      case 8: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <section id={`cat-${category.id}`} className="mb-12 group/category scroll-mt-24">
      {/* Sun-Panel 经典分组标题栏 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shadow-sm"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide text-shadow">
            {category.title}
          </h3>
          <span className="text-[11px] font-semibold text-white/80 glass-btn-secondary px-2 py-0.5 rounded-full font-mono text-shadow">
            {category.cards.length}
          </span>
        </div>

        {/* 分类操作按钮组 (悬浮平滑显现) */}
        <div className="flex items-center gap-1 opacity-80 group-hover/category:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onAddCard(category.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white/90 glass-btn-secondary rounded-xl transition-all shadow-sm"
            title="添加新应用"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">添加</span>
          </button>
          <button
            type="button"
            onClick={() => onEditCategory(category)}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="编辑分类"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteCategory(category.id)}
            className="p-1.5 text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="删除分类"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sun-Panel 经典 APP 宫格网格区 (icon-small-box) */}
      <SortableContext items={category.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-y-6 gap-x-3 sm:gap-x-4 px-1">
          {category.cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              networkContext={networkContext}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}

          {category.cards.length === 0 && (
            <div
              onClick={() => onAddCard(category.id)}
              className="flex flex-col items-center justify-center cursor-pointer group"
              title="添加新服务"
            >
              <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl border-2 border-dashed border-white/20 group-hover:border-white/50 flex items-center justify-center text-white/50 group-hover:text-white group-hover:scale-105 transition-all glass-card-item">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/60 group-hover:text-white mt-1.5 text-shadow">
                添加
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
};
