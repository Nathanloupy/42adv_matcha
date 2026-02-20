import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProtectedRoute({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated } = useAuthContext();

	if (!isAuthenticated) {
		return <Navigate to="/signin" replace />;
	}

	return children;
}
