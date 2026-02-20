import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export interface ProfileData {
	username: string
	email: string
	surname: string
	firstname: string
	verified: boolean
}

export interface UpdateProfileData {
	email: string
	surname: string
	firstname: string
}

interface ProfileError {
	message: string
}

export function useProfile() {
	const [profile, setProfile] = useState<ProfileData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<ProfileError | null>(null)

	async function fetchProfile() {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`${API_URL}/users/me`, {
				credentials: "include",
			})

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to fetch profile")
			}

			const data: ProfileData = await response.json()
			setProfile(data)
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Failed to fetch profile",
			})
		} finally {
			setIsLoading(false)
		}
	}

	async function updateProfile(data: UpdateProfileData) {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`${API_URL}/users/me`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to update profile")
			}

			setProfile((prev) =>
				prev ? { ...prev, ...data } : prev,
			)
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Failed to update profile",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return { profile, fetchProfile, updateProfile, isLoading, error }
}
