"use client"
import Image from "next/image"
import { emojis } from "@/lib/data"
import requests from "@/lib/services/requests"
import { IoSend } from "react-icons/io5"
import { GoClock } from "react-icons/go"
import { useSelector } from "react-redux"
import { FaCheck } from "react-icons/fa6"
import { RootState } from "@/lib/store/store"
import { IChatMessage } from "@/lib/interfaces"
import { useToast } from "../context/ToastContext"
import { useEffect, useRef, useState } from "react"
import { BsEmojiSmileUpsideDown } from "react-icons/bs"
import { useChatContext } from "../context/ChatContext"
import { MdContentCopy, MdDelete } from "react-icons/md"
import { IoCheckmarkDone, IoClose } from "react-icons/io5"
import { useProfileContext } from "../context/ProfileContext"
import { IoMdCheckmark, IoIosArrowBack, IoMdShareAlt } from "react-icons/io"
import { compareDates, copyToClipboard, formatDate, formatMessage, getLastSeen } from "@/lib/Funcs"

const ChatWindow: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user)

    const { receiverId, updateReceiverId, chats, setChats, loadingChats, sendMessage, onlineConnections, selectedMessages, addSelectedMessage, removeSelectedMessage, clearSelectedMessages, openDeleteWindow, openForwardMessageWindow, chatId, setLoadingChats, page, setPage, hasMore, setHasMore } = useChatContext()
    const { openProfile } = useProfileContext()
    const { addToast } = useToast()

    const [message, setMessage] = useState<string>("")
    const [showEmojis, setShowEmojis] = useState<boolean>(false)
    const [previousChatWindowHeight, setPreviousChatWindowHeight] = useState<number>(0)
    const receiver = user?.connections.find((connection) => connection.userId._id === receiverId)

    const messageInputRef = useRef<HTMLInputElement | null>(null)
    const chatScrollRef = useRef<HTMLDivElement | null>(null)

    const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null)      // Used to handle long press on messages.
    const [longPressActive, setLongPressActive] = useState<boolean>(false)     // Used to handle long press on messages.

    const handleChatWindowScroll = () => {
        if (!hasMore) return
        const chatWindow = chatScrollRef.current
        if (!chatWindow) return

        const chatWindowScrollTop = chatWindow.scrollTop
        const chatWindowScrollHeight = chatWindow.scrollHeight
        const chatWindowClientHeight = chatWindow.clientHeight

        if (chatWindowScrollHeight <= chatWindowClientHeight) return

        if (chatWindowScrollTop === 0 && !loadingChats) {
            setPage(prev => prev + 1)
        }
    }

    // Function to get messages.
    const getMessages = async () => {
        if (!chatId || (loadingChats || !hasMore && page !== 1)) return

        // Set loading state to true and get the token.
        setLoadingChats(true)
        const token = localStorage.getItem("token")

        // Check if token exists.
        if (!token) {
            addToast("Something went wrong", false)
            return
        }

        setPreviousChatWindowHeight(chatScrollRef.current?.scrollHeight || 0)

        try {
            const messages = await requests.getMessages({ chatId, page, limit: 20 })
            const newChats = messages.chats.filter(chat => !chats.some((existingChat: IChatMessage) => existingChat._id === chat._id))
            setChats(prevChats => [...newChats, ...prevChats])
            setHasMore(messages.hasMore)
        } catch {
            addToast("Something went wrong", false)
        } finally {
            setLoadingChats(false)
        }
    }

    // Handle message submit.
    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        messageInputRef.current?.focus()
        sendMessage(message)
        setMessage("")
        setShowEmojis(false)
        setTimeout(() => {
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
            }
        }, 200)
    }

    // Handle long press on messages.
    const handleLongPressMessage = (message: IChatMessage) => {
        // If any message is already selected, don't do anything.
        if (selectedMessages.length > 0) return

        // Add the message to selected messages and set long press active.
        const longPressTimeout = setTimeout(() => {
            addSelectedMessage(message)
            setLongPressActive(true)
        }, 500)

        setLongPressTimeout(longPressTimeout)
    }

    // Handle long press on messages end.
    const handleLongPressMessageEnd = () => {
        if (longPressTimeout) {
            // Clear the timeout and set long press active to false.
            clearTimeout(longPressTimeout)
            setLongPressTimeout(null)
        }
        setTimeout(() => setLongPressActive(false), 100)
    }

    // Handle message click.
    const handleMessageClick = (message: IChatMessage) => {
        // If no messages are selected or long press is active, don't do anything.
        if (selectedMessages.length === 0 || longPressActive) return

        const isMessageSelected = selectedMessages.filter(selectedMessage => selectedMessage._id === message._id).length > 0

        // If message is already selected, remove it from selected messages, else add it to selected messages.
        if (isMessageSelected) {
            removeSelectedMessage(message._id)
        } else {
            addSelectedMessage(message)
        }
    }

    // Handle emoji click.
    const handleEmojiClick = (emoji: string) => {
        setMessage((prev) => prev + emoji)

        // Regain focus on the input field
        if (messageInputRef.current) {
            messageInputRef.current.focus()
        }
    }

    // Function to copy messages.
    const copyMessages = () => {
        if (selectedMessages.length === 0) return
        const messages = selectedMessages.map(selectedMessage => selectedMessage.message)
        copyToClipboard(messages.join("\n"))

        // Clear selected messages.
        clearSelectedMessages()
    }

    useEffect(() => {
        getMessages()
    }, [chatId, page])

    useEffect(() => {
        if (chatScrollRef.current && chats.length <= 20) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }

        if (chatScrollRef.current && page > 1) {
            chatScrollRef.current.scrollTop = Number(chatScrollRef.current.scrollHeight) - Number(previousChatWindowHeight)
        }
    }, [chats])

    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            if (selectedMessages.length > 0) {
                e.preventDefault()
                return
            }
        }

        const chatWindow = document.querySelector('#chatWindow') as HTMLDivElement

        if (chatWindow) {
            const links = chatWindow.querySelectorAll('a')
            links.forEach(link => {
                link.addEventListener('click', handleLinkClick)
            })

            return () => {
                links.forEach(link => {
                    link.removeEventListener('click', handleLinkClick)
                })
            }
        }
    }, [chats, selectedMessages])

    if (!receiverId) return (
        <div className="w-full h-full hidden lg:flex lg:flex-col items-center justify-center gap-6 relative z-20 text-xl font-[200]">
            <Image
                src="/images/group.webp"
                alt="Start a new chat"
                width={889}
                height={787}
                className="w-[80%] max-w-[400px] h-auto"
            />
            <p className="text-center">{"Welcome Back"}</p>
        </div>
    )

    return (
        <div className={`w-screen h-screen lg:w-full z-20 fixed top-0 left-0 lg:relative bg-[#0A0A0A] lg:bg-none`}>
            <div id="chatWindow" className="h-[85%] w-full overflow-y-auto flex flex-col" ref={chatScrollRef} onScroll={handleChatWindowScroll}>
                <div className="sticky top-0 left-0 z-10 w-full lg:px-6 lg:py-4 flex items-center justify-between bg-[#0A0A0A] lg:hover:bg-gray-900 duration-300 border-b border-gray-800 text-xl">
                    {selectedMessages.length > 0 && (
                        <div className="w-full h-full flex items-center justify-between px-2 lg:px-6 gap-2 absolute top-0 left-0 bg-[#0A0A0A] z-10">
                            <p className="flex items-center gap-2">
                                <button onClick={clearSelectedMessages}>
                                    <IoClose size={30} />
                                </button>

                                {selectedMessages.length + " Selected"}
                            </p>

                            <div className="flex items-center gap-4 ml-auto justify-self-end">
                                <button onClick={openDeleteWindow}>
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
                    )}

                    <button
                        className="lg:hidden rounded-full outline-none mx-4"
                        onClick={() => {
                            updateReceiverId(null)
                            setChats([])
                        }}
                    >
                        <IoIosArrowBack size={24} />
                    </button>

                    <button className="items-center py-4 px-6 lg:px-0 lg:py-0 gap-4 flex-grow flex flex-row-reverse lg:flex-row" onClick={() => openProfile(receiverId)}>
                        {receiver?.userId?.dp ? (
                            <span className="w-[40px] h-[40px] rounded-full overflow-hidden">
                                <Image
                                    src={receiver.userId.dp}
                                    alt={receiver.userId.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full h-full w-full object-cover object-top"
                                />
                            </span>
                        ) : (
                            <span className="h-[40px] w-[40px] flex items-center justify-center bg-blue-700 text-white text-xl rounded-full overflow-hidden">
                                {receiver?.userId?.name[0].split(" ")[0]}
                            </span>
                        )}

                        <span className="flex flex-col lg:gap-1 text-left">
                            <span>
                                {receiver?.userId?.name}
                            </span>

                            {(receiver?.userId?.lastSeen && !onlineConnections.includes(receiverId)) && (
                                <span className="text-xs flex items-center gap-2">
                                    <span className="h-2 w-2 bg-yellow-500 rounded-full block" />
                                    {" Last seen " + getLastSeen(receiver.userId.lastSeen)}
                                </span>
                            )}

                            {onlineConnections.includes(receiverId) && (
                                <span className="text-xs flex items-center gap-2 animate-heightActive">
                                    <span className="h-2 w-2 bg-green-500 rounded-full block" />
                                    {" Online"}
                                </span>
                            )}
                        </span>
                    </button>
                </div>

                <div className="flex-grow h-fit pt-10 px-4 lg:px-32 flex flex-col justify-end gap-1.5 w-full relative">
                    {loadingChats && <div className="w-full absolute top-1 left-0">
                        <div className="w-8 h-8 mx-auto rounded-full border-[3px] border-t-transparent border-blue-700 animate-spin" />
                    </div>}

                    {chats?.map((chat, index) => {
                        const isMessageSelected = selectedMessages.filter(selectedMessage => selectedMessage._id === chat._id).length > 0
                        const comparedDate = compareDates(chats[index - 1]?.sentAt, chat.sentAt)

                        return (
                            <div key={chat._id} className={`w-full relative duration-300 ${selectedMessages.length > 0 ? "md:pl-8" : "pl-0"}`}>
                                {comparedDate && (
                                    <div key={chat._id} className="gap-2 w-fit mx-auto text-sm my-1 px-4 py-1 rounded-full bg-slate-800">
                                        {comparedDate}
                                    </div>
                                )}

                                {selectedMessages.length > 0 && <button
                                    className={`hidden md:flex absolute items-center justify-center outline-none bottom-0 -translate-y-1/4 lg:-translate-y-1/2 left-0 h-5 w-5 rounded-md overflow-hidden border border-white ${isMessageSelected ? "bg-blue-700" : "bg-transparent"}`}
                                    onClick={() => handleMessageClick(chat)}
                                >
                                    {isMessageSelected && <FaCheck size={10} />}
                                </button>}

                                <div
                                    className="w-full relative"
                                    onClick={() => handleMessageClick(chat)}
                                    onMouseDown={() => handleLongPressMessage(chat)}
                                    onTouchStart={() => handleLongPressMessage(chat)}
                                    onMouseUp={() => handleLongPressMessageEnd()}
                                    onTouchEnd={() => handleLongPressMessageEnd()}
                                >
                                    {isMessageSelected && <div className="w-screen -right-4 lg:-right-32 h-full absolute bg-blue-700/40" />}

                                    <div className={`flex items-end md:max-w-[350px] max-w-[90%] py-1 px-2 rounded-lg w-fit lg:text-xl relative ${chat.senderId === user?._id ? "ml-auto bg-blue-700" : "self-start bg-slate-800"}`}>
                                        <p className="break-words break-all">
                                            {formatMessage(chat.message)}
                                        </p>

                                        <div className="flex items-center justify-end gap-1 text-sm text-white whitespace-nowrap pl-4">
                                            <p className="text-[10px] leading-none">
                                                {formatDate(chat.sentAt)}
                                            </p>

                                            {chat.isRead && user?._id === chat.senderId && (
                                                <IoCheckmarkDone className="text-green-300" />
                                            )}

                                            {chat.status === "sending" ? (
                                                <GoClock className="text-white" />
                                            ) : !chat.isRead && user?._id === chat.senderId && (
                                                <IoMdCheckmark className="text-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <form className="w-full h-[15%] flex items-start pt-2 justify-center gap-3 relative overflow-visible" onSubmit={handleMessageSubmit} onClick={(e) => e.stopPropagation()}>
                <div className={`${showEmojis ? "h-[250px] p-2.5 border opacity-100" : "h-[0px] border-0 p-0 opacity-0"} absolute bottom-[98%] left-2 w-[80%] lg:w-[40%] overflow-y-auto overflow-x-hidden rounded-xl bg-gray-800 border-gray-700 text-xl flex items-center justify-start gap-2 flex-wrap duration-500`}>
                    {emojis.map((emoji, index) => (
                        <button type="button" key={index} className="outline-none rounded-full hover:opacity-70 duration-200" onClick={() => handleEmojiClick(emoji)}>
                            {emoji}
                        </button>
                    ))}
                </div>
                <label htmlFor="message" className="w-[80%] lg:w-[70%] px-2 py-2 bg-gray-800 focus:outline-none rounded-full flex items-center gap-2">
                    <button type="button" className="outline-none rounded-full text-neutral-300" onClick={() => {
                        setShowEmojis(prev => !prev)
                    }}>
                        <BsEmojiSmileUpsideDown size={24} className="rotate-180" />
                    </button>

                    <input
                        type="text"
                        value={message}
                        id="message"
                        autoComplete="off"
                        autoFocus
                        ref={messageInputRef}
                        placeholder="Message"
                        className={`bg-transparent flex-grow focus:outline-none`}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </label>

                <button
                    type="submit"
                    className={`p-2 w-fit bg-blue-700 rounded-full block duration-300 lg:hover:opacity-70`}
                >
                    <IoSend size={24} />
                </button>
            </form>
        </div>
    )
}

export default ChatWindow