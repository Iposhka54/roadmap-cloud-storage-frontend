import UnauthorizedException from "./UnauthorizedException.jsx";
import ConflictException from "./ConflictException.jsx";
import ForbiddenException from "./ForbiddenException.jsx";
import NotFoundException from "./NotFoundException.jsx";
import StorageExceedException from "./StorageExceedException.jsx";
import BadRequestException from "./BadRequestException.jsx";


export const throwSpecifyException = (status, detail) => {

    if (status === 400 && detail?.rejectedFiles) {
        const rejectedFiles = Array.isArray(detail.rejectedFiles) ? detail.rejectedFiles : [];
        throw new StorageExceedException(
            detail.message || "Недостаточно свободного места в хранилище",
            rejectedFiles,
            {partialUpload: rejectedFiles.length > 0}
        );
    }

    switch (status) {
        case 400:
            throw new BadRequestException(detail.message);
        case 401:
            throw new UnauthorizedException(detail.message);
        case 409:
            throw new ConflictException(detail.message);
        case 403:
            throw new ForbiddenException(detail.message);

        case 404:
            throw new NotFoundException(detail.message);

        case 413:
            throw new StorageExceedException(detail.message);
        default:
            throw new Error('Unknown error');
    }

}