import { useState } from "react";
import likeSvg from "@/assets/like.svg";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";
import locationSvg from "@/assets/location-pin.svg";
import heartSvg from "@/assets/heart.svg";
import maleSvg from "@/assets/male.svg";
import femaleSvg from "@/assets/female.svg";

interface BrowseProfileCardProps {
	username: string;
	firstname: string;
	surname: string;
	age: number;
	gender: number;
	biography: string;
	gps: number;
	fame: number;
	last_connection: string;
	tag_count: number;
	pictures?: string[];
	onNext: () => void;
}

export type { BrowseProfileCardProps };

function formatLastConnection(raw: string): string {
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return raw;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default function BrowseProfileCard({
	firstname,
	age,
	gender,
	biography,
	gps,
	fame,
	last_connection,
	tag_count,
	pictures = [],
	onNext,
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
								className={`block w-2 h-2 rounded-full transition-colors ${i === pictureIndex ? "bg-white" : "bg-white/35"}`}
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
					<img
						src={blockSvg}
						alt="Block profile"
						className="w-5 h-5 drop-shadow"
					/>
				</button>
				<button
					type="button"
					className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
					onClick={() => {}}
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
						<img src={locationSvg} alt="" className="w-4 h-4" />
						{gps} km
					</span>
					<span className="flex items-center gap-1.5">
						<img src={heartSvg} alt="" className="w-4 h-4" />
						{fame}
					</span>
					{tag_count > 0 && (
						<span className="text-foreground font-medium">
							{tag_count} tag{tag_count > 1 ? "s" : ""} in common
						</span>
					)}
				</div>

				<span className="text-xs text-muted-foreground/55">
					Last seen {formatLastConnection(last_connection)}
				</span>

				<div className="flex gap-3 pt-1">
					<button
						type="button"
						onClick={() => {}}
					className="group flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-pink-400/40 text-sm font-medium text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 hover:text-pink-300 hover:scale-105 active:scale-95 active:bg-pink-500/10 active:border-pink-400 active:text-pink-300 transition-all duration-150 cursor-pointer"
					aria-label="Like profile"
				>
					<img src={likeSvg} alt="" className="w-4 h-4 transition-transform duration-150 group-hover:scale-125 group-active:scale-125 group-hover:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] group-active:drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
						Like
					</button>
				<button
					type="button"
					onClick={() => setTimeout(onNext, 200)}
					className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted hover:border-muted-foreground/40 hover:translate-x-0.5 active:bg-muted active:border-muted-foreground/40 active:translate-x-1 transition-all duration-150 cursor-pointer"
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
