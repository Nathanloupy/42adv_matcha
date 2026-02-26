import { Chat, type ChatProps } from "./components/chat";

const mockChats: ChatProps[] = [
	{
		name: "Alice",
		id: 1,
		avatar: "https://i.pravatar.cc/100?u=alice",
		userLastMessageSender: false,
		lastMessage: "Hey, are you free tonight?",
		time: "2m",
		unread: true,
	},
	{
		name: "Bob",
		id: 2,
		avatar: "https://i.pravatar.cc/100?u=bob",
		userLastMessageSender: true,
		lastMessage: "That was a great date!",
		time: "15m",
		unread: false,
	},
	{
		name: "Charlie",
		id: 3,
		avatar: "https://i.pravatar.cc/100?u=charlie",
		userLastMessageSender: false,
		lastMessage: "Nice to meet you :)",
		time: "1h",
		unread: true,
	},
	{
		name: "Diana",
		id: 4,
		avatar: "https://i.pravatar.cc/100?u=diana",
		userLastMessageSender: true,
		lastMessage: "See you tomorrow",
		time: "2h",
		unread: false,
	},
	{
		name: "Emma",
		id: 5,
		avatar: "https://i.pravatar.cc/100?u=emma",
		userLastMessageSender: false,
		lastMessage: "Do you like hiking?",
		time: "3h",
		unread: true,
	},
	{
		name: "Felix",
		id: 6,
		avatar: "https://i.pravatar.cc/100?u=felix",
		userLastMessageSender: true,
		lastMessage: "Haha yeah for sure",
		time: "5h",
		unread: false,
	},
	{
		name: "Grace",
		id: 7,
		avatar: "https://i.pravatar.cc/100?u=grace",
		userLastMessageSender: false,
		lastMessage: "What kind of music do you listen to?",
		time: "1d",
		unread: false,
	},
	{
		name: "Hugo",
		id: 8,
		avatar: "https://i.pravatar.cc/100?u=hugo",
		userLastMessageSender: true,
		lastMessage: "Let me know when you arrive",
		time: "1d",
		unread: false,
	},
	{
		name: "Iris",
		id: 9,
		avatar: "https://i.pravatar.cc/100?u=iris",
		userLastMessageSender: false,
		lastMessage: "Your profile is so cool!",
		time: "2d",
		unread: true,
	},
	{
		name: "Jules",
		id: 10,
		avatar: "https://i.pravatar.cc/100?u=jules",
		userLastMessageSender: true,
		lastMessage: "Thanks for the match!",
		time: "3d",
		unread: false,
	},
];

export default function Messages() {
	return (
		<div className="min-h-screen">
			{mockChats.map((chat) => (
				<Chat key={chat.name} {...chat} />
			))}
		</div>
	);
}
