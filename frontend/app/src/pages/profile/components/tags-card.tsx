import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTags } from "@/hooks/useTags";

const MAX_TAGS = 10;

export function TagsCard() {
	const {
		allTags,
		myTags,
		isLoading,
		error,
		fetchAllTags,
		fetchMyTags,
		addTag,
		removeTag,
	} = useTags();
	const initRef = useRef(false);

	useEffect(() => {
		if (initRef.current) return;
		initRef.current = true;
		fetchAllTags();
		fetchMyTags();
	}, [fetchAllTags, fetchMyTags]);

	const myTagsSet = new Set(myTags);

	function handleToggle(tag: string) {
		if (isLoading) return;
		if (myTagsSet.has(tag)) {
			removeTag(tag);
		} else {
			if (myTags.length >= MAX_TAGS) return;
			addTag(tag);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tags</CardTitle>
				<CardDescription>
					Select up to {MAX_TAGS} tags that describe your interests ({myTags.length}/{MAX_TAGS})
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{allTags.length === 0 && !error && (
						<p className="text-sm text-muted-foreground">
							Loading tags...
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{allTags.map((tag) => {
							const selected = myTagsSet.has(tag);
							const disabled =
								isLoading ||
								(!selected && myTags.length >= MAX_TAGS);
							return (
								<button
									key={tag}
									type="button"
									onClick={() => handleToggle(tag)}
									disabled={disabled}
									className={cn(
										"rounded-full border px-3 py-1 text-sm transition-colors",
										selected
											? "border-primary bg-primary text-primary-foreground"
											: "border-input bg-transparent text-foreground hover:bg-muted",
										disabled && !selected && "cursor-not-allowed opacity-50",
									)}
								>
									{selected ? `${tag} ✕` : tag}
								</button>
							);
						})}
					</div>
					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
