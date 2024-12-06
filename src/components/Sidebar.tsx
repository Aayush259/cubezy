"use client";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { IoIosArrowForward } from "react-icons/io";
import { FaUser } from "react-icons/fa6";
import { useIdBarContext } from "../contexts/IdBarContext";
import { useChatContext } from "../contexts/ChatContext";
import { formatDate, getRandomEmoji } from "../funcs/funcs";
import { useProfileContext } from "../contexts/ProfileContext";
import Image from "next/image";

export default function Sidebar() {

    const { user } = useSelector((state: RootState) => state.user);

    const { setIdBarOpen } = useIdBarContext();
    const { receiverId, setReceiverId, lastMessages } = useChatContext();
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

    return (
        <div className="pb-4 h-full w-full max-w-[450px] border-r-2 border-gray-800">

            <div className="h-24 text-2xl flex items-center justify-between border-b-2 border-gray-800 px-4">
                <p className="font-semibold">
                    {greeting}{", "}{user?.name.split(" ")[0]}{" "}{randomEmoji}
                </p>

                <button
                    className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-gray-800 flex items-end"
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

            <div className="h-full pb-28 overflow-y-auto">
                {
                    user?.connections.map(connection => {
                        const lastMessage = lastMessages.find(message => message.chatId === connection.chatId)?.lastMessage;

                        return (
                            <button
                                key={connection._id}
                                className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 duration-300 border-b border-gray-800 text-xl ${connection._id === receiverId ? "bg-slate-900" : "bg-transparent"}`}
                                onClick={() => {
                                    setReceiverId(connection._id);
                                    closeProfile();
                                }}
                            >
                                <span className="flex items-center gap-4 flex-grow pr-7">
                                    {
                                        connection.dp ? (
                                            <Image
                                                src={connection.dp}
                                                alt={connection.name}
                                                width={50}
                                                height={50}
                                                className="rounded-full object-cover object-top"
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center h-[50px] w-[50px] bg-blue-700 text-white text-2xl rounded-full overflow-hidden">
                                                {connection.name[0]}
                                            </span>
                                        )
                                    }


                                    <span className="flex flex-col flex-grow justify-between items-start gap-[3px]">
                                        <span className="block">{connection.name}</span>
                                        <span className={`text-sm flex items-center justify-between w-full whitespace-nowrap ${lastMessage && !lastMessage.isRead && lastMessage.senderId !== user._id ? "font-bold" : "opacity-70"}`}>
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
                                        lastMessage && !lastMessage.isRead && lastMessage.senderId !== user._id && (
                                            <span className="block h-4 w-4 rounded-full bg-blue-500" />
                                        )
                                    }
                                    <IoIosArrowForward size={20} />
                                </span>
                            </button>
                        )
                    })}

                {
                    user?.connections.length === 0 && (
                        <div className="text-center text-xl w-full h-full flex items-center justify-center text-white/70">
                            <button onClick={() => setIdBarOpen(true)} className="hover:text-white duration-300">
                                {"Add your first friend " + getRandomEmoji()}
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};
