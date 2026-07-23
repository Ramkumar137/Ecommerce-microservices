import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

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
    // Global uncaught error monitoring placeholder
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected application error occurred. Please reload to try again.
          </p>
          <Button onClick={this.handleReset} className="mt-6">
            <RefreshCw className="mr-2 size-4" /> Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
