import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserView, fetchMeLikes } from "@/services/api";
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
	}

	if (id === null || Number.isNaN(id)) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-destructive">Invalid profile ID.</span>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-muted-foreground">Loading profile...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-destructive">
					{error instanceof Error ? error.message : "Failed to load profile"}
				</span>
			</div>
		);
	}

	if (!profile) return null;

	return (
		<div className="h-full p-4">
			<ViewProfileCard {...profile} isLiked={isLiked} onLikeToggle={onLikeToggle} />
		</div>
	);
}
