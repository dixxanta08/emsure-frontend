// src/utils/dateUtils.js


import dayjs from 'dayjs';
// Function to get a cookie by its name
export function formatToDateInput(dateString) {
    const date = new Date(dateString); // Parse the date string into a Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    return `${year}-${month}-${day}`;
}

// Convert Dayjs to string (YYYY-MM-DD)
export const toFormattedDate = (date) => {
    return date ? dayjs(date).format('YYYY-MM-DD') : null;
};

// Convert Dayjs to a JavaScript Date object

export const toDateObject = (date) => {
    const parsedDate = dayjs(date, 'YYYY-MM-DD').isValid() ? dayjs(date, 'YYYY-MM-DD') : dayjs();
    console.log("props is vlaid", parsedDate.isValid());
    return parsedDate;
};