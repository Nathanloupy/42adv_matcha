import { useState } from "react";
import Tab from "@/components/Tab";
import { LikesProfileCard } from "./components/likes-profile-card";
import type { LikesProfileCardProps } from "./components/likes-profile-card";

const mockLikedProfiles: LikesProfileCardProps[] = [
	{
		profileId: 1,
		isLikedByUser: true,
		firstname: "Abel",
		age: 4,
		picture: "https://i.ytimg.com/vi/HXUHHGOFFMk/maxresdefault.jpg",
	},
	{
		profileId: 3,
		isLikedByUser: true,
		firstname: "Allan",
		age: 5,
		picture:
			"https://img.freepik.com/premium-photo/playful-cat-making-hilarious-funny-face_1151123-57906.jpg?w=360",
	},
	{
		profileId: 5,
		isLikedByUser: true,
		firstname: "Yohan",
		age: 7,
		picture:
			"https://static.boredpanda.com/blog/wp-content/uploads/2025/02/funny-silly-cats-pics-cover_675.jpg",
	},
	{
		profileId: 2,
		isLikedByUser: true,
		firstname: "Caroline",
		age: 5,
		picture:
			"https://i.pinimg.com/736x/96/4c/77/964c7732f9a8c6d6e99ed71553521684.jpg",
	},
	{
		profileId: 4,
		isLikedByUser: true,
		firstname: "Imane",
		age: 8,
		picture:
			"https://www.shutterstock.com/image-photo/cute-side-moment-ledus-600nw-2345448513.jpg",
	},
	{
		profileId: 6,
		isLikedByUser: true,
		firstname: "Jade",
		age: 3,
		picture: "https://media.tenor.com/Ti6AFXIRrGsAAAAM/meme-funny.gif",
	},
];

const mockLikedYouProfiles: LikesProfileCardProps[] = [
	{
		profileId: 6,
		isLikedByUser: false,
		firstname: "Jade",
		age: 3,
		picture: "https://media.tenor.com/Ti6AFXIRrGsAAAAM/meme-funny.gif",
	},
];

const mockViewedYouProfiles: LikesProfileCardProps[] = [
	{
		profileId: 6,
		isLikedByUser: false,
		firstname: "Jade",
		age: 3,
		picture: "https://media.tenor.com/Ti6AFXIRrGsAAAAM/meme-funny.gif",
	},
];

export default function Likes() {
	const [activeTab, setActiveTab] = useState<
		"liked" | "likedYou" | "viewedYou"
	>("liked");

	const profiles =
		activeTab === "liked"
			? mockLikedProfiles
			: activeTab === "likedYou"
				? mockLikedYouProfiles
				: mockViewedYouProfiles;

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
			<div className="grid grid-cols-2">
				{profiles.map((profile) => (
					<LikesProfileCard key={profile.profileId} {...profile} />
				))}
			</div>
		</div>
	);
}
