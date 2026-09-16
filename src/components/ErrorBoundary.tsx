import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise React Error Boundary
 * Catches runtime UI errors gracefully without unmounting the whole application.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-slate-900 border border-red-800/80 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-red-950 text-red-400 border border-red-800">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Workspace Recovery Mode Activated</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Workspace View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
