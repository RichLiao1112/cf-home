import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center text-slate-100 relative bg-mesh-linear">
          <div className="glass-modal p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">页面渲染遇到异常</h2>
            <p className="text-xs text-white/70 mb-6 leading-relaxed">
              {this.state.error?.message || '发生未知错误，可能是配置数据格式或网络连接异常。'}
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('cf_home_active_key');
                window.location.reload();
              }}
              className="glass-btn-primary px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置缓存并刷新</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
