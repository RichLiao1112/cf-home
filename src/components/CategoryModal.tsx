import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: Category | null;
  onSave: (category: Partial<Category>) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // 蓝
  '#10B981', // 绿
  '#F59E0B', // 琥珀橙
  '#8B5CF6', // 紫
  '#EC4899', // 粉
  '#06B6D4', // 青
  '#EF4444', // 红
  '#64748B', // 灰
];

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialCategory,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (initialCategory) {
      setTitle(initialCategory.title || '');
      setColor(initialCategory.color || '#3B82F6');
    } else {
      setTitle('');
      setColor('#3B82F6');
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入分类名称');
      return;
    }
    onSave({
      id: initialCategory?.id || crypto.randomUUID(),
      title: title.trim(),
      color,
      cards: initialCategory?.cards || [],
      position: initialCategory?.position ?? 999,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-slate-100">
            {initialCategory ? '编辑分类' : '新建分类'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">分类名称 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：媒体影音、开发工具、智能家居"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">分类主题色</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0"
                title="自定义颜色"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:bg-white/10 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-md transition"
            >
              保存分类
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
