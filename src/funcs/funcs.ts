
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

// Function to copy the user's ID to the clipboard.
export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
}
