import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useImages } from "@/hooks/useImages";
import deleteIcon from "@/assets/delete.svg";

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ".jpg";

export function ImagesCard() {
	const {
		images,
		isLoading,
		isUploading,
		isDeleting,
		uploadImage,
		deleteImage,
	} = useImages();

	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		uploadImage(file);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	const canUpload = images.length < MAX_IMAGES && !isUploading;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile pictures</CardTitle>
				<CardDescription>
					Upload up to {MAX_IMAGES} photos ({images.length}/
					{MAX_IMAGES})
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{isLoading && images.length === 0 && (
						<p className="text-sm text-muted-foreground">
							Loading images...
						</p>
					)}
					<div className="grid grid-cols-3 gap-3">
						{images.map((image) => (
							<div
								key={image.uuid}
								className="group relative aspect-square overflow-hidden rounded-lg border border-border"
							>
								<img
									src={`data:image/jpeg;base64,${image.base64}`}
									alt="Profile"
									className="h-full w-full object-cover"
								/>
								<button
									type="button"
									onClick={() => deleteImage(image.uuid)}
									disabled={isDeleting}
									className={cn(
										"absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full",
										"bg-black/60 transition-colors",
										"hover:bg-destructive",
										isDeleting &&
											"cursor-not-allowed opacity-50",
									)}
									aria-label="Delete image"
								>
									<img
										src={deleteIcon}
										alt=""
										className="size-4.5 invert"
									/>
								</button>
							</div>
						))}
						{canUpload && (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className={cn(
									"flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-input",
									"text-muted-foreground transition-colors hover:border-primary hover:text-primary",
								)}
								aria-label="Upload image"
							>
								<span className="text-2xl leading-none">+</span>
							</button>
						)}
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept={ACCEPTED_TYPES}
						onChange={handleUpload}
						className="hidden"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
