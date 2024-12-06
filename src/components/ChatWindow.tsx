"use client";
import { useSelector } from "react-redux";
import { useChatContext } from "../contexts/ChatContext";
import { RootState } from "../store/store";
import { IoSend } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "../funcs/funcs";
import Image from "next/image";
import { useProfileContext } from "../contexts/ProfileContext";

const ChatWindow: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);

    const { receiverId, chats, loadingChats, sendMessage } = useChatContext();
    const { openProfile } = useProfileContext();

    const [message, setMessage] = useState<string>("");

    const receiver = user?.connections.find((connection) => connection._id === receiverId);

    const chatScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chats]);

    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    };

    if (!receiverId) return (
        <div className="w-full h-full flex items-center justify-center relative z-20 text-2xl font-semibold">
            Welcome Back
        </div>
    );

    return (
        <div className="w-full h-full z-20 relative">
            <button className="absolute top-0 left-0 w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 duration-300 border-b border-gray-800 text-xl" onClick={() => openProfile(receiverId)}>
                <span className="items-center gap-4 flex">
                    {receiver?.dp ? (
                        <span className="w-[40px] h-[40px] rounded-full overflow-hidden">
                        <Image
                            src={receiver.dp}
                            alt={receiver.name}
                            width={40}
                            height={40}
                            className="rounded-full h-full w-full object-cover object-top"
                        />
                        </span>
                    ) : (
                        <span className="h-[40px] w-[40px] flex items-center justify-center bg-blue-700 text-white text-xl rounded-full overflow-hidden">
                            {receiver?.name[0]}
                        </span>
                    )}
                    {receiver?.name}
                </span>
            </button>

            {
                loadingChats ? (
                    <>Loading...</>
                ) : (
                    <div className="h-[88%] md:px-32 pt-10 pb-4 overflow-y-auto scroll-smooth grid [place-items:end]" ref={chatScrollRef}>
                        <div className="h-fit pt-40 flex flex-col justify-end gap-1 w-full">
                            {
                                chats?.map(chat => (
                                    <div key={chat._id} className={`flex items-end md:max-w-[350px] max-w-[90%] py-1 px-2 rounded-lg w-fit text-xl relative ${chat.senderId === user?._id ? "self-end bg-blue-700" : "self-start bg-slate-800"}`}>
                                        {chat.message}

                                        <div className="flex items-center justify-end gap-1 text-sm text-white whitespace-nowrap pl-4">
                                            <p className="text-[10px] leading-none">
                                                {
                                                    formatDate(chat.sentAt)
                                                }
                                            </p>

                                            {
                                                chat.isRead && user?._id === chat.senderId && (
                                                    <IoCheckmarkDone className="text-green-300" />
                                                )
                                            }

                                            {
                                                chat.status === "sending" ? (
                                                    <GoClock className="text-white" />
                                                )
                                                    : !chat.isRead && user?._id === chat.senderId && (
                                                        <IoMdCheckmark className="text-white" />
                                                    )
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            }

            <form className="w-full absolute bottom-8 left-0 flex items-center justify-center gap-3" onSubmit={handleMessageSubmit}>
                <input
                    type="text"
                    value={message}
                    placeholder="Message"
                    className={`w-[95%] md:w-[70%] px-4 py-2 bg-gray-800 focus:outline-none rounded-full`}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    type="submit"
                    className={`p-2 w-fit bg-blue-700 rounded-full block duration-300 hover:opacity-70`}
                >
                    <IoSend size={24} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
