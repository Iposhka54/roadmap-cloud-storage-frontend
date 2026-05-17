import {API_TARIFFS} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

const normalizeTariff = (item) => ({
    tariff: item?.tariff ?? item?.name ?? item?.value ?? null,
    size: Number(item?.size ?? 0),
    current: Boolean(item?.current),
});

export const sendGetTariffs = async () => {
    const response = await fetch(API_TARIFFS, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    const payload = await response.json();

    if (!Array.isArray(payload)) {
        const normalized = normalizeTariff(payload);
        return normalized.tariff ? [normalized] : [];
    }

    return payload.map(normalizeTariff).filter((item) => item.tariff);
};