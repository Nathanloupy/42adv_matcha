import { SignInForm } from "@/components/signin-form";
import { useAuth } from "@/hooks/useAuth";

export default function SignIn() {
	const { signin, isLoading, error } = useAuth();

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SignInForm
					onSubmit={signin}
					isLoading={isLoading}
					error={error}
				/>
			</div>
		</div>
	);
}
