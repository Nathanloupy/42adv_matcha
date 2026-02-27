import { SignInForm } from "./components/signin-form";
import { useSignIn } from "@/hooks/useAuth";
import { AuthPageLayout } from "@/components/AuthPageLayout";

export default function SignIn() {
	const { signIn, isLoading } = useSignIn();

	return (
		<AuthPageLayout>
			<SignInForm onSubmit={signIn} isLoading={isLoading} />
		</AuthPageLayout>
	);
}
