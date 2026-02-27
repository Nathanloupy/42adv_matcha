/**
 * Truncates each GPS coordinate to 2 decimal places and joins them with ", ".
 * Example: "48.8566,2.3522" → "48.85, 2.35"
 */
export function formatGps(gps: string): string {
	return gps
		.split(",")
		.map((n) => (Math.trunc(+n * 100) / 100).toFixed(2))
		.join(", ");
}
