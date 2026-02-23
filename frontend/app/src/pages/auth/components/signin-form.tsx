import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SignInFormProps extends Omit<
	React.ComponentProps<"div">,
	"onSubmit"
> {
	onSubmit: (data: { username: string; password: string }) => void;
	isLoading?: boolean;
}

export function SignInForm({
	className,
	onSubmit,
	isLoading,
	...props
}: SignInFormProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		onSubmit({ username, password });
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Sign in to your account</CardTitle>
					<CardDescription>
						Enter your credentials below to sign in to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="username">
									Username
								</FieldLabel>
								<Input
									id="username"
									type="text"
									placeholder="cat"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
									required
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">
										Password
									</FieldLabel>
									<Link
										to="/request-reset-password"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
						</Field>
						<Field>
							<Button type="submit" disabled={isLoading}>
									{isLoading ? "Signing in..." : "Sign in"}
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<Link
										to="/signup"
										className="underline underline-offset-4 hover:text-primary"
									>
										Sign up
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
