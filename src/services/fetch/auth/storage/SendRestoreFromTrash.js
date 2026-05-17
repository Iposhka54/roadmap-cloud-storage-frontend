import {API_TRASH_RESTORE} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

export const sendRestoreFromTrash = async (paths) => {
    const response = await fetch(API_TRASH_RESTORE, {
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