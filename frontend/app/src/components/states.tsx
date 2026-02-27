interface LoadingStateProps {
	message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
	return (
		<div className="flex items-center justify-center h-full">
			<span className="text-muted-foreground">{message}</span>
		</div>
	);
}

interface ErrorStateProps {
	error?: unknown;
	fallback?: string;
}

export function ErrorState({
	error,
	fallback = "Something went wrong",
}: ErrorStateProps) {
	const message =
		error instanceof Error ? error.message : fallback;
	return (
		<div className="flex items-center justify-center h-full">
			<span className="text-destructive">{message}</span>
		</div>
	);
}

interface EmptyStateProps {
	title: string;
	subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center h-full gap-2">
			<span className="text-xl font-semibold text-white">{title}</span>
			{subtitle && (
				<span className="text-muted-foreground text-sm">{subtitle}</span>
			)}
		</div>
	);
}

/** Inline (non-full-height) loading row, used inside scrollable pages */
export function InlineLoadingState({ message = "Loading..." }: LoadingStateProps) {
	return (
		<div className="flex items-center justify-center py-16">
			<span className="text-muted-foreground">{message}</span>
		</div>
	);
}

/** Inline error row */
export function InlineErrorState({ error, fallback = "Failed to load" }: ErrorStateProps) {
	const message = error instanceof Error ? error.message : fallback;
	return (
		<div className="flex items-center justify-center py-16">
			<span className="text-destructive">{message}</span>
		</div>
	);
}

/** Inline empty row */
export function InlineEmptyState({ title, subtitle }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 gap-2">
			<span className="text-muted-foreground">{title}</span>
			{subtitle && (
				<span className="text-xs text-muted-foreground/60">{subtitle}</span>
			)}
		</div>
	);
}
