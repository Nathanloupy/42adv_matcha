import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function ProtectedRoute({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isAuthLoading, isProfileCompleted } =
		useAuthContext();
	const location = useLocation();

	if (isAuthLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/signin" replace />;
	}

	if (!isProfileCompleted && location.pathname !== "/profile") {
		return <Navigate to="/profile" replace />;
	}

	return children;
}
