import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
  retryButtonProps?: Partial<ButtonProps>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  retryLabel = "Retry",
  onRetry,
  actions,
  retryButtonProps,
  className,
  ...props
}) => {
  const hasRetry = typeof onRetry === "function";

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive",
        className
      )}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="text-sm text-destructive/80">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {hasRetry ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            {...retryButtonProps}
          >
            {retryLabel}
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
};
