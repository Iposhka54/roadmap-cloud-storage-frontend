export const ActionType = {
    REGISTER: 0,
    UNKNOWN: 1,
    LOGIN: 2,
    CREATE_DIRECTORY: 3,
    UPLOAD_RESOURCE: 4,
    DELETE_RESOURCE: 5,
    DOWNLOAD_RESOURCE: 6,
    RENAME_RESOURCE: 7,
    MOVE_RESOURCE: 8
};

/**
 * Получить понятное название действия по его типу
 * @param {number} actionType - тип действия
 * @returns {string} - понятное название
 */
export const getActionTypeName = (actionType) => {
    const actionNames = {
        [ActionType.REGISTER]: "Регистрация",
        [ActionType.UNKNOWN]: "Неизвестный",
        [ActionType.LOGIN]: "Вход",
        [ActionType.CREATE_DIRECTORY]: "Создание",
        [ActionType.UPLOAD_RESOURCE]: "Загрузка",
        [ActionType.DELETE_RESOURCE]: "Удаление",
        [ActionType.DOWNLOAD_RESOURCE]: "Скачивание",
        [ActionType.RENAME_RESOURCE]: "Переименование",
        [ActionType.MOVE_RESOURCE]: "Перемещение"
    };
    
    return actionNames[actionType] || "Неизвестно";
};

/**
 * Получить все доступные типы действий для фильтра
 * @returns {Array<{value: number, label: string}>}
 */
export const getActionTypeOptions = () => {
    return [
        { value: ActionType.REGISTER, label: getActionTypeName(ActionType.REGISTER) },
        { value: ActionType.UNKNOWN, label: getActionTypeName(ActionType.UNKNOWN) },
        { value: ActionType.LOGIN, label: getActionTypeName(ActionType.LOGIN) },
        { value: ActionType.CREATE_DIRECTORY, label: getActionTypeName(ActionType.CREATE_DIRECTORY) },
        { value: ActionType.UPLOAD_RESOURCE, label: getActionTypeName(ActionType.UPLOAD_RESOURCE) },
        { value: ActionType.DELETE_RESOURCE, label: getActionTypeName(ActionType.DELETE_RESOURCE) },
        { value: ActionType.DOWNLOAD_RESOURCE, label: getActionTypeName(ActionType.DOWNLOAD_RESOURCE) },
        { value: ActionType.RENAME_RESOURCE, label: getActionTypeName(ActionType.RENAME_RESOURCE) },
        { value: ActionType.MOVE_RESOURCE, label: getActionTypeName(ActionType.MOVE_RESOURCE) }
    ];
};

