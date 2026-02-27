interface AuthPageLayoutProps {
	children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">{children}</div>
		</div>
	);
}
