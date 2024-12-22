"use client";
import { IoSend } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useChatContext } from "../contexts/ChatContext";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import DP from "../reusables/DP";
import { useMemo, useState } from "react";
import Search from "../reusables/Search";

export default function ForwardMessageWindow() {

    const { user } = useSelector((state: RootState) => state.user);
    const { forwardMessageWindowVisible, closeForwardMessageWindow, forwardToReceiverIds, addForwardToReceiverId, removeForwardToReceiverId, forwardMessages } = useChatContext();

    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredConnections = useMemo(() => {
        if (searchQuery === "") {
            return user?.connections;
        }

        return user?.connections?.filter(connection => connection.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, user?.connections]);

    if (!forwardMessageWindowVisible) return null;

    return (
        <div className="fixed w-screen min-h-screen top-0 left-0 z-[999] flex items-center justify-center bg-black/50">

            <div className="h-screen w-screen md:max-w-[90vw] md:h-[600px] md:w-[500px] md:max-h-[95vh] bg-black border border-gray-800 rounded-xl mx-auto overflow-hidden">
                <div className="w-full h-[85%] flex flex-col overflow-y-auto">
                    <div className="px-2 py-3 md:px-6 md:py-4 border-b border-gray-800 flex items-center gap-4">
                        <button className="sticky top-0 left-0 lg:hover:opacity-80 duration-300" onClick={closeForwardMessageWindow}>
                            <IoIosArrowRoundBack size={30} className="text-white" />
                        </button>

                        <Search
                            id="search"
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {
                        (!filteredConnections || filteredConnections.length === 0) ? (
                            <div className="w-full py-8 text-center text-neutral-500">
                                No results found
                            </div>
                        ) : filteredConnections.map(connection => (
                            <label key={connection._id} htmlFor={connection._id} className="flex items-center justify-between gap-4 cursor-pointer border-b border-gray-800 px-2 py-4 md:px-6 md:py-6">
                                <div className="flex items-center gap-4">
                                    <DP dp={connection.dp} name={connection.name} />
                                    <p className="text-2xl">{connection.name.split(" ")[0]}</p>
                                </div>

                                <input
                                    type="checkbox"
                                    id={connection._id}
                                    className="appearance-none w-5 h-5 border-2 border-gray-800 rounded-md bg-transparent checked:bg-blue-700 checked:border-blue-700 focus:outline-none before:block before:w-full before:h-full before:rounded-md checked:before:bg-[url('/icons/check.svg')] before:bg-no-repeat before:bg-center before:bg-contain"
                                    checked={forwardToReceiverIds.includes(connection._id)}
                                    onChange={() => {
                                        if (forwardToReceiverIds.includes(connection._id)) {
                                            removeForwardToReceiverId(connection._id);
                                        } else {
                                            addForwardToReceiverId(connection._id);
                                        }
                                    }}
                                />
                            </label>
                        ))
                    }
                </div>

                <div className={`${forwardToReceiverIds.length === 0 ? "h-[0%] opacity-0" : "h-[15%] opacity-100"} duration-200 overflow-hidden px-2 md:px-6 flex items-center justify-between text-xl bg-slate-900`}>
                    {
                        forwardToReceiverIds.length !== 0 && (<>
                            <p>Send</p>

                            <button
                                className={`p-2 w-fit bg-blue-700 rounded-full block duration-300 lg:hover:opacity-70`}
                                onClick={forwardMessages}
                            >
                                <IoSend size={24} />
                            </button>
                        </>)
                    }
                </div>
            </div>
        </div>
    );
};
