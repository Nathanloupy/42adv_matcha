import { useParams } from "react-router-dom";

export default function Conversation() {
	const { id } = useParams();

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<h2 className="text-2xl font-bold text-white">
				Conversation #{id}
			</h2>
		</div>
	);
}
