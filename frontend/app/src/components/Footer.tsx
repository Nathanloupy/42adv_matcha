import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import catIcon from "@assets/cat.svg";
import loveLetterIcon from "@assets/love-letter-opened.svg";
import heartIcon from "@assets/heart.svg";
import editIcon from "@assets/edit.svg";

export default function Footer() {
	const { isAuthenticated, isAuthLoading } = useAuthContext();

	return (
		<footer className="bg-slate-950 py-3 text-sm border-t border-border">
			<div
				className={`grid grid-cols-4 items-center ${!isAuthLoading && isAuthenticated ? "" : "invisible"}`}
			>
				<Link to="/" className="flex justify-center">
					<img src={catIcon} className="h-9" alt="Search" />
				</Link>
				<Link to="/likes" className="flex justify-center">
					<img src={heartIcon} className="h-7" alt="Likes" />
				</Link>
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
