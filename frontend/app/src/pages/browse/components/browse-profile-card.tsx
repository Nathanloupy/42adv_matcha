import { PhotoCarousel } from "@/components/PhotoCarousel";
import { LikeButton } from "@/components/LikeButton";
import { ProfileActionButtons } from "@/components/ProfileActionButtons";
import { formatLastConnection } from "@/lib/format-last-connection";
import { formatGps } from "@/lib/format-gps";
import { cn } from "@/lib/utils";
import locationSvg from "@/assets/location-pin.svg";
import distanceSvg from "@/assets/distance.svg";
import heartSvg from "@/assets/heart.svg";
import viewSvg from "@/assets/view.svg";

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
	const lastConnectionText = formatLastConnection(lastConnection);
	const isOnline = lastConnectionText === "Currently online";

	return (
		<div className="h-full w-full flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg border border-border">
			<div className="relative flex-1 min-h-0">
				<PhotoCarousel
					images={pictures}
					firstname={firstname}
					age={age}
					gender={gender}
				/>
				<ProfileActionButtons id={id} onBlock={onNext} />
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
						<img src={distanceSvg} alt="" className="invert w-4 h-4" />
						{distance} km
					</span>
					<span className="flex items-center gap-1.5">
						<img src={locationSvg} alt="" className="w-4 h-4" />
						{formatGps(gps)}
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
					<LikeButton id={id} isLiked={isLiked} onToggle={onLikeToggle} />
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
