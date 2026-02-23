import { cn } from "@/lib/utils";
import { ProfileCard } from "./profile-card";
import { TagsCard } from "./tags-card";
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
	isLocationLoading?: boolean;
	error?: { message: string } | null;
	locationError?: { message: string } | null;
}

export function ProfileForm({
	className,
	profile,
	onSubmit,
	onUpdateLocation,
	isLoading,
	isLocationLoading,
	error,
	locationError,
	...props
}: ProfileFormProps) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<ProfileCard
				profile={profile}
				onSubmit={onSubmit}
				isLoading={isLoading}
				error={error?.message ?? ""}
			/>
			<TagsCard />
			<LocationCard
				initialGps={profile.gps ?? ""}
				onUpdateLocation={onUpdateLocation}
				isLoading={isLocationLoading}
				error={locationError?.message ?? ""}
			/>
		</div>
	);
}
