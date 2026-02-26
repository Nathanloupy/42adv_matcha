import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { likeUser, unlikeUser, blockUser, reportUser } from "@/services/api";
import likeSvg from "@/assets/like.svg";
import unlikeSvg from "@/assets/unlike.svg";
import viewSvg from "@/assets/view.svg";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";
import locationSvg from "@/assets/location-pin.svg";
import distanceSvg from "@/assets/distance.svg";
import heartSvg from "@/assets/heart.svg";
import maleSvg from "@/assets/male.svg";
import femaleSvg from "@/assets/female.svg";

interface BrowseProfileCardProps {
	id: number;
	username: string;
	firstname: string;
	surname: string;
	age: number;
	gender: number;
	biography: string;
	gps: string;
	distance: number;
	fame: number;
	lastConnection: string;
	tagCount: number;
	pictures?: string[];
	isLiked: boolean;
	onNext: () => void;
	onView: () => void;
	onLikeToggle: () => void;
}

export type { BrowseProfileCardProps };

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function formatLastConnection(raw: string): string {
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return raw;

	if (Date.now() - date.getTime() < FIVE_MINUTES_MS) {
		return "Currently online";
	}

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function BrowseProfileCard({
	id,
	firstname,
	age,
	gender,
	biography,
	gps,
	distance,
	fame,
	lastConnection,
	tagCount,
	pictures = [],
	isLiked,
	onNext,
	onView,
	onLikeToggle,
}: BrowseProfileCardProps) {
	const [pictureIndex, setPictureIndex] = useState(0);

	const hasPictures = pictures.length > 0;
	const currentPicture = hasPictures ? pictures[pictureIndex] : null;

	function prevPicture(e: React.MouseEvent) {
		e.stopPropagation();
		setPictureIndex((i) => (i - 1 + pictures.length) % pictures.length);
	}

	function nextPicture(e: React.MouseEvent) {
		e.stopPropagation();
		setPictureIndex((i) => (i + 1) % pictures.length);
	}

	const lastConnectionText = formatLastConnection(lastConnection);
	const isOnline = lastConnectionText === "Currently online";

	return (
		<div className="h-full w-full flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg border border-border">
			<div className="relative flex-1 bg-muted flex items-center justify-center overflow-hidden min-h-0">
				{currentPicture ? (
					<img
						src={`data:image/jpeg;base64,${currentPicture}`}
						alt={`${firstname}'s photo`}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<svg
						className="w-32 h-32 text-muted-foreground/20"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
					</svg>
				)}

				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

				{hasPictures && pictures.length > 1 && (
					<>
						<button
							type="button"
							onClick={prevPicture}
							className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
							aria-label="Previous picture"
						>
							<svg
								className="w-5 h-5 text-white"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<button
							type="button"
							onClick={nextPicture}
							className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
							aria-label="Next picture"
						>
							<svg
								className="w-5 h-5 text-white"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</>
				)}

				{hasPictures && pictures.length > 1 && (
					<div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
						{pictures.map((_, i) => (
							<span
								key={`dot-${
									// biome-ignore lint/suspicious/noArrayIndexKey: pictures have no stable id
									i
								}`}
								className={cn(
									"block w-2 h-2 rounded-full transition-colors",
									i === pictureIndex
										? "bg-white"
										: "bg-white/35",
								)}
							/>
						))}
					</div>
				)}

				<button
					type="button"
					className="absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {
						blockUser(id)
							.then(() => {
								toast.success("User blocked");
								onNext();
							})
							.catch((e: unknown) =>
								toast.error(
									e instanceof Error
										? e.message
										: "Failed to block",
								),
							);
					}}
					title="Block profile"
				>
					<img
						src={blockSvg}
						alt="Block profile"
						className="w-5 h-5 drop-shadow"
					/>
				</button>
				<button
					type="button"
					className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {
						reportUser(id)
							.then(() => toast.success("User reported"))
							.catch((e: unknown) =>
								toast.error(
									e instanceof Error
										? e.message
										: "Failed to report",
								),
							);
					}}
					title="Report profile"
				>
					<img
						src={reportSvg}
						alt="Report profile"
						className="w-5 h-5 drop-shadow"
					/>
				</button>

				<div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10 flex items-end justify-between">
					<span className="text-white font-bold text-2xl drop-shadow">
						{firstname}, {age}
					</span>
					<img
						src={gender === 0 ? femaleSvg : maleSvg}
						alt={gender === 0 ? "Female" : "Male"}
						className="w-7 h-7 drop-shadow invert"
					/>
				</div>
			</div>

			<div className="px-4 pt-3 pb-4 flex flex-col gap-2 bg-card shrink-0">
				{biography ? (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{biography}
					</p>
				) : (
					<p className="text-sm text-muted-foreground/40 italic">
						No biography.
					</p>
				)}

				<div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<img
							src={distanceSvg}
							alt=""
							className="invert w-4 h-4"
						/>
						{distance} km
					</span>
					<span className="flex items-center gap-1.5">
						<img src={locationSvg} alt="" className="w-4 h-4" />
						{gps
							.split(",")
							.map((n) => (Math.trunc(+n * 100) / 100).toFixed(2))
							.join(",")}{" "}
					</span>
					<span className="flex items-center gap-1.5">
						<img src={heartSvg} alt="" className="w-4 h-4" />
						{fame}
					</span>
					{tagCount > 0 && (
						<span className="text-foreground font-medium">
							{tagCount} tag{tagCount > 1 ? "s" : ""} in common
						</span>
					)}
				</div>

				<span
					className={cn(
						"text-xs",
						isOnline
							? "text-green-400 font-medium"
							: "text-muted-foreground/55",
					)}
				>
					{isOnline
						? lastConnectionText
						: `Last seen ${lastConnectionText}`}
				</span>

				<div className="flex gap-3 pt-1">
				{isLiked ? (
					<button
						type="button"
						onClick={() => {
							unlikeUser(id)
								.then(() => { toast.success("Unliked"); onLikeToggle(); })
								.catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to unlike"));
						}}
						className="group flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-pink-400/60 bg-pink-500/10 text-sm font-medium text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
						aria-label="Unlike profile"
					>
						<img
							src={unlikeSvg}
							alt=""
							className="w-4 h-4 transition-transform duration-150 group-hover:scale-125 group-active:scale-125"
						/>
						Unlike
					</button>
				) : (
					<button
						type="button"
						onClick={() => {
							likeUser(id)
								.then(() => { toast.success("Liked!"); onLikeToggle(); })
								.catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to like"));
						}}
						className="group flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-pink-400/40 text-sm font-medium text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 hover:text-pink-300 hover:scale-105 active:scale-95 active:bg-pink-500/10 active:border-pink-400 active:text-pink-300 transition-all duration-150 cursor-pointer"
						aria-label="Like profile"
					>
						<img
							src={likeSvg}
							alt=""
							className="w-4 h-4 transition-transform duration-150 group-hover:scale-125 group-active:scale-125 group-hover:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] group-active:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]"
						/>
						Like
					</button>
				)}
					<button
						type="button"
						onClick={onView}
						className="group flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-cyan-400/40 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:scale-105 active:scale-95 active:bg-cyan-500/10 active:border-cyan-400 active:text-cyan-300 transition-all duration-150 cursor-pointer"
						aria-label="View profile"
						title="View profile"
					>
						<img
							src={viewSvg}
							alt=""
							className="w-4 h-4 transition-transform duration-150 group-hover:scale-125 group-active:scale-125 group-hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.8)] group-active:drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
						/>
						View
					</button>
				<button
					type="button"
					onClick={() => setTimeout(onNext, 200)}
					className="group flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted hover:border-muted-foreground/40 hover:scale-105 active:scale-95 active:bg-muted active:border-muted-foreground/40 transition-all duration-150 cursor-pointer"
					aria-label="Next profile"
				>
						Next
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
