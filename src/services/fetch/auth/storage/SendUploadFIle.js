import axios from "axios";
import {API_FILES} from "../../../../UrlConstants.jsx";
import bytes from "bytes";


export async function sendUpload(files, updateDownloadTask, updateTask, uploadTask, currPath) {


    console.log("Файлы загружен на фронт: ");
    console.log(files);

    const formData = new FormData();
    files.forEach(({file, path}) => {
        formData.append("object", file, path);
    })
    formData.append("path", currPath);


    try {
        console.log("Отправляем файлы на бэк ");

        const response = await axios.post(API_FILES, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
                updateTask(uploadTask, "progress", "Загружаем... " + bytes(progressEvent.rate) + "/c");
                if (progressEvent.progress === 1) {
                    updateTask(uploadTask, "progress", "Сохраняем в хранилище...")
                }

                updateDownloadTask(uploadTask, progressEvent.progress * 100);
            },
        });

        if (response.status === 201) {
            updateTask(uploadTask, "completed", "Загружено");
            return {success: true};
        }
    } catch (error) {
        console.log(error);

        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 409) {
            updateTask(uploadTask, "error", "Файл/папка с таким именем уже существует в целевой папке!");
            return {success: false};

        } else if (status === 400 && Array.isArray(data?.rejectedFiles)) {
            const rejectedFiles = data.rejectedFiles;
            const allRejected = rejectedFiles.length >= files.length;
            const suffix = rejectedFiles.length > 3
                ? ` и еще ${rejectedFiles.length - 3}`
                : '';
            const listedRejected = rejectedFiles.slice(0, 3).join(', ');

            updateTask(
                uploadTask,
                allRejected ? "error" : "warning",
                allRejected
                    ? "Недостаточно места в хранилище"
                    : `Загружено частично: ${listedRejected}${suffix}`
            );

            return {
                success: !allRejected,
                quotaError: {
                    message: data?.message || (allRejected
                        ? "Недостаточно места в хранилище"
                        : "Некоторые файлы не загрузились из-за нехватки места"),
                    rejectedFiles,
                    partialUpload: !allRejected,
                }
            };

        } else {
            updateTask(uploadTask, "error", "Ошибка при загрузке. Попробуйте позже");
            return {success: false};
        }
    }


}
