import type { BrowseProfile } from "@/services/api";
import type { SortField, SortDirection } from "@/contexts/options-context";

interface SortConfig {
	field: SortField;
	direction: SortDirection;
}

interface FilterConfig {
	maxDistance: number;
	minTags: number;
}

export function sortAndFilterProfiles(
	profiles: BrowseProfile[],
	sort: SortConfig,
	filters: FilterConfig,
): BrowseProfile[] {
	let result = profiles.filter(
		(p) => p.distance <= filters.maxDistance && p.tagCount >= filters.minTags,
	);

	if (sort.field !== "none") {
		const dir = sort.direction === "asc" ? 1 : -1;
		result = [...result].sort((a, b) => {
			switch (sort.field) {
				case "age":
					return (a.age - b.age) * dir;
				case "distance":
					return (a.distance - b.distance) * dir;
				case "fame":
					return (a.fame - b.fame) * dir;
				case "tags":
					return (a.tagCount - b.tagCount) * dir;
				default:
					return 0;
			}
		});
	}

	return result;
}
