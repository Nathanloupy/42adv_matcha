import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTags } from "@/services/api";
import type { SearchParams } from "@/services/api";
import { geocodeAddress } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Tab from "@/components/Tab";
import BrowseContent from "./components/BrowseContent";
import SearchContent from "./components/SearchContent";

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return debounced;
}

export default function Browse() {
	const [activeTab, setActiveTab] = useState<"browse" | "search">("browse");

	const [ageRange, setAgeRange] = useState([3, 21]);
	const [fameRange, setFameRange] = useState([-100, 100]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [locationText, setLocationText] = useState("");
	const [locationCoords, setLocationCoords] = useState<string | null>(null);
	const [locationError, setLocationError] = useState("");
	const [geocoding, setGeocoding] = useState(false);
	const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { data: allTags } = useQuery({
		queryKey: ["tags", "all"],
		queryFn: fetchAllTags,
	});

	const debouncedAge = useDebounce(ageRange, 300);
	const debouncedFame = useDebounce(fameRange, 300);

	const searchParams: SearchParams = {
		age_min: debouncedAge[0],
		age_max: debouncedAge[1],
		fame_min: debouncedFame[0],
		fame_max: debouncedFame[1],
		location: locationCoords,
		tags: selectedTags.length > 0 ? selectedTags : null,
	};

	function handleTagToggle(tag: string) {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}

	function handleLocationChange(value: string) {
		setLocationText(value);
		setLocationError("");

		if (geocodeTimerRef.current) {
			clearTimeout(geocodeTimerRef.current);
		}

		if (!value.trim()) {
			setLocationCoords(null);
			return;
		}

		geocodeTimerRef.current = setTimeout(async () => {
			setGeocoding(true);
			try {
				const result = await geocodeAddress(value.trim());
				if (result) {
					setLocationCoords(`${result.lat},${result.lng}`);
					setLocationError("");
				} else {
					setLocationCoords(null);
					setLocationError("Location not found");
				}
			} catch {
				setLocationCoords(null);
				setLocationError("Failed to geocode address");
			} finally {
				setGeocoding(false);
			}
		}, 500);
	}

	function handleLocationKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") {
			if (geocodeTimerRef.current) {
				clearTimeout(geocodeTimerRef.current);
			}
			const value = locationText.trim();
			if (!value) return;
			setGeocoding(true);
			geocodeAddress(value)
				.then((result) => {
					if (result) {
						setLocationCoords(`${result.lat},${result.lng}`);
						setLocationError("");
					} else {
						setLocationCoords(null);
						setLocationError("Location not found");
					}
					setGeocoding(false);
				})
				.catch(() => {
					setLocationCoords(null);
					setLocationError("Failed to geocode address");
					setGeocoding(false);
				});
		}
	}

	const tagsArr = allTags ?? [];
	const selectedSet = new Set(selectedTags);

	return (
		<div className="h-full w-full bg-slate-950 flex flex-col">
			<div className="flex flex-row items-center text-center shrink-0">
				<Tab
					isActive={activeTab === "browse"}
					name="Browse"
					onClick={() => setActiveTab("browse")}
				/>
				<div className="w-0.5 h-[2em] bg-white/40 shrink-0" />
				<div
					className={`flex-1 flex items-center justify-center gap-2 font-semibold px-2 py-4 text-foreground rounded-md text-center cursor-pointer ${
						activeTab !== "search" ? "opacity-50" : ""
					}`}
					onClick={() => setActiveTab("search")}
				>
					<span>Search</span>
					<DropdownMenu>
						<DropdownMenuTrigger
							className="cursor-pointer"
							onClick={(e) => e.stopPropagation()}
						>
							<Settings className="h-5 w-5" />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64 p-2">
							<DropdownMenuLabel className="font-bold">
								Search filters
							</DropdownMenuLabel>

							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="cursor-default flex flex-col items-start gap-2"
							>
								<div className="flex items-center justify-between gap-2 w-full">
									<Label htmlFor="search-age-range">Age</Label>
									<span className="text-muted-foreground text-sm">
										{ageRange[0]} - {ageRange[1]}
									</span>
								</div>
								<Slider
									id="search-age-range"
									value={ageRange}
									onValueChange={setAgeRange}
									min={3}
									max={21}
									step={1}
									className="w-full"
								/>
							</DropdownMenuItem>

							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="cursor-default flex flex-col items-start gap-2"
							>
								<div className="flex items-center justify-between gap-2 w-full">
									<Label htmlFor="search-fame-range">Fame</Label>
									<span className="text-muted-foreground text-sm">
										{fameRange[0]} - {fameRange[1]}
									</span>
								</div>
								<Slider
									id="search-fame-range"
									value={fameRange}
									onValueChange={setFameRange}
									min={-100}
									max={100}
									step={1}
									className="w-full"
								/>
							</DropdownMenuItem>

							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="cursor-default flex flex-col items-start gap-2"
							>
								<Label htmlFor="search-location">Location</Label>
								<Input
									id="search-location"
									type="text"
									value={locationText}
									onChange={(e) => handleLocationChange(e.target.value)}
									onKeyDown={handleLocationKeyDown}
									placeholder={geocoding ? "Locating..." : "Enter a city or address"}
									disabled={geocoding}
								/>
								{locationError && (
									<p className="text-sm text-destructive">{locationError}</p>
								)}
							</DropdownMenuItem>

							{tagsArr.length > 0 && (
								<DropdownMenuItem
									onSelect={(e) => e.preventDefault()}
									className="cursor-default flex flex-col items-start gap-2"
								>
									<Label>Tags</Label>
									<div className="flex flex-wrap gap-1.5">
										{tagsArr.map((tag) => {
											const selected = selectedSet.has(tag);
											return (
												<button
													key={tag}
													type="button"
													onClick={() => handleTagToggle(tag)}
													className={cn(
														"rounded-full border px-2.5 py-0.5 text-xs transition-colors cursor-pointer",
														selected
															? "border-primary bg-primary text-primary-foreground"
															: "border-input bg-transparent text-foreground hover:bg-muted",
													)}
												>
													{selected ? `${tag} \u2715` : tag}
												</button>
											);
										})}
									</div>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="flex-1 min-h-0 p-2">
				{activeTab === "browse" ? (
					<BrowseContent />
				) : (
					<SearchContent searchParams={searchParams} />
				)}
			</div>
		</div>
	);
}
