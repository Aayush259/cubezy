"use client";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const Toast: React.FC<{
    message: string;
    onClose: () => void;
    success: boolean;
}> = ({ message, onClose, success }) => {

    useEffect(() => {
        setTimeout(() => {
            onClose();
        }, 4000);
    }, [])

    return (
        <div className="bg-slate-800 max-w-[85vw] w-[400px] mx-auto md:mx-0 p-3 md:py-4 md:px-8 text-center text-white flex justify-between items-center rounded-xl m-2 md:text-xl overflow-ellipsis animate-in relative z-[1000] overflow-hidden gap-2">
            <div
                className={`absolute h-1 left-0 bottom-0 ${success ? 'bg-blue-700' : 'bg-red-500'} animate-toast`}
            />
            <div className="flex items-center justify-start text-left gap-2 flex-grow">
                {message}
            </div>
            <button onClick={onClose}>
                <IoClose />
            </button>
        </div>
    );
};

export default Toast;
