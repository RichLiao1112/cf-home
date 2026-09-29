import React, { useState } from 'react';
import {
  Search,
  Camera,
  Palette,
  Trash,
  DownloadCloud,
  Plus,
  ShieldCheck,
  Wifi,
  Globe,
  Layers,
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
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/[var(--nav-opacity,0.65)] backdrop-blur-xl transition-all">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* 左侧：Logo、标题与空间切换 */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3">
            {headLayout.siteImage ? (
              <img
                src={headLayout.siteImage}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-cover border border-white/15"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
                {headLayout.name?.slice(0, 1) || 'H'}
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentKey}</span>
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                    <span>新建空间...</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 中间：快速搜索栏（点击唤醒 Spotlight） */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-xl transition shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>搜索卡片、网址、分类 (支持拼音)...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-300 bg-white/10 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* 右侧：网络状态、Zero Trust 标识与功能按钮 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 移动端搜索按钮 */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-300 hover:bg-white/10 rounded-xl border border-white/10"
            title="搜索 (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 网络环境标签 */}
          <div
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              networkContext.networkType === 'lan'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30'
            }`}
            title={`客户端 IP: ${networkContext.clientIP}`}
          >
            {networkContext.networkType === 'lan' ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <Globe className="w-3 h-3 text-cyan-400" />
            )}
            <span>{networkContext.networkType === 'lan' ? 'LAN 内网' : 'WAN 公网'}</span>
          </div>

          {/* Cloudflare Zero Trust 标识 */}
          {authSession.isZeroTrust && (
            <div
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-400/30"
              title={`Zero Trust 鉴权用户: ${authSession.userEmail}`}
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span className="max-w-[120px] truncate">{authSession.userEmail}</span>
            </div>
          )}

          {/* 按钮群组 */}
          <button
            type="button"
            onClick={onAddCategory}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-md shadow-cyan-500/20 transition active:scale-95"
            title="添加分类"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">分类</span>
          </button>

          <button
            type="button"
            onClick={onOpenAppearance}
            className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="个性化外观与透明度设置"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSnapshot}
            className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="版本快照与历史备份"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenRecycleBin}
            className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="回收站"
          >
            <Trash className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenMigration}
            className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="导入 / 导出 home.json 数据"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
