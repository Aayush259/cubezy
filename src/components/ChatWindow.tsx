"use client";
import { useSelector } from "react-redux";
import { useChatContext } from "../contexts/ChatContext";
import { RootState } from "../store/store";
import { IoSend } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { useState } from "react";

const ChatWindow: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);

    const { receiverId, chats, loadingChats, sendMessage } = useChatContext();

    const [message, setMessage] = useState<string>("");

    const receiver = user?.connections.find((connection) => connection._id === receiverId);

    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    }

    if (!receiverId) return (
        <div className="w-full h-full flex items-center justify-center relative z-20 text-2xl font-semibold">
            Welcome Back
        </div>
    );

    const formatDate = (date: Date) => {
        date = new Date(date);

        // Get hours and minutes.
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    return (
        <div className="w-full h-full z-20 relative">
            <button className="w-fit py-[1.3rem] px-8 text-xl text-right absolute top-0 right-0 hover:bg-slate-800 duration-300 rounded-bl-2xl">
                {receiver?.name}
            </button>

            {
                loadingChats ? (
                    <>Loading...</>
                ) : (
                    <div className="h-full md:px-32 pb-24 overflow-y-auto flex flex-col justify-end gap-2">
                        {
                            chats?.map(chat => (
                                <div key={chat._id} className={`md:max-w-[300px] max-w-[90%] pr-16 py-1 px-2 rounded-lg w-fit text-xl relative ${chat.senderId === user?._id ? "self-end bg-blue-700" : "self-start bg-slate-800"}`}>
                                    {chat.message}

                                    <div className="flex items-center gap-1 text-sm text-white bottom-1 right-1 absolute">
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
                    className={`p-2 w-fit bg-orange-700 rounded-full block duration-300 hover:opacity-70`}
                >
                    <IoSend size={24} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
