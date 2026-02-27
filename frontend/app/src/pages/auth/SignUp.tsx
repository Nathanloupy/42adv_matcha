import { SignUpForm } from "./components/signup-form";
import { useSignUp } from "@/hooks/useAuth";
import { AuthPageLayout } from "@/components/AuthPageLayout";

export default function SignUp() {
	const { signUp, isLoading } = useSignUp();

	return (
		<AuthPageLayout>
			<SignUpForm onSubmit={signUp} isLoading={isLoading} />
		</AuthPageLayout>
	);
}
