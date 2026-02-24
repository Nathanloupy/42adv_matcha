const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function parseErrorBody(response: Response): Promise<string> {
	try {
		const body = await response.json();
		return body.detail ?? response.statusText;
	} catch {
		return response.statusText;
	}
}

async function request<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		credentials: "include",
		...options,
	});

	if (!response.ok) {
		const message = await parseErrorBody(response);
		throw new ApiError(message, response.status);
	}

	const contentType = response.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		return response.json();
	}
	return undefined as T;
}

// ── Auth ──

export function checkAuth(): Promise<{ ok: boolean; completed: boolean }> {
	return fetch(`${API_URL}/users/me`, { credentials: "include" }).then(
		async (r) => {
			if (!r.ok) return { ok: false, completed: false };
			const data = await r.json();
			return { ok: true, completed: !!data.completed };
		},
	);
}

export interface SignInData {
	username: string;
	password: string;
}

export function signIn(data: SignInData): Promise<void> {
	const body = new URLSearchParams();
	body.append("username", data.username);
	body.append("password", data.password);

	return request("/signin", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
	});
}

export interface SignUpData {
	username: string;
	password: string;
	email: string;
	surname: string;
	firstname: string;
}

export function signUp(data: SignUpData): Promise<void> {
	return request("/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export function signOut(): Promise<void> {
	return request("/signout");
}

export function requestResetPassword(email: string): Promise<void> {
	const params = new URLSearchParams({ email });
	return request(`/request-reset-password?${params}`, { method: "POST" });
}

export function verifyEmail(token: string): Promise<void> {
	const params = new URLSearchParams({ token });
	return request(`/verify-email?${params}`);
}

export interface ResetPasswordData {
	token: string;
	new_password: string;
}

export function resetPassword(data: ResetPasswordData): Promise<void> {
	const params = new URLSearchParams({
		token: data.token,
		new_password: data.new_password,
	});
	return request(`/reset-password?${params}`, { method: "POST" });
}

// ── Profile ──

export interface ProfileData {
	username: string;
	email: string;
	surname: string;
	firstname: string;
	age: number;
	verified: boolean;
	completed: boolean;
	fame: number;
	gps: string;
	biography: string;
	gender: boolean;
	sexual_preference: number;
}

export interface UpdateProfileData {
	email: string;
	surname: string;
	firstname: string;
	age: number;
	biography: string;
	gender: boolean;
	sexual_preference: number;
	gps?: string;
}

export function fetchProfile(): Promise<ProfileData> {
	return request("/users/me");
}

export function updateProfile(data: UpdateProfileData): Promise<void> {
	return request("/users/me", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export function updateLocation(gps: string): Promise<void> {
	return request("/users/me", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ gps }),
	});
}

// ── Images ──

export interface ImageData {
	uuid: string;
	base64: string;
}

export async function fetchImages(): Promise<ImageData[]> {
	const res = await request<{ message: [string, string][] }>(
		"/users/me/images",
	);
	return res.message.map(([uuid, base64]) => ({ uuid, base64 }));
}

export function uploadImage(file: File): Promise<void> {
	const formData = new FormData();
	formData.append("image", file);
	return request("/users/me/image", {
		method: "POST",
		body: formData,
	});
}

export function deleteImage(uuid: string): Promise<void> {
	return request(`/users/me/image?image_uuid=${uuid}`, {
		method: "DELETE",
	});
}

// ── Browse ──

export interface BrowseProfile {
	username: string;
	firstname: string;
	surname: string;
	age: number;
	gender: number;
	biography: string;
	gps: number;
	fame: number;
	last_connection: string;
	tag_count: number;
}

export function fetchBrowse(): Promise<BrowseProfile[]> {
	return request("/browse");
}

// ── Tags ──

export function fetchAllTags(): Promise<string[]> {
	return request("/users/tags");
}

export function fetchMyTags(): Promise<string[]> {
	return request("/users/me/tags");
}

export function addTag(tag: string): Promise<void> {
	return request(`/users/me/tag?tag=${encodeURIComponent(tag)}`, {
		method: "POST",
	});
}

export function removeTag(tag: string): Promise<void> {
	return request(`/users/me/tag?tag=${encodeURIComponent(tag)}`, {
		method: "DELETE",
	});
}
