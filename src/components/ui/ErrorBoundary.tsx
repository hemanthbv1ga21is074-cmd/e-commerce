import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-accent flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-muted max-w-md mb-6">
            We encountered an unexpected error. Please refresh or try again later.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={this.handleReset}
              icon={<RotateCcw size={16} />}
            >
              Reload Page
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go to Homepage
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-xl text-left overflow-auto text-xs font-mono text-rose-700">
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
