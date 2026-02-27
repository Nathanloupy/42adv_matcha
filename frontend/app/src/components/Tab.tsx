import { cn } from "@/lib/utils";

interface TabProps {
	isActive: boolean;
	name: string;
	onClick: () => void;
}

export default function Tab({ isActive, name, onClick }: TabProps) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			className={cn(
				"flex-1 font-semibold px-2 py-4 text-foreground rounded-md text-center cursor-pointer transition-opacity",
				!isActive && "opacity-50",
			)}
			onClick={onClick}
		>
			{name}
		</button>
	);
}
