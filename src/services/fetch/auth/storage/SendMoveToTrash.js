import {API_TRASH} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

export const sendMoveToTrash = async (paths) => {
    const response = await fetch(API_TRASH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({paths}),
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }
};