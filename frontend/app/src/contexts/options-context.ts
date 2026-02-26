import { createContext } from "react";
import type { SearchParams } from "@/services/api";

export type BrowseTab = "browse" | "search";
export type SortField = "none" | "age" | "distance" | "fame" | "tags";
export type SortDirection = "asc" | "desc";

export interface OptionsContextType {
	activeTab: BrowseTab;
	setActiveTab: (tab: BrowseTab) => void;
	sortField: SortField;
	sortDirection: SortDirection;
	setSortField: (field: SortField) => void;
	toggleSortDirection: () => void;
	searchParams: SearchParams;
	ageRange: number[];
	setAgeRange: (value: number[]) => void;
	fameRange: number[];
	setFameRange: (value: number[]) => void;
	selectedTags: string[];
	handleTagToggle: (tag: string) => void;
	locationText: string;
	handleLocationChange: (value: string) => void;
	isGeocoding: boolean;
	maxDistance: number;
	setMaxDistance: (value: number) => void;
	minTags: number;
	setMinTags: (value: number) => void;
	applyOptions: () => void;
	hasChanges: boolean;
}

export const OptionsContext = createContext<OptionsContextType | null>(null);
