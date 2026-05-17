import {API_TRASH_ITEMS} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

export const sendDeleteFromTrash = async (paths) => {
    const response = await fetch(API_TRASH_ITEMS, {
        method: 'DELETE',
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