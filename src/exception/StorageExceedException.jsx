
class StorageExceedException extends Error {
    constructor(message, rejectedFiles = [], options = {}) {
        super(message || "Недостаточно свободного места в хранилище");
        this.rejectedFiles = rejectedFiles;
        this.partialUpload = Boolean(options.partialUpload);
    }
}
export default StorageExceedException;