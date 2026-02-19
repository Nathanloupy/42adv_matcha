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

interface ResetPasswordData {
	email: string
}

export function useAuth() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<AuthError | null>(null)
	const { setIsAuthenticated } = useAuthContext()
	const navigate = useNavigate()

	async function signin(data: SignInData) {
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

	async function signup(data: SignUpData) {
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

	async function resetPassword(data: ResetPasswordData) {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`${API_URL}/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error("Password reset failed")
			}
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Password reset failed",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return { signin, signup, resetPassword, isLoading, error }
}
