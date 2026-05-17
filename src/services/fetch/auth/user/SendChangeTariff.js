import {API_CHANGE_TARIFF} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

const parseResponseBody = (text) => {
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const extractTariff = (payload) => {
    if (typeof payload === 'string') {
        return payload;
    }

    if (payload && typeof payload === 'object') {
        return payload.tariff ?? payload.name ?? payload.value ?? null;
    }

    return null;
};

export const sendChangeTariff = async (tariff) => {
    const response = await fetch(API_CHANGE_TARIFF, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({tariff}),
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    const payload = parseResponseBody(await response.text());
    return extractTariff(payload) ?? tariff;
};