import { createContext } from "react";

export interface AuthContextType {
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	isAuthLoading: boolean;
	isProfileCompleted: boolean;
	setIsProfileCompleted: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
