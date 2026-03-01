const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function formatLastConnection(raw: string): string {
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) return raw;

	console.log(Date.now());
	console.log(date.getTime());
	console.log(Date.now() - date.getTime());
	if (Date.now() - date.getTime() < FIVE_MINUTES_MS) {
		return "Currently online";
	}

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
