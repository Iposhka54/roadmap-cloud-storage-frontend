const isProduction = import.meta.env.MODE === "production"; // Определяем режим окружения


export const API_BASE_URL = isProduction ? window.APP_CONFIG.baseUrl :
    "http://localhost:8080"
;

export const API_CONTEXT = window.APP_CONFIG.baseApi;



//unauth
export const API_REGISTRATION = API_BASE_URL + API_CONTEXT + '/auth/sign-up';
export const API_LOGIN = API_BASE_URL + API_CONTEXT + '/auth/sign-in';
export const API_LOGOUT = API_BASE_URL + API_CONTEXT + '/auth/sign-out';

export const API_DIRECTORY = API_BASE_URL + API_CONTEXT + '/directory';
export const API_FILES = API_BASE_URL + API_CONTEXT + '/resource';
export const API_FILES_SEARCH  = API_FILES + '/search';
export const API_DOWNLOAD_FILES  = API_FILES + '/download';
export const API_MOVE_FILES = API_FILES + '/move';
export const API_TRASH = API_FILES + '/trash';
export const API_TRASH_RESTORE = API_TRASH + '/restore';
export const API_DOWNLOAD_TRASH = API_TRASH + '/download';
export const API_TRASH_ITEMS = API_TRASH + '/items';

export const API_USER_INFO = API_BASE_URL + API_CONTEXT + '/user/me';
export const API_CHANGE_TARIFF = API_BASE_URL + API_CONTEXT + '/user/tariff';

export const API_TARIFFS = API_BASE_URL + API_CONTEXT + '/tariff';

export const API_STORAGE = API_BASE_URL + API_CONTEXT + '/storage';
export const API_STORAGE_INFO = API_STORAGE + '/info';

export const API_ADMIN_AUDIT = API_BASE_URL + API_CONTEXT + '/admin/audit';

export const GITHUB_INFO = window.APP_CONFIG.githubLink