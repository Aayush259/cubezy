import Link from "next/link";

export const formatDate = (date: Date) => {
    date = new Date(date);

    // Get hours and minutes.
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Determine AM or PM.
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format.
    hours = hours % 12;
    // Adjust for 0 hour (midnight case).
    hours = hours === 0 ? 12 : hours;

    return `${hours}:${minutes} ${period}`;
};

export const formatDate2 = (date: Date) => {
    date = new Date(date);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' }); // Gets full month name
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

// Function to generate a random emoji.
export const getRandomEmoji = () => {
    const emojis = [
        "😃", "😄", "😘", "🤓", "😉", "🤗", "🥳", "🙃", "😊", "😎", "🤠", "😁"
    ];

    const randomIndex = Math.floor(Math.random() * emojis.length);

    return emojis[randomIndex];
};

// Function to compare dates.
export const compareDates = (date1: string | Date, date2: string | Date) => {
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    // Extract year, month, and day for both dates
    const firstDay = {
        year: firstDate.getFullYear(),
        month: firstDate.getMonth(),
        day: firstDate.getDate(),
    };

    const secondDay = {
        year: secondDate.getFullYear(),
        month: secondDate.getMonth(),
        day: secondDate.getDate(),
    };

    // Compare if both dates are on the same day
    if (
        firstDay.year === secondDay.year &&
        firstDay.month === secondDay.month &&
        firstDay.day === secondDay.day
    ) {
        return null; // Same day
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Extract year, month, and day for today and yesterday
    const todayDay = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    };

    const yesterdayDay = {
        year: yesterday.getFullYear(),
        month: yesterday.getMonth(),
        day: yesterday.getDate(),
    };

    // Check if the second date is today or yesterday
    if (
        secondDay.year === todayDay.year &&
        secondDay.month === todayDay.month &&
        secondDay.day === todayDay.day
    ) {
        return "Today";
    } else if (
        secondDay.year === yesterdayDay.year &&
        secondDay.month === yesterdayDay.month &&
        secondDay.day === yesterdayDay.day
    ) {
        return "Yesterday";
    }

    // Format: DD MMM YYYY
    const formattedDate = `${String(secondDay.day).padStart(2, "0")} ${secondDate.toLocaleString("en-GB", { month: "short" })
        } ${secondDay.year}`;
    return formattedDate;
};

// Function to copy the user's ID to the clipboard.
export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};

// Function to format the message (with links, emails, and phone numbers).
export const formatMessage = (input: string) => {
    // Regular expressions for URLs, emails, and phone numbers.
    const urlRegex = /(https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\?=%&.-]*)?)/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\b\d{10,15}\b/g;

    const combinedRegex = new RegExp(`${urlRegex.source}|${emailRegex.source}|${phoneRegex.source}`, 'g');

    // Array to store parts of the string (text or anchor tags).
    const elements: React.ReactNode[] = [];

    // Tracks the end of the last match to slice the string correctly.
    let lastIndex = 0;

    // Variable to hold the current regex match.
    let match;

    // Iterate through all matches of the regex in the input string.
    while ((match = combinedRegex.exec(input)) !== null) {
        const matchedText = match[0]; // Matched string (URL, email, or phone number).
        const start = match.index; // Starting index of the match in the input string.

        // Add text before the current match if there is any.
        if (start > lastIndex) {
            elements.push(
                <span key={`text-${lastIndex}`}>{input.substring(lastIndex, start)}</span>
            );
        }

        // Determine the type of the matched text and wrap it appropriately.
        if (urlRegex.test(matchedText)) {
            elements.push(
                <Link
                    key={`url-${start}`}
                    href={matchedText}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:opacity-70 duration-300"
                >
                    {matchedText}
                </Link>
            );
        } else if (emailRegex.test(matchedText)) {
            elements.push(
                <Link
                    key={`email-${start}`}
                    href={`mailto:${matchedText}`}
                    className="underline underline-offset-4 hover:opacity-70 duration-300"
                >
                    {matchedText}
                </Link>
            );
        } else if (phoneRegex.test(matchedText)) {
            elements.push(
                <Link
                    key={`phone-${start}`}
                    href={`tel:${matchedText}`}
                    className="underline underline-offset-4 hover:opacity-70 duration-300"
                >
                    {matchedText}
                </Link>
            );
        }

        // Update lastIndex to the end of the current match.
        lastIndex = start + matchedText.length;
    }

    // Add any remaining text after the last match.
    if (lastIndex < input.length) {
        elements.push(
            <span key={`text-${lastIndex}`}>{input.substring(lastIndex)}</span>
        );
    }

    return elements;
};
