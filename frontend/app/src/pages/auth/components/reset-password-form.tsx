import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ResetPasswordFormProps extends Omit<
	React.ComponentProps<"div">,
	"onSubmit"
> {
	onSubmit: (data: { token: string; new_password: string }) => void;
	token: string;
	isLoading?: boolean;
	error?: { message: string } | null;
}

export function ResetPasswordForm({
	className,
	onSubmit,
	token,
	isLoading,
	error,
	...props
}: ResetPasswordFormProps) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setValidationError(null);

		if (password.length < 8) {
			setValidationError("Password must be at least 8 characters long");
			return;
		}

		if (password !== confirmPassword) {
			setValidationError("Passwords do not match");
			return;
		}

		onSubmit({ token, new_password: password });
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Set your new password</CardTitle>
					<CardDescription>
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="password">
									New password
								</FieldLabel>
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
								<FieldLabel htmlFor="confirm-password">
									Confirm password
								</FieldLabel>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
								/>
							</Field>
							{(validationError || error) && (
								<p className="text-sm text-destructive">
									{validationError ?? error?.message}
								</p>
							)}
							<Field>
								<Button type="submit" disabled={isLoading}>
									{isLoading
										? "Resetting..."
										: "Reset password"}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
