import { Link } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import signOutIcon from "@assets/sign-out.svg";
import { useSignOut } from "@/hooks/useAuth";
import { Settings } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
	{ value: "age", label: "Age" },
	{ value: "distance", label: "Distance" },
	{ value: "fame", label: "Fame" },
	{ value: "tags", label: "Common tags" },
];

export default function Header() {
	const { isAuthenticated, isAuthLoading } = useAuthContext();
	const { signOut } = useSignOut();
	const [ageRange, setAgeRange] = useState([3, 21]);
	const [fameRatingRange, setFameRatingRange] = useState([-50, 50]);
	const [distance, setDistance] = useState([30]);
	const [sortBy, setSortBy] = useState("age");

	return (
		<header className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between font-jaini border-b border-border">
			<Link to="/">
				<h1 className="text-3xl font-bold">Matcha(t)</h1>
			</Link>
			<div className="flex items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger
						className={`cursor-pointer ${!isAuthLoading && isAuthenticated ? "" : "invisible"}`}
					>
						<Settings className="h-7 w-7" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56 p-2">
						<DropdownMenuLabel className="font-bold">
							Settings
						</DropdownMenuLabel>

						{/* Sort selector */}
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="cursor-default flex flex-col items-start gap-2"
						>
							<Label>Sort by</Label>
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Sort by..." />
								</SelectTrigger>
								<SelectContent>
									{SORT_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</DropdownMenuItem>

						{/* Age range */}
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="cursor-default flex flex-col items-start gap-2"
						>
							<div className="flex items-center justify-between gap-2">
								<Label htmlFor="slider-age-range">
									Age filter
								</Label>
								<span className="text-muted-foreground text-sm">
									{ageRange.join(", ")}
								</span>
							</div>
							<Slider
								id="slider-age-range"
								value={ageRange}
								onValueChange={setAgeRange}
								min={3}
								max={21}
								step={1}
								className="w-full"
							/>
						</DropdownMenuItem>

						{/* Fame rating range */}
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="cursor-default flex flex-col items-start gap-2"
						>
							<div className="flex items-center justify-between gap-2">
								<Label htmlFor="slider-fame-rating-range">
									Fame rating filter
								</Label>
								<span className="text-muted-foreground text-sm">
									{fameRatingRange.join(", ")}
								</span>
							</div>
							<Slider
								id="slider-fame-rating-range"
								value={fameRatingRange}
								onValueChange={setFameRatingRange}
								min={-100}
								max={100}
								step={1}
								className="w-full"
							/>
						</DropdownMenuItem>

						{/* Distance */}
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="cursor-default flex flex-col items-start gap-2"
						>
							<div className="flex items-center justify-between gap-2">
								<Label htmlFor="slider-distance">
									Distance filter
								</Label>
								<span className="text-muted-foreground text-sm">
									{`<${distance}km`}
								</span>
							</div>
							<Slider
								id="slider-distance"
								value={distance}
								onValueChange={setDistance}
								min={1}
								max={200}
								step={1}
								className="w-full"
							/>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<button
					type="button"
					onClick={signOut}
					className={`cursor-pointer ${!isAuthLoading && isAuthenticated ? "" : "invisible"}`}
				>
					<img src={signOutIcon} className="h-9" alt="Sign Out" />
				</button>
			</div>
		</header>
	);
}
