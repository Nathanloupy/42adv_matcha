import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSearch } from "@/services/api";
import type { SearchParams } from "@/services/api";
import BrowseProfileCard from "./BrowseProfileCard";

interface SearchContentProps {
	searchParams: SearchParams;
}

export default function SearchContent({ searchParams }: SearchContentProps) {
	const [index, setIndex] = useState(0);
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["search", searchParams],
		queryFn: () => fetchSearch(searchParams),
	});

	useEffect(() => {
		setIndex(0);
	}, [searchParams]);

	const advanceToNext = useCallback(async () => {
		setIndex(0);
		await queryClient.invalidateQueries({ queryKey: ["search"] });
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
					Try adjusting your filters.
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
