import { useQuery } from "@tanstack/react-query";
import { fetchConnectedUsers } from "@/services/api";
import { InlineLoadingState, InlineErrorState, InlineEmptyState } from "@/components/states";
import { Chat } from "./components/chat";

export default function Messages() {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["me_connect"],
		queryFn: fetchConnectedUsers,
	});

	return (
		<div>
			<div className="px-4 py-4 border-b border-white/10">
				<h1 className="text-lg font-semibold text-foreground">Messages</h1>
			</div>

			{isLoading && <InlineLoadingState />}

			{isError && <InlineErrorState error={error} />}

			{!isLoading && !isError && data?.length === 0 && (
				<InlineEmptyState
					title="No conversations yet."
					subtitle="Match with someone to start chatting!"
				/>
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
