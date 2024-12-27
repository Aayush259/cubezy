"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { updateConnections } from "../store/userSlice";
import { useIdBarContext } from "../contexts/IdBarContext";
import { getRandomEmoji } from "../../utils/funcs/Funcs";
import { RootState } from "../store/store";

const IdBar: React.FC = () => {

    const { user } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const { idBarOpen, setIdBarOpen } = useIdBarContext();

    const [userEmailToAdd, setUserEmailToAdd] = useState<string>("");   // State to store the email to add.
    const [isAdding, setIsAdding] = useState<boolean>(false);   // State to track whether the user is adding a new email.
    const [enteredWrongEmail, setEnteredWrongEmail] = useState<boolean>(false);   // State to track if the entered email is wrong.

    useEffect(() => {

        const closeIdBar = () => {
            setIdBarOpen(false);
        };

        window.addEventListener("click", closeIdBar);

        return () => {
            window.removeEventListener("click", closeIdBar);
        };
    }, []);

    useEffect(() => {
        if (enteredWrongEmail && !idBarOpen) {
            setEnteredWrongEmail(false);
        }
    }, [idBarOpen]);

    const addFriend = async () => {
        if (!userEmailToAdd) return;

        setIsAdding(true);
        setEnteredWrongEmail(false);

        const isUserAlreadyAdded = user?.connections.some(connection => connection.email === userEmailToAdd);
        const isUsersEmail = user?.email === userEmailToAdd;

        if (isUserAlreadyAdded || isUsersEmail) {
            setIsAdding(false);
            setUserEmailToAdd("");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("/api/auth/addConnection", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userEmailToAdd: userEmailToAdd
                })
            });

            if (response.ok) {
                const data = await response.json();
                const connections = data?.connections;

                if (connections) {
                    dispatch(updateConnections(connections));
                }
            } else {
                console.log("Error adding ID. response:", response);
                setEnteredWrongEmail(true);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsAdding(false);
            setUserEmailToAdd("");
        }
    };

    return (
        <div className="w-fit h-fit" onClick={(e) => e.stopPropagation()}>

            <div className={`fixed right-0 top-0 z-[999] w-screen h-screen lg:max-w-[450px] border-l-2 border-gray-800 bg-black ${idBarOpen ? "translate-x-0" : "translate-x-full"} duration-300`}>

                <button className="absolute top-4 right-4 lg:hover:opacity-80 duration-300" onClick={() => setIdBarOpen(false)}>
                    <IoClose size={30} className="text-white" />
                </button>

                <div className="text-2xl text-center mt-32 overflow-hidden">
                    <p>Add new friend {getRandomEmoji()}</p>
                </div>

                <form className="my-4 flex flex-row items-center justify-center" onSubmit={(e) => {
                    e.preventDefault();
                    addFriend();
                }}>
                    <input
                        type="email"
                        value={userEmailToAdd}
                        placeholder="Enter your friend's email"
                        className={`w-[70%] max-w-[350px] lg:max-w-none px-4 py-2 bg-gray-800 border-b-2 border-gray-800 focus:outline-none focus:border-blue-700 rounded-l-lg ${isAdding ? "opacity-50" : "opacity-100"}`}
                        onChange={(e) => setUserEmailToAdd(e.target.value)}
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

                {
                    enteredWrongEmail && (
                        <p className="text-sm text-red-500 text-center">
                            {"Email not found"}
                        </p>
                    )
                }
            </div>
        </div>
    );
};

export default IdBar;
