import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { unlikeUser, blockUser, reportUser } from "@/services/api";
import unlikeSvg from "@/assets/unlike.svg";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";

interface LikesProfileCardProps {
	profileId: number;
	isLikedByUser: boolean;
	firstname: string;
	image: string;
}

export type { LikesProfileCardProps };

export function LikesProfileCard({
	profileId,
	firstname,
	isLikedByUser,
	image,
}: LikesProfileCardProps) {
	const navigate = useNavigate();

	return (
		<div
			className="relative col-span-1 h-[33vh] m-1 rounded-sm overflow-hidden bg-cover bg-center cursor-pointer"
			style={{ backgroundImage: `url(data:image/jpeg;base64,${image})` }}
			onClick={() => navigate(`/view?id=${profileId}`)}
			onKeyDown={(e) => e.key === "Enter" && navigate(`/view?id=${profileId}`)}
			role="button"
			tabIndex={0}
			aria-label={`View ${firstname}'s profile`}
		>
			<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
			{isLikedByUser && (
				<button
					type="button"
					className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={(e) => {
						e.stopPropagation();
						unlikeUser(profileId)
							.then(() => toast.success("Unliked"))
							.catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to unlike"));
					}}
				>
					<img
						src={unlikeSvg}
						alt="Unlike profile"
						className="w-5 h-5 drop-shadow-lg"
					/>
				</button>
			)}
			<button
				type="button"
				className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
				onClick={(e) => {
					e.stopPropagation();
					blockUser(profileId)
						.then(() => toast.success("User blocked"))
						.catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to block"));
				}}
			>
				<img
					src={blockSvg}
					alt="Block profile"
					className="w-5 h-5 drop-shadow-lg"
				/>
			</button>
			<button
				type="button"
				className="absolute top-12 left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
				onClick={(e) => {
					e.stopPropagation();
					reportUser(profileId)
						.then(() => toast.success("User reported"))
						.catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to report"));
				}}
			>
				<img
					src={reportSvg}
					alt="Report fake account"
					className="w-5 h-5 drop-shadow-lg"
				/>
			</button>
			<div className="relative flex items-end h-full p-2">
			<span className="text-white font-semibold drop-shadow-lg">
				{firstname}
			</span>
			</div>
		</div>
	);
}
