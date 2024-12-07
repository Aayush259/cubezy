"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { CgArrowRightO } from "react-icons/cg";
import { IoIosArrowBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { updateConnections } from "../store/userSlice";
import { useIdBarContext } from "../contexts/IdBarContext";
import { copyToClipboard } from "../funcs/funcs";

const IdBar: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const { idBarOpen, setIdBarOpen } = useIdBarContext();

    const [idCopied, setIdCopied] = useState<boolean>(false);   // State to track whether the ID has been copied.
    const [idToAdd, setIdToAdd] = useState<string>("");   // State to store the ID to add.
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
    }, [idCopied]);

    // Function to copy the user's ID to the clipboard.
    const copyIdToClipboard = () => {
        copyToClipboard(user?._id as string);
        setIdCopied(true);
    }

    const addId = async () => {
        setIsAdding(true);

        const token = localStorage.getItem("token");

        try {
            console.log("Adding ID:", idToAdd);
            const response = await fetch("/api/auth/addConnection", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idToAdd: idToAdd
                })
            });

            if (response.ok) {
                const data = await response.json();
                const connections = data?.connections;

                if (connections) {
                    dispatch(updateConnections(connections));
                    setIdToAdd("");
                    setIsAdding(false);
                }
            } else {
                console.log("Error adding ID. response:", response);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="w-fit h-fit">

            <div className={`fixed right-0 top-0 z-50 w-screen h-screen lg:max-w-[450px] border-l-2 border-gray-800 bg-black ${idBarOpen ? "translate-x-0" : "translate-x-full"} duration-300`}>

                <button className="absolute top-4 right-4 lg:hover:opacity-80 duration-300" onClick={() => setIdBarOpen(false)}>
                    <IoClose size={30} className="text-white" />
                </button>

                <div className="text-2xl text-center my-10 overflow-hidden">
                    <p>Your ID:</p>
                    <div className="w-[80%] max-w-[400px] lg:max-w-none mx-auto my-1 flex items-center justify-between">
                        <p className="max-w-[85%] overflow-hidden overflow-ellipsis">{user?._id}</p>

                        <button className="w-fit" onClick={copyIdToClipboard}>
                            {idCopied ? <FaRegCircleCheck size={30} /> : <MdOutlineContentCopy size={30} className="lg:hover:opacity-80 duration-300" />}
                        </button>
                    </div>
                </div>

                <form className="my-16 flex flex-row items-center justify-center" onSubmit={(e) => {
                    e.preventDefault();
                    addId();
                }}>
                    <input
                        type="text"
                        value={idToAdd}
                        placeholder="Enter your friend's ID"
                        className={`w-[70%] max-w-[350px] lg:max-w-none px-4 py-2 bg-gray-800 border-b-2 border-gray-800 focus:outline-none focus:border-blue-700 rounded-l-lg ${isAdding ? "opacity-50" : "opacity-100"}`}
                        onChange={(e) => setIdToAdd(e.target.value)}
                        readOnly={isAdding}
                    />

                    <button
                        type="submit"
                        className={`px-4 py-2 w-fit bg-blue-700 rounded-r-lg block duration-300 ${isAdding ? "opacity-50" : "opacity-100 lg:hover:opacity-80"} border-b-2 border-blue-700`}
                        disabled={isAdding}
                    >
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IdBar;
