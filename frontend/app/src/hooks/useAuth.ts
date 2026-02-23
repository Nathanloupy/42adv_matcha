import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	signIn as signInApi,
	signUp as signUpApi,
	signOut as signOutApi,
	requestResetPassword as requestResetPasswordApi,
	verifyEmail as verifyEmailApi,
	resetPassword as resetPasswordApi,
	ApiError,
	type SignInData,
	type SignUpData,
	type ResetPasswordData,
} from "@/services/api";

interface AuthError {
	message: string;
}

function toAuthError(err: unknown): AuthError {
	if (err instanceof ApiError) return { message: err.message };
	if (err instanceof Error) return { message: err.message };
	return { message: "An unexpected error occurred" };
}

export function useSignIn() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: SignInData) => signInApi(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			navigate("/");
		},
		onError: (err) => {
			toast.error(toAuthError(err).message);
		},
	});

	return {
		signIn: mutation.mutate,
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
	};
}

export function useSignUp() {
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (data: SignUpData) => signUpApi(data),
		onSuccess: () => {
			toast.success("Account created! Check your email to verify your account.");
			navigate("/signin");
		},
		onError: (err) => {
			toast.error(toAuthError(err).message);
		},
	});

	return {
		signUp: mutation.mutate,
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
	};
}

export function useSignOut() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: signOutApi,
		onSuccess: () => {
			queryClient.setQueryData(["auth"], { ok: false });
			queryClient.removeQueries({ queryKey: ["profile"] });
			queryClient.removeQueries({ queryKey: ["tags"] });
			navigate("/");
		},
		onError: (err) => {
			toast.error(toAuthError(err).message);
		},
	});

	return {
		signOut: () => mutation.mutate(),
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
	};
}

export function useRequestResetPassword() {
	const mutation = useMutation({
		mutationFn: (data: { email: string }) =>
			requestResetPasswordApi(data.email),
		onSuccess: () => {
			toast.success("Email sent! Check your inbox for the reset link.");
		},
		onError: (err) => {
			toast.error(toAuthError(err).message);
		},
	});

	return {
		requestResetPassword: mutation.mutate,
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
	};
}

export function useVerifyEmail() {
	const mutation = useMutation({
		mutationFn: (token: string) => verifyEmailApi(token),
	});

	return {
		verifyEmail: mutation.mutate,
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
		isSuccess: mutation.isSuccess,
	};
}

export function useResetPassword() {
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (data: ResetPasswordData) => resetPasswordApi(data),
		onSuccess: () => {
			toast.success("Password reset successfully.");
			navigate("/signin");
		},
		onError: (err) => {
			toast.error(toAuthError(err).message);
		},
	});

	return {
		resetPassword: mutation.mutate,
		isLoading: mutation.isPending,
		error: mutation.error ? toAuthError(mutation.error) : null,
	};
}
