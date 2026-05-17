import {API_STORAGE_INFO} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

export const sendGetStorageInfo = async () => {
    const response = await fetch(API_STORAGE_INFO, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    return await response.json();
};