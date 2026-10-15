'use client'

import {useState, useRef, useEffect, KeyboardEvent} from 'react';
import ReactMarkdown from 'react-markdown';
import { IconCalendarEvent, IconMail, IconRobotFace, IconSend} from '@tabler/icons-react';
import type { ChatEntry, ChatResponseBody } from '@/lib/types';


function getIcon(text:string):typeof IconCalendarEvent{
    if(/calendar|event|schedule/i.test(text)) return IconCalendarEvent;
    if (/event|mail/i.test(text)) return IconMail;

    return IconRobotFace
}

export default function ChatWindow(){
    const[message, setMessage] = useState<string>('');
    const[chatLog, setChatLog] = useState<ChatEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    async function sendMessage():Promise<void>{
        const trimmed = message.trim();
        if(!trimmed || loading) return;

        setChatLog(prev =>[...prev,{role:'user', text:trimmed}]);
        setMessage('')
        setLoading(true)

        try {
            const res = await fetch("/api/assistant", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message:trimmed})
            })

            if (!res.ok) throw new Error('Request failed');
            const data: ChatResponseBody = await res.json();
            setChatLog(prev=>[...prev,{role:'assistant', text:data.reply}])
        }catch (error) {
            console.error(error);
            setChatLog(prev=>[
                ...prev,{role:'assistant', text:'Something went wrong, please try again.'}
            ])
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        chatEndRef.current?.scrollIntoView({behavior:"smooth"});
    }, [chatLog])


    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>):void{
        if(e.key === "Enter"){
            e.preventDefault();
            sendMessage();
        }
    }


    return (
        <div className="w-full max-w-md bg-black rounded-xl border border-neutral-200 p-5 flex
        flex-col h-[560px]">
            <div className='flex items-center gap-2 pb-3 border-b border-neutral-200'>
                <IconRobotFace size={18} className='text-blue-600'/>
                <span className='font-medium text-[15px]'>AI Assistant</span>
            </div>

            <div className='flex-1 overflow-y-auto flex flex-col gap-2.5 py-3'>
                {chatLog.length === 0 && (<p className='text-sm text-neutral-400 text-center mt-10'>
                    Try : &quot;Schedule a standup tomorrow at 10 am&quot;
                </p>)}

                {
                    chatLog.map((entry, i) => {
                        const BubbleIcon = getIcon(entry.text)
                        const isUser = entry.role === "user";

                        return(
                            <div key={i} className={`flex items-center gap-1 px-3 py-2 rounded-lg
                                text-sm max-w-[85%] leading-relaxed ${isUser ? 'self-end bg-blue-50 text-blue-900' :
                                `self-start bg-neutral-100 text-neutral-800`}`}>
                                    {!isUser && <BubbleIcon size={14} className="text-neutral-500
                                    shrink-0"/>}
                                    <div>
                                        {isUser ? entry.text : <ReactMarkdown>{entry.text}</ReactMarkdown>}
                                    </div>
                                </div>
                        )
                    })
                }

                {
                    loading && <div className='self-start px-3 py-2 rounded-lg text-sm
                    bg-neutral-100 text-neutral-400'>
                        Thinking...
                        </div>
                }

                <div ref={chatEndRef}></div>
            </div>

            <div className='flex gap-2 pt-3 border-t border-neutral-200'>
                <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)}
                onKeyDown={handleKeyDown} placeholder='Ask your assistant...' disabled={loading} 
                className='flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm outline-none
                focus:ring-2 focus:ring-blue-200 disabled:opacity-50'/>
                <button onClick={sendMessage} disabled={loading} className='px-3.5 rounded-lg
                border border-neutral-200 bg-white flex items-center justify-center 
                hover:bg-neutral-50 disabled:opacity-50'><IconSend size={16}/></button>
            </div>

        </div>
    )
}