import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tab from "@/components/Tab";
import { fetchMeLikes, fetchLikesMe, fetchViewsMe } from "@/services/api";
import { LikesProfileCard } from "./components/likes-profile-card";

type ActiveTab = "liked" | "likedYou" | "viewedYou";

const QUERY_KEY: Record<ActiveTab, string> = {
	liked: "me_likes",
	likedYou: "likes_me",
	viewedYou: "views_me",
};

export default function Likes() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("liked");
	const queryClient = useQueryClient();

	const meLikesQuery = useQuery({
		queryKey: ["me_likes"],
		queryFn: fetchMeLikes,
	});

	const likesMeQuery = useQuery({
		queryKey: ["likes_me"],
		queryFn: fetchLikesMe,
	});

	const viewsMeQuery = useQuery({
		queryKey: ["views_me"],
		queryFn: fetchViewsMe,
	});

	const activeQuery =
		activeTab === "liked"
			? meLikesQuery
			: activeTab === "likedYou"
				? likesMeQuery
				: viewsMeQuery;

	const { data, isLoading, isError, error } = activeQuery;

	function refetchActive() {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY[activeTab]] });
	}

	return (
		<div className="min-h-screen">
			<div className="flex flex-row items-center text-center">
				<Tab
					isActive={activeTab === "liked"}
					name="You liked"
					onClick={() => setActiveTab("liked")}
				/>
				<div className="w-0.5 h-[2em] bg-white/40 shrink-0" />
				<Tab
					isActive={activeTab === "likedYou"}
					name="Liked you"
					onClick={() => setActiveTab("likedYou")}
				/>
				<div className="w-0.5 h-[2em] bg-white/40 shrink-0" />
				<Tab
					isActive={activeTab === "viewedYou"}
					name="Viewed you"
					onClick={() => setActiveTab("viewedYou")}
				/>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-16">
					<span className="text-muted-foreground">Loading...</span>
				</div>
			)}

			{isError && (
				<div className="flex items-center justify-center py-16">
					<span className="text-destructive">
						{error instanceof Error ? error.message : "Failed to load"}
					</span>
				</div>
			)}

			{!isLoading && !isError && data?.length === 0 && (
				<div className="flex items-center justify-center py-16">
					<span className="text-muted-foreground">Nothing here yet.</span>
				</div>
			)}

			{data && data.length > 0 && (
				<div className="grid grid-cols-2">
					{data.map((entry) => (
				<LikesProfileCard
					key={entry.id}
					profileId={entry.id}
					firstname={entry.firstname}
					image={entry.image}
					isLikedByUser={activeTab === "liked"}
					onAction={refetchActive}
				/>
					))}
				</div>
			)}
		</div>
	);
}
