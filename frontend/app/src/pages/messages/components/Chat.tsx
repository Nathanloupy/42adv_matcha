interface ChatProps {
  name: string
  id: number
  avatar: string
  userLastMessageSender: boolean
  lastMessage?: string
  time: string
  unread: boolean
}

import { useNavigate } from 'react-router-dom'

export type { ChatProps }

function LastMessageSentArrow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(90)matrix(-1, 0, 0, -1, 0, 0)">
            <path d="M12 19.5L17 14.5M12 19.5L7 14.5M12 19.5C12 19.5 12 11.1667 12 9.5C12 7.83333 11 4.5 7 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default function Chat(props: ChatProps) {
    const { name, id, avatar, userLastMessageSender, lastMessage, time, unread } = props
    const navigate = useNavigate()

    return (
    <div className="flex items-center gap-3 px-4 cursor-pointer shadow-[inset_0_-1px_1px_0_rgba(0,0,0,0.05)]" onClick={() => navigate(`/messages/${id}`)}>
        <div className="relative shrink-0 overflow-visible">
            <img src={avatar} alt={name} className="w-16 h-16 rounded-full object-cover shadow-md/20"/>
            {unread && <>
                <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 rounded-full bg-gradient-to-br from-rose-400 to-rose-800 border border-rose-500"/>
                <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-pulse opactity-75"/>
            </>}
        </div>
        <div className="flex flex-1 items-center gap-3 py-5">
            <div className="flex flex-col">
                <span className="font-semibold text-slate-950 truncate">{name}</span>
                <div className="flex flex-row items-center gap-1">
                    { userLastMessageSender ? (<LastMessageSentArrow className="h-4 text-gray-400"/>) : null }
                    <p className="text-sm text-gray-400 truncate">{lastMessage}</p>
                </div>
            </div>
            <div className="flex flex-row ml-auto">
                <span className="text-xs text-gray-500 shrink-0">{time}</span>
            </div>
        </div>
    </div>
  )
}
