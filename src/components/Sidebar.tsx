"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export default function Sidebar() {

    const { user } = useSelector((state: RootState) => state.user);

    const [greeting, setGreeting] = useState<string>("");   // Greeting message based on the current time.

    useEffect(() => {
        // Function to update the greeting based on the current time.
        const updateGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                setGreeting("Good morning");
            } else if (currentHour < 18) {
                setGreeting("Good afternoon");
            } else {
                setGreeting("Good evening");
            }
        };

        // Initial greeting.
        updateGreeting();

        // Update greeting every minute.
        const intervalId = setInterval(updateGreeting, 60000);

        // Clean up the interval on component unmount.
        return () => clearInterval(intervalId);
    }, []);

    // Function to generate a random emoji.
    const getRandomEmoji = () => {
        const emojis = [
            "😃", "😄", "😘", "🤓", "😉", "🤗", "🥳", "🙃", "😊", "😎", "🤠", "😁"
        ];

        const randomIndex = Math.floor(Math.random() * emojis.length);

        return emojis[randomIndex];
    }

    return (
        <div className="py-4 h-full w-full max-w-[450px] border-r-2 border-gray-800">

            <p className="px-4 pb-4 font-semibold text-2xl h-14 flex items-center border-b-2 border-gray-800">
                {greeting}{", "}{user?.name.split(" ")[0]}{" "}{getRandomEmoji()}
            </p>

            <div className="h-full pb-28 overflow-y-auto">
                <div></div>
            </div>
        </div>
    );
};
