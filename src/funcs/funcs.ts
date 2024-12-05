
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
