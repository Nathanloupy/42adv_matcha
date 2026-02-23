import { Link } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import signOutIcon from "@assets/sign-out.svg";
import { useSignOut } from "@/hooks/useAuth";

export default function Header() {
	const { isAuthenticated, isAuthLoading } = useAuthContext();
	const { signOut } = useSignOut();

	return (
		<header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini border-b border-border">
			<Link to="/">
				<h1 className="text-3xl font-bold"> Matcha(t)</h1>
			</Link>
			<button
				type="button"
				onClick={signOut}
				className={`cursor-pointer ${!isAuthLoading && isAuthenticated ? "" : "invisible"}`}
			>
				<img src={signOutIcon} className="h-9" alt="Sign Out" />
			</button>
		</header>
	);
}
