import { useNavigate } from "react-router-dom";
import type { ConnectedUser } from "@/services/api";

export type ChatProps = ConnectedUser;

export function Chat({ id, firstname, image }: ChatProps) {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			className="w-full flex items-center gap-3 px-4 cursor-pointer shadow-[inset_0_-1px_1px_0_rgba(255,255,255,0.05)] hover:bg-white/5 transition-colors"
			onClick={() => navigate(`/messages/${id}`)}
		>
			<div className="relative shrink-0 py-3">
				{image ? (
					<img
						src={`data:image/jpeg;base64,${image}`}
						alt={firstname}
						className="w-14 h-14 rounded-full object-cover shadow-md/20"
					/>
				) : (
					<div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center">
						<span className="text-white text-lg font-semibold">
							{firstname[0]?.toUpperCase()}
						</span>
					</div>
				)}
			</div>
			<div className="flex flex-1 items-center">
				<span className="font-semibold text-foreground">
					{firstname}
				</span>
			</div>
		</button>
	);
}
