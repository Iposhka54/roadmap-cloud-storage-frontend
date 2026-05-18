import {AppBar, Box, Container, IconButton, Toolbar, Tooltip, CircularProgress} from "@mui/material";
import DarkModeSwitcher from "./DarkModeSwitcher.jsx";
import MainLabel from "./MainLabel.jsx";
import {HeaderSearchField} from "../InputElements/HeaderSearchField.jsx";
import {useAuthContext} from "../../context/Auth/AuthContext.jsx";
import {Settings} from "./SettingsMenu/Settings.jsx";
import {SelectHeader} from "../Selection/SelectHeader/SelectHeader.jsx";
import {FileButton} from "./FileButton.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import {useStorageMeta} from "../../context/Storage/StorageMetaProvider.jsx";
import bytes from "bytes";

const normalizeBytes = (value) => bytes(value || 0, {decimalPlaces: 1});

export default function Header() {
    const {auth} = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();

    // Безопасно достаем данные, чтобы не падало при первичной загрузке
    const meta = useStorageMeta() || {};
    const {storageInfo, storageInfoLoading, currentTariff} = meta;

    const isFilesRoute = location.pathname.startsWith('/files');
    const isTrashRoute = location.pathname.startsWith('/trash');
    const isTariffsRoute = location.pathname.startsWith('/tariffs');

    const totalSpace = storageInfo?.totalSpace ?? 0;
    const usedSpace = storageInfo?.usedSpace ?? 0;
    const progress = totalSpace > 0 ? Math.min((usedSpace / totalSpace) * 100, 100) : 0;

    return (
        <AppBar component="nav" position="fixed" elevation={0}
                sx={{
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderBottom: "1px solid ",
                    backgroundColor: 'header',
                    borderColor: 'divider',
                    height: "64px",
                    zIndex: 1100, // Гарантируем, что Header всегда сверху
                }}
        >
            <SelectHeader/>

            <Container disableGutters>
                <Toolbar sx={{height: "65px",}} disableGutters>
                    <MainLabel/>

                    <Box sx={{flexGrow: 1, height: 1}}/>

                    {auth?.isAuthenticated && !isFilesRoute && <FileButton/>}
                    {auth?.isAuthenticated && isFilesRoute && <HeaderSearchField/>}

                    {auth?.isAuthenticated && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>

                            <Tooltip
                                title={`Занято ${normalizeBytes(usedSpace)} из ${normalizeBytes(totalSpace)} (${progress.toFixed(0)}%). Тариф: ${currentTariff || '—'}`}
                                arrow
                            >
                                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 1, cursor: 'help' }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={100}
                                        size={28}
                                        thickness={5}
                                        sx={{ color: 'rgba(125,125,125,0.2)', position: 'absolute' }}
                                    />
                                    <CircularProgress
                                        variant={storageInfoLoading ? "indeterminate" : "determinate"}
                                        value={progress}
                                        size={28}
                                        thickness={5}
                                        color={progress > 90 ? "error" : progress > 70 ? "warning" : "primary"}
                                    />
                                </Box>
                            </Tooltip>

                            <Tooltip title="Корзина">
                                <IconButton
                                    onClick={() => navigate('/trash')}
                                    color={isTrashRoute ? "primary" : "default"}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Тарифы">
                                <IconButton
                                    onClick={() => navigate('/tariffs')}
                                    color={isTariffsRoute ? "primary" : "default"}
                                >
                                    <WorkspacePremiumIcon />
                                </IconButton>
                            </Tooltip>

                        </Box>
                    )}

                    <DarkModeSwitcher/>
                    <Settings/>

                </Toolbar>
            </Container>
        </AppBar>
    )
};