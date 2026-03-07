"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorFallbackProps {
    error?: unknown;
    resetErrorBoundary?: () => void;
    message?: string;
}

export const ErrorFallback = ({
    error,
    resetErrorBoundary,
    message = "Something went wrong",
}: ErrorFallbackProps) => {
    const errorMessage = error instanceof Error ? error.message : undefined;

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">{message}</p>
                {errorMessage && (
                    <p className="text-xs text-muted-foreground">{errorMessage}</p>
                )}
            </div>
            {resetErrorBoundary && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetErrorBoundary}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </Button>
            )}
        </div>
    );
};