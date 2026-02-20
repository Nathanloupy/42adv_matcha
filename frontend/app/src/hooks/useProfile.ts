import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export interface ProfileData {
	username: string
	email: string
	surname: string
	firstname: string
	age: number
	verified: boolean
	completed: boolean
	fame: number
	gps: string
	biography: string
	gender: boolean
	sexual_preference: number
}

export interface UpdateProfileData {
	email: string
	surname: string
	firstname: string
	age: number
	biography: string
	gender: boolean
	sexual_preference: number
	gps?: string
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
				method: "PATCH",
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

	async function updateLocation(gps: string) {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(`${API_URL}/users/me`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ gps }),
			})

			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to update location")
			}

			setProfile((prev) =>
				prev ? { ...prev, gps } : prev,
			)
		} catch (err) {
			setError({
				message: err instanceof Error ? err.message : "Failed to update location",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return { profile, fetchProfile, updateProfile, updateLocation, isLoading, error }
}
