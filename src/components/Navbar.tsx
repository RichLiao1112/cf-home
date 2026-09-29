import React, { useState } from 'react';
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
} from 'lucide-react';
import { NetworkContext, AuthSession, HeadLayout } from '../types';

interface Props {
  headLayout: HeadLayout;
  currentKey: string;
  configKeys: string[];
  networkContext: NetworkContext;
  authSession: AuthSession;
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

export const Navbar: React.FC<Props> = ({
  headLayout,
  currentKey,
  configKeys,
  networkContext,
  authSession,
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-2xl transition-all">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* 左侧：Logo、标题与空间切换 */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3">
            {headLayout.siteImage ? (
              <img
                src={headLayout.siteImage}
                alt="Logo"
                className="w-9 h-9 rounded-2xl object-cover border border-white/15 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 rounded-xl transition shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
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
                          ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
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
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新建配置空间</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右侧：操作中心 */}
        <div className="flex items-center gap-2">
          {/* Zero Trust 身份认证微章 */}
          {authSession.isZeroTrust && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 shadow-sm mr-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] truncate max-w-[160px]">
                {authSession.userEmail || 'Zero Trust'}
              </span>
            </div>
          )}

          {/* 聚光灯快捷搜索按钮 */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            title="聚光灯拼音搜索 (Cmd+K)"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs hidden lg:inline text-slate-400 font-mono">⌘K</span>
          </button>

          {/* 新建分类按钮 */}
          <button
            type="button"
            onClick={onAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            title="添加新分类"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">新分类</span>
          </button>

          {/* 视觉主题外观设置 */}
          <button
            type="button"
            onClick={onOpenAppearance}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title="个性化视觉与透明度"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* 版本快照 */}
          <button
            type="button"
            onClick={onOpenSnapshot}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title="版本快照与历史回滚"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* 数据备份与迁移 */}
          <button
            type="button"
            onClick={onOpenMigration}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title="数据备份与导入导出"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          {/* 回收站 */}
          <button
            type="button"
            onClick={onOpenRecycleBin}
            className="p-2 rounded-xl text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 transition"
            title="防误删回收站"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
