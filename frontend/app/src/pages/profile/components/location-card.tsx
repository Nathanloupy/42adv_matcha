import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	getBrowserLocation,
	reverseGeocode,
	geocodeAddress,
} from "@/hooks/useGeolocation";
import locationPinIcon from "@assets/location-pin.svg";

interface LocationCardProps {
	initialGps: string;
	onUpdateLocation: (gps: string) => void;
	isLoading?: boolean;
}

export function LocationCard({
	initialGps,
	onUpdateLocation,
	isLoading,
}: LocationCardProps) {
	const [gps, setGps] = useState(initialGps);
	const [gpsDisplay, setGpsDisplay] = useState("");
	const [gpsActive, setGpsActive] = useState(false);
	const [gpsLoading, setGpsLoading] = useState(false);
	const [gpsError, setGpsError] = useState("");
	const initRef = useRef(false);

	useEffect(() => {
		if (initRef.current) return;
		if (!initialGps) return;
		initRef.current = true;
		const [latStr, lngStr] = initialGps.split(",");
		const lat = parseFloat(latStr);
		const lng = parseFloat(lngStr);
		if (isNaN(lat) || isNaN(lng)) return;
		setGps(initialGps);
		reverseGeocode(lat, lng).then((name) => setGpsDisplay(name));
	}, [initialGps]);

	async function handleGpsToggle() {
		if (gpsActive) {
			setGpsActive(false);
			return;
		}
		setGpsLoading(true);
		setGpsError("");
		try {
			const coords = await getBrowserLocation();
			const coordStr = `${coords.lat},${coords.lng}`;
			setGps(coordStr);
			const name = await reverseGeocode(coords.lat, coords.lng);
			setGpsDisplay(name);
			setGpsActive(true);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Failed to get location";
			setGpsError(
				`${msg}. You can type a city or address manually instead.`,
			);
		} finally {
			setGpsLoading(false);
		}
	}

	async function handleUpdateLocation() {
		setGpsError("");
		if (gpsActive) {
			if (!gps) {
				setGpsError("No GPS coordinates available");
				return;
			}
			onUpdateLocation(gps);
			return;
		}
		if (!gpsDisplay.trim()) {
			setGpsError("Please enter a city or address");
			return;
		}
		setGpsLoading(true);
		try {
			const result = await geocodeAddress(gpsDisplay.trim());
			if (!result) {
				setGpsError("Could not find that location");
				return;
			}
			const coordStr = `${result.lat},${result.lng}`;
			setGps(coordStr);
			setGpsDisplay(result.displayName);
			onUpdateLocation(coordStr);
		} catch {
			setGpsError("Failed to geocode address");
		} finally {
			setGpsLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Location</CardTitle>
				<CardDescription>
					Use GPS auto-detect or enter your city manually
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<div className="flex items-end gap-2">
						<button
							type="button"
							onClick={handleGpsToggle}
							disabled={gpsLoading}
							className={cn(
								"flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
								gpsActive
									? "border-blue-500 bg-blue-500"
									: "border-input bg-transparent hover:bg-muted",
							)}
							title={
								gpsActive
									? "GPS auto-detect on — click to switch to manual"
									: "Click to auto-detect your location"
							}
						>
							<img
								src={locationPinIcon}
								alt="Location pin"
								className={cn(
									"h-5 w-5",
									gpsActive ? "opacity-100" : "opacity-50",
								)}
							/>
						</button>
						<Field className="flex-1">
							<Input
								id="location"
								type="text"
								value={gpsDisplay}
								onChange={(e) => setGpsDisplay(e.target.value)}
								disabled={gpsActive || gpsLoading}
								placeholder={
									gpsActive
										? "Detected via GPS"
										: "Enter a city or address"
								}
							/>
						</Field>
					</div>
				{gpsError && (
					<p className="text-sm text-destructive">
						{gpsError}
					</p>
				)}
					<Button
						type="button"
						onClick={handleUpdateLocation}
						disabled={
							isLoading ||
							gpsLoading ||
							(!gpsActive && !gpsDisplay.trim())
						}
					>
						{gpsLoading ? "Locating..." : "Update location"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
