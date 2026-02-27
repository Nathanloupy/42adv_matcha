import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";
import { API_URL } from "@/services/api";

const WS_URL = API_URL.replace(/^http/, "ws");

const RECONNECT_DELAY_MS_BASE = 3000;
const RECONNECT_DELAY_MS_MAX = 30000;

type WsEventType =
	| "NEW_VIEW"
	| "NEW_LIKE"
	| "NEW_MATCH"
	| "NEW_UNMATCH"
	| "NEW_CHAT";

interface WsEvent {
	type: WsEventType;
	senderId: number;
}

function parseWsEvent(raw: string): WsEvent | null {
	const comma = raw.indexOf(",");
	if (comma === -1) return null;
	const type = raw.slice(0, comma) as WsEventType;
	const senderId = Number(raw.slice(comma + 1));
	if (isNaN(senderId)) return null;
	return { type, senderId };
}

export function useWebSocket() {
	const { isAuthenticated } = useAuthContext();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();

	// Keep a ref so the stable WS onmessage closure always reads the current route
	const locationRef = useRef(location);
	useEffect(() => {
		locationRef.current = location;
	}, [location]);

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
				const parsed = parseWsEvent(String(event.data).trim());
				if (!parsed) return;

				const { type, senderId } = parsed;
				const pathname = locationRef.current.pathname;

				switch (type) {
					case "NEW_VIEW":
						toast.info("An user visited your profile!");
						if (pathname === "/likes") {
							queryClient.invalidateQueries({ queryKey: ["views_me"] });
						}
						break;

					case "NEW_LIKE":
						toast.success("Someone liked your profile!");
						if (pathname === "/likes") {
							queryClient.invalidateQueries({ queryKey: ["likes_me"] });
						}
						break;

					case "NEW_MATCH":
						toast.success("You have a new match!");
						if (pathname === "/messages") {
							queryClient.invalidateQueries({ queryKey: ["me_connect"] });
						}
						break;

					case "NEW_UNMATCH": {
						toast.warning("Someone unmatched you.");
						// If we are inside the conversation with that person, close it
						const conversationMatch = pathname.match(/^\/messages\/(\d+)$/);
						if (conversationMatch && Number(conversationMatch[1]) === senderId) {
							navigate("/messages");
						}
						else if (pathname === "/messages") {
							queryClient.invalidateQueries({ queryKey: ["me_connect"] });
						}
						break;
					}

					case "NEW_CHAT": {
						// Only refresh and suppress the toast if we are in that conversation
						const conversationMatch = pathname.match(/^\/messages\/(\d+)$/);
						if (conversationMatch && Number(conversationMatch[1]) === senderId) {
							queryClient.invalidateQueries({ queryKey: ["chat", senderId] });
						} else {
							toast.info("New message received!");
						}
						break;
					}

					default: {
						const _exhaustive: never = type;
						console.warn("Unknown WS event type:", _exhaustive);
					}
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
	}, [isAuthenticated, queryClient, navigate]);
}
