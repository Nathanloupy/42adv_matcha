import { useEffect } from "react";
import { toast } from "sonner";
import { ProfileForm } from "./components/profile-form";
import { useProfile } from "@/hooks/useProfile";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function Profile() {
	const { isProfileCompleted } = useAuthContext();
	const {
		profile,
		isLoading,
		error,
		updateProfile,
		isUpdating,
		updateLocation,
		isUpdatingLocation,
	} = useProfile();

	useEffect(() => {
		if (!isProfileCompleted) {
			toast("Please complete your profile to continue.", {
				duration: 3000,
				id: "profile-incomplete",
			});
		}
	}, [isProfileCompleted]);

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
					onUpdateLocation={updateLocation}
					isLoading={isUpdating}
					isLocationLoading={isUpdatingLocation}
				/>
			</div>
		</div>
	);
}
