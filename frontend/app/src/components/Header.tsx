import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import signOutIcon from "@assets/sign-out.svg";

export default function Header() {
	const { isAuthenticated } = useAuthContext();

	return (
		<header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini">
			<Link to="/">
				<h1 className="text-3xl font-bold"> Matcha(t)</h1>
			</Link>
			<Link
				to="/"
				className={`flex justify-center ${isAuthenticated ? "" : "invisible"}`}
			>
				<img src={signOutIcon} className="h-9" alt="Sign Out" />
			</Link>
		</header>
	);
}
