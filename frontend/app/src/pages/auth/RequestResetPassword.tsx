import { RequestResetPasswordForm } from "./components/request-reset-password-form";
import { useRequestResetPassword } from "@/hooks/useAuth";
import { AuthPageLayout } from "@/components/AuthPageLayout";

export default function RequestResetPassword() {
	const { requestResetPassword, isLoading } = useRequestResetPassword();

	return (
		<AuthPageLayout>
			<RequestResetPasswordForm
				onSubmit={requestResetPassword}
				isLoading={isLoading}
			/>
		</AuthPageLayout>
	);
}
