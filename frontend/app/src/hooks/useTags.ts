import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export function useTags() {
	const [allTags, setAllTags] = useState<string[]>([])
	const [myTags, setMyTags] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function fetchAllTags() {
		try {
			const response = await fetch(`${API_URL}/users/tags`, {
				credentials: "include",
			})
			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to fetch tags")
			}
			const data: string[] = await response.json()
			setAllTags(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch tags")
		}
	}

	async function fetchMyTags() {
		try {
			const response = await fetch(`${API_URL}/users/me/tags`, {
				credentials: "include",
			})
			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to fetch your tags")
			}
			const data: string[] = await response.json()
			setMyTags(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch your tags")
		}
	}

	async function addTag(tag: string) {
		setError(null)
		setIsLoading(true)
		try {
			const response = await fetch(`${API_URL}/users/me/tag`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ tag }),
			})
			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to add tag")
			}
			setMyTags((prev) => [...prev, tag])
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add tag")
		} finally {
			setIsLoading(false)
		}
	}

	async function removeTag(tag: string) {
		setError(null)
		setIsLoading(true)
		try {
			const response = await fetch(`${API_URL}/users/me/tag`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ tag }),
			})
			if (!response.ok) {
				const body = await response.json()
				throw new Error(body.detail ?? "Failed to remove tag")
			}
			setMyTags((prev) => prev.filter((t) => t !== tag))
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to remove tag")
		} finally {
			setIsLoading(false)
		}
	}

	return { allTags, myTags, isLoading, error, fetchAllTags, fetchMyTags, addTag, removeTag }
}
