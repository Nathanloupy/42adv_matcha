import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	fetchProfile,
	updateProfile as updateProfileApi,
	updateLocation as updateLocationApi,
	type ProfileData,
	type UpdateProfileData,
} from "@/services/api";

export type { ProfileData, UpdateProfileData } from "@/services/api";

export function useProfile() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["profile"],
		queryFn: fetchProfile,
	});

	const updateMutation = useMutation({
		mutationFn: (data: UpdateProfileData) => updateProfileApi(data),
		onSuccess: (_result, data) => {
			queryClient.setQueryData<ProfileData>(["profile"], (prev) =>
				prev ? { ...prev, ...data } : prev,
			);
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Profile saved.");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to save profile.");
		},
	});

	const locationMutation = useMutation({
		mutationFn: (gps: string) => updateLocationApi(gps),
		onSuccess: (_result, gps) => {
			queryClient.setQueryData<ProfileData>(["profile"], (prev) =>
				prev ? { ...prev, gps } : prev,
			);
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Location updated.");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to update location.");
		},
	});

	return {
		profile: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error ? { message: query.error.message } : null,
		updateProfile: updateMutation.mutate,
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error
			? { message: updateMutation.error.message }
			: null,
		updateLocation: locationMutation.mutate,
		isUpdatingLocation: locationMutation.isPending,
		locationError: locationMutation.error
			? { message: locationMutation.error.message }
			: null,
	};
}
