import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import signOutIcon from "@assets/sign-out.svg";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
	const { isAuthenticated } = useAuthContext();
	const { signOut } = useAuth();

	return (
		<header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini">
			<Link to="/">
				<h1 className="text-3xl font-bold"> Matcha(t)</h1>
			</Link>
			<button
				type="button"
				onClick={signOut}
				className={`cursor-pointer ${isAuthenticated ? "" : "invisible"}`}
			>
				<img src={signOutIcon} className="h-9" alt="Sign Out" />
			</button>
		</header>
	);
}
