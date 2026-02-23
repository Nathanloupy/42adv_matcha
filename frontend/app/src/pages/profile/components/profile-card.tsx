import { useState, type FormEvent } from "react";
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

interface ProfileCardProps {
	profile: ProfileData;
	onSubmit: (data: UpdateProfileData) => void;
	isLoading?: boolean;
	error?: string;
}

export function ProfileCard({
	profile,
	onSubmit,
	isLoading,
	error,
}: ProfileCardProps) {
	const [email, setEmail] = useState(profile.email);
	const [age, setAge] = useState(profile.age ?? 3);
	const [firstname, setFirstname] = useState(profile.firstname);
	const [surname, setSurname] = useState(profile.surname);
	const [biography, setBiography] = useState(profile.biography ?? "");
	const [gender, setGender] = useState(profile.gender ?? false);
	const [sexualPreference, setSexualPreference] = useState(
		profile.sexual_preference ?? 0,
	);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		onSubmit({
			email,
			age,
			firstname,
			surname,
			biography,
			gender,
			sexual_preference: sexualPreference,
		});
	}

	const hasChanges =
		email !== profile.email ||
		age !== (profile.age ?? 3) ||
		firstname !== profile.firstname ||
		surname !== profile.surname ||
		biography !== (profile.biography ?? "") ||
		gender !== (profile.gender ?? false) ||
		sexualPreference !== (profile.sexual_preference ?? 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Signed in as{" "}
					<span className="font-semibold">{profile.username}</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex items-center justify-between rounded-md border border-border bg-muted/50 px-4 py-3">
					<span className="text-sm text-muted-foreground">
						Fame rating
					</span>
					<span className="text-lg font-semibold text-foreground">
						{profile.fame ?? 0}
					</span>
				</div>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<div className="grid grid-cols-3 gap-4">
							<Field className="col-span-2">
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="age">Age</FieldLabel>
								<Input
									id="age"
									type="number"
									min={3}
									max={30}
									value={age}
									onChange={(e) =>
										setAge(Number(e.target.value))
									}
									required
								/>
							</Field>
						</div>
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
									onChange={(e) => setSurname(e.target.value)}
									required
								/>
							</Field>
						</div>
						<Field>
							<FieldLabel htmlFor="biography">
								Biography
							</FieldLabel>
							<textarea
								id="biography"
								value={biography}
								onChange={(e) => setBiography(e.target.value)}
								rows={3}
								maxLength={256}
								className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none dark:bg-input/30"
							/>
						</Field>
						<div className="grid grid-cols-2 gap-4">
							<Field>
								<FieldLabel htmlFor="gender">Gender</FieldLabel>
								<select
									id="gender"
									value={gender ? "true" : "false"}
									onChange={(e) =>
										setGender(e.target.value === "true")
									}
									className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none dark:bg-input/30"
								>
									<option value="false">Male</option>
									<option value="true">Female</option>
								</select>
							</Field>
							<Field>
								<FieldLabel htmlFor="sexual_preference">
									Sexual preference
								</FieldLabel>
								<select
									id="sexual_preference"
									value={sexualPreference}
									onChange={(e) =>
										setSexualPreference(
											Number(e.target.value),
										)
									}
									className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none dark:bg-input/30"
								>
									<option value={0}>Heterosexual</option>
									<option value={1}>Homosexual</option>
									<option value={2}>Bisexual</option>
								</select>
							</Field>
						</div>
						{error && (
							<p className="text-sm text-destructive">{error}</p>
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
	);
}
