import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface AuthContextType {
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthLoading, setIsAuthLoading] = useState(true);

	useEffect(() => {
		async function checkAuth() {
			try {
				const response = await fetch(`${API_URL}/users/me`, {
					credentials: "include",
				});
				setIsAuthenticated(response.ok);
			} catch {
				setIsAuthenticated(false);
			} finally {
				setIsAuthLoading(false);
			}
		}
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, setIsAuthenticated, isAuthLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
