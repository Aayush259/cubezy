"use client";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { IoMdAdd } from "react-icons/io";
import { FaUser } from "react-icons/fa6";
import { useIdBarContext } from "../contexts/IdBarContext";
import { useChatContext } from "../contexts/ChatContext";
import { formatDate, getRandomEmoji } from "../../utils/funcs/funcs";
import { useProfileContext } from "../contexts/ProfileContext";
import Image from "next/image";

export default function Sidebar() {

    const { user } = useSelector((state: RootState) => state.user);

    const { setIdBarOpen, idBarOpen } = useIdBarContext();
    const { receiverId, updateReceiverId, lastMessages } = useChatContext();
    const { openProfile, closeProfile } = useProfileContext();

    const [greeting, setGreeting] = useState<string>("");   // Greeting message based on the current time.

    const randomEmoji = useMemo(() => getRandomEmoji(), []);

    useEffect(() => {
        // Function to update the greeting based on the current time.
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                setGreeting("Good morning");
            } else if (currentHour < 18) {
                setGreeting("Good afternoon");
            } else {
                setGreeting("Good evening");
            }
        };

        // Initial greeting.
        updateGreeting();

        // Update greeting every minute.
        const intervalId = setInterval(updateGreeting, 60000);

        // Clean up the interval on component unmount.
        return () => clearInterval(intervalId);
    }, []);

    const sortedConnections = useMemo(() => {
        if (!user || !lastMessages.length) return user?.connections || [];

        return [...user.connections].sort((a, b) => {
            const lastMessageA = lastMessages.find(m => m.chatId === a.chatId)?.lastMessage;
            const lastMessageB = lastMessages.find(m => m.chatId === b.chatId)?.lastMessage;

            const dateA = lastMessageA ? new Date(lastMessageA.sentAt).getTime() : 0;
            const dateB = lastMessageB ? new Date(lastMessageB.sentAt).getTime() : 0;

            // Sort in descending order (newest first) by date.
            return dateB - dateA;
        });
    }, [user, lastMessages]);

    return (
        <div className="pb-4 h-full w-screen lg:max-w-[450px] border-r-2 border-gray-800 relative">

            <div className="h-24 text-xl lg:text-2xl flex items-center justify-between border-b-2 border-gray-800 px-2 lg:px-4">
                <p className="font-semibold">
                    {greeting}{", "}{user?.name.split(" ")[0]}{" "}{randomEmoji}
                </p>

                <button
                    className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] rounded-full overflow-hidden border-2 border-gray-800 flex items-end"
                    onClick={() => {
                        if (user?._id) openProfile(user._id);
                    }}
                >
                    {
                        user?.dp ? (
                            <Image
                                src={user.dp}
                                alt={user.name}
                                width={60}
                                height={60}
                                className="rounded-full object-cover object-top"
                            />
                        ) : <FaUser className="mx-auto h-[75%] w-full text-gray-600" />
                    }
                </button>
            </div>

            <div className="h-full pb-48 overflow-y-auto">
                {
                    sortedConnections.map(connection => {
                        const lastMessage = lastMessages.find(message => message.chatId === connection.chatId)?.lastMessage;

                        return (
                            <button
                                key={connection._id}
                                className={`w-full px-6 py-4 flex items-center justify-between lg:hover:bg-gray-900 duration-300 border-b border-gray-800 text-lg lg:text-xl ${connection._id === receiverId ? "bg-slate-900" : "bg-transparent"}`}
                                onClick={() => {
                                    updateReceiverId(connection._id);
                                    closeProfile();
                                }}
                            >
                                <span className="flex items-center gap-4 flex-grow pr-7">
                                    {
                                        connection.dp ? (
                                            <span className="w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] rounded-full overflow-hidden">
                                                <Image
                                                    src={connection.dp}
                                                    alt={connection.name}
                                                    width={50}
                                                    height={50}
                                                    className="rounded-full w-full h-full object-cover object-top"
                                                />
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center h-[50px] w-[50px] bg-blue-700 text-white text-xl lg:text-2xl rounded-full overflow-hidden">
                                                {connection.name[0]}
                                            </span>
                                        )
                                    }


                                    <span className="flex flex-col flex-grow justify-between items-start gap-[1px] lg:gap-[3px]">
                                        <span className="block">{connection.name}</span>
                                        <span className={`text-sm flex items-center justify-between w-full whitespace-nowrap ${lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?._id ? "font-bold" : "opacity-70"}`}>
                                            <span className="block max-w-[200px] overflow-ellipsis overflow-hidden">
                                                {lastMessage?.message}
                                            </span>

                                            {
                                                lastMessage?.sentAt && <span className="flex-grow text-right text-xs">
                                                    {formatDate(lastMessage.sentAt)}
                                                </span>
                                            }
                                        </span>
                                    </span>
                                </span>

                                <span className="flex items-center gap-2">
                                    {
                                        lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?._id && (
                                            <span className="relative block h-3 w-3 rounded-full bg-blue-500 before:h-3 before:w-3 before:inset-0 before:absolute before:rounded-full before:bg-blue-500 before:animate-ping" />
                                        )
                                    }
                                    {/* <IoIosArrowForward size={20} /> */}
                                </span>
                            </button>
                        )
                    })}

                {
                    user?.connections.length === 0 && (
                        <div className="text-center text-xl w-full h-full flex items-center justify-center text-white/70">
                            <button onClick={() => setIdBarOpen(true)} className="lg:hover:text-white duration-300">
                                {"Add your first friend " + getRandomEmoji()}
                            </button>
                        </div>
                    )
                }
            </div>

            <button className={`w-fit rounded-full absolute bottom-16 right-8 lg:hover:opacity-70 lg:hover:rotate-45 duration-300 z-20 bg-blue-700 flex items-center justify-center p-2.5 ${idBarOpen && "rotate-45"}`} onClick={() => setIdBarOpen(prev => !prev)}>
                <IoMdAdd size={28} />
            </button>
        </div>
    );
};
