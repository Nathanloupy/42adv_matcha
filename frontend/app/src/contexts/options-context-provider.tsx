import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { geocodeAddress } from "@/services/geolocation";
import type { SearchParams } from "@/services/api";
import { OptionsContext } from "@/contexts/options-context";
import type { BrowseTab, SortField, SortDirection } from "@/contexts/options-context";

const defaultSearchParams: SearchParams = {
	ageMin: 3,
	ageMax: 21,
	fameMin: -1000,
	fameMax: 1000,
	location: null,
	tags: null,
};

interface CommittedState {
	sortField: SortField;
	sortDirection: SortDirection;
	ageRange: number[];
	fameRange: number[];
	maxDistance: number;
	minTags: number;
	locationText: string;
	selectedTags: string[];
}

const defaultCommitted: CommittedState = {
	sortField: "none",
	sortDirection: "asc",
	ageRange: [3, 21],
	fameRange: [-1000, 1000],
	maxDistance: 100,
	minTags: 0,
	locationText: "",
	selectedTags: [],
};

export function OptionsProvider({ children }: { children: ReactNode }) {
	const [activeTab, setActiveTab] = useState<BrowseTab>("browse");
	const [sortField, setSortField] = useState<SortField>("none");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [ageRange, setAgeRange] = useState([3, 21]);
	const [fameRange, setFameRange] = useState([-1000, 1000]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [locationText, setLocationText] = useState("");
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [maxDistance, setMaxDistance] = useState(100);
	const [minTags, setMinTags] = useState(0);

	// searchParams is a committed snapshot — only updated when the user clicks "Apply options"
	const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);
	const [committed, setCommitted] = useState<CommittedState>(defaultCommitted);

	const hasChanges =
		sortField !== committed.sortField ||
		sortDirection !== committed.sortDirection ||
		ageRange[0] !== committed.ageRange[0] ||
		ageRange[1] !== committed.ageRange[1] ||
		fameRange[0] !== committed.fameRange[0] ||
		fameRange[1] !== committed.fameRange[1] ||
		maxDistance !== committed.maxDistance ||
		minTags !== committed.minTags ||
		locationText !== committed.locationText ||
		selectedTags.length !== committed.selectedTags.length ||
		selectedTags.some((t, i) => t !== committed.selectedTags[i]);

	function handleTagToggle(tag: string) {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}

	function toggleSortDirection() {
		setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
	}

	function handleLocationChange(value: string) {
		setLocationText(value);
	}

	async function applyOptions() {
		let resolvedCoords: string | null = null;
		let resolvedDisplayName = locationText.trim();

		const trimmed = locationText.trim();
		if (trimmed) {
			setIsGeocoding(true);
			try {
				const result = await geocodeAddress(trimmed);
				if (result) {
					resolvedCoords = `${result.lat},${result.lng}`;
					resolvedDisplayName = result.displayName;
					setLocationText(result.displayName);
				} else {
					toast.error("Location not found");
					setIsGeocoding(false);
					return;
				}
			} catch {
				toast.error("Failed to geocode address");
				setIsGeocoding(false);
				return;
			}
			setIsGeocoding(false);
		}

		setSearchParams({
			ageMin: ageRange[0],
			ageMax: ageRange[1],
			fameMin: fameRange[0],
			fameMax: fameRange[1],
			location: resolvedCoords,
			tags: selectedTags.length > 0 ? selectedTags : null,
		});
		setCommitted({
			sortField,
			sortDirection,
			ageRange,
			fameRange,
			maxDistance,
			minTags,
			locationText: resolvedDisplayName,
			selectedTags,
		});
	}

	return (
		<OptionsContext.Provider
			value={{
				activeTab,
				setActiveTab,
				sortField,
				sortDirection,
				setSortField,
				toggleSortDirection,
				searchParams,
				ageRange,
				setAgeRange,
				fameRange,
				setFameRange,
				selectedTags,
				handleTagToggle,
			locationText,
			handleLocationChange,
			isGeocoding,
			maxDistance,
			setMaxDistance,
			minTags,
			setMinTags,
			applyOptions,
			hasChanges,
		}}
		>
			{children}
		</OptionsContext.Provider>
	);
}
