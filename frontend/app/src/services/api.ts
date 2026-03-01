export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
		if (response.status === 401) {
			window.dispatchEvent(new CustomEvent("auth:unauthorized"));
		}
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
	newPassword: string;
}

export function resetPassword(data: ResetPasswordData): Promise<void> {
	const params = new URLSearchParams({
		token: data.token,
		new_password: data.newPassword,
	});
	return request(`/reset-password?${params}`, { method: "POST" });
}

// ── Profile ──

export interface ProfileData {
	id: number;
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
	sexualPreference: number;
}

export interface UpdateProfileData {
	email: string;
	surname: string;
	firstname: string;
	age: number;
	biography: string;
	gender: boolean;
	sexualPreference: number;
	gps?: string;
}

export async function fetchProfile(): Promise<ProfileData> {
	const raw = await request<Record<string, unknown>>("/users/me");
	return {
		...raw,
		sexualPreference: raw.sexual_preference,
	} as unknown as ProfileData;
}

export function updateProfile(data: UpdateProfileData): Promise<void> {
	const { sexualPreference, ...rest } = data;
	return request("/users/me", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...rest, sexual_preference: sexualPreference }),
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
	id: number;
	username: string;
	firstname: string;
	surname: string;
	age: number;
	gender: number;
	biography: string;
	gps: string;
	distance: number;
	fame: number;
	lastConnection: string;
	tagCount: number;
	images: string[];
}

function toBrowseProfile(raw: Record<string, unknown>): BrowseProfile {
	return {
		...raw,
		lastConnection: raw.last_connection,
		tagCount: raw.common_tags_count,
	} as unknown as BrowseProfile;
}

// ── Browse Query Params ──

export interface BrowseQueryParams {
	ageMin: number;
	ageMax: number;
	fameMin: number;
	fameMax: number;
}

function buildRangeQs(params: BrowseQueryParams): URLSearchParams {
	const qs = new URLSearchParams();
	qs.append("age_min", String(params.ageMin));
	qs.append("age_max", String(params.ageMax));
	qs.append("fame_min", String(params.fameMin));
	qs.append("fame_max", String(params.fameMax));
	return qs;
}

export async function fetchBrowse(params: BrowseQueryParams): Promise<BrowseProfile[]> {
	const query = buildRangeQs(params).toString();
	const raw = await request<Record<string, unknown>[]>(`/browse${query ? `?${query}` : ""}`);
	return raw.map(toBrowseProfile);
}

// ── Search ──

export interface SearchParams {
	ageMin: number;
	ageMax: number;
	fameMin: number;
	fameMax: number;
	location?: string | null;
	tags?: string[] | null;
}

export async function fetchSearch(params: SearchParams): Promise<BrowseProfile[]> {
	const qs = buildRangeQs(params);
	if (params.location) qs.append("location", params.location);
	if (params.tags?.length) params.tags.forEach((t) => qs.append("tags", t));
	const query = qs.toString();
	const raw = await request<Record<string, unknown>[]>(`/search${query ? `?${query}` : ""}`);
	return raw.map(toBrowseProfile);
}

// ── Likes / Views lists ──

export interface LikesListEntry {
	id: number;
	firstname: string;
	uuid: string;
	image: string;
}

export function fetchMeLikes(): Promise<LikesListEntry[]> {
	return request("/users/me/me_likes");
}

export function fetchLikesMe(): Promise<LikesListEntry[]> {
	return request("/users/me/likes_me");
}

export function fetchViewsMe(): Promise<LikesListEntry[]> {
	return request("/users/me/views_me");
}

// ── Social actions ──

export function likeUser(id: number): Promise<void> {
	return request(`/like?id=${id}`, { method: "POST" });
}

export function unlikeUser(id: number): Promise<void> {
	return request(`/unlike?id=${id}`, { method: "DELETE" });
}

export function blockUser(id: number): Promise<void> {
	return request(`/block?id=${id}`, { method: "POST" });
}

export function reportUser(id: number): Promise<void> {
	return request(`/users/report?id=${id}`, { method: "POST" });
}

// ── View ──

export interface ViewProfile {
	id: number;
	username: string;
	firstname: string;
	surname: string;
	age: number;
	gender: number;
	sexualPreference: number;
	biography: string;
	gps: string;
	fame: number;
	lastConnection: string;
	tags: string[];
	images: string[];
	likedMe: boolean;
	areConnected: boolean;
}

function toViewProfile(raw: Record<string, unknown>): ViewProfile {
	return {
		...raw,
		sexualPreference: raw.sexual_preference,
		lastConnection: raw.last_connection,
		likedMe: raw.liked_me,
		areConnected: raw.are_connected,
	} as unknown as ViewProfile;
}

export async function fetchUserView(id: number): Promise<ViewProfile> {
	const raw = await request<Record<string, unknown>>(`/view?id=${id}`);
	return toViewProfile(raw);
}

// ── Chat ──

export interface ConnectedUser {
	id: number;
	firstname: string;
	image: string;
}

export interface ChatMessage {
	user_id: number;
	value: string;
	time: string;
}

export function fetchConnectedUsers(): Promise<ConnectedUser[]> {
	return request("/users/me_connected");
}

export function fetchConversation(id: number): Promise<ChatMessage[]> {
	return request(`/chat?id=${id}`);
}

export function sendMessage(id: number, message: string): Promise<void> {
	const params = new URLSearchParams({ id: String(id), message });
	return request(`/chat?${params}`, { method: "POST" });
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
