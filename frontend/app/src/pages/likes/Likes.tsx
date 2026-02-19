import { useState } from "react";
import LikesTab from "./components/LikesTab";

export default function Likes() {
	const [activeTab, setActiveTab] = useState<"liked" | "likedYou">("liked");

	return (
		<div className="min-h-screen">
			<div className="flex flex-row items-center text-center">
				<LikesTab
					isActive={activeTab === "liked"}
					name="You liked"
					onClick={() => setActiveTab("liked")}
				/>
				<LikesTab
					isActive={activeTab === "likedYou"}
					name="Liked you"
					onClick={() => setActiveTab("likedYou")}
				/>
			</div>
			{activeTab === "liked" ? (
				<div className="p-4">You liked bob</div>
			) : (
				<div className="p-4">Alice liked you</div>
			)}
		</div>
	);
}
