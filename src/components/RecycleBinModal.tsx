import React from 'react';
import { X, Trash2, RotateCcw } from 'lucide-react';
import { RecycleBin, Card, Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recycleBin: RecycleBin;
  onRestoreCategory: (recycleId: string) => void;
  onRestoreCard: (recycleId: string) => void;
  onClearAll: () => void;
}

export const RecycleBinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recycleBin,
  onRestoreCategory,
  onRestoreCard,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const totalCount = (recycleBin.categories?.length || 0) + (recycleBin.cards?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="glass-modal relative w-full max-w-xl rounded-2xl p-6 z-10 max-h-[85vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>回收站 ({totalCount})</span>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('确认清空回收站吗？此操作无法撤销。')) {
                    onClearAll();
                  }
                }}
                className="glass-btn-danger px-3 py-1.5 text-xs rounded-xl"
              >
                清空回收站
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {totalCount === 0 ? (
            <div className="py-12 text-center text-slate-400">
              回收站为空
            </div>
          ) : (
            <>
              {/* 已删除的分类 */}
              {recycleBin.categories?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    已删除分类 ({recycleBin.categories.length})
                  </div>
                  {recycleBin.categories.map((item) => (
                    <div
                      key={item.recycleId}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition"
                    >
                      <div>
                        <div className="font-medium text-slate-100">{item.data.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          内含 {item.data.cards?.length || 0} 个卡片 · 删除于{' '}
                          {new Date(item.deletedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestoreCategory(item.recycleId)}
                        className="glass-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>恢复分类</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 已删除的卡片 */}
              {recycleBin.cards?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    已删除卡片 ({recycleBin.cards.length})
                  </div>
                  {recycleBin.cards.map((item) => (
                    <div
                      key={item.recycleId}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition"
                    >
                      <div>
                        <div className="font-medium text-slate-100">{item.data.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          原分类：{item.sourceCategoryTitle} · 删除于{' '}
                          {new Date(item.deletedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestoreCard(item.recycleId)}
                        className="glass-btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>恢复卡片</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
