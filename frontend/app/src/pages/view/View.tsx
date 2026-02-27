import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserView, fetchMeLikes } from "@/services/api";
import { LoadingState, ErrorState } from "@/components/states";
import { ViewProfileCard } from "./components/view-profile-card";

export default function View() {
	const [searchParams] = useSearchParams();
	const rawId = searchParams.get("id");
	const id = rawId ? Number(rawId) : null;
	const queryClient = useQueryClient();

	const {
		data: profile,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["view", id],
		queryFn: () => fetchUserView(id as number),
		enabled: id !== null && !Number.isNaN(id),
	});

	const { data: meLikes } = useQuery({
		queryKey: ["me_likes"],
		queryFn: fetchMeLikes,
		enabled: id !== null && !Number.isNaN(id),
	});

	const isLiked = meLikes?.some((entry) => entry.id === id) ?? false;

	function onLikeToggle() {
		queryClient.invalidateQueries({ queryKey: ["me_likes"] });
		queryClient.invalidateQueries({ queryKey: ["me_connect"] });
	}

	if (id === null || Number.isNaN(id)) {
		return <ErrorState fallback="Invalid profile ID." />;
	}

	if (isLoading) {
		return <LoadingState message="Loading profile..." />;
	}

	if (isError) {
		return <ErrorState error={error} fallback="Failed to load profile" />;
	}

	if (!profile) return null;

	return (
		<div className="h-full p-4">
			<ViewProfileCard {...profile} isLiked={isLiked} onLikeToggle={onLikeToggle} />
		</div>
	);
}
