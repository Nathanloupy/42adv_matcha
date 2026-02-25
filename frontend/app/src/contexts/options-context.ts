import { createContext } from "react";
import type { SearchParams } from "@/services/api";

export interface OptionsContextType {
	searchParams: SearchParams;
	ageRange: number[];
	setAgeRange: (value: number[]) => void;
	fameRange: number[];
	setFameRange: (value: number[]) => void;
	selectedTags: string[];
	handleTagToggle: (tag: string) => void;
	locationText: string;
	handleLocationChange: (value: string) => void;
	handleLocationKeyDown: (e: React.KeyboardEvent) => void;
	locationError: string;
	isGeocoding: boolean;
}

export const OptionsContext = createContext<OptionsContextType | null>(null);
