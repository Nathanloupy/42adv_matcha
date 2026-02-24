import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	fetchImages,
	uploadImage as uploadImageApi,
	deleteImage as deleteImageApi,
	type ImageData,
} from "@/services/api";

export type { ImageData } from "@/services/api";

export function useImages() {
	const queryClient = useQueryClient();

	const imagesQuery = useQuery({
		queryKey: ["images", "mine"],
		queryFn: fetchImages,
	});

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadImageApi(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["images", "mine"] });
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Image uploaded.");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to upload image.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (uuid: string) => deleteImageApi(uuid),
		onSuccess: (_result, uuid) => {
			queryClient.setQueryData<ImageData[]>(
				["images", "mine"],
				(prev) => (prev ? prev.filter((img) => img.uuid !== uuid) : []),
			);
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			toast.success("Image deleted.");
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Failed to delete image.");
		},
	});

	return {
		images: imagesQuery.data ?? [],
		isLoading: imagesQuery.isLoading,
		isUploading: uploadMutation.isPending,
		isDeleting: deleteMutation.isPending,
		error:
			imagesQuery.error?.message ??
			uploadMutation.error?.message ??
			deleteMutation.error?.message ??
			null,
		uploadImage: uploadMutation.mutate,
		deleteImage: deleteMutation.mutate,
	};
}
