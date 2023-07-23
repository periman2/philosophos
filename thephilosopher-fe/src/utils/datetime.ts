export function formatDateString(dateString: string) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.toLocaleString('en', { month: 'long' });
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${year} ${month} ${day}:${formattedHours}:${formattedMinutes}${amOrPm}`;
}