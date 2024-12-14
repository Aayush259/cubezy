
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
    const formattedDate = `${String(secondDay.day).padStart(2, "0")} ${
        secondDate.toLocaleString("en-GB", { month: "short" })
    } ${secondDay.year}`;
    return formattedDate;
};

// Function to copy the user's ID to the clipboard.
export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};
