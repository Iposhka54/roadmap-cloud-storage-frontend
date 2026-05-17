export const mapTrashObjectToFrontFormat = (object) => {
    const isDirectory = object.type === "DIRECTORY";
    const name = isDirectory && !object.name.endsWith("/")
        ? `${object.name}/`
        : object.name;

    const path = isDirectory && !object.path.endsWith("/")
        ? `${object.path}/`
        : object.path;

    return {
        lastModified: null,
        name,
        size: object.size ?? 0,
        path,
        folder: isDirectory,
    };
};