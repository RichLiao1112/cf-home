import React, { useState, useEffect } from 'react';
import { X, Camera, RotateCcw, Plus, Loader2 } from 'lucide-react';
import { SnapshotMeta } from '../types';
import { fetchSnapshots, createSnapshot, restoreSnapshot } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onRestoreSuccess: () => void;
}

export const SnapshotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentKey,
  onRestoreSuccess,
}) => {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [creating, setCreating] = useState(false);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await fetchSnapshots(currentKey);
      setSnapshots(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
      setNewNote('');
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createSnapshot(currentKey, newNote);
      setNewNote('');
      await loadList();
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (id: string, note?: string) => {
    if (window.confirm(`确认还原到该快照版本吗？\n${note || '无备注'}\n系统将在恢复前自动为您创建一份保护快照。`)) {
      setLoading(true);
      try {
        await restoreSnapshot(currentKey, id);
        onRestoreSuccess();
        onClose();
      } catch (err: any) {
        alert('还原失败: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl z-10 max-h-[85vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>版本快照管理 ({currentKey})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 手动创建快照表单 */}
        <form onSubmit={handleCreate} className="flex gap-2 shrink-0">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="快照备注（例如：整理媒体分类前备份）"
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>创建快照</span>
          </button>
        </form>

        {/* 快照历史记录列表 */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : snapshots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              当前配置空间暂无历史快照
            </div>
          ) : (
            snapshots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{s.note || '手动快照'}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        s.reason === 'before_restore'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-400/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20'
                      }`}
                    >
                      {s.reason === 'before_restore' ? '恢复保护备份' : '手动'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {new Date(s.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(s.id, s.note)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>一键还原</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
