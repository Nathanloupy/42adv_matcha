import { useOptionsContext } from "@/hooks/useOptionsContext";
import Tab from "@/components/Tab";
import { BrowseContent } from "./components/browse-content";
import { SearchContent } from "./components/search-content";

export default function Browse() {
	const { activeTab, setActiveTab, searchParams } = useOptionsContext();

	return (
		<div className="h-full w-full bg-slate-950 flex flex-col">
			<div className="flex flex-row items-center text-center shrink-0">
				<Tab
					isActive={activeTab === "browse"}
					name="Browse"
					onClick={() => setActiveTab("browse")}
				/>
				<div className="w-0.5 h-[2em] bg-white/40 shrink-0" />
				<Tab
					isActive={activeTab === "search"}
					name="Search"
					onClick={() => setActiveTab("search")}
				/>
			</div>
			<div className="flex-1 min-h-0 p-2">
				{activeTab === "browse" ? (
					<BrowseContent />
				) : (
					<SearchContent searchParams={searchParams} />
				)}
			</div>
		</div>
	);
}
