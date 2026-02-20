import { SignUpForm } from "@/components/signup-form";
import { useAuth } from "@/hooks/useAuth";

export default function SignUp() {
	const { signUp, isLoading, error } = useAuth();

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SignUpForm
					onSubmit={signUp}
					isLoading={isLoading}
					error={error}
				/>
			</div>
		</div>
	);
}
