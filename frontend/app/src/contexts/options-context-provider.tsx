import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { geocodeAddress } from "@/services/geolocation";
import type { SearchParams } from "@/services/api";
import { OptionsContext } from "@/contexts/options-context";

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return debounced;
}

export function OptionsProvider({ children }: { children: ReactNode }) {
	const [ageRange, setAgeRange] = useState([3, 21]);
	const [fameRange, setFameRange] = useState([-100, 100]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [locationText, setLocationText] = useState("");
	const [locationCoords, setLocationCoords] = useState<string | null>(null);
	const [locationError, setLocationError] = useState("");
	const [isGeocoding, setIsGeocoding] = useState(false);
	const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const debouncedAge = useDebounce(ageRange, 300);
	const debouncedFame = useDebounce(fameRange, 300);

	const searchParams: SearchParams = {
		ageMin: debouncedAge[0],
		ageMax: debouncedAge[1],
		fameMin: debouncedFame[0],
		fameMax: debouncedFame[1],
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
			setIsGeocoding(true);
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
				setIsGeocoding(false);
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
		setIsGeocoding(true);
		geocodeAddress(value)
			.then((result) => {
				if (result) {
					setLocationCoords(`${result.lat},${result.lng}`);
					setLocationError("");
				} else {
					setLocationCoords(null);
					setLocationError("Location not found");
				}
				setIsGeocoding(false);
			})
			.catch(() => {
				setLocationCoords(null);
				setLocationError("Failed to geocode address");
				setIsGeocoding(false);
			});
		}
	}

	return (
		<OptionsContext.Provider
			value={{
				searchParams,
				ageRange,
				setAgeRange,
				fameRange,
				setFameRange,
				selectedTags,
				handleTagToggle,
				locationText,
				handleLocationChange,
				handleLocationKeyDown,
				locationError,
				isGeocoding,
			}}
		>
			{children}
		</OptionsContext.Provider>
	);
}
