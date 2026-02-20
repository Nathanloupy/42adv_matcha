import { useState, useEffect, type FormEvent } from "react";
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
import type { ProfileData, UpdateProfileData } from "@/hooks/useProfile";

interface ProfileFormProps
	extends Omit<React.ComponentProps<"div">, "onSubmit"> {
	profile: ProfileData;
	onSubmit: (data: UpdateProfileData) => void;
	isLoading?: boolean;
	error?: { message: string } | null;
}

export function ProfileForm({
	className,
	profile,
	onSubmit,
	isLoading,
	error,
	...props
}: ProfileFormProps) {
	const [email, setEmail] = useState(profile.email);
	const [firstname, setFirstname] = useState(profile.firstname);
	const [surname, setSurname] = useState(profile.surname);

	useEffect(() => {
		setEmail(profile.email);
		setFirstname(profile.firstname);
		setSurname(profile.surname);
	}, [profile]);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		onSubmit({ email, firstname, surname });
	}

	const hasChanges =
		email !== profile.email ||
		firstname !== profile.firstname ||
		surname !== profile.surname;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>
						Signed in as{" "}
						<span className="font-semibold">
							{profile.username}
						</span>
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
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</Field>
							<div className="grid grid-cols-2 gap-4">
								<Field>
									<FieldLabel htmlFor="firstname">
										First name
									</FieldLabel>
									<Input
										id="firstname"
										type="text"
										value={firstname}
										onChange={(e) =>
											setFirstname(e.target.value)
										}
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="surname">
										Surname
									</FieldLabel>
									<Input
										id="surname"
										type="text"
										value={surname}
										onChange={(e) =>
											setSurname(e.target.value)
										}
										required
									/>
								</Field>
							</div>
							{error && (
								<p className="text-sm text-destructive">
									{error.message}
								</p>
							)}
							<Field>
								<Button
									type="submit"
									disabled={isLoading || !hasChanges}
								>
									{isLoading ? "Saving..." : "Save changes"}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
