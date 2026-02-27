import { useState } from "react";
import { cn } from "@/lib/utils";
import maleSvg from "@/assets/male.svg";
import femaleSvg from "@/assets/female.svg";

interface PhotoCarouselProps {
	images: string[];
	firstname: string;
	age: number;
	gender: number;
}

export function PhotoCarousel({
	images,
	firstname,
	age,
	gender,
}: PhotoCarouselProps) {
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

	return (
		<div className="relative h-full w-full bg-muted flex items-center justify-center overflow-hidden">
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
	);
}
