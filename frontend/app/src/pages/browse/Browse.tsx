import { useOptionsContext } from "@/hooks/useOptionsContext";
import Tab from "@/components/Tab";
import { ProfileListContent } from "./components/profile-list-content";

export default function Browse() {
	const { activeTab, setActiveTab } = useOptionsContext();

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
				<ProfileListContent mode={activeTab} />
			</div>
		</div>
	);
}
