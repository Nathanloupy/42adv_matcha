import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useOptionsContext } from "@/hooks/useOptionsContext";
import { fetchAllTags } from "@/services/api";
import { cn } from "@/lib/utils";
import optionsIcon from "@/assets/options.svg";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import signOutIcon from "@/assets/sign-out.svg";
import { useSignOut } from "@/hooks/useAuth";

export default function Header() {
	const { isAuthenticated, isAuthLoading } = useAuthContext();
	const { signOut } = useSignOut();
	const location = useLocation();
	const isFirstPage = location.pathname === "/";

	return (
		<header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini border-b border-border">
			<Link to="/">
				<h1 className="text-3xl font-bold">Matcha(t)</h1>
			</Link>
			<div className="flex items-center gap-3">
				{isFirstPage && !isAuthLoading && isAuthenticated && (
					<OptionsDropdown />
				)}
				<button
					type="button"
					onClick={signOut}
					className={cn(
						"cursor-pointer",
						!isAuthLoading && isAuthenticated ? "" : "invisible",
					)}
				>
					<img src={signOutIcon} className="h-9" alt="Sign Out" />
				</button>
			</div>
		</header>
	);
}

function OptionsDropdown() {
	const {
		sortField,
		sortDirection,
		setSortField,
		toggleSortDirection,
		ageRange,
		setAgeRange,
		fameRange,
		setFameRange,
		maxDistance,
		setMaxDistance,
		minTags,
		setMinTags,
		selectedTags,
		handleTagToggle,
		locationText,
		handleLocationChange,
		handleLocationKeyDown,
		locationError,
		isGeocoding,
	} = useOptionsContext();

	const { data: allTags } = useQuery({
		queryKey: ["tags", "all"],
		queryFn: fetchAllTags,
	});

	const tagsArr = allTags ?? [];
	const selectedSet = new Set(selectedTags);
	console.log({ minTags });
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="cursor-pointer">
				<img src={optionsIcon} className="h-8 w-8" alt="Options" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-64 p-2"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<DropdownMenuLabel className="font-bold">
					Sort by
				</DropdownMenuLabel>

				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<div className="flex items-center gap-2 w-full">
						<Select
							value={sortField}
							onValueChange={(v) =>
								setSortField(
									v as
										| "none"
										| "age"
										| "distance"
										| "fame"
										| "tags",
								)
							}
						>
							<SelectTrigger className="flex-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None</SelectItem>
								<SelectItem value="age">Age</SelectItem>
								<SelectItem value="distance">
									Distance
								</SelectItem>
								<SelectItem value="fame">
									Fame rating
								</SelectItem>
								<SelectItem value="tags">
									Common tags
								</SelectItem>
							</SelectContent>
						</Select>
						{sortField !== "none" && (
							<button
								type="button"
								onClick={toggleSortDirection}
								className="flex items-center justify-center h-9 w-9 shrink-0 rounded-md border border-input text-sm hover:bg-muted transition-colors cursor-pointer"
								title={
									sortDirection === "asc"
										? "Ascending"
										: "Descending"
								}
							>
								{sortDirection === "asc" ? "↑" : "↓"}
							</button>
						)}
					</div>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuLabel className="font-bold">
					Query filters
				</DropdownMenuLabel>
				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<div className="flex items-center justify-between gap-2 w-full">
						<Label htmlFor="search-age-range">Age</Label>
						<span className="text-muted-foreground text-sm">
							{ageRange[0]} - {ageRange[1]}
						</span>
					</div>
					<Slider
						id="search-age-range"
						value={ageRange}
						onValueChange={setAgeRange}
						min={3}
						max={21}
						step={1}
						className="w-full"
					/>
				</DropdownMenuItem>

				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<div className="flex items-center justify-between gap-2 w-full">
						<Label htmlFor="search-fame-range">Fame</Label>
						<span className="text-muted-foreground text-sm">
							{fameRange[0]} - {fameRange[1]}
						</span>
					</div>
					<Slider
						id="search-fame-range"
						value={fameRange}
						onValueChange={setFameRange}
						min={-1000}
						max={1000}
						step={1}
						className="w-full"
					/>
				</DropdownMenuItem>

				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<div className="flex items-center justify-between gap-2 w-full">
						<Label htmlFor="search-max-distance">Distance</Label>
						<span className="text-muted-foreground text-sm">
							{`<${maxDistance}km`}
						</span>
					</div>
					<Slider
						id="search-max-distance"
						value={[maxDistance]}
						onValueChange={(v) => setMaxDistance(v[0])}
						min={1}
						max={500}
						step={1}
						className="w-full"
					/>
				</DropdownMenuItem>

				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<Label htmlFor="search-location">Location</Label>
					<Input
						id="search-location"
						type="text"
						value={locationText}
						onChange={(e) => handleLocationChange(e.target.value)}
						onKeyDown={handleLocationKeyDown}
						placeholder={
							isGeocoding
								? "Locating..."
								: "Enter a city or address"
						}
						disabled={isGeocoding}
					/>
					{locationError && (
						<p className="text-sm text-destructive">
							{locationError}
						</p>
					)}
				</DropdownMenuItem>

				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-default flex flex-col items-start gap-2"
				>
					<div className="flex items-center justify-between gap-2 w-full">
						<Label htmlFor="search-min-tags">Common tags</Label>
						<span className="text-muted-foreground text-sm">
							{`>${minTags}`}
						</span>
					</div>

					<Slider
						id="search-min-tags"
						dir="rtl"
						value={[10 - minTags]}
						onValueChange={(v) => setMinTags(10 - v[0])}
						min={0}
						max={10}
						step={1}
						className="w-full"
					/>
				</DropdownMenuItem>
				{tagsArr.length > 0 && (
					<DropdownMenuItem
						onSelect={(e) => e.preventDefault()}
						className="cursor-default flex flex-col items-start gap-2"
					>
						<Label>Tags</Label>
						<div className="flex flex-wrap gap-1.5">
							{tagsArr.map((tag) => {
								const selected = selectedSet.has(tag);
								return (
									<button
										key={tag}
										type="button"
										onClick={() => handleTagToggle(tag)}
										className={cn(
											"rounded-full border px-2.5 py-0.5 text-xs transition-colors cursor-pointer",
											selected
												? "border-primary bg-primary text-primary-foreground"
												: "border-input bg-transparent text-foreground hover:bg-muted",
										)}
									>
										{selected ? `${tag} \u2715` : tag}
									</button>
								);
							})}
						</div>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
