import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBrowse } from "@/services/api";
import { BrowseProfileCard } from "./browse-profile-card";

export function BrowseContent() {
	const [index, setIndex] = useState(0);
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["browse"],
		queryFn: fetchBrowse,
	});

	useEffect(() => {
		if (!data) return;
		if (index === data.length - 2) {
			queryClient.prefetchQuery({
				queryKey: ["browse", "next"],
				queryFn: fetchBrowse,
			});
		}
	}, [index, data, queryClient]);

	const advanceToNext = useCallback(async () => {
		setIndex(0);
		const prefetched = queryClient.getQueryData(["browse", "next"]);
		if (prefetched) {
			queryClient.setQueryData(["browse"], prefetched);
			queryClient.removeQueries({ queryKey: ["browse", "next"] });
		} else {
			await queryClient.invalidateQueries({ queryKey: ["browse"] });
		}
	}, [queryClient]);

	function next() {
		if (!data) return;
		const isLast = index === data.length - 1;
		if (isLast) {
			advanceToNext();
		} else {
			setIndex((i) => Math.min(i + 1, (data?.length ?? 1) - 1));
		}
	}

	if (isLoading || isFetching) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-muted-foreground">Loading profiles...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-destructive">
					{error instanceof Error ? error.message : "Failed to load profiles"}
				</span>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<span className="text-xl font-semibold text-white">No profiles found</span>
				<span className="text-muted-foreground text-sm">
					Check back later or update your preferences.
				</span>
			</div>
		);
	}

	const profile = data[index];
	if (!profile) return null;

	return (
		<BrowseProfileCard
			key={profile.username}
			{...profile}
			pictures={profile.images}
			onNext={next}
		/>
	);
}
