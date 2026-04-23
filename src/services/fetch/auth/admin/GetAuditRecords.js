import {API_ADMIN_AUDIT} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";

/**
 * Получить записи аудита с фильтрами и пагинацией
 * @param {Object} params - параметры запроса
 * @param {string|null} params.username - фильтр по имени пользователя
 * @param {number|null} params.actionType - фильтр по типу действия
 * @param {number} params.page - номер страницы (начиная с 0)
 * @param {number} params.size - размер страницы
 * @returns {Promise<Object>} - объект с данными пагинации и записями аудита
 */
export const getAuditRecords = async ({username = null, actionType = null, page = 0, size = 20}) => {
    console.log("Запрос на получение аудита:", {username, actionType, page, size});

    const params = new URLSearchParams();
    if (username) {
        params.append('username', username);
    }
    if (actionType !== null && actionType !== undefined) {
        params.append('actionType', actionType.toString());
    }
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'actionTime,desc');

    const url = `${API_ADMIN_AUDIT}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    console.log("Ответ на запрос аудита:");
    console.log(response);

    if (!response.ok) {
        console.log("Ошибка со статусом: " + response.status);
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    const data = await response.json();
    console.log("Данные аудита получены:");
    console.log(data);

    return data;
};

