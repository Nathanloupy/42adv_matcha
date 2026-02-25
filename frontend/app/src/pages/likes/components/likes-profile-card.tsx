import unlikeSvg from "@/assets/unlike.svg";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";

interface LikesProfileCardProps {
	profileId: number;
	isLikedByUser: boolean;
	firstname: string;
	age: number;
	picture: string;
}

export type { LikesProfileCardProps };

export function LikesProfileCard({
	firstname,
	isLikedByUser,
	age,
	picture,
}: LikesProfileCardProps) {
	return (
		<div
			className="relative col-span-1 h-[33vh] m-1 rounded-sm overflow-hidden bg-cover bg-center"
			style={{ backgroundImage: `url(${picture})` }}
		>
			<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
			{isLikedByUser && (
				<button
					type="button"
					className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {}}
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
				onClick={() => {}}
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
				onClick={() => {}}
			>
				<img
					src={reportSvg}
					alt="Report fake account"
					className="w-5 h-5 drop-shadow-lg"
				/>
			</button>
			<div className="relative flex items-end h-full p-2">
				<span className="text-white font-semibold drop-shadow-lg">
					{firstname}, {age}
				</span>
			</div>
		</div>
	);
}
