import { toast } from "sonner";
import { blockUser, reportUser } from "@/services/api";
import blockSvg from "@/assets/block.svg";
import reportSvg from "@/assets/report.svg";

interface ProfileActionButtonsProps {
	id: number;
	/** Called after a successful block so the parent can navigate away / refresh */
	onBlock?: () => void;
}

export function ProfileActionButtons({ id, onBlock }: ProfileActionButtonsProps) {
	return (
		<>
			<button
				type="button"
				className="absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
				onClick={() => {
					blockUser(id)
						.then(() => {
							toast.success("User blocked");
							onBlock?.();
						})
						.catch((e: unknown) =>
							toast.error(e instanceof Error ? e.message : "Failed to block"),
						);
				}}
				title="Block profile"
			>
				<img src={blockSvg} alt="Block profile" className="w-5 h-5 drop-shadow" />
			</button>
			<button
				type="button"
				className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/55 transition-colors cursor-pointer"
				onClick={() => {
					reportUser(id)
						.then(() => toast.success("User reported"))
						.catch((e: unknown) =>
							toast.error(e instanceof Error ? e.message : "Failed to report"),
						);
				}}
				title="Report profile"
			>
				<img src={reportSvg} alt="Report profile" className="w-5 h-5 drop-shadow" />
			</button>
		</>
	);
}
