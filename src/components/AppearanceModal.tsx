import React, { useState, useEffect } from 'react';
import { X, Sliders } from 'lucide-react';
import { HeadLayout } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLayout: HeadLayout;
  onSave: (layout: HeadLayout) => void;
}

export const AppearanceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialLayout,
  onSave,
}) => {
  const [layout, setLayout] = useState<HeadLayout>(initialLayout);

  useEffect(() => {
    setLayout(initialLayout);
  }, [initialLayout, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof HeadLayout, value: any) => {
    setLayout((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(layout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="glass-modal relative w-full max-w-lg rounded-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            <Sliders className="w-5 h-5 text-sky-400" />
            <span>视觉外观与透明度个性化</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 站点名称与副标题 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">导航站名称</label>
              <input
                type="text"
                value={layout.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">副标题 (可选)</label>
              <input
                type="text"
                value={layout.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-slate-100"
              />
            </div>
          </div>

          {/* 桌面端卡片列数 */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">桌面端卡片列数</span>
              <span className="text-sky-400 font-bold">{layout.desktopColumns || 4} 列</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={layout.desktopColumns || 4}
              onChange={(e) => handleChange('desktopColumns', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* 背景图片 URL */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">壁纸背景图片 URL (可选)</label>
            <input
              type="text"
              value={layout.backgroundImage || ''}
              onChange={(e) => handleChange('backgroundImage', e.target.value)}
              placeholder="https://images.unsplash.com/... 或任意图片直链"
              className="glass-input w-full px-3 py-2 rounded-xl text-slate-100 placeholder-white/30"
            />
          </div>

          {/* 背景模糊度 Blur */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">背景毛玻璃模糊度 (Blur)</span>
              <span className="text-sky-400 font-bold">{layout.backgroundBlur || 0} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={layout.backgroundBlur || 0}
              onChange={(e) => handleChange('backgroundBlur', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* 遮罩透明度 */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">暗色遮罩透明度</span>
              <span className="text-sky-400 font-bold">{layout.overlayOpacity ?? 70}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={layout.overlayOpacity ?? 70}
              onChange={(e) => handleChange('overlayOpacity', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* 顶栏透明度 */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">顶栏不透明度 (Nav Opacity)</span>
              <span className="text-sky-400 font-bold">{layout.navOpacity ?? 62}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={2}
              value={layout.navOpacity ?? 62}
              onChange={(e) => handleChange('navOpacity', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* 卡片玻璃底色透明度 */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium">卡片玻璃底色透明度</span>
              <span className="text-sky-400 font-bold">{layout.cardOpacity ?? 5}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={layout.cardOpacity ?? 5}
              onChange={(e) => handleChange('cardOpacity', Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

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
              应用并保存外观
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
