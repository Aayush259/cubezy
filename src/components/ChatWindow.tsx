"use client";
import { useSelector } from "react-redux";
import { useChatContext } from "../contexts/ChatContext";
import { RootState } from "../store/store";
import { IoSend } from "react-icons/io5";
import { IoCheckmarkDone, IoClose } from "react-icons/io5";
import { IoMdCheckmark, IoIosArrowBack, IoMdShareAlt } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { compareDates, copyToClipboard, formatDate } from "../../utils/funcs/funcs";
import Image from "next/image";
import { useProfileContext } from "../contexts/ProfileContext";
import Loader from "./Loader";
import { IChatMessage } from "@/utils/interfaces/interfaces";

const ChatWindow: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);

    const { receiverId, updateReceiverId, chats, loadingChats, sendMessage, onlineConnections, selectedMessages, addSelectedMessage, removeSelectedMessage, clearSelectedMessages, deleteMessage, openForwardMessageWindow } = useChatContext();
    const { openProfile } = useProfileContext();

    const [message, setMessage] = useState<string>("");

    const receiver = user?.connections.find((connection) => connection._id === receiverId);

    const chatScrollRef = useRef<HTMLDivElement | null>(null);

    const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);      // Used to handle long press on messages.
    const [longPressActive, setLongPressActive] = useState<boolean>(false);     // Used to handle long press on messages.

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chats]);

    // Handle message submit.
    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    };

    // Handle long press on messages.
    const handleLongPressMessage = (message: IChatMessage) => {
        // If any message is already selected, don't do anything.
        if (selectedMessages.length > 0) return;

        // Add the message to selected messages and set long press active.
        const longPressTimeout = setTimeout(() => {
            addSelectedMessage(message);
            setLongPressActive(true);
        }, 500);

        setLongPressTimeout(longPressTimeout);
    };

    // Handle long press on messages end.
    const handleLongPressMessageEnd = () => {
        if (longPressTimeout) {
            // Clear the timeout and set long press active to false.
            clearTimeout(longPressTimeout);
            setLongPressTimeout(null);
        }
        setTimeout(() => setLongPressActive(false), 100);
    };

    // Handle message click.
    const handleMessageClick = (message: IChatMessage) => {
        // If no messages are selected or long press is active, don't do anything.
        if (selectedMessages.length === 0 || longPressActive) return;

        const isMessageSelected = selectedMessages.filter(selectedMessage => selectedMessage._id === message._id).length > 0;

        // If message is already selected, remove it from selected messages, else add it to selected messages.
        if (isMessageSelected) {
            removeSelectedMessage(message._id);
        } else {
            addSelectedMessage(message);
        }
    };

    // Function to copy messages.
    const copyMessages = () => {
        if (selectedMessages.length === 0) return;

        const messages = selectedMessages.map(selectedMessage => selectedMessage.message);
        copyToClipboard(messages.join("\n"));

        // Clear selected messages.
        clearSelectedMessages();
    };

    if (!receiverId) return (
        <div className="w-full h-full hidden lg:flex lg:flex-col items-center justify-center gap-6 relative z-20 text-xl font-[200]">
            <Image
                src="/images/group.webp"
                alt="Start a new chat"
                width={889}
                height={787}
                className="w-[80%] max-w-[400px] h-auto"
            />

            <p className="text-center">Welcome Back</p>
        </div>
    );

    return (
        <div className={`w-screen h-screen lg:w-full z-20 fixed top-0 left-0 lg:relative bg-[#0A0A0A] lg:bg-none`}>
            <div className="h-[85%] w-full overflow-y-auto scroll-smooth flex flex-col" ref={chatScrollRef}>
                <div className="sticky top-0 left-0 z-10 w-full lg:px-6 lg:py-4 flex items-center justify-between bg-[#0A0A0A] lg:hover:bg-gray-900 duration-300 border-b border-gray-800 text-xl">
                    {
                        selectedMessages.length > 0 && (
                            <div className="w-full h-full flex items-center justify-between px-2 lg:px-6 gap-2 absolute top-0 left-0 bg-[#0A0A0A] z-10">
                                <p className="flex items-center gap-2">
                                    <button onClick={clearSelectedMessages}>
                                        <IoClose size={30} />
                                    </button>

                                    {selectedMessages.length + " Selected"}
                                </p>

                                <div className="flex items-center gap-4 ml-auto justify-self-end">
                                    <button onClick={deleteMessage}>
                                        <MdDelete size={22} />
                                    </button>

                                    <button onClick={copyMessages}>
                                        <MdContentCopy size={20} />
                                    </button>

                                    <button onClick={openForwardMessageWindow}>
                                        <IoMdShareAlt size={22} />
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    <button
                        className="lg:hidden rounded-full outline-none mx-4"
                        onClick={() => updateReceiverId(null)}
                    >
                        <IoIosArrowBack size={24} />
                    </button>

                    <button className="items-center py-4 px-6 lg:px-0 lg:py-0 gap-4 flex-grow flex flex-row-reverse lg:flex-row" onClick={() => openProfile(receiverId)}>
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
                                {receiver?.name[0].split(" ")[0]}
                            </span>
                        )}

                        <span className="flex flex-col lg:gap-1">
                            <span>
                                {receiver?.name}
                            </span>

                            {
                                onlineConnections.includes(receiverId) && (
                                    <span className="text-xs flex items-center gap-2 animate-heightActive">
                                        <span className="h-2 w-2 bg-green-500 rounded-full block" />
                                        {" Online"}
                                    </span>
                                )
                            }
                        </span>
                    </button>
                </div>

                {
                    loadingChats ? (
                        <Loader />
                    ) : (
                        <div className="flex-grow h-fit pt-2 px-4 lg:px-32 flex flex-col justify-end gap-1.5 w-full">
                            {
                                chats?.map((chat, index) => {

                                    const isMessageSelected = selectedMessages.filter(selectedMessage => selectedMessage._id === chat._id).length > 0;

                                    const comparedDate = compareDates(chats[index - 1]?.sentAt, chat.sentAt);

                                    return (
                                        <div key={chat._id} className={`w-full relative duration-300 ${selectedMessages.length > 0 ? "pl-8" : "pl-0"}`}>
                                            {
                                                comparedDate && (
                                                    <div key={chat._id} className="gap-2 w-fit mx-auto text-sm my-1 px-4 py-1 rounded-full bg-slate-800">
                                                        {comparedDate}
                                                    </div>
                                                )
                                            }

                                            {
                                                selectedMessages.length > 0 && <button
                                                    className={`absolute flex items-center justify-center outline-none bottom-0 -translate-y-1/4 lg:-translate-y-1/2 left-0 h-5 w-5 rounded-full overflow-hidden border border-white ${isMessageSelected ? "bg-blue-700" : "bg-transparent"}`}
                                                    onClick={() => handleMessageClick(chat)}
                                                >
                                                    {
                                                        isMessageSelected && <FaCheck size={10} />
                                                    }
                                                </button>
                                            }

                                            <div
                                                className="w-full relative"
                                                onClick={() => handleMessageClick(chat)}
                                                onMouseDown={() => handleLongPressMessage(chat)}
                                                onTouchStart={() => handleLongPressMessage(chat)}
                                                onMouseUp={() => handleLongPressMessageEnd()}
                                                onTouchEnd={() => handleLongPressMessageEnd()}
                                            >
                                                {
                                                    isMessageSelected && <div className="w-screen -right-4 lg:-right-32 rounded-md h-full absolute bg-blue-700/20" />
                                                }

                                                <div className={`flex items-end md:max-w-[350px] max-w-[90%] py-1 px-2 rounded-lg w-fit lg:text-xl relative ${chat.senderId === user?._id ? "ml-auto bg-blue-700" : "self-start bg-slate-800"}`}>

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
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>

            {
                !loadingChats && (
                    <form className="w-full h-[15%] flex items-start pt-2 justify-center gap-3" onSubmit={handleMessageSubmit}>
                        <input
                            type="text"
                            value={message}
                            placeholder="Message"
                            className={`w-[80%] lg:w-[70%] px-4 py-2 bg-gray-800 focus:outline-none rounded-full`}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <button
                            type="submit"
                            className={`p-2 w-fit bg-blue-700 rounded-full block duration-300 lg:hover:opacity-70`}
                        >
                            <IoSend size={24} />
                        </button>
                    </form>
                )}
        </div>
    );
};

export default ChatWindow;
