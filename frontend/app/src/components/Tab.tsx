type TabProps = {
	isActive: boolean;
	name: string;
	onClick: () => void;
};

export default function Tab({ isActive, name, onClick }: TabProps) {
	return (
		<div
			className={`flex-1 font-semibold px-2 py-4 text-foreground rounded-md text-center cursor-pointer ${
				!isActive ? "opacity-50" : ""
			}`}
			onClick={onClick}
		>
			{name}
		</div>
	);
}
