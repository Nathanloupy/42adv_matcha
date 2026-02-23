import { SignInForm } from "./components/signin-form";
import { useSignIn } from "@/hooks/useAuth";

export default function SignIn() {
	const { signIn, isLoading } = useSignIn();

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SignInForm
					onSubmit={signIn}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
