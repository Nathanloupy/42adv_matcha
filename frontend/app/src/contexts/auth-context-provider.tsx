import { type ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkAuth } from "@/services/api";
import { AuthContext } from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["auth"],
		queryFn: checkAuth,
		staleTime: Infinity,
		retry: false,
	});

	useEffect(() => {
		function handleUnauthorized() {
			queryClient.clear();
		}
		window.addEventListener("auth:unauthorized", handleUnauthorized);
		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, [queryClient]);

	const isAuthenticated = data?.ok ?? false;
	const isProfileCompleted = data?.completed ?? false;

	function setIsAuthenticated(value: boolean) {
		queryClient.setQueryData(["auth"], (prev: typeof data) => ({
			...prev,
			ok: value,
		}));
	}

	function setIsProfileCompleted(value: boolean) {
		queryClient.setQueryData(["auth"], (prev: typeof data) => ({
			...prev,
			completed: value,
		}));
	}

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				setIsAuthenticated,
				isAuthLoading: isLoading,
				isProfileCompleted,
				setIsProfileCompleted,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
