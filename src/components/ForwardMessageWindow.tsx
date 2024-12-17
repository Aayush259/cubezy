"use client";
import { IoClose, IoSend } from "react-icons/io5";
import { useChatContext } from "../contexts/ChatContext";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import DP from "../reusables/DP";

export default function ForwardMessageWindow() {

    const { user } = useSelector((state: RootState) => state.user);
    const { forwardMessageWindowVisible, closeForwardMessageWindow, forwardToReceiverIds, addForwardToReceiverId, removeForwardToReceiverId, forwardMessages } = useChatContext();

    if (!forwardMessageWindowVisible) return null;

    return (
        <div className="fixed w-screen min-h-screen top-0 left-0 z-[999] flex items-center justify-center bg-black/50">
            <button className="absolute top-4 right-4 lg:hover:opacity-80 duration-300" onClick={closeForwardMessageWindow}>
                <IoClose size={30} className="text-white" />
            </button>

            <div className="max-w-[90vw] h-[600px] w-[600px] max-h-[95vh] bg-black border border-gray-800 rounded-xl mx-auto overflow-hidden">
                <div className="w-full h-[85%] flex flex-col overflow-y-auto">
                    {
                        user?.connections.map(connection => (
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
