import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchBrowse } from "@/services/api";
import type { BrowseQueryParams } from "@/services/api";
import { useOptionsContext } from "@/hooks/useOptionsContext";
import { sortAndFilterProfiles } from "@/lib/sort-and-filter-profiles";
import { BrowseProfileCard } from "./browse-profile-card";

export function BrowseContent() {
	const navigate = useNavigate();
	const {
		browseParams,
		committedSort,
		committedMaxDistance,
		committedMinTags,
	} = useOptionsContext();

	const [index, setIndex] = useState(0);
	const [noMore, setNoMore] = useState(false);
	const queryClient = useQueryClient();

	// Reset index + noMore flag whenever the query params change
	const [prevParams, setPrevParams] =
		useState<BrowseQueryParams>(browseParams);
	if (browseParams !== prevParams) {
		setPrevParams(browseParams);
		setIndex(0);
		setNoMore(false);
	}

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["browse", browseParams],
		queryFn: () => fetchBrowse(browseParams),
	});

	// Apply frontend sort + filters on the raw data
	const profiles = useMemo(() => {
		if (!data) return [];
		return sortAndFilterProfiles(data, committedSort, {
			maxDistance: committedMaxDistance,
			minTags: committedMinTags,
		});
	}, [data, committedSort, committedMaxDistance, committedMinTags]);

	// Prefetch next batch 2 profiles before the end
	useEffect(() => {
		if (!profiles.length) return;
		if (index === profiles.length - 2) {
			queryClient.prefetchQuery({
				queryKey: ["browse", "next", browseParams],
				queryFn: () => fetchBrowse(browseParams),
			});
		}
	}, [index, profiles, queryClient, browseParams]);

	const advanceToNext = useCallback(async () => {
		setIndex(0);
		const prefetched = queryClient.getQueryData([
			"browse",
			"next",
			browseParams,
		]);
		if (prefetched) {
			queryClient.setQueryData(["browse", browseParams], prefetched);
			queryClient.removeQueries({
				queryKey: ["browse", "next", browseParams],
			});
		} else {
			const result = await queryClient.fetchQuery({
				queryKey: ["browse", browseParams],
				queryFn: () => fetchBrowse(browseParams),
			});
			if (!result || result.length === 0) {
				setNoMore(true);
			}
		}
	}, [queryClient, browseParams]);

	function next() {
		if (!profiles.length) return;
		const isLast = index === profiles.length - 1;
		if (isLast) {
			advanceToNext();
		} else {
			setIndex((i) => Math.min(i + 1, profiles.length - 1));
		}
	}

	if (isLoading || isFetching) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-muted-foreground">
					Loading profiles...
				</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-destructive">
					{error instanceof Error
						? error.message
						: "Failed to load profiles"}
				</span>
			</div>
		);
	}

	if (noMore || !data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<span className="text-xl font-semibold text-white">
					No profiles found
				</span>
				<span className="text-muted-foreground text-sm">
					Check back later or update your preferences.
				</span>
			</div>
		);
	}

	if (profiles.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<span className="text-xl font-semibold text-white">
					No profiles match your filters
				</span>
				<span className="text-muted-foreground text-sm">
					Try increasing the distance or lowering the common tags
					minimum.
				</span>
			</div>
		);
	}

	const profile = profiles[index];
	if (!profile) return null;

	return (
		<BrowseProfileCard
			key={profile.id}
			{...profile}
			pictures={profile.images}
			onNext={next}
			onView={() => navigate(`/view?id=${profile.id}`)}
		/>
	);
}
