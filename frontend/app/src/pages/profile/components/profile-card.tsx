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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AGE_MIN, AGE_MAX } from "@/lib/constants";
import type { ProfileData, UpdateProfileData } from "@/hooks/useProfile";

interface ProfileCardProps {
	profile: ProfileData;
	onSubmit: (data: UpdateProfileData) => void;
	isLoading?: boolean;
}

export function ProfileCard({
	profile,
	onSubmit,
	isLoading,
}: ProfileCardProps) {
	const [email, setEmail] = useState(profile.email);
	const [age, setAge] = useState(profile.age ?? AGE_MIN);
	const [firstname, setFirstname] = useState(profile.firstname);
	const [surname, setSurname] = useState(profile.surname);
	const [biography, setBiography] = useState(profile.biography ?? "");
	const [gender, setGender] = useState(profile.gender ?? false);
	const [sexualPreference, setSexualPreference] = useState(
		profile.sexualPreference ?? 0,
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
			sexualPreference,
		});
	}

	const hasChanges =
		email !== profile.email ||
		age !== (profile.age ?? AGE_MIN) ||
		firstname !== profile.firstname ||
		surname !== profile.surname ||
		biography !== (profile.biography ?? "") ||
		gender !== (profile.gender ?? false) ||
		sexualPreference !== (profile.sexualPreference ?? 0);

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
									min={AGE_MIN}
									max={AGE_MAX}
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
							<Textarea
								id="biography"
								value={biography}
								onChange={(e) => setBiography(e.target.value)}
								rows={3}
								maxLength={256}
							/>
						</Field>
						<div className="grid grid-cols-2 gap-4">
							<Field>
								<FieldLabel htmlFor="gender">Gender</FieldLabel>
								<Select
									value={gender ? "true" : "false"}
									onValueChange={(v) =>
										setGender(v === "true")
									}
								>
									<SelectTrigger id="gender" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="false">Male</SelectItem>
										<SelectItem value="true">Female</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor="sexual_preference">
									Sexual preference
								</FieldLabel>
								<Select
									value={String(sexualPreference)}
									onValueChange={(v) =>
										setSexualPreference(Number(v))
									}
								>
									<SelectTrigger id="sexual_preference" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="0">Heterosexual</SelectItem>
										<SelectItem value="1">Homosexual</SelectItem>
										<SelectItem value="2">Bisexual</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>
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
