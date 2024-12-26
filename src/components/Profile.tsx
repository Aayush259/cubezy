"use client";
import Image from "next/image";
import { useProfileContext } from "../contexts/ProfileContext";
import { IoClose, IoCameraSharp } from "react-icons/io5";
import { RiPencilFill } from "react-icons/ri";
import { FaArrowRightLong } from "react-icons/fa6";
import { formatDate2 } from "../../utils/funcs/funcs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useChatContext } from "../contexts/ChatContext";
import Loader from "./Loader";
import { useEffect, useRef, useState } from "react";
import { logout } from "../store/userSlice";
import { useRouter } from "next/navigation";

const Profile = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    // Getting the state from the ProfileContext.
    const { isProfileOpen, setIsProfileOpen, isLoading, profileInfo } = useProfileContext();
    const { addDp, updateBio, onlineConnections, receiverId, updateReceiverId } = useChatContext();     // Function to add the DP to the chat.

    // User state from store.
    const { user } = useSelector((state: RootState) => state.user);

    // Local state to handle profileBio.
    const [profileBio, setProfileBio] = useState<string>("");

    // State to handle editBio.
    const [editBio, setEditBio] = useState<boolean>(false);

    // Ref to focus the input when editBio is true.
    const editBioInputRef = useRef<HTMLInputElement>(null);

    // Function to show the editBio input.
    const showEditBioInput = () => {
        setEditBio(true);
        setTimeout(() => {
            editBioInputRef.current?.focus();
        }, 100);
    };

    // Function to handle the bio submit.
    const handleBioSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateBio(profileBio);
        setEditBio(false);
    };

    const handleConnectionClick = (connectionId: string) => {
        updateReceiverId(connectionId);
        setIsProfileOpen(false);
    };

    const handleLogout = () => {
        if (profileInfo?._id !== user?._id) return;

        localStorage.removeItem("token");
        dispatch(logout());
        router.push("/login");
    };

    // Effect to set the profileBio state.
    useEffect(() => {
        setProfileBio(profileInfo?.bio || "");
        setEditBio(false);
    }, [profileInfo]);

    return (
        <div className={`py-8 h-full w-full fixed lg:absolute top-0 left-0 duration-300 z-[100] overflow-hidden bg-[#0A0A0A] ${isProfileOpen ? "translate-x-0" : "translate-x-full"}`} onClick={() => setEditBio(false)}>
            <button className="absolute top-4 right-4 lg:hover:opacity-80 duration-300" onClick={() => setIsProfileOpen(false)}>
                <IoClose size={30} className="text-white" />
            </button>
            {
                isLoading ? <Loader /> : <div className="h-full w-full">{
                    profileInfo && (
                        <div className="h-full w-full flex flex-col items-center gap-2 overflow-y-auto">
                            {
                                profileInfo.dp ? (
                                    user?._id === profileInfo._id ? (
                                        <label htmlFor="addDp" className="cursor-pointer h-[100px] w-[100px] flex items-center justify-center lg:hover:opacity-40 duration-200">
                                            <input
                                                type="file"
                                                name="addDp"
                                                id="addDp"
                                                className="hidden"
                                                onChange={addDp}
                                                accept="image/*"
                                            />
                                            <Image
                                                src={profileInfo.dp}
                                                alt={profileInfo.name}
                                                width={100}
                                                height={100}
                                                className="rounded-full h-full w-full object-cover object-top"
                                            />
                                        </label>
                                    ) : (
                                        <span className="block w-[100px] h-[100px] rounded-full overflow-hidden">
                                            <Image
                                                src={profileInfo.dp}
                                                alt={profileInfo.name}
                                                width={100}
                                                height={100}
                                                className="rounded-full w-full h-full object-cover object-top"
                                            />
                                        </span>
                                    )
                                ) : (
                                    <div className={`h-[100px] w-[100px] flex items-center justify-center text-white text-5xl rounded-full overflow-hidden ${user?._id !== profileInfo._id ? "bg-blue-700" : "border-2 border-gray-800"}`}>
                                        {
                                            user?._id === profileInfo._id ? (
                                                <label htmlFor="addDp" className="cursor-pointer h-full w-full flex items-center justify-center lg:hover:opacity-40 duration-200">
                                                    <input
                                                        type="file"
                                                        name="addDp"
                                                        id="addDp"
                                                        className="hidden"
                                                        onChange={addDp}
                                                        accept="image/*"
                                                    />
                                                    <IoCameraSharp size={50} className="opacity-70" />
                                                </label>
                                            ) : profileInfo.name[0]
                                        }
                                    </div>
                                )
                            }

                            <p className="text-2xl flex flex-row-reverse items-center justify-center gap-1">
                                <span className="font-semibold">{profileInfo.name}<span className="opacity-70">{user?._id === profileInfo._id && " (You)"}</span></span>
                                {
                                    user?._id !== profileInfo._id && receiverId && onlineConnections.includes(receiverId) && (
                                        <span className="h-2 w-2 bg-green-500 rounded-full block" />
                                    )
                                }
                            </p>

                            {
                                !editBio && (
                                    <div className="flex items-center justify-center gap-2">
                                        <p>{profileInfo.bio}</p>

                                        {
                                            profileInfo._id === user?._id && (
                                                <button
                                                    type="button"
                                                    className="rounded-full outline-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        showEditBioInput()
                                                    }}
                                                >
                                                    <RiPencilFill size={18} className="opacity-70" />
                                                </button>
                                            )
                                        }
                                    </div>
                                )
                            }

                            {
                                profileInfo._id === user?._id && (
                                    <form className={`flex items-center justify-center ${!editBio && "hidden"}`} onSubmit={handleBioSubmit} onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            ref={editBioInputRef}
                                            disabled={profileInfo._id !== user?._id}
                                            readOnly={profileInfo._id !== user?._id}
                                            autoFocus
                                            name="bio"
                                            id="bio"
                                            className="bg-gray-800 rounded-l-full outline-none w-[200px] text-center px-2 border-y border-transparent"
                                            value={profileBio} onChange={(e) => setProfileBio(e.target.value)}
                                        />

                                        <button type="submit" className="px-3 py-1 rounded-r-full bg-blue-700">
                                            <FaArrowRightLong size={18} />
                                        </button>
                                    </form>
                                )
                            }

                            {
                                profileInfo._id === user?._id && profileInfo.connections.length > 0 && <div className="w-full px-4 md:px-8 py-4 border-t border-b border-t-gray-800 border-b-gray-800 mt-3">

                                    <p className="text-xl mb-2">Your Connections:</p>

                                    <div className="shrink-0 grow-0 flex items-center gap-5 w-full overflow-x-auto">
                                        {
                                            profileInfo.connections.map(connection => (
                                                <div
                                                    className="shrink-0 grow-0 flex items-center justify-center flex-col gap-2 duration-300 hover:opacity-70 cursor-pointer overflow-hidden"
                                                    key={connection._id}
                                                    onClick={() => handleConnectionClick(connection._id)}
                                                >
                                                    {connection.dp ? (
                                                        <span className="block w-[50px] h-[50px] rounded-full overflow-hidden">
                                                            <Image
                                                                src={connection.dp}
                                                                alt={connection.name}
                                                                width={50}
                                                                height={50}
                                                                className="rounded-full h-full w-full object-cover object-top"
                                                            />
                                                        </span>
                                                    ) : (
                                                        <div className="h-[50px] w-[50px] flex items-center justify-center bg-blue-700 text-white text-xl rounded-full overflow-hidden">
                                                            {connection.name[0]}
                                                        </div>
                                                    )}

                                                    <p className="max-w-[55px] overflow-ellipsis overflow-hidden">{connection.name.split(" ")[0]}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            }

                            <div className={`w-full px-4 md:px-8 pt-1 pb-3 border-b border-t-gray-800 border-b-gray-800 ${profileInfo._id !== user?._id && "border-t !pt-3 mt-3"}`}>
                                <p>{profileInfo.email}</p>
                            </div>

                            <div className={`w-full px-4 md:px-8 pt-1 pb-3 border-b border-t-gray-800 border-b-gray-800`}>
                                <p>Joined on: {formatDate2(profileInfo.createdAt)}</p>
                            </div>

                            {
                                profileInfo._id === user?._id && (
                                    <button className="my-4 ml-auto mr-4 duration-300 bg-gray-800 rounded-full outline-none w-fit text-center px-4 py-1.5 text-red-500 hover:bg-transparent border border-gray-800 text-lg" onClick={handleLogout}>
                                        Logout
                                    </button>
                                )
                            }
                        </div>
                    )
                }</div>
            }
        </div>
    );
};

export default Profile;
