import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
	fetchBrowse,
	fetchSearch,
	fetchMeLikes,
} from "@/services/api";
import type { SearchParams } from "@/services/api";
import { useOptionsContext } from "@/hooks/useOptionsContext";
import { sortAndFilterProfiles } from "@/lib/sort-and-filter-profiles";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { BrowseProfileCard } from "./browse-profile-card";

// ── Browse mode ──────────────────────────────────────────────────────────────

function BrowseListContent() {
	const navigate = useNavigate();
	const {
		browseParams,
		committedSort,
		committedMaxDistance,
		committedMinTags,
	} = useOptionsContext();

	const queryClient = useQueryClient();

	// Reset index when params change (using useEffect avoids render-phase setState)
	const [index, setIndex] = useState(0);
	const [noMore, setNoMore] = useState(false);
	useEffect(() => {
		setIndex(0);
		setNoMore(false);
	}, [browseParams]);

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["browse", browseParams],
		queryFn: () => fetchBrowse(browseParams),
	});

	const { data: meLikes } = useQuery({
		queryKey: ["me_likes"],
		queryFn: fetchMeLikes,
	});

	// Apply frontend sort + filters
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
		return <LoadingState message="Loading profiles..." />;
	}

	if (isError) {
		return <ErrorState error={error} fallback="Failed to load profiles" />;
	}

	if (noMore || !data || data.length === 0) {
		return (
			<EmptyState
				title="No profiles found"
				subtitle="Check back later or update your preferences."
			/>
		);
	}

	if (profiles.length === 0) {
		return (
			<EmptyState
				title="No profiles match your filters"
				subtitle="Try increasing the distance or lowering the common tags minimum."
			/>
		);
	}

	const profile = profiles[index];
	if (!profile) return null;

	const isLiked = meLikes?.some((e) => e.id === profile.id) ?? false;

	return (
		<BrowseProfileCard
			key={profile.id}
			{...profile}
			pictures={profile.images}
			isLiked={isLiked}
			onNext={next}
			onView={() => navigate(`/view?id=${profile.id}`)}
			onLikeToggle={() => {
				queryClient.invalidateQueries({ queryKey: ["me_likes"] });
				next();
			}}
		/>
	);
}

// ── Search mode ───────────────────────────────────────────────────────────────

function SearchListContent() {
	const navigate = useNavigate();
	const { searchParams, committedSort, committedMaxDistance, committedMinTags } =
		useOptionsContext();

	const queryClient = useQueryClient();

	// Store both the params snapshot and index together to avoid stale state
	const [indexState, setIndexState] = useState<{
		params: SearchParams;
		index: number;
	}>({ params: searchParams, index: 0 });

	const index = indexState.params === searchParams ? indexState.index : 0;

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

	if (isLoading || isFetching) {
		return <LoadingState message="Searching..." />;
	}

	if (isError) {
		return <ErrorState error={error} fallback="Search failed" />;
	}

	if (!data || data.length === 0) {
		return (
			<EmptyState
				title="No results"
				subtitle="Try adjusting your search filters."
			/>
		);
	}

	if (profiles.length === 0) {
		return (
			<EmptyState
				title="No profiles match your filters"
				subtitle="Try increasing the distance or lowering the common tags minimum."
			/>
		);
	}

	const profile = profiles[index];
	if (!profile) return null;

	const isLiked = meLikes?.some((e) => e.id === profile.id) ?? false;

	return (
		<BrowseProfileCard
			key={profile.id}
			{...profile}
			pictures={profile.images}
			isLiked={isLiked}
			onNext={next}
			onView={() => navigate(`/view?id=${profile.id}`)}
			onLikeToggle={() =>
				queryClient.invalidateQueries({ queryKey: ["me_likes"] })
			}
		/>
	);
}

// ── Public entry point ────────────────────────────────────────────────────────

interface ProfileListContentProps {
	mode: "browse" | "search";
}

export function ProfileListContent({ mode }: ProfileListContentProps) {
	return mode === "browse" ? <BrowseListContent /> : <SearchListContent />;
}
