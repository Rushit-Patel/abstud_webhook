import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AutomationErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Automation Error Boundary caught an error:', error, errorInfo);
        
        // You can also log the error to an error reporting service here
        // Example: errorReportingService.captureException(error, { extra: errorInfo });
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
            }

            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <div className="max-w-md w-full">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription className="mt-2">
                                There was an error loading the automation builder. This might be due to a temporary issue.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="mt-4 space-y-3">
                            <Button 
                                onClick={this.resetError}
                                variant="outline"
                                className="w-full"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            
                            <Button 
                                onClick={() => window.location.reload()}
                                variant="secondary"
                                className="w-full"
                            >
                                Refresh Page
                            </Button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 p-3 bg-gray-50 rounded border">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                                    Error Details (Dev Mode)
                                </summary>
                                <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for functional components
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
    const WrappedComponent = (props: P) => (
        <AutomationErrorBoundary fallback={fallback}>
            <Component {...props} />
        </AutomationErrorBoundary>
    );
    
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
};