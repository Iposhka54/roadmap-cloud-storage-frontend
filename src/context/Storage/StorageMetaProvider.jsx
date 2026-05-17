import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useAuthContext} from "../Auth/AuthContext.jsx";
import {sendGetStorageInfo} from "../../services/fetch/auth/storage/SendGetStorageInfo.js";
import {sendGetTariffs} from "../../services/fetch/auth/tariff/SendGetTariffs.js";
import {sendChangeTariff} from "../../services/fetch/auth/user/SendChangeTariff.js";
import {useNotification} from "../Notification/NotificationProvider.jsx";

const StorageMetaContext = createContext(null);

export const useStorageMeta = () => useContext(StorageMetaContext);

export const StorageMetaProvider = ({children}) => {
    const {auth} = useAuthContext();
    const {showError, showSuccess} = useNotification();

    const [storageInfo, setStorageInfo] = useState(null);
    const [storageInfoLoading, setStorageInfoLoading] = useState(false);

    const [tariffs, setTariffs] = useState([]);
    const [tariffsLoading, setTariffsLoading] = useState(false);
    const [changingTariff, setChangingTariff] = useState(false);

    const clearMeta = () => {
        setStorageInfo(null);
        setTariffs([]);
    };

    const refreshStorageInfo = async ({silent = false} = {}) => {
        if (!auth.isAuthenticated) {
            setStorageInfo(null);
            return null;
        }

        try {
            setStorageInfoLoading(true);
            const info = await sendGetStorageInfo();
            setStorageInfo(info);
            return info;
        } catch (error) {
            if (!silent) {
                showError(error.message || "Не удалось загрузить информацию о хранилище");
            }
            return null;
        } finally {
            setStorageInfoLoading(false);
        }
    };

    const refreshTariffs = async ({silent = false} = {}) => {
        if (!auth.isAuthenticated) {
            setTariffs([]);
            return [];
        }

        try {
            setTariffsLoading(true);
            const data = await sendGetTariffs();
            setTariffs(data);
            return data;
        } catch (error) {
            if (!silent) {
                showError(error.message || "Не удалось загрузить тарифы");
            }
            return [];
        } finally {
            setTariffsLoading(false);
        }
    };

    const refreshStorageMeta = async ({silent = false} = {}) => {
        await Promise.all([
            refreshStorageInfo({silent}),
            refreshTariffs({silent})
        ]);
    };

    const changeTariff = async (tariff) => {
        setChangingTariff(true);
        try {
            const updatedTariff = await sendChangeTariff(tariff);
            showSuccess(`Тариф ${updatedTariff} успешно подключен`, 4000);
            await refreshStorageMeta({silent: true});
            return updatedTariff;
        } catch (error) {
            showError(error.message || "Не удалось сменить тариф");
            throw error;
        } finally {
            setChangingTariff(false);
        }
    };

    useEffect(() => {
        if (!auth.isAuthenticated) {
            clearMeta();
            return;
        }

        refreshStorageMeta({silent: true});
    }, [auth.isAuthenticated]);

    const currentTariff = useMemo(() => {
        return tariffs.find((item) => item.current)?.tariff ?? null;
    }, [tariffs]);

    return (
        <StorageMetaContext.Provider value={{
            storageInfo,
            storageInfoLoading,
            refreshStorageInfo,
            tariffs,
            tariffsLoading,
            refreshTariffs,
            refreshStorageMeta,
            currentTariff,
            changeTariff,
            changingTariff,
        }}>
            {children}
        </StorageMetaContext.Provider>
    );
};