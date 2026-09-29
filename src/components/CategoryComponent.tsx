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
    <section id={`cat-${category.id}`} className="mb-10 group/category scroll-mt-24">
      {/* 分类标题栏 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          {/* 色彩立体光标 */}
          <div
            className="w-2.5 h-6 rounded-md shadow-sm"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}66`,
            }}
          />
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              {category.title}
            </h3>
            <span className="text-xs font-medium text-slate-400 bg-white/5 border border-white/[0.08] px-2 py-0.5 rounded-full font-mono">
              {category.cards.length}
            </span>
          </div>
        </div>

        {/* 分类操作按钮组 */}
        <div className="flex items-center gap-1.5 opacity-90 group-hover/category:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onAddCard(category.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/60 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 rounded-xl transition-all shadow-sm"
            title="添加新卡片"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加</span>
          </button>
          <button
            type="button"
            onClick={() => onEditCategory(category)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition"
            title="编辑分类"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteCategory(category.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            title="删除分类"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 卡片栅格区 */}
      <SortableContext items={category.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className={`grid gap-3.5 ${getGridColsClass(desktopColumns)}`}>
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
              className="col-span-full border-2 border-dashed border-white/10 hover:border-cyan-400/40 rounded-2xl p-8 text-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] cursor-pointer transition flex flex-col items-center justify-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium">该分类暂无卡片，点击即可添加新服务</p>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
};
