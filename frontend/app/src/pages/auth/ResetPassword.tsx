import { useSearchParams, Link } from "react-router-dom";
import { ResetPasswordForm } from "./components/reset-password-form";
import { useResetPassword } from "@/hooks/useAuth";
import { AuthPageLayout } from "@/components/AuthPageLayout";

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const { resetPassword, isLoading } = useResetPassword();

	if (!token) {
		return (
			<AuthPageLayout>
				<div className="text-center">
					<h1 className="text-2xl font-bold">Invalid link</h1>
					<p className="mt-2 text-muted-foreground">
						This password reset link is invalid or has expired.
					</p>
					<Link
						to="/request-reset-password"
						className="mt-4 inline-block text-sm underline-offset-4 hover:underline"
					>
						Request a new link
					</Link>
				</div>
			</AuthPageLayout>
		);
	}

	return (
		<AuthPageLayout>
			<ResetPasswordForm
				onSubmit={resetPassword}
				token={token}
				isLoading={isLoading}
			/>
		</AuthPageLayout>
	);
}
