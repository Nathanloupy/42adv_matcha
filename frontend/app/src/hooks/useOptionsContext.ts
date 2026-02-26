import { useContext } from "react";
import { OptionsContext } from "@/contexts/options-context";

export function useOptionsContext() {
	const context = useContext(OptionsContext);
	if (!context) {
		throw new Error("useOptionsContext must be used within an OptionsProvider");
	}
	return context;
}
