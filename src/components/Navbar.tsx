import React, { useState, useEffect } from 'react';
import {
  Search,
  Camera,
  Palette,
  Trash,
  DownloadCloud,
  Plus,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import { NetworkContext, AuthSession, HeadLayout, ThemePreset } from '../types';

interface Props {
  headLayout: HeadLayout;
  currentKey: string;
  configKeys: string[];
  networkContext: NetworkContext;
  authSession: AuthSession;
  theme?: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
  onSwitchKey: (key: string) => void;
  onCreateKey: () => void;
  onDeleteKey: (key: string) => void;
  onOpenSearch: () => void;
  onOpenSnapshot: () => void;
  onOpenAppearance: () => void;
  onOpenRecycleBin: () => void;
  onOpenMigration: () => void;
  onAddCategory: () => void;
}

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg
    viewBox="0 0 170 170"
    fill="currentColor"
    className={className}
  >
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.92-3.37-7.9-8.14-11.94-14.3-4.04-6.17-7.29-13.06-9.75-20.67-2.46-7.61-3.69-15.11-3.69-22.5 0-11.96 3.16-22.18 9.48-30.65 6.32-8.47 14.32-12.87 24-13.2 4.35 0 9.38 1.14 15.09 3.42 5.71 2.28 9.53 3.48 11.46 3.6 1.93-.12 5.92-1.37 11.97-3.75 6.05-2.38 11.08-3.41 15.09-3.09 11.53.88 20.62 5.17 27.27 12.87-10.02 6.08-14.92 14.46-14.7 25.13.22 8.27 3.33 15.34 9.33 21.21 6 5.88 13.06 9.24 21.18 10.08-2.07 6.1-4.68 12.18-7.83 18.25zM119.22 33.74c0-7.18 2.51-13.78 7.53-19.8 5.02-6.03 11.18-9.69 18.48-10.99.22 1.31.33 2.51.33 3.6 0 7.4-2.67 14.16-8.01 20.28-5.34 6.12-11.66 9.69-18.96 10.71-.44-1.31-.66-2.58-.66-3.8z" />
  </svg>
);

export const Navbar: React.FC<Props> = ({
  headLayout,
  currentKey,
  configKeys,
  networkContext,
  authSession,
  theme = 'linear',
  onThemeChange,
  onSwitchKey,
  onCreateKey,
  onDeleteKey,
  onOpenSearch,
  onOpenSnapshot,
  onOpenAppearance,
  onOpenRecycleBin,
  onOpenMigration,
  onAddCategory,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteImgError, setSiteImgError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 border-none ${
        isScrolled
          ? theme === 'apple'
            ? 'bg-black/40 backdrop-blur-2xl'
            : 'bg-slate-950/70 backdrop-blur-2xl'
          : 'bg-transparent backdrop-blur-none'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* 左侧：Logo、标题与空间切换 */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {headLayout.siteImage && !siteImgError ? (
              <img
                src={headLayout.siteImage}
                alt="Logo"
                onError={() => setSiteImgError(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl object-cover border border-white/15 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                {headLayout.name || 'Home'}
              </h1>
              {headLayout.subtitle && (
                <p className="text-[11px] text-slate-400 leading-tight mt-1 truncate max-w-[200px]">
                  {headLayout.subtitle}
                </p>
              )}
            </div>
          </div>

            {/* 空间切换器 Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-xl transition shadow-sm"
              >
                <Layers className={`w-3.5 h-3.5 ${theme === 'apple' ? 'text-white' : 'text-sky-400'}`} />
                <span>{currentKey}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      配置空间
                    </div>
                    {configKeys.map((key) => (
                      <div
                        key={key}
                        onClick={() => {
                          onSwitchKey(key);
                          setProfileDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition ${
                          key === currentKey
                            ? theme === 'apple'
                              ? 'bg-white/20 text-white font-semibold'
                              : 'bg-sky-500/20 text-sky-200 font-semibold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{key}</span>
                        {configKeys.length > 1 && key === currentKey && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`确认删除空间 "${key}" 吗？`)) {
                                onDeleteKey(key);
                                setProfileDropdownOpen(false);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-400 text-[10px] px-1"
                            title="删除当前空间"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-white/10 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onCreateKey();
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl transition font-medium ${
                        theme === 'apple'
                          ? 'text-white hover:bg-white/10'
                          : 'text-sky-300 hover:bg-sky-500/10'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新建配置空间</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 主题预设快捷切换器: Linear 极夜石墨 vs Apple 纯净毛玻璃 */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => onThemeChange('linear')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'linear'
                    ? 'bg-slate-800 text-sky-200 shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="切换为 Linear 极夜石墨风格"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span className="hidden md:inline">Linear</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('apple')}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'apple'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="切换为 Apple Pro 纯净毛玻璃风格"
              >
                <AppleIcon className="w-3 h-3" />
                <span className="hidden md:inline">Apple</span>
              </button>
            </div>
          </div>

          {/* 右侧：操作中心 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zero Trust 身份认证微章 */}
            {authSession.isZeroTrust && (
              <div
                className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shadow-sm border mr-1 ${
                  theme === 'apple'
                    ? 'bg-white/10 border-white/15 text-white/90'
                    : 'bg-slate-900/60 border-white/10 text-slate-300'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${theme === 'apple' ? 'text-white' : 'text-sky-400'}`} />
                <span className="font-mono text-[11px] truncate max-w-[160px]">
                  {authSession.userEmail || 'Zero Trust'}
                </span>
              </div>
            )}

            {/* 聚光灯快捷搜索按钮 */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
              title="聚光灯拼音搜索 (Cmd+K)"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs hidden lg:inline text-slate-400 font-mono">⌘K</span>
            </button>

            {/* 新建分类按钮 */}
            <button
              type="button"
              onClick={onAddCategory}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-medium text-xs shadow-md transition-all hover:scale-[1.02] ${
                theme === 'apple'
                  ? 'bg-white text-zinc-950 font-semibold shadow-white/10 hover:bg-white/90'
                  : 'bg-slate-800 text-sky-200 border border-sky-400/30 shadow-sky-950/20 hover:bg-slate-700/80'
              }`}
              title="添加新分类"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">新分类</span>
            </button>

          {/* 桌面端工具按钮组 */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenAppearance}
              className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              title="个性化视觉与透明度"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSnapshot}
              className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              title="版本快照与历史回滚"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenMigration}
              className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              title="数据备份与导入导出"
            >
              <DownloadCloud className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenRecycleBin}
              className="p-2 rounded-xl text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 transition"
              title="防误删回收站"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>

          {/* 移动端快捷更多操作菜单 */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              title="更多工具"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {mobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    主题风格
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1 py-1 mb-1 bg-black/40 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => onThemeChange('linear')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        theme === 'linear'
                          ? 'bg-slate-800 text-sky-200 border border-sky-400/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>Linear</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onThemeChange('apple')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        theme === 'apple'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <AppleIcon className="w-3 h-3" />
                      <span>Apple</span>
                    </button>
                  </div>

                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    工具与管理
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAppearance();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-xl transition text-left"
                  >
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>视觉与壁纸</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSnapshot();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-xl transition text-left"
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>历史版本快照</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenMigration();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-xl transition text-left"
                  >
                    <DownloadCloud className="w-4 h-4 text-cyan-400" />
                    <span>备份与迁移</span>
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRecycleBin();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 rounded-xl transition text-left"
                  >
                    <Trash className="w-4 h-4 text-rose-400" />
                    <span>回收站</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
