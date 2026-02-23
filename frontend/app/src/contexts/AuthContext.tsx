import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkAuth } from "@/services/api";
import { AuthContext } from "@/contexts/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["auth"],
		queryFn: checkAuth,
		staleTime: Infinity,
		retry: false,
	});

	const isAuthenticated = data?.ok ?? false;

	function setIsAuthenticated(value: boolean) {
		queryClient.setQueryData(["auth"], { ok: value });
	}

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, setIsAuthenticated, isAuthLoading: isLoading }}
		>
			{children}
		</AuthContext.Provider>
	);
}
