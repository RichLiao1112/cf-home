import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Card, Category } from '../types';
import { fetchSiteMetadata } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCard?: Card | null;
  targetCategoryId?: string;
  onSave: (card: Card) => void;
}

export const CardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  initialCard,
  targetCategoryId,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [wanLink, setWanLink] = useState('');
  const [lanLink, setLanLink] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  useEffect(() => {
    if (initialCard) {
      setTitle(initialCard.title || '');
      setDescription(initialCard.description || '');
      setCover(initialCard.cover || '');
      setWanLink(initialCard.wanLink || '');
      setLanLink(initialCard.lanLink || '');
      setOpenInNewWindow(initialCard.openInNewWindow ?? true);
      setCategoryId(initialCard.categoryId || categories[0]?.id || '');
    } else {
      setTitle('');
      setDescription('');
      setCover('');
      setWanLink('');
      setLanLink('');
      setOpenInNewWindow(true);
      setCategoryId(targetCategoryId || categories[0]?.id || '');
    }
  }, [initialCard, targetCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleFetchMeta = async () => {
    const targetUrl = wanLink.trim() || lanLink.trim();
    if (!targetUrl) {
      alert('请先输入外网或内网网址');
      return;
    }

    setIsFetchingMeta(true);
    try {
      const data = await fetchSiteMetadata(targetUrl);
      if (data) {
        if (!title && data.title) setTitle(data.title);
        if (!description && data.description) setDescription(data.description);
        if (!cover && data.favicon) setCover(data.favicon);
      } else {
        alert('未能自动拉取到元数据，可手动输入');
      }
    } catch {
      alert('拉取失败，请手动填写');
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入卡片标题');
      return;
    }

    onSave({
      id: initialCard?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      cover: cover.trim() || undefined,
      wanLink: wanLink.trim() || undefined,
      lanLink: lanLink.trim() || undefined,
      openInNewWindow,
      position: initialCard?.position ?? 999,
      categoryId: categoryId || categories[0]?.id || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="glass-modal relative w-full max-w-lg rounded-2xl p-6 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-slate-100">
            {initialCard ? '编辑卡片' : '添加新卡片'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 所属分类 */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">所属分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-slate-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* 外网与内网链接 */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">WAN 外网链接</label>
                <button
                  type="button"
                  onClick={handleFetchMeta}
                  disabled={isFetchingMeta}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 disabled:opacity-50"
                >
                  {isFetchingMeta ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>智能解析标题/图标</span>
                </button>
              </div>
              <input
                type="text"
                value={wanLink}
                onChange={(e) => setWanLink(e.target.value)}
                placeholder="https://example.com"
                className="glass-input w-full px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">LAN 局域网链接 (可选)</label>
              <input
                type="text"
                value={lanLink}
                onChange={(e) => setLanLink(e.target.value)}
                placeholder="http://192.168.1.100:8080"
                className="glass-input w-full px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
              />
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">卡片名称 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Jellyfin 媒体库"
              className="glass-input w-full px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">备注说明 (可选)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：个人高清影院"
              className="glass-input w-full px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
            />
          </div>

          {/* 图标链接与预览 */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">图标 URL (可选)</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://.../favicon.png"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
              />
              {cover && (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <img src={cover} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* 在新窗口中打开 */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="openInNewWindow"
              checked={openInNewWindow}
              onChange={(e) => setOpenInNewWindow(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0 w-4 h-4"
            />
            <label htmlFor="openInNewWindow" className="text-slate-300 cursor-pointer">
              在新标签页中打开链接
            </label>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="glass-btn-secondary px-4 py-2 rounded-xl"
            >
              取消
            </button>
            <button
              type="submit"
              className="glass-btn-primary px-5 py-2 font-semibold rounded-xl"
            >
              保存卡片
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
