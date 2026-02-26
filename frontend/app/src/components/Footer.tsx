import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";
import catIcon from "@/assets/cat.svg";
import loveLetterIcon from "@/assets/love-letter-opened.svg";
import heartIcon from "@/assets/heart.svg";
import editIcon from "@/assets/edit.svg";

export default function Footer() {
	const { isAuthenticated, isAuthLoading } = useAuthContext();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	function goToBrowse() {
		queryClient.invalidateQueries({ queryKey: ["browse"] });
		queryClient.invalidateQueries({ queryKey: ["search"] });
		queryClient.invalidateQueries({ queryKey: ["me_likes"] });
		navigate("/");
	}

	function goToLikes() {
		queryClient.invalidateQueries({ queryKey: ["me_likes"] });
		queryClient.invalidateQueries({ queryKey: ["likes_me"] });
		queryClient.invalidateQueries({ queryKey: ["views_me"] });
		navigate("/likes");
	}

	return (
		<footer className="bg-slate-950 py-3 text-sm border-t border-border">
			<div
				className={cn(
					"grid grid-cols-4 items-center",
					(!isAuthLoading && isAuthenticated) ? "" : "invisible",
				)}
			>
				<button
					type="button"
					onClick={goToBrowse}
					className="flex justify-center cursor-pointer bg-transparent border-0 p-0"
				>
					<img src={catIcon} className="h-9" alt="Search" />
				</button>
				<button
					type="button"
					onClick={goToLikes}
					className="flex justify-center cursor-pointer bg-transparent border-0 p-0"
				>
					<img src={heartIcon} className="h-7" alt="Likes" />
				</button>
				<Link to="/messages" className="flex justify-center">
					<img src={loveLetterIcon} className="h-7" alt="Messages" />
				</Link>
				<Link to="/profile" className="flex justify-center">
					<img src={editIcon} className="h-7" alt="Profile" />
				</Link>
			</div>
		</footer>
	);
}
