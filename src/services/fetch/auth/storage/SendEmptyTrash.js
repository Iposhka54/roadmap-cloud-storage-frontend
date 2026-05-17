import {API_TRASH} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

export const sendEmptyTrash = async () => {
    const response = await fetch(API_TRASH, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }
};