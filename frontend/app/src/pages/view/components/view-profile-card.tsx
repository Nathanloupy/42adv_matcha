import { PhotoCarousel } from "@/components/PhotoCarousel";
import { LikeButton } from "@/components/LikeButton";
import { ProfileActionButtons } from "@/components/ProfileActionButtons";
import { formatLastConnection } from "@/lib/format-last-connection";
import { formatGps } from "@/lib/format-gps";
import { cn } from "@/lib/utils";
import locationSvg from "@/assets/location-pin.svg";
import heartSvg from "@/assets/heart.svg";
import type { ViewProfile } from "@/services/api";

function formatSexualPreference(pref: number): string {
	if (pref === 0) return "Heterosexual";
	if (pref === 1) return "Homosexual";
	if (pref === 2) return "Bisexual";
	return "Unknown";
}

export function ViewProfileCard({
	id,
	username,
	firstname,
	surname,
	age,
	gender,
	sexualPreference,
	biography,
	gps,
	fame,
	lastConnection,
	tags,
	images,
	isLiked,
	onLikeToggle,
}: ViewProfile & { isLiked: boolean; onLikeToggle: () => void }) {
	const lastConnectionText = formatLastConnection(lastConnection);
	const isOnline = lastConnectionText === "Currently online";

	return (
		<div className="h-full w-full flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg border border-border">
			{/* Photo area */}
			<div className="relative flex-1 min-h-0">
				<PhotoCarousel
					images={images}
					firstname={firstname}
					age={age}
					gender={gender}
				/>
				<ProfileActionButtons id={id} />
			</div>

			{/* Info panel */}
			<div className="px-4 pt-3 pb-4 flex flex-col gap-2 bg-card shrink-0">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-baseline gap-2 min-w-0">
						<span className="font-semibold text-foreground truncate">
							{firstname} {surname}
						</span>
						<span className="text-sm text-muted-foreground shrink-0">
							@{username}
						</span>
					</div>
					<LikeButton id={id} isLiked={isLiked} onToggle={onLikeToggle} size="sm" />
				</div>

				{biography ? (
					<p className="text-sm text-muted-foreground">{biography}</p>
				) : (
					<p className="text-sm text-muted-foreground/40 italic">No biography.</p>
				)}

				<div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<img src={locationSvg} alt="" className="w-4 h-4" />
						{formatGps(gps)}
					</span>
					<span className="flex items-center gap-1.5">
						<img src={heartSvg} alt="" className="w-4 h-4" />
						{fame}
					</span>
				</div>

				<span className="text-sm text-muted-foreground">
					{formatSexualPreference(sexualPreference)}
				</span>

				{tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-0.5">
						{tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/15 text-pink-300 border border-pink-500/25"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				<span
					className={cn(
						"text-xs",
						isOnline ? "text-green-400 font-medium" : "text-muted-foreground/55",
					)}
				>
					{isOnline ? lastConnectionText : `Last seen ${lastConnectionText}`}
				</span>
			</div>
		</div>
	);
}
