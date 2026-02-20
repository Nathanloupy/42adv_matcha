import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/contexts/AuthContext"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

interface AuthError {
	message: string
}

interface SignInData {
	username: string
	password: string
}

interface SignUpData {
	username: string
	password: string
	email: string
	surname: string
	firstname: string
}

interface RequestResetPasswordData {
	email: string
}

interface ResetPasswordData {
	token: string
	new_password: string
}

export function useAuth() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<AuthError | null>(null)
	const { setIsAuthenticated } = useAuthContext()
	const navigate = useNavigate()

	async function signIn(data: SignInData) {
		setIsLoading(true)
		setError(null)
		try {

			const body = new URLSearchParams()
			body.append("username", data.username)
			body.append("password", data.password)

			const response = await fetch(`${API_URL}/signin`, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				credentials: "include",
				body,
			})

			if (!response.ok) {
				throw new Error(
					response.status === 401
						? "Invalid username or password"
						: "Sign in failed"
				)
			}

			setIsAuthenticated(true)
			navigate("/")
		} catch (err) {
			setError({ message: err instanceof Error ? err.message : "Sign in failed" })
		} finally {
			setIsLoading(false)
		}
	}

	async function signUp(data: SignUpData) {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`${API_URL}/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error("Sign up failed")
			}

			navigate("/signin")
		} catch (err) {
			setError({ message: err instanceof Error ? err.message : "Sign up failed" })
		} finally {
			setIsLoading(false)
		}
	}

	async function signOut() {
		try {
			const response = await fetch(`${API_URL}/signout`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Sign out failed")
			}

			setIsAuthenticated(false)
			navigate("/")
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Sign out failed",
			})
		} finally {
			setIsLoading(false)
		}
	}

	async function requestResetPassword(data: RequestResetPasswordData) {
		setIsLoading(true)
		setError(null)
		try {
			const params = new URLSearchParams({ email: data.email })
			const response = await fetch(`${API_URL}/request-reset-password?${params}`, {
				method: "POST",
			})

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Password reset request failed")
			}
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Password reset request failed",
			})
		} finally {
			setIsLoading(false)
		}
	}

	async function verifyEmail(token: string) {
		setIsLoading(true)
		setError(null)
		try {
			const params = new URLSearchParams({ token })
			const response = await fetch(`${API_URL}/verify-email?${params}`)

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Email verification failed")
			}
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Email verification failed",
			})
		} finally {
			setIsLoading(false)
		}
	}

	async function resetPassword(data: ResetPasswordData) {
		setIsLoading(true)
		setError(null)
		try {
			const params = new URLSearchParams({
				token: data.token,
				new_password: data.new_password,
			})
			const response = await fetch(`${API_URL}/reset-password?${params}`, {
				method: "POST",
			})

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Password reset failed")
			}

			navigate("/signin")
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Password reset failed",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return { signIn, signUp, signOut, verifyEmail, requestResetPassword, resetPassword, isLoading, error }
}
