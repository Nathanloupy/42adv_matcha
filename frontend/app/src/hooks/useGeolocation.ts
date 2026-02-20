const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
	const response = await fetch("http://ip-api.com/json/?fields=lat,lon,status");
	if (!response.ok) throw new Error("IP geolocation request failed");
	const data = await response.json();
	if (data.status !== "success") throw new Error("IP geolocation failed");
	return { lat: data.lat, lng: data.lon };
}

export async function reverseGeocode(
	lat: number,
	lng: number,
): Promise<string> {
	const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
	const response = await fetch(url, {
		headers: { "Accept-Language": "en" },
	});

	if (!response.ok) {
		return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
	}

	const data = await response.json();
	const address = data.address;

	if (address) {
		const city =
			address.city || address.town || address.village || address.municipality;
		const country = address.country;
		if (city && country) return `${city}, ${country}`;
		if (city) return city;
		if (country) return country;
	}

	if (data.display_name) {
		return data.display_name;
	}

	return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export async function geocodeAddress(
	query: string,
): Promise<{ lat: number; lng: number; displayName: string } | null> {
	const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
	const response = await fetch(url, {
		headers: { "Accept-Language": "en" },
	});

	if (!response.ok) return null;

	const results = await response.json();
	if (!results.length) return null;

	const result = results[0];
	const address = result.address;
	let displayName = result.display_name;

	if (address) {
		const city =
			address.city || address.town || address.village || address.municipality;
		const country = address.country;
		if (city && country) displayName = `${city}, ${country}`;
		else if (city) displayName = city;
	}

	return {
		lat: parseFloat(result.lat),
		lng: parseFloat(result.lon),
		displayName,
	};
}
