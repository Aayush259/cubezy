"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { CgArrowRightO } from "react-icons/cg";
import { IoClose } from "react-icons/io5";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";

const IdBar: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);

    const [idBarOpen, setIdBarOpen] = useState<boolean>(false);     // State to control the visibility of the ID bar.
    const [idCopied, setIdCopied] = useState<boolean>(false);   // State to track whether the ID has been copied.
    const [isAdding, setIsAdding] = useState<boolean>(false);   // State to track whether the user is adding a new ID.

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;

        // If idCopied is true, then set it to false after 4 seconds.
        if (idCopied) {
            intervalId = setTimeout(() => {
                setIdCopied(false);
            }, 4000);
        }

        // Clean up the interval on component unmount.
        return () => {
            if (intervalId) {
                clearTimeout(intervalId);
            }
        };
    }, [idCopied])

    // Function to copy the user's ID to the clipboard.
    const copyIdToClipboard = () => {
        navigator.clipboard.writeText(user?._id as string);
        setIdCopied(true);
    }

    const addId = () => {
        setIsAdding(true);
    }

    return (
        <div className="w-fit h-fit">
            <button className="w-fit rounded-full fixed top-1/2 -translate-y-1/2 -right-2 rotate-180 hover:opacity-70 hover:right-0 duration-300 z-20" onClick={() => setIdBarOpen(true)}>
                <CgArrowRightO size={30} className="text-white" />
            </button>

            <div className={`fixed right-0 top-0 z-30 w-screen h-screen max-w-[450px] border-l-2 border-gray-800 bg-black ${idBarOpen ? "translate-x-0" : "translate-x-full"} duration-300`}>

                <button className="absolute top-4 right-4 hover:opacity-80 duration-300" onClick={() => setIdBarOpen(false)}>
                    <IoClose size={30} className="text-white" />
                </button>

                <div className="text-2xl text-center my-10 overflow-hidden">
                    <p>Your Square ID:</p>
                    <div className="w-[80%] mx-auto my-1 flex items-center justify-between">
                        <p className="max-w-[85%] overflow-hidden overflow-ellipsis">{user?._id}</p>

                        <button className="w-fit" onClick={copyIdToClipboard}>
                            {idCopied ? <FaRegCircleCheck size={30} /> : <MdOutlineContentCopy size={30} className="hover:opacity-80 duration-300" />}
                        </button>
                    </div>
                </div>

                <form className="my-16 flex flex-row items-center justify-center">
                    <input type="text" placeholder="Enter your chatmate's Square ID" className="w-[70%] px-4 py-2 bg-gray-800 border-b-2 border-gray-800 focus:outline-none focus:border-orange-700 rounded-l-lg" />

                    <button className={`px-4 py-2 w-fit bg-orange-700 rounded-r-lg block duration-300 ${isAdding ? "opacity-50" : "opacity-100 hover:opacity-80"} border-b-2 border-orange-700`}>
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IdBar;
