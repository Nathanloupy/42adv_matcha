import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";
import { API_URL } from "@/services/api";

const WS_URL = API_URL.replace(/^http/, "ws");

const RECONNECT_DELAY_MS_BASE = 3000;
const RECONNECT_DELAY_MS_MAX = 30000;

export function useWebSocket() {
	const { isAuthenticated } = useAuthContext();

	useEffect(() => {
		if (!isAuthenticated) return;

		let cancelled = false;
		let ws: WebSocket | null = null;
		let timer: ReturnType<typeof setTimeout> | null = null;
		let attempt = 0;

		function connect() {
			if (cancelled) return;

			ws = new WebSocket(`${WS_URL}/ws`);

			ws.onmessage = (event: MessageEvent) => {
				const data = String(event.data).trim();
				if (data === "NEW_LIKE") {
					toast.success("Someone liked your profile!");
				} else if (data === "NEW_MESSAGE") {
					// TODO: invalidate chat queries or show a notification
					// when the backend starts sending this event
					toast.info("New message received");
				}
			};

			ws.onerror = () => {
				// onerror always fires before onclose; logging is sufficient here
				// since onclose handles reconnection
				console.error("WebSocket error");
			};

			ws.onclose = (event: CloseEvent) => {
				if (cancelled) return;
				// Don't reconnect if the server explicitly rejected us (bad token)
				if (event.code === 1008) return;
				const delay = Math.min(
					RECONNECT_DELAY_MS_BASE * 2 ** attempt,
					RECONNECT_DELAY_MS_MAX,
				);
				attempt += 1;
				timer = setTimeout(connect, delay);
			};

			ws.onopen = () => {
				attempt = 0;
			};
		}

		connect();

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
			ws?.close();
		};
	}, [isAuthenticated]);
}
