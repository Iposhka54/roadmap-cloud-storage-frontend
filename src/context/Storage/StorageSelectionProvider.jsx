import React, {createContext, useContext, useEffect, useState} from "react";


const CloudStorageContext = createContext();

export const useStorageSelection = () => useContext(CloudStorageContext);


export const StorageSelectionProvider = ({children}) => {
    const [isSelectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteMode, setDeleteMode] = useState(false);

    const [isCutMode, setCutMode] = useState(false);
    const [isCopyMode, setCopyMode] = useState(false);

    const [bufferIds, setBufferIds] = useState([]);

    useEffect(() => {
        if (selectedIds.length === 0) {
            setDeleteMode(false);
        }
    }, [selectedIds]);

    const startDeleteMode = () => {
        if (selectedIds.length > 0) {
            setDeleteMode(true);
        }
    }

    const endDeleteMode = () => {
        setDeleteMode(false);
    }



    const startCutting = () => {
        setBufferIds(selectedIds);
        setCutMode(true);
        setCopyMode(false);
        setDeleteMode(false);

        setSelectedIds([]);
        setSelectionMode(false);
    }

    const startCopying = () => {
        setBufferIds(selectedIds);
        setCopyMode(true);
        setCutMode(false);
        setDeleteMode(false);

        setSelectedIds([]);
        setSelectionMode(false);
    }

    const endCutting = () => {
        setBufferIds([]);
        setCutMode(false);
    }

    const endCopying = () => {
        setBufferIds([]);
        setCopyMode(false);
    }

    return (<CloudStorageContext.Provider
        value={{
            isSelectionMode,
            setSelectionMode,
            selectedIds,
            setSelectedIds,
            isDeleteMode,
            setDeleteMode,
            startDeleteMode,
            endDeleteMode,

            bufferIds,

            isCutMode,
            isCopyMode,
            startCopying,
            startCutting,
            endCutting,
            endCopying
        }}>
        {children}
    </CloudStorageContext.Provider>);
}