import {API_DOWNLOAD_TRASH} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";
import {extractSimpleName} from "../../../util/Utils.js";

const resolveFileName = (contentDisposition, path) => {
    if (contentDisposition) {
        const utfFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utfFileName?.[1]) {
            return decodeURIComponent(utfFileName[1]);
        }

        const fileName = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (fileName?.[1]) {
            return fileName[1];
        }
    }

    return path.endsWith("/")
        ? extractSimpleName(path).replace("/", ".zip")
        : extractSimpleName(path);
};

export const sendDownloadTrashFile = async (path) => {
    const params = new URLSearchParams({path});
    const response = await fetch(`${API_DOWNLOAD_TRASH}?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    const blob = await response.blob();
    const fileName = resolveFileName(response.headers.get('content-disposition'), path);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
};