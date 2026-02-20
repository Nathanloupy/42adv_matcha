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

interface RequestResetPasswordFormProps extends Omit<
	React.ComponentProps<"div">,
	"onSubmit"
> {
	onSubmit: (data: { email: string }) => void;
	isLoading?: boolean;
	error?: { message: string } | null;
}

export function RequestResetPasswordForm({
	className,
	onSubmit,
	isLoading,
	error,
	...props
}: RequestResetPasswordFormProps) {
	const [email, setEmail] = useState("");

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		onSubmit({ email });
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Reset your password</CardTitle>
					<CardDescription>
						Enter your email to receive a link to reset your
						password
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="cat@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</Field>
							{error && (
								<p className="text-sm text-destructive">
									{error.message}
								</p>
							)}
							<Field>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Sending..." : "Send link"}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
