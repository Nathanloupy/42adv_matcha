type LikesTabProps = {
	isActive: boolean;
	name: string;
	onClick: () => void;
};

export default function LikesTab({ isActive, name, onClick }: LikesTabProps) {
	return (
		<div
			className={`flex-1 font-semibold px-2 py-4 text-foreground rounded-sm text-center cursor-pointer ${
				!isActive
					? "opacity-50 inset-shadow-[0_0_25px_rgba(255,255,255,0.05)]"
					: ""
			}`}
			onClick={onClick}
		>
			{name}
		</div>
	);
}
