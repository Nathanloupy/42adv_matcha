import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	fetchAllTags,
	fetchMyTags,
	addTag as addTagApi,
	removeTag as removeTagApi,
} from "@/services/api";

export function useTags() {
	const queryClient = useQueryClient();

	const allTagsQuery = useQuery({
		queryKey: ["tags", "all"],
		queryFn: fetchAllTags,
	});

	const myTagsQuery = useQuery({
		queryKey: ["tags", "mine"],
		queryFn: fetchMyTags,
	});

	const addMutation = useMutation({
		mutationFn: (tag: string) => addTagApi(tag),
		onSuccess: (_result, tag) => {
			queryClient.setQueryData<string[]>(["tags", "mine"], (prev) =>
				prev ? [...prev, tag] : [tag],
			);
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success(`Tag "${tag}" added.`);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to add tag.");
		},
	});

	const removeMutation = useMutation({
		mutationFn: (tag: string) => removeTagApi(tag),
		onSuccess: (_result, tag) => {
			queryClient.setQueryData<string[]>(["tags", "mine"], (prev) =>
				prev ? prev.filter((t) => t !== tag) : [],
			);
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success(`Tag "${tag}" removed.`);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to remove tag.");
		},
	});

	return {
		allTags: allTagsQuery.data ?? [],
		myTags: myTagsQuery.data ?? [],
		isLoading: addMutation.isPending || removeMutation.isPending,
		isTagsLoading: allTagsQuery.isLoading || myTagsQuery.isLoading,
		error:
			allTagsQuery.error?.message ??
			myTagsQuery.error?.message ??
			addMutation.error?.message ??
			removeMutation.error?.message ??
			null,
		addTag: addMutation.mutate,
		removeTag: removeMutation.mutate,
	};
}
