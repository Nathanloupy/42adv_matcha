import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchSearch, fetchMeLikes } from "@/services/api";
import type { SearchParams } from "@/services/api";
import { useOptionsContext } from "@/hooks/useOptionsContext";
import { sortAndFilterProfiles } from "@/lib/sort-and-filter-profiles";
import { BrowseProfileCard } from "./browse-profile-card";

interface SearchContentProps {
	searchParams: SearchParams;
}

export function SearchContent({ searchParams }: SearchContentProps) {
	const navigate = useNavigate();
	const { committedSort, committedMaxDistance, committedMinTags } =
		useOptionsContext();

	const [indexState, setIndexState] = useState({
		params: searchParams,
		index: 0,
	});
	const queryClient = useQueryClient();

	const index =
		indexState.params === searchParams ? indexState.index : 0;

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["search", searchParams],
		queryFn: () => fetchSearch(searchParams),
	});

	const { data: meLikes } = useQuery({
		queryKey: ["me_likes"],
		queryFn: fetchMeLikes,
	});

	// Apply frontend sort + filters on the raw data
	const profiles = useMemo(() => {
		if (!data) return [];
		return sortAndFilterProfiles(data, committedSort, {
			maxDistance: committedMaxDistance,
			minTags: committedMinTags,
		});
	}, [data, committedSort, committedMaxDistance, committedMinTags]);

	async function advanceToNext() {
		setIndexState({ params: searchParams, index: 0 });
		await queryClient.invalidateQueries({ queryKey: ["search"] });
	}

	function next() {
		if (!profiles.length) return;
		const isLast = index === profiles.length - 1;
		if (isLast) {
			advanceToNext();
		} else {
			setIndexState((prev) => ({
				params: searchParams,
				index: Math.min(prev.index + 1, profiles.length - 1),
			}));
		}
	}

	const loading = isLoading || isFetching;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-muted-foreground">Searching...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full">
				<span className="text-destructive">
					{error instanceof Error ? error.message : "Search failed"}
				</span>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<span className="text-xl font-semibold text-white">No results</span>
				<span className="text-muted-foreground text-sm">
					Try adjusting your search filters.
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
					Try increasing the distance or lowering the common tags minimum.
				</span>
			</div>
		);
	}

	const profile = profiles[index];
	if (!profile) return null;

	const isLiked = meLikes?.some((e) => e.id === profile.id) ?? false;

	return (
		<BrowseProfileCard
			key={profile.username}
			{...profile}
			pictures={profile.images}
			isLiked={isLiked}
			onNext={next}
			onView={() => navigate(`/view?id=${profile.id}`)}
			onLikeToggle={() => queryClient.invalidateQueries({ queryKey: ["me_likes"] })}
		/>
	);
}
