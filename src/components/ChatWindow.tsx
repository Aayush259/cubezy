import { useSelector } from "react-redux";
import { useChatContext } from "../contexts/ChatContext";
import { RootState } from "../store/store";
import { IoSend } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import { Socket } from "socket.io-client";

const ChatWindow: React.FC<{
    socket: Socket | null
}> = ({ socket }) => {

    const { user } = useSelector((state: RootState) => state.user);

    const { receiverId } = useChatContext();

    const [message, setMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);

    const receiver = user?.connections.find((connection) => connection._id === receiverId);

    const sendMessage = () => {
        if (!socket || !receiverId) return;
        setIsSending(true);

        if (message.trim() === "") return;
        
    };

    if (!receiverId) return (
        <div className="w-full h-full flex items-center justify-center relative z-20 text-2xl font-semibold">
            Welcome Back
        </div>
    );

    return (
        <div className="w-full h-full z-20 relative">
            <button className="w-fit py-[1.3rem] px-8 text-xl text-right absolute top-0 right-0 hover:bg-slate-800 duration-300 rounded-bl-2xl">
                {receiver?.name}
            </button>

            <form className="w-full absolute bottom-8 left-0 flex items-center justify-center gap-3">
                <input
                    type="text"
                    value={message}
                    placeholder="Message"
                    className={`w-[95%] md:w-[70%] px-4 py-2 bg-gray-800 focus:outline-none rounded-full ${isSending ? "opacity-50" : "opacity-100"}`}
                    onChange={(e) => setMessage(e.target.value)}
                    readOnly={isSending}
                />

                <button
                    type="submit"
                    className={`p-2 w-fit bg-orange-700 rounded-full block duration-300 ${isSending ? "opacity-50" : "opacity-100 hover:opacity-70"}`}
                    disabled={isSending}
                >
                    <IoSend size={24} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
