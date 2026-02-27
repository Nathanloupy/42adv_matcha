import { toast } from "sonner";
import { likeUser, unlikeUser } from "@/services/api";
import likeSvg from "@/assets/like.svg";
import unlikeSvg from "@/assets/unlike.svg";

interface LikeButtonProps {
	id: number;
	isLiked: boolean;
	onToggle: () => void;
	/** "default" uses py-2 / w-4 h-4 icons (browse card); "sm" uses py-1.5 / w-3.5 h-3.5 icons (view card) */
	size?: "default" | "sm";
	/** Extra classes added to the wrapper — useful for flex/shrink overrides */
	className?: string;
}

export function LikeButton({
	id,
	isLiked,
	onToggle,
	size = "default",
	className = "",
}: LikeButtonProps) {
	const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
	const paddingClass = size === "sm" ? "py-1.5 px-3" : "py-2";
	const textClass = size === "sm" ? "text-xs" : "text-sm";
	const wrapperClass =
		size === "sm" ? "shrink-0 flex items-center gap-1.5" : "flex-1 flex items-center justify-center gap-2";

	if (isLiked) {
		return (
			<button
				type="button"
				onClick={() => {
					unlikeUser(id)
						.then(() => {
							toast.success("Unliked");
							onToggle();
						})
						.catch((e: unknown) =>
							toast.error(e instanceof Error ? e.message : "Failed to unlike"),
						);
				}}
				className={`group ${wrapperClass} ${paddingClass} rounded-md border border-pink-400/60 bg-pink-500/10 ${textClass} font-medium text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer ${className}`}
				aria-label="Unlike profile"
			>
				<img
					src={unlikeSvg}
					alt=""
					className={`${iconClass} transition-transform duration-150 group-hover:scale-125 group-active:scale-125`}
				/>
				Unlike
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={() => {
				likeUser(id)
					.then(() => {
						toast.success("Liked!");
						onToggle();
					})
					.catch((e: unknown) =>
						toast.error(e instanceof Error ? e.message : "Failed to like"),
					);
			}}
			className={`group ${wrapperClass} ${paddingClass} rounded-md border border-pink-400/40 ${textClass} font-medium text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 hover:text-pink-300 hover:scale-105 active:scale-95 active:bg-pink-500/10 active:border-pink-400 active:text-pink-300 transition-all duration-150 cursor-pointer ${className}`}
			aria-label="Like profile"
		>
			<img
				src={likeSvg}
				alt=""
				className={`${iconClass} transition-transform duration-150 group-hover:scale-125 group-active:scale-125 group-hover:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] group-active:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]`}
			/>
			Like
		</button>
	);
}
