import { useEffect, useRef } from "react";
import { ProfileForm } from "@/components/profile-form";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
	const { profile, fetchProfile, updateProfile, isLoading, error } =
		useProfile();
	const calledRef = useRef(false);

	useEffect(() => {
		if (!calledRef.current) {
			calledRef.current = true;
			fetchProfile();
		}
	}, [fetchProfile]);

	if (!profile) {
		if (isLoading) {
			return (
				<div className="flex min-h-full items-center justify-center">
					<p className="text-muted-foreground">Loading profile...</p>
				</div>
			);
		}
		if (error) {
			return (
				<div className="flex min-h-full items-center justify-center">
					<p className="text-sm text-destructive">{error.message}</p>
				</div>
			);
		}
		return null;
	}

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<ProfileForm
					profile={profile}
					onSubmit={updateProfile}
					isLoading={isLoading}
					error={error}
				/>
			</div>
		</div>
	);
}
