import React, { useState } from 'react';
import { X, Download, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { exportAllData, importAllData } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const MigrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `home-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('导出失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      alert('请先选择文件或粘贴 home.json 内容');
      return;
    }

    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await importAllData(parsed);
      if (res.success) {
        setSuccessMsg('导入成功！');
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 800);
      } else {
        alert('导入失败: ' + res.message);
      }
    } catch (e: any) {
      alert('JSON 格式错误: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl glass-modal p-6 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            <Download className="w-5 h-5 text-cyan-400" />
            <span>数据备份与一键迁移 (home.json)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导出区域 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
          <div className="font-semibold text-slate-200">导出数据</div>
          <p className="text-slate-400">
            一键下载当前所有空间、分类与卡片配置为完整的 `home.json` 文件。
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white glass-btn-secondary rounded-xl transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>导出 home.json</span>
          </button>
        </div>

        {/* 导入区域 */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
          <div className="font-semibold text-slate-200">从已有项目导入</div>
          <p className="text-slate-400">
            可直接上传或粘贴原有 NAS / Docker 项目中的 `home.json`，无缝继承所有已有卡片。
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-slate-200 hover:file:bg-white/20 cursor-pointer"
          />

          <textarea
            rows={5}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="或在此处直接粘贴 JSON 数据..."
            className="w-full p-2.5 rounded-xl glass-input text-slate-200 font-mono text-[11px] focus:outline-none"
          />

          {successMsg && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !jsonText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white glass-btn-primary rounded-xl transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>一键导入生效</span>
          </button>
        </div>
      </div>
    </div>
  );
};
