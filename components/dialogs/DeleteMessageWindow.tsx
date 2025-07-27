"use client"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { useChatContext } from "../context/ChatContext"

const DeleteMessageWindow = () => {
    const { deleteMessage, deleteWindowVisible, closeDeleteWindow, clearSelectedMessages, selectedMessages } = useChatContext()
    const { user } = useSelector((state: RootState) => state.user)

    if (!deleteWindowVisible) return null

    return (
        <div className="fixed w-screen min-h-screen top-0 left-0 z-[999] flex items-center justify-center bg-black/50">
            <div className="w-[400px] max-w-[100vw] h-fit bg-black border border-gray-800 rounded-xl mx-auto overflow-hidden">
                <div className="w-full flex flex-col p-4">
                    <p>{"Delete Message?"}</p>

                    <div className="flex items-end gap-2 flex-col text-sm">
                        <button className="px-3 py-1.5 bg-blue-700 rounded-full hover:bg-blue-500 duration-200" onClick={() => deleteMessage("me")}>
                            {"Delete for Me"}
                        </button>

                        {selectedMessages.filter(message => (message.senderId === user?._id && !message.isRead && new Date(message.sentAt) >= new Date(Date.now() - 5 * 60 * 60 * 1000))).length === selectedMessages.length && (
                            <button className="px-3 py-1.5 bg-blue-700 rounded-full hover:bg-blue-500 duration-200" onClick={() => deleteMessage("everyone")}>
                                {"Delete for Everyone"}
                            </button>
                        )}

                        <button
                            className="px-3 py-1.5 bg-blue-700 rounded-full hover:bg-blue-500 duration-200"
                            onClick={() => {
                                closeDeleteWindow()
                                clearSelectedMessages()
                            }}>
                            {"Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteMessageWindow