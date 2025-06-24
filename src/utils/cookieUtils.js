// src/utils/cookieUtils.js
// Function to set a cookie with expiry time in minutes, hours, or days
export function setCookie(name, value, expires, unit = "minutes") {
    const d = new Date();

    // Convert expiration based on the unit (minutes, hours, or days)
    if (unit === "minutes") {
        d.setTime(d.getTime() + (expires * 60 * 1000)); // Convert minutes to milliseconds
    } else if (unit === "seconds") {
        d.setTime(d.getTime() + (expires * 1000)); // Convert seconds to milliseconds
    } else if (unit === "hours") {
        d.setTime(d.getTime() + (expires * 60 * 60 * 1000)); // Convert hours to milliseconds
    } else if (unit === "days") {
        d.setTime(d.getTime() + (expires * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    }

    const expiresStr = "expires=" + d.toUTCString(); // Cookie expiration
    document.cookie = `${name}=${value};${expiresStr};path=/`; // Set the cookie
}

// Function to get a cookie by its name
export function getCookie(name) {
    const value = `; ${document.cookie}`; // Get the entire document cookie string
    const parts = value.split(`; ${name}=`); // Split by the cookie name
    if (parts.length === 2) {
        return parts.pop().split(';').shift(); // Return the value of the cookie
    }
    return null; // Return null if the cookie is not found
}

// Function to delete a cookie
export function deleteCookie(name) {
    setCookie(name, "", -1); // Set the cookie with an expired date
}
