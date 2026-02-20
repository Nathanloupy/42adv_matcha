import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ProfileCard } from "./profile-card";
import { LocationCard } from "./location-card";
import type { ProfileData, UpdateProfileData } from "@/hooks/useProfile";

interface ProfileFormProps extends Omit<
	React.ComponentProps<"div">,
	"onSubmit"
> {
	profile: ProfileData;
	onSubmit: (data: UpdateProfileData) => void;
	onUpdateLocation: (gps: string) => void;
	isLoading?: boolean;
	error?: { message: string } | null;
}

export function ProfileForm({
	className,
	profile,
	onSubmit,
	onUpdateLocation,
	isLoading,
	error,
	...props
}: ProfileFormProps) {
	const lastActionRef = useRef<"profile" | "location">("profile");

	const profileError =
		error && lastActionRef.current === "profile" ? error.message : "";
	const locationError =
		error && lastActionRef.current === "location" ? error.message : "";

	function handleProfileSubmit(data: UpdateProfileData) {
		lastActionRef.current = "profile";
		onSubmit(data);
	}

	function handleLocationUpdate(gps: string) {
		lastActionRef.current = "location";
		onUpdateLocation(gps);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<ProfileCard
				profile={profile}
				onSubmit={handleProfileSubmit}
				isLoading={isLoading}
				error={profileError}
			/>
			<LocationCard
				initialGps={profile.gps ?? ""}
				onUpdateLocation={handleLocationUpdate}
				isLoading={isLoading}
				error={locationError}
			/>
		</div>
	);
}
