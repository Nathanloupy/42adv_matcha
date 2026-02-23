import { createContext } from "react";

export interface AuthContextType {
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	isAuthLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
