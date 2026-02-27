import { useQuery } from "@tanstack/react-query";
import { fetchConnectedUsers } from "@/services/api";
import { Chat } from "./components/chat";

export default function Messages() {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["me_connect"],
		queryFn: fetchConnectedUsers,
	});

	return (
		<div className="min-h-screen">
			<div className="px-4 py-4 border-b border-white/10">
				<h1 className="text-lg font-semibold text-foreground">Messages</h1>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-16">
					<span className="text-muted-foreground">Loading...</span>
				</div>
			)}

			{isError && (
				<div className="flex items-center justify-center py-16">
					<span className="text-destructive">
						{error instanceof Error ? error.message : "Failed to load"}
					</span>
				</div>
			)}

			{!isLoading && !isError && data?.length === 0 && (
				<div className="flex flex-col items-center justify-center py-16 gap-2">
					<span className="text-muted-foreground">No conversations yet.</span>
					<span className="text-xs text-muted-foreground/60">
						Match with someone to start chatting!
					</span>
				</div>
			)}

			{data && data.length > 0 && (
				<div className="flex flex-col">
					{data.map((user) => (
						<Chat key={user.id} {...user} />
					))}
				</div>
			)}
		</div>
	);
}
