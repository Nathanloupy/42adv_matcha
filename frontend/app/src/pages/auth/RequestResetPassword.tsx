import { RequestResetPasswordForm } from "./components/request-reset-password-form";
import { useRequestResetPassword } from "@/hooks/useAuth";

export default function RequestResetPassword() {
	const { requestResetPassword, isLoading, error } = useRequestResetPassword();

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<RequestResetPasswordForm
					onSubmit={requestResetPassword}
					isLoading={isLoading}
					error={error}
				/>
			</div>
		</div>
	);
}
