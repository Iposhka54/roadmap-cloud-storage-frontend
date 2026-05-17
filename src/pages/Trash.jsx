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
import {sendGetTrash} from "../services/fetch/auth/storage/SendGetTrash.js";
import {sendRestoreFromTrash} from "../services/fetch/auth/storage/SendRestoreFromTrash.js";
import {sendDeleteFromTrash} from "../services/fetch/auth/storage/SendDeleteFromTrash.js";
import {sendEmptyTrash} from "../services/fetch/auth/storage/SendEmptyTrash.js";
import {sendDownloadTrashFile} from "../services/fetch/auth/storage/SendDownloadTrashFile.js";
import {useNotification} from "../context/Notification/NotificationProvider.jsx";
import {useStorageMeta} from "../context/Storage/StorageMetaProvider.jsx";
import {FileFormatIcon} from "../assets/FileFormatIcon.jsx";

const LoadingBox = () => (
    <Box sx={{ width: '100%', pt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress/>
    </Box>
);

const formatSize = (value) => bytes(value || 0, {decimalPlaces: 1});
const COUNTDOWN_SECONDS = 5;

const initialConfirmState = { open: false, type: null, title: '', description: '', confirmLabel: '', paths: [] };

const TrashConfirmModal = ({open, title, description, confirmLabel, onClose, onConfirm}) => (
    <Modal open={open} onClose={onClose}>
        <Slide in={open} direction={'down'} style={{transform: "translate(-50%, 0%)", marginTop: "70px"}}>
            <Card
                variant="outlined"
                sx={{
                    display: 'flex', flexDirection: 'column', width: {sm: '420px', xs: '100%'},
                    maxWidth: {sm: '420px', xs: '90%'}, padding: 2, gap: 2, margin: 'auto',
                    backgroundColor: "modal", backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                    boxShadow: 5, borderRadius: 2, position: "relative",
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 5, right: 5, width: '25px', height: '25px' }}>
                    <CloseIcon sx={{fontSize: '25px'}}/>
                </IconButton>
                <Typography variant="h5" textAlign="center" sx={{width: '100%', mb: -1}}>{title}</Typography>
                <Typography textAlign="center" color="text.secondary" sx={{fontSize: '15px'}}>{description}</Typography>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button size="small" variant="outlined" onClick={onClose}>Отмена</Button>
                    <Button size="small" variant="contained" color="error" onClick={onConfirm}>{confirmLabel}</Button>
                </Box>
            </Card>
        </Slide>
    </Modal>
);

const TrashSelectionHeader = ({ visible, selectedCount, canDownload, processing, pendingAction, onSelectAll, onRestore, onDownload, onDelete, onClose }) => (
    <Container
        sx={{
            zIndex: 2000,
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            top: visible ? '-6px' : '-80px',
            transition: 'top 0.2s ease-in-out',
            userSelect: 'none'
        }}
        disableGutters
    >
        <Toolbar
            sx={{
                height: "70px", border: '1px solid',
                background: 'linear-gradient(90deg, rgba(28,50,163,1) 0%, rgba(16,113,195,1) 100%)',
                borderRadius: 2, borderColor: 'info.dark', ml: '8px', mr: '8px'
            }}
        >
            <IconButton sx={{ position: 'absolute', bottom: 14, left: 7, width: '35px', height: '35px', color: 'white' }}>
                <CheckBoxOutlinedIcon sx={{fontSize: '20px'}}/>
            </IconButton>

            <Typography sx={{ width: '49%', pl: '45px', textAlign: 'left', position: 'absolute', bottom: 17, pointerEvents: 'none', left: 0, fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                {selectedCount === 1 ? '1 объект' : `${selectedCount} объектов`}
            </Typography>

            <Box sx={{display: 'flex', ml: 'auto', gap: 0.5}}>
                <IconButton onClick={onSelectAll} disabled={processing} sx={{ width: '35px', height: '35px', color: 'white' }}>
                    <DoneAllIcon sx={{fontSize: '20px'}}/>
                </IconButton>
                <IconButton onClick={onRestore} disabled={processing} sx={{ width: '35px', height: '35px', color: 'white' }}>
                    <RestoreFromTrashIcon sx={{fontSize: '20px'}}/>
                </IconButton>
                <IconButton onClick={onDownload} disabled={!canDownload || processing} sx={{ width: '35px', height: '35px', color: 'white', display: canDownload ? 'flex' : 'none' }}>
                    <DownloadIcon sx={{fontSize: '20px'}}/>
                </IconButton>
                <IconButton onClick={onDelete} disabled={processing || Boolean(pendingAction)} sx={{ width: '35px', height: '35px', color: 'white', backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' }, '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.5)' } }}>
                    <DeleteForeverIcon sx={{fontSize: '20px'}}/>
                </IconButton>
                <IconButton onClick={onClose} sx={{ width: '30px', height: '30px', color: 'white', backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}>
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
    const {refreshStorageInfo} = useStorageMeta();

    const loadTrash = useCallback(async ({silent = false} = {}) => {
        try {
            setLoading(true);
            const data = await sendGetTrash();
            setTrashItems(data);
            return data;
        } catch (error) {
            if (!silent) showError(error.message || "Не удалось загрузить корзину");
            return [];
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => { loadTrash(); }, [loadTrash]);

    const allSelected = trashItems.length > 0 && selectedIds.length === trashItems.length;

    const toggleSelection = (path) => {
        setSelectedIds((prev) => prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]);
    };

    const handleSelectAll = () => setSelectedIds(allSelected ? [] : trashItems.map((item) => item.path));
    const clearSelection = () => setSelectedIds([]);

    const runAction = async (action, successMessage) => {
        if (selectedIds.length === 0) { showWarn("Сначала выберите элементы"); return; }
        try {
            setProcessing(true);
            await action(selectedIds);
            showSuccess(successMessage, 5000);
            clearSelection();
            await Promise.all([loadTrash({silent: true}), refreshStorageInfo({silent: true})]);
        } catch (error) {
            showError(error.message || "Операция не выполнена");
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async () => await runAction(sendRestoreFromTrash, "Выбранные элементы восстановлены");
    const closeConfirm = () => setConfirmState(initialConfirmState);

    const schedulePendingAction = (action) => {
        if (destructiveTimeoutRef.current) window.clearTimeout(destructiveTimeoutRef.current);
        const actionWithExpiresAt = { ...action, expiresAt: Date.now() + COUNTDOWN_SECONDS * 1000 };
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
                await Promise.all([loadTrash({silent: true}), refreshStorageInfo({silent: true})]);
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
        if (pendingAction?.paths?.length) setSelectedIds(pendingAction.paths);
        setPendingAction(null);
        setPendingSecondsLeft(COUNTDOWN_SECONDS);
        showInfo("Удаление отменено", 3000);
    };

    useEffect(() => {
        if (!pendingAction) { setPendingSecondsLeft(COUNTDOWN_SECONDS); return; }
        const intervalId = window.setInterval(() => {
            const secondsLeft = Math.max(0, Math.ceil((pendingAction.expiresAt - Date.now()) / 1000));
            setPendingSecondsLeft(secondsLeft);
        }, 200);
        return () => window.clearInterval(intervalId);
    }, [pendingAction]);

    useEffect(() => { return () => { if (destructiveTimeoutRef.current) window.clearTimeout(destructiveTimeoutRef.current); }; }, []);

    const requestDeleteForever = () => {
        if (selectedIds.length === 0) { showWarn("Сначала выберите элементы"); return; }
        if (pendingAction) { showWarn("Уже есть удаление, которое можно отменить"); return; }
        setConfirmState({
            open: true, type: 'delete-selected', title: 'Удалить навсегда?',
            description: selectedIds.length === 1 ? 'Объект будет окончательно удален из корзины.' : `Будут окончательно удалены ${selectedIds.length} объектов из корзины.`,
            confirmLabel: 'Удалить', paths: selectedIds,
        });
    };

    const handleDownload = async () => {
        if (selectedIds.length !== 1) { showWarn("Для скачивания выберите один элемент"); return; }
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
        if (trashItems.length === 0) { showWarn("Корзина уже пуста"); return; }
        if (pendingAction) { showWarn("Уже есть удаление, которое можно отменить"); return; }
        setConfirmState({
            open: true, type: 'empty-trash', title: 'Очистить корзину?',
            description: `Все ${trashItems.length} объектов будут окончательно удалены из корзины.`,
            confirmLabel: 'Очистить', paths: [],
        });
    };

    const handleConfirmAction = () => {
        if (confirmState.type === 'delete-selected') schedulePendingAction({ type: 'delete-selected', paths: confirmState.paths });
        if (confirmState.type === 'empty-trash') schedulePendingAction({ type: 'empty-trash', paths: trashItems.map((item) => item.path) });
        closeConfirm();
    };

    return (
        <Box sx={{height: '100%'}}>
            <TrashSelectionHeader
                visible={selectedIds.length > 0} selectedCount={selectedIds.length}
                canDownload={selectedIds.length === 1} processing={processing}
                pendingAction={pendingAction} onSelectAll={handleSelectAll}
                onRestore={handleRestore} onDownload={handleDownload}
                onDelete={requestDeleteForever} onClose={clearSelection}
            />

            <Container disableGutters sx={{mt: 12, width: '100%'}}>
                <Box sx={{p: 1, pb: 4}}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2, border: '1px solid', borderColor: 'divider',
                            backgroundColor: 'header', backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)', boxShadow: 4, overflow: 'hidden',
                        }}
                    >
                        {/* Новая компактная панель управления корзиной */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Удаленные файлы ({trashItems.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="outlined" startIcon={<RefreshIcon/>} onClick={() => loadTrash()} disabled={loading || processing}>
                                    Обновить
                                </Button>
                                <Button size="small" variant="contained" color="error" startIcon={<DeleteSweepIcon/>} onClick={requestEmptyTrash} disabled={processing || trashItems.length === 0 || Boolean(pendingAction)}>
                                    Очистить
                                </Button>
                            </Box>
                        </Box>

                        {loading ? (
                            <LoadingBox/>
                        ) : trashItems.length === 0 ? (
                            <Box sx={{p: 8, textAlign: 'center'}}>
                                <Typography variant="h6" sx={{mb: 1, fontWeight: 600}}>Корзина пуста</Typography>
                                <Typography variant="body2" color="text.secondary">Здесь будут храниться удаленные файлы и папки.</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                {trashItems.map((item, index) => {
                                    const selected = selectedIds.includes(item.path);
                                    return (
                                        <React.Fragment key={item.path}>
                                            <Box
                                                onClick={() => toggleSelection(item.path)}
                                                sx={{
                                                    p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                                                    backgroundColor: selected ? 'objectSelected' : 'transparent',
                                                    '&:hover': { backgroundColor: selected ? 'objectSelected' : 'objectHover' },
                                                    opacity: pendingAction?.type === 'empty-trash' || pendingAction?.paths?.includes(item.path) ? 0.55 : 1,
                                                }}
                                            >
                                                <Checkbox checked={selected} onChange={() => toggleSelection(item.path)} onClick={(e) => e.stopPropagation()} disabled={processing}/>
                                                <Box sx={{width: 28, display: 'flex', justifyContent: 'center'}}>
                                                    <FileFormatIcon name={item.name} style="list"/>
                                                </Box>
                                                <Box sx={{minWidth: 0, flexGrow: 1}}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.folder ? item.name.slice(0, -1) : item.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.path}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{minWidth: 90, textAlign: 'right'}}>
                                                    {formatSize(item.size)}
                                                </Typography>
                                            </Box>
                                            {index < trashItems.length - 1 && <Divider/>}
                                        </React.Fragment>
                                    );
                                })}
                            </Box>
                        )}
                    </Card>
                </Box>
            </Container>

            <TrashConfirmModal open={confirmState.open} title={confirmState.title} description={confirmState.description} confirmLabel={confirmState.confirmLabel} onClose={closeConfirm} onConfirm={handleConfirmAction}/>
            <Snackbar open={Boolean(pendingAction)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} sx={{mb: 2}}>
                <Alert severity="warning" variant="filled" action={<Button color="inherit" size="small" onClick={cancelPendingAction}>Отменить</Button>} sx={{ width: '100%', alignItems: 'center', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}>
                    {pendingAction?.type === 'empty-trash' ? `Очистка корзины через ${pendingSecondsLeft} сек.` : `Удаление ${pendingAction?.paths?.length || 0} объектов через ${pendingSecondsLeft} сек.`}
                </Alert>
            </Snackbar>
        </Box>
    );
}