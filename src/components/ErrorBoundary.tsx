import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Luma] ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
          style={{
            background: "var(--bg-main, #1A1410)",
            color: "var(--text-primary, #FFF3DC)",
          }}
        >
          <div className="space-y-3">
            <p className="text-4xl">🌸</p>
            <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary, #FFF3DC)" }}>
              Ups, ada yang nggak beres
            </h1>
            <p
              className="max-w-[32ch] text-sm leading-6"
              style={{ color: "var(--text-secondary, #CDBEA8)" }}
            >
              Tenang, datanya tetap aman. Coba muat ulang halaman ini ya.
            </p>
            {this.state.error?.message ? (
              <p
                className="mx-auto max-w-[40ch] rounded-2xl px-4 py-3 text-xs leading-5"
                style={{
                  background: "var(--bg-card-soft, #342A22)",
                  color: "var(--text-muted, #9C8D7B)",
                  border: "1px solid var(--border-soft, rgba(255,243,220,0.08))",
                }}
              >
                {this.state.error.message}
              </p>
            ) : null}
          </div>

          <button
            className="inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-sm font-bold transition-opacity hover:opacity-90"
            onClick={this.handleReset}
            style={{
              background: "linear-gradient(160deg, var(--accent-soft, #F4D6A0), var(--accent-primary, #E8A857))",
              color: "var(--text-on-accent, #1A1410)",
            }}
            type="button"
          >
            Coba Lagi ✨
          </button>

          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted, #9C8D7B)" }}
          >
            Luma
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
