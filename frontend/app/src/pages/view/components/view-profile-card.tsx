import { useState } from "react";
import { cn } from "@/lib/utils";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";
import locationSvg from "@/assets/location-pin.svg";
import heartSvg from "@/assets/heart.svg";
import maleSvg from "@/assets/male.svg";
import femaleSvg from "@/assets/female.svg";
import type { ViewProfile } from "@/services/api";

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

function formatSexualPreference(pref: number): string {
	if (pref === 0) return "Heterosexual";
	if (pref === 1) return "Homosexual";
	if (pref === 2) return "Bisexual";
	return "Unknown";
}

export function ViewProfileCard({
	username,
	firstname,
	surname,
	age,
	gender,
	sexual_preference,
	biography,
	gps,
	fame,
	last_connection,
	tags,
	images,
}: ViewProfile) {
	const [pictureIndex, setPictureIndex] = useState(0);

	const hasPictures = images.length > 0;
	const currentPicture = hasPictures ? images[pictureIndex] : null;

	function prevPicture(e: React.MouseEvent) {
		e.stopPropagation();
		setPictureIndex((i) => (i - 1 + images.length) % images.length);
	}

	function nextPicture(e: React.MouseEvent) {
		e.stopPropagation();
		setPictureIndex((i) => (i + 1) % images.length);
	}

	const lastConnectionText = formatLastConnection(last_connection);
	const isOnline = lastConnectionText === "Currently online";

	return (
		<div className="h-full w-full flex flex-col bg-card text-card-foreground overflow-hidden rounded-lg border border-border">
			{/* Photo area */}
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

				{hasPictures && images.length > 1 && (
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

				{hasPictures && images.length > 1 && (
					<div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
						{images.map((_, i) => (
							<span
								key={`dot-${
									// biome-ignore lint/suspicious/noArrayIndexKey: images have no stable id
									i
								}`}
								className={cn(
									"block w-2 h-2 rounded-full transition-colors",
									i === pictureIndex ? "bg-white" : "bg-white/35",
								)}
							/>
						))}
					</div>
				)}

				<button
					type="button"
					className="absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {}}
					title="Block profile"
				>
					<img src={blockSvg} alt="Block profile" className="w-5 h-5 drop-shadow" />
				</button>
				<button
					type="button"
					className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {}}
					title="Report profile"
				>
					<img src={reportSvg} alt="Report profile" className="w-5 h-5 drop-shadow" />
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

			{/* Info panel */}
			<div className="px-4 pt-3 pb-4 flex flex-col gap-2 bg-card shrink-0">
				<div className="flex items-baseline gap-2">
					<span className="font-semibold text-foreground">{firstname} {surname}</span>
					<span className="text-sm text-muted-foreground">@{username}</span>
				</div>

				{biography ? (
					<p className="text-sm text-muted-foreground">{biography}</p>
				) : (
					<p className="text-sm text-muted-foreground/40 italic">No biography.</p>
				)}

				<div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<img src={locationSvg} alt="" className="w-4 h-4" />
						{gps
							.split(",")
							.map((n) => (Math.trunc(+n * 100) / 100).toFixed(2))
							.join(", ")}
					</span>
					<span className="flex items-center gap-1.5">
						<img src={heartSvg} alt="" className="w-4 h-4" />
						{fame}
					</span>
				</div>

				<span className="text-sm text-muted-foreground">
					{formatSexualPreference(sexual_preference)}
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
						isOnline
							? "text-green-400 font-medium"
							: "text-muted-foreground/55",
					)}
				>
					{isOnline ? lastConnectionText : `Last seen ${lastConnectionText}`}
				</span>
			</div>
		</div>
	);
}
