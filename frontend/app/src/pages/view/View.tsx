import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserView } from "@/services/api";
import { ViewProfileCard } from "./components/view-profile-card";

export default function View() {
	const [searchParams] = useSearchParams();
	const rawId = searchParams.get("id");
	const id = rawId ? Number(rawId) : null;

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
			<ViewProfileCard {...profile} />
		</div>
	);
}
