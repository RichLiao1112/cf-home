import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Edit3, Trash2 } from 'lucide-react';
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
  const accentColor = category.color || '#3B82F6';

  // 动态列样式映射 (1 - 8 列)
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 5: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 6: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      case 7: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7';
      case 8: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <section className="mb-10 group/category">
      {/* 分类标题栏 */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2.5">
          {/* 色彩标识指示条 */}
          <span
            className="w-1.5 h-4.5 rounded-full shadow-sm"
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="text-base font-semibold text-slate-100 tracking-wide flex items-center gap-2">
            <span>{category.title}</span>
            <span className="text-xs font-normal text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {category.cards.length}
            </span>
          </h3>
        </div>

        {/* 分类操作按钮 */}
        <div className="flex items-center gap-1 opacity-80 group-hover/category:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onAddCard(category.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/30 rounded-lg transition"
            title="添加新卡片"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加卡片</span>
          </button>
          <button
            type="button"
            onClick={() => onEditCategory(category)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-lg transition"
            title="编辑分类"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteCategory(category.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="删除分类"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 卡片栅格区与拖拽容器 */}
      <SortableContext items={category.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className={`grid gap-3 ${getGridColsClass(desktopColumns)}`}>
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
              className="col-span-full border-2 border-dashed border-white/10 hover:border-cyan-400/40 rounded-2xl p-6 text-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5 text-slate-500" />
              <p className="text-xs">该分类下暂无卡片，点击即可添加</p>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
};
