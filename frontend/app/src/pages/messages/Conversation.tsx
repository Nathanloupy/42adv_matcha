import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchConversation, sendMessage, fetchProfile, fetchConnectedUsers } from "@/services/api";

function ArrowLeftIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 12H5" />
			<path d="M12 19l-7-7 7-7" />
		</svg>
	);
}

function SendIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M22 2L11 13" />
			<path d="M22 2L15 22 11 13 2 9l20-7z" />
		</svg>
	);
}

export default function Conversation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const otherId = Number(id);

	const profileQuery = useQuery({
		queryKey: ["profile"],
		queryFn: fetchProfile,
	});

	const connectedUsersQuery = useQuery({
		queryKey: ["me_connect"],
		queryFn: fetchConnectedUsers,
	});

	const conversationQuery = useQuery({
		queryKey: ["chat", otherId],
		queryFn: () => fetchConversation(otherId),
		enabled: !!otherId,
	});

	const sendMutation = useMutation({
		mutationFn: (message: string) => sendMessage(otherId, message),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chat", otherId] });
			setInputValue("");
			inputRef.current?.focus();
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to send message");
		},
	});

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [conversationQuery.data]);

	function handleSend() {
		const trimmed = inputValue.trim();
		if (!trimmed || sendMutation.isPending) return;
		sendMutation.mutate(trimmed);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSend();
		}
	}

	const myId = profileQuery.data?.id;
	const otherUser = connectedUsersQuery.data?.find((u) => u.id === otherId);
	const messages = conversationQuery.data ?? [];

	const isLoading = conversationQuery.isLoading || profileQuery.isLoading;
	const isError = conversationQuery.isError || profileQuery.isError;

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-slate-950 shrink-0">
				<button
					type="button"
					onClick={() => navigate("/messages")}
					className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					aria-label="Back to messages"
				>
					<ArrowLeftIcon />
				</button>

				{otherUser ? (
					<>
						{otherUser.image ? (
							<img
								src={`data:image/jpeg;base64,${otherUser.image}`}
								alt={otherUser.firstname}
								className="w-9 h-9 rounded-full object-cover"
							/>
						) : (
							<div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
								<span className="text-white text-sm font-semibold">
									{otherUser.firstname[0]?.toUpperCase()}
								</span>
							</div>
						)}
						<span className="font-semibold text-foreground">
							{otherUser.firstname}
						</span>
					</>
				) : (
					<span className="font-semibold text-foreground">Conversation</span>
				)}
			</div>

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
				{isLoading && (
					<div className="flex items-center justify-center h-full">
						<span className="text-muted-foreground text-sm">Loading...</span>
					</div>
				)}

				{isError && (
					<div className="flex items-center justify-center h-full">
						<span className="text-destructive text-sm">
							Failed to load messages.
						</span>
					</div>
				)}

				{!isLoading && !isError && messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full gap-2">
						<span className="text-muted-foreground text-sm">
							No messages yet.
						</span>
						<span className="text-xs text-muted-foreground/60">
							Say hello!
						</span>
					</div>
				)}

				{!isLoading &&
					!isError &&
					messages.map((msg, index) => {
						const isMine = msg.user_id === myId;
						const showTime =
							index === 0 ||
							msg.time !== messages[index - 1]?.time;

						return (
							<div key={index} className="flex flex-col">
								{showTime && (
									<span className="text-[10px] text-muted-foreground/50 text-center my-1">
										{new Date(msg.time).toLocaleString(undefined, {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								)}
								<div
									className={`flex ${isMine ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed break-words ${
											isMine
												? "bg-pink-500 text-white rounded-br-sm"
												: "bg-slate-800 text-foreground rounded-bl-sm"
										}`}
									>
										{msg.value}
									</div>
								</div>
							</div>
						);
					})}

				<div ref={messagesEndRef} />
			</div>

			{/* Input bar */}
			<div className="shrink-0 px-4 py-3 border-t border-white/10 bg-slate-950">
				<div className="flex items-center gap-2">
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="flex-1 bg-slate-800 text-foreground placeholder:text-muted-foreground/50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-pink-500/50 transition-all"
						disabled={sendMutation.isPending}
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={!inputValue.trim() || sendMutation.isPending}
						className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
						aria-label="Send message"
					>
						<SendIcon />
					</button>
				</div>
			</div>
		</div>
	);
}
