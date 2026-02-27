import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { geocodeAddress } from "@/services/geolocation";
import type { BrowseQueryParams, SearchParams } from "@/services/api";
import { OptionsContext } from "@/contexts/options-context";
import type { BrowseTab, SortField, SortDirection } from "@/contexts/options-context";
import {
	AGE_MIN,
	AGE_MAX,
	FAME_MIN,
	FAME_MAX,
	DEFAULT_MAX_DISTANCE,
	DEFAULT_MIN_TAGS,
} from "@/lib/constants";

const defaultBrowseParams: BrowseQueryParams = {
	ageMin: AGE_MIN,
	ageMax: AGE_MAX,
	fameMin: FAME_MIN,
	fameMax: FAME_MAX,
};

const defaultSearchParams: SearchParams = {
	...defaultBrowseParams,
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
	ageRange: [AGE_MIN, AGE_MAX],
	fameRange: [FAME_MIN, FAME_MAX],
	maxDistance: DEFAULT_MAX_DISTANCE,
	minTags: DEFAULT_MIN_TAGS,
	locationText: "",
	selectedTags: [],
};

export function OptionsProvider({ children }: { children: ReactNode }) {
	const [activeTab, setActiveTab] = useState<BrowseTab>("browse");
	const [sortField, setSortField] = useState<SortField>("none");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
	const [ageRange, setAgeRange] = useState([AGE_MIN, AGE_MAX]);
	const [fameRange, setFameRange] = useState([FAME_MIN, FAME_MAX]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [locationText, setLocationText] = useState("");
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [maxDistance, setMaxDistance] = useState(DEFAULT_MAX_DISTANCE);
	const [minTags, setMinTags] = useState(DEFAULT_MIN_TAGS);

	// Committed snapshots — only updated when the user clicks "Apply options"
	const [browseParams, setBrowseParams] =
		useState<BrowseQueryParams>(defaultBrowseParams);
	const [searchParams, setSearchParams] =
		useState<SearchParams>(defaultSearchParams);
	const [committed, setCommitted] =
		useState<CommittedState>(defaultCommitted);

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

		const rangeParams: BrowseQueryParams = {
			ageMin: ageRange[0],
			ageMax: ageRange[1],
			fameMin: fameRange[0],
			fameMax: fameRange[1],
		};

		setBrowseParams(rangeParams);
		setSearchParams({
			...rangeParams,
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

				// Draft state
				sortField,
				sortDirection,
				setSortField,
				toggleSortDirection,
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

				// Committed state
				browseParams,
				searchParams,
				committedSort: {
					field: committed.sortField,
					direction: committed.sortDirection,
				},
				committedMaxDistance: committed.maxDistance,
				committedMinTags: committed.minTags,

				applyOptions,
				hasChanges,
			}}
		>
			{children}
		</OptionsContext.Provider>
	);
}
