import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function ProtectedRoute({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isAuthLoading } = useAuthContext();

	if (isAuthLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/signin" replace />;
	}

	return children;
}
