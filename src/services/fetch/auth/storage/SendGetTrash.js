import {API_TRASH} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";
import {mapTrashObjectToFrontFormat} from "../../../util/StorageMappers.js";

export const sendGetTrash = async () => {
    const response = await fetch(API_TRASH, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    const data = await response.json();
    return data.map(mapTrashObjectToFrontFormat);
};