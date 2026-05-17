import * as React from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Modal,
    Slide,
    Snackbar,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import bytes from "bytes";
import {StorageTabsBar} from "../components/Header/StorageTabsBar.jsx";
import {sendGetTrash} from "../services/fetch/auth/storage/SendGetTrash.js";
import {sendRestoreFromTrash} from "../services/fetch/auth/storage/SendRestoreFromTrash.js";
import {sendDeleteFromTrash} from "../services/fetch/auth/storage/SendDeleteFromTrash.js";
import {sendEmptyTrash} from "../services/fetch/auth/storage/SendEmptyTrash.js";
import {sendDownloadTrashFile} from "../services/fetch/auth/storage/SendDownloadTrashFile.js";
import {useNotification} from "../context/Notification/NotificationProvider.jsx";
import {useStorageMeta} from "../context/Storage/StorageMetaProvider.jsx";
import {FileFormatIcon} from "../assets/FileFormatIcon.jsx";

const LoadingBox = () => (
    <Box
        sx={{
            width: '100%',
            pt: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <CircularProgress/>
    </Box>
);

const formatSize = (value) => bytes(value || 0, {decimalPlaces: 1});
const COUNTDOWN_SECONDS = 5;

const initialConfirmState = {
    open: false,
    type: null,
    title: '',
    description: '',
    confirmLabel: '',
    paths: [],
};

const TrashConfirmModal = ({open, title, description, confirmLabel, onClose, onConfirm}) => (
    <Modal open={open} onClose={onClose}>
        <Slide in={open} direction={'down'} style={{transform: "translate(-50%, 0%)", marginTop: "70px"}}>
            <Card
                variant="outlined"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: {sm: '420px', xs: '100%'},
                    maxWidth: {sm: '420px', xs: '90%'},
                    padding: 2,
                    gap: 2,
                    margin: 'auto',
                    backgroundColor: "modal",
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    boxShadow: 5,
                    borderRadius: 2,
                    position: "relative",
                }}
            >
                <IconButton
                    aria-label="close"
                    size="small"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: '25px',
                        height: '25px',
                    }}
                >
                    <CloseIcon sx={{fontSize: '25px'}}/>
                </IconButton>

                <Typography variant="h5" textAlign="center" sx={{width: '100%', mb: -1}}>
                    {title}
                </Typography>

                <Typography textAlign="center" color="text.secondary" sx={{fontSize: '15px'}}>
                    {description}
                </Typography>

                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button size="small" variant="outlined" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button size="small" variant="contained" color="error" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </Box>
            </Card>
        </Slide>
    </Modal>
);

const TrashPageHeader = ({
    selectedVisible,
    itemCount,
    trashSpace,
    loading,
    processing,
    pendingAction,
    allSelected,
    onRefresh,
    onSelectAll,
    onEmptyTrash,
}) => (
    <Container
        disableGutters
        sx={{
            mt: 22,
            width: '100%',
            position: 'fixed',
            transform: 'translateX(-50%)',
            left: '50%',
            zIndex: 2,
            transition: 'opacity 0.2s ease-in-out',
            opacity: selectedVisible ? 0.25 : 1,
            pointerEvents: selectedVisible ? 'none' : 'auto',
        }}
    >
        <Box sx={{p: 1}}>
            <Card
                elevation={0}
                sx={{
                    backgroundColor: "header",
                    width: "100%",
                    boxShadow: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    minHeight: '110px'
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        pt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    <Box>
                        <Typography variant="h5" sx={{fontSize: '22px', fontWeight: 700}}>
                            Корзина
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                            Элементов: {itemCount} • Размер корзины: {formatSize(trashSpace)}
                        </Typography>
                    </Box>

                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon/>}
                            onClick={onRefresh}
                            disabled={loading || processing}
                        >
                            Обновить
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DoneAllIcon/>}
                            onClick={onSelectAll}
                            disabled={loading || processing || itemCount === 0}
                        >
                            {allSelected ? 'Снять выделение' : 'Выбрать все'}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteSweepIcon/>}
                            onClick={onEmptyTrash}
                            disabled={processing || itemCount === 0 || Boolean(pendingAction)}
                        >
                            Очистить корзину
                        </Button>
                    </Stack>
                </Box>
            </Card>
        </Box>
    </Container>
);

const TrashSelectionHeader = ({
    visible,
    selectedCount,
    canDownload,
    processing,
    pendingAction,
    onSelectAll,
    onRestore,
    onDownload,
    onDelete,
    onClose,
}) => (
    <Container
        sx={{
            zIndex: 5,
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            top: visible ? '170px' : '96px',
            transition: 'top 0.2s ease-in-out',
            userSelect: 'none'
        }}
        disableGutters
    >
        <Toolbar
            sx={{
                height: "70px",
                border: '1px solid',
                background: 'linear-gradient(90deg, rgba(28,50,163,1) 0%, rgba(16,113,195,1) 100%)',
                borderRadius: 2,
                borderColor: 'info.dark',
                ml: '8px',
                mr: '8px',
                userSelect: 'none'
            }}
        >
            <IconButton
                sx={{
                    position: 'absolute',
                    bottom: 14,
                    left: 7,
                    width: '35px',
                    height: '35px',
                    color: 'white',
                }}
            >
                <CheckBoxOutlinedIcon sx={{fontSize: '20px'}}/>
            </IconButton>

            <Typography
                sx={{
                    width: '49%',
                    pl: '45px',
                    textAlign: 'left',
                    position: 'absolute',
                    bottom: 17,
                    pointerEvents: 'none',
                    left: 0,
                    fontSize: '18px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'white',
                }}
            >
                {selectedCount === 1 ? '1 объект' : `${selectedCount} объектов`}
            </Typography>

            <Box sx={{display: 'flex', ml: 'auto', gap: 0.5}}>
                <IconButton
                    onClick={onSelectAll}
                    disabled={processing}
                    sx={{
                        width: '35px',
                        height: '35px',
                        color: 'white',
                    }}
                >
                    <DoneAllIcon sx={{fontSize: '20px'}}/>
                </IconButton>

                <IconButton
                    onClick={onRestore}
                    disabled={processing}
                    sx={{
                        width: '35px',
                        height: '35px',
                        color: 'white',
                    }}
                >
                    <RestoreFromTrashIcon sx={{fontSize: '20px'}}/>
                </IconButton>

                <IconButton
                    onClick={onDownload}
                    disabled={!canDownload || processing}
                    sx={{
                        width: '35px',
                        height: '35px',
                        color: 'white',
                    }}
                >
                    <DownloadIcon sx={{fontSize: '20px'}}/>
                </IconButton>

                <IconButton
                    onClick={onDelete}
                    disabled={processing || Boolean(pendingAction)}
                    sx={{
                        width: '35px',
                        height: '35px',
                        color: 'white',
                        backgroundColor: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.dark',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.5)',
                        }
                    }}
                >
                    <DeleteForeverIcon sx={{fontSize: '20px'}}/>
                </IconButton>

                <IconButton
                    onClick={onClose}
                    sx={{
                        width: '30px',
                        height: '30px',
                        color: 'white',
                        backgroundColor: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.dark',
                        }
                    }}
                >
                    <CloseIcon sx={{fontSize: '25px'}}/>
                </IconButton>
            </Box>
        </Toolbar>
    </Container>
);

export default function Trash() {
    const [trashItems, setTrashItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmState, setConfirmState] = useState(initialConfirmState);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingSecondsLeft, setPendingSecondsLeft] = useState(COUNTDOWN_SECONDS);

    const destructiveTimeoutRef = useRef(null);

    const {showError, showInfo, showSuccess, showWarn} = useNotification();
    const {refreshStorageInfo, storageInfo} = useStorageMeta();

    const loadTrash = useCallback(async ({silent = false} = {}) => {
        try {
            setLoading(true);
            const data = await sendGetTrash();
            setTrashItems(data);
            return data;
        } catch (error) {
            if (!silent) {
                showError(error.message || "Не удалось загрузить корзину");
            }
            return [];
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadTrash();
    }, [loadTrash]);

    const selectedItems = useMemo(
        () => trashItems.filter((item) => selectedIds.includes(item.path)),
        [trashItems, selectedIds]
    );

    const allSelected = trashItems.length > 0 && selectedIds.length === trashItems.length;

    const toggleSelection = (path) => {
        setSelectedIds((prev) => prev.includes(path)
            ? prev.filter((id) => id !== path)
            : [...prev, path]);
    };

    const handleSelectAll = () => {
        setSelectedIds(allSelected ? [] : trashItems.map((item) => item.path));
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const runAction = async (action, successMessage) => {
        if (selectedIds.length === 0) {
            showWarn("Сначала выберите элементы");
            return;
        }

        try {
            setProcessing(true);
            await action(selectedIds);
            showSuccess(successMessage, 5000);
            clearSelection();
            await Promise.all([
                loadTrash({silent: true}),
                refreshStorageInfo({silent: true})
            ]);
        } catch (error) {
            showError(error.message || "Операция не выполнена");
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async () => {
        await runAction(sendRestoreFromTrash, "Выбранные элементы восстановлены");
    };

    const closeConfirm = () => {
        setConfirmState(initialConfirmState);
    };

    const schedulePendingAction = (action) => {
        if (destructiveTimeoutRef.current) {
            window.clearTimeout(destructiveTimeoutRef.current);
        }

        const actionWithExpiresAt = {
            ...action,
            expiresAt: Date.now() + COUNTDOWN_SECONDS * 1000,
        };

        setPendingAction(actionWithExpiresAt);
        setPendingSecondsLeft(COUNTDOWN_SECONDS);
        clearSelection();

        destructiveTimeoutRef.current = window.setTimeout(async () => {
            setPendingAction(null);
            destructiveTimeoutRef.current = null;

            try {
                setProcessing(true);

                if (action.type === 'delete-selected') {
                    await sendDeleteFromTrash(action.paths);
                    showSuccess("Выбранные элементы удалены навсегда", 5000);
                }

                if (action.type === 'empty-trash') {
                    await sendEmptyTrash();
                    showSuccess("Корзина очищена", 5000);
                }

                await Promise.all([
                    loadTrash({silent: true}),
                    refreshStorageInfo({silent: true})
                ]);
            } catch (error) {
                showError(error.message || "Операция не выполнена");
            } finally {
                setProcessing(false);
            }
        }, COUNTDOWN_SECONDS * 1000);
    };

    const cancelPendingAction = () => {
        if (destructiveTimeoutRef.current) {
            window.clearTimeout(destructiveTimeoutRef.current);
            destructiveTimeoutRef.current = null;
        }

        if (pendingAction?.paths?.length) {
            setSelectedIds(pendingAction.paths);
        }

        setPendingAction(null);
        setPendingSecondsLeft(COUNTDOWN_SECONDS);
        showInfo("Удаление отменено", 3000);
    };

    useEffect(() => {
        if (!pendingAction) {
            setPendingSecondsLeft(COUNTDOWN_SECONDS);
            return;
        }

        const intervalId = window.setInterval(() => {
            const secondsLeft = Math.max(0, Math.ceil((pendingAction.expiresAt - Date.now()) / 1000));
            setPendingSecondsLeft(secondsLeft);
        }, 200);

        return () => window.clearInterval(intervalId);
    }, [pendingAction]);

    useEffect(() => {
        return () => {
            if (destructiveTimeoutRef.current) {
                window.clearTimeout(destructiveTimeoutRef.current);
            }
        };
    }, []);

    const requestDeleteForever = () => {
        if (selectedIds.length === 0) {
            showWarn("Сначала выберите элементы");
            return;
        }

        if (pendingAction) {
            showWarn("Уже есть удаление, которое можно отменить");
            return;
        }

        setConfirmState({
            open: true,
            type: 'delete-selected',
            title: 'Удалить навсегда?',
            description: selectedIds.length === 1
                ? 'Объект будет окончательно удален из корзины.'
                : `Будут окончательно удалены ${selectedIds.length} объектов из корзины.`,
            confirmLabel: 'Удалить',
            paths: selectedIds,
        });
    };

    const handleDownload = async () => {
        if (selectedIds.length !== 1) {
            showWarn("Для скачивания выберите один элемент");
            return;
        }

        try {
            setProcessing(true);
            await sendDownloadTrashFile(selectedIds[0]);
        } catch (error) {
            showError(error.message || "Не удалось скачать объект из корзины");
        } finally {
            setProcessing(false);
        }
    };

    const requestEmptyTrash = async () => {
        if (trashItems.length === 0) {
            showWarn("Корзина уже пуста");
            return;
        }

        if (pendingAction) {
            showWarn("Уже есть удаление, которое можно отменить");
            return;
        }

        setConfirmState({
            open: true,
            type: 'empty-trash',
            title: 'Очистить корзину?',
            description: `Все ${trashItems.length} объектов будут окончательно удалены из корзины.`,
            confirmLabel: 'Очистить',
            paths: [],
        });
    };

    const handleConfirmAction = () => {
        if (confirmState.type === 'delete-selected') {
            schedulePendingAction({
                type: 'delete-selected',
                paths: confirmState.paths,
            });
        }

        if (confirmState.type === 'empty-trash') {
            schedulePendingAction({
                type: 'empty-trash',
                paths: trashItems.map((item) => item.path),
            });
        }

        closeConfirm();
    };

    return (
        <Box sx={{height: '100%'}}>
            <StorageTabsBar/>

            <TrashSelectionHeader
                visible={selectedIds.length > 0}
                selectedCount={selectedIds.length}
                canDownload={selectedIds.length === 1}
                processing={processing}
                pendingAction={pendingAction}
                onSelectAll={handleSelectAll}
                onRestore={handleRestore}
                onDownload={handleDownload}
                onDelete={requestDeleteForever}
                onClose={clearSelection}
            />

            <TrashPageHeader
                selectedVisible={selectedIds.length > 0}
                itemCount={trashItems.length}
                trashSpace={storageInfo?.trashSpace ?? 0}
                loading={loading}
                processing={processing}
                pendingAction={pendingAction}
                allSelected={allSelected}
                onRefresh={() => loadTrash()}
                onSelectAll={handleSelectAll}
                onEmptyTrash={requestEmptyTrash}
            />

            <Container disableGutters sx={{mt: 36, width: '100%'}}>
                <Box sx={{p: 1, pb: 4}}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'header',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: 4,
                            overflow: 'hidden',
                        }}
                    >
                        {loading ? (
                            <LoadingBox/>
                        ) : trashItems.length === 0 ? (
                            <Box sx={{p: 5, textAlign: 'center'}}>
                                <Typography variant="h6" sx={{mb: 1}}>
                                    Корзина пуста
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Удаленные файлы и папки появятся здесь.
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {trashItems.map((item, index) => {
                                    const selected = selectedIds.includes(item.path);

                                    return (
                                        <React.Fragment key={item.path}>
                                            <Box
                                                onClick={() => toggleSelection(item.path)}
                                                sx={{
                                                    p: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    cursor: 'pointer',
                                                    backgroundColor: selected ? 'objectSelected' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: selected ? 'objectSelected' : 'objectHover',
                                                    },
                                                    opacity: pendingAction?.type === 'empty-trash'
                                                        || pendingAction?.paths?.includes(item.path)
                                                        ? 0.55
                                                        : 1,
                                                }}
                                            >
                                                <Checkbox
                                                    checked={selected}
                                                    onChange={() => toggleSelection(item.path)}
                                                    onClick={(event) => event.stopPropagation()}
                                                    disabled={processing}
                                                />

                                                <Box sx={{width: 28, display: 'flex', justifyContent: 'center'}}>
                                                    <FileFormatIcon name={item.name} style="list"/>
                                                </Box>

                                                <Box sx={{minWidth: 0, flexGrow: 1}}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {item.folder ? item.name.slice(0, -1) : item.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {item.path}
                                                    </Typography>
                                                </Box>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{minWidth: 120, textAlign: 'right'}}
                                                >
                                                    {formatSize(item.size)}
                                                </Typography>
                                            </Box>
                                            {index < trashItems.length - 1 && <Divider/>}
                                        </React.Fragment>
                                    );
                                })}
                            </>
                        )}
                    </Card>
                </Box>
            </Container>

            <TrashConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                description={confirmState.description}
                confirmLabel={confirmState.confirmLabel}
                onClose={closeConfirm}
                onConfirm={handleConfirmAction}
            />

            <Snackbar
                open={Boolean(pendingAction)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                sx={{mb: 2}}
            >
                <Alert
                    severity="warning"
                    variant="filled"
                    action={
                        <Button color="inherit" size="small" onClick={cancelPendingAction}>
                            Отменить
                        </Button>
                    }
                    sx={{
                        width: '100%',
                        alignItems: 'center',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                    }}
                >
                    {pendingAction?.type === 'empty-trash'
                        ? `Очистка корзины будет выполнена через ${pendingSecondsLeft} сек.`
                        : `Удаление ${pendingAction?.paths?.length || 0} объектов будет выполнено через ${pendingSecondsLeft} сек.`}
                </Alert>
            </Snackbar>
        </Box>
    );
}