import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBrowse } from "@/services/api";
import BrowseProfileCard from "./components/BrowseProfileCard";

export default function Browse() {
	const [index, setIndex] = useState(0);
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["browse"],
		queryFn: fetchBrowse,
	});

	// Prefetch the next batch when the user reaches the second-to-last profile
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
		// Swap the prefetched data in as the active query, then drop the prefetch key
		const prefetched = queryClient.getQueryData(["browse", "next"]);
		if (prefetched) {
			queryClient.setQueryData(["browse"], prefetched);
			queryClient.removeQueries({ queryKey: ["browse", "next"] });
		} else {
			await queryClient.invalidateQueries({ queryKey: ["browse"] });
		}
	}, [queryClient]);

	if (isLoading || isFetching) {
		return (
			<div className="flex items-center justify-center h-full bg-slate-950">
				<span className="text-muted-foreground">Loading profiles...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full bg-slate-950">
				<span className="text-destructive">
					{error instanceof Error ? error.message : "Failed to load profiles"}
				</span>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2 bg-slate-950">
				<span className="text-xl font-semibold text-white">No profiles found</span>
				<span className="text-muted-foreground text-sm">
					Check back later or update your preferences.
				</span>
			</div>
		);
	}

	const profile = data[index];
	const isLast = index === data.length - 1;

	function next() {
		if (isLast) {
			advanceToNext();
		} else {
			setIndex((i) => Math.min(i + 1, (data?.length ?? 1) - 1));
		}
	}

	if (!profile) return null;

	return (
		<div className="h-full w-full bg-slate-950 p-2">
			<BrowseProfileCard key={profile.username} {...profile} onNext={next} />
		</div>
	);
}
