import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

const RECONNECT_DELAY_MS = 3000;

export function useWebSocket() {
	const { isAuthenticated } = useAuthContext();
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const shouldConnectRef = useRef(false);

	useEffect(() => {
		shouldConnectRef.current = isAuthenticated;

		if (!isAuthenticated) {
			// Clean up any existing connection on logout
			if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
			wsRef.current?.close();
			wsRef.current = null;
			return;
		}

		function connect() {
			if (!shouldConnectRef.current) return;

			const ws = new WebSocket(`${WS_URL}/ws`);
			wsRef.current = ws;

			ws.onmessage = (event: MessageEvent) => {
				const data = String(event.data).trim();
				if (data === "NEW_LIKE") {
					toast.success("Someone liked your profile!");
				}
			};

			ws.onclose = (event: CloseEvent) => {
				// Don't reconnect on intentional close (e.g. logout)
				if (!shouldConnectRef.current) return;
				// Reconnect unless the server explicitly rejected us (policy violation)
				if (event.code !== 1008) {
					reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
				}
			};
		}

		connect();

		return () => {
			shouldConnectRef.current = false;
			if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, [isAuthenticated]);
}
