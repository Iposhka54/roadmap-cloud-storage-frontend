import {
    AppBar,
    Box,
    Container,
    IconButton,
    Toolbar,
    Tooltip,
    CircularProgress,
    Typography // <-- Обязательно добавлено сюда
} from "@mui/material";
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
    const {storageInfo, storageInfoLoading, currentTariff} = useStorageMeta();

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
                    zIndex: 1100,
                }}
        >
            <SelectHeader/>

            <Container disableGutters>
                <Toolbar sx={{height: "65px",}} disableGutters>
                    <MainLabel/>

                    <Box sx={{flexGrow: 1, height: 1}}/>

                    {auth.isAuthenticated && !isFilesRoute && <FileButton/>}
                    {auth.isAuthenticated && isFilesRoute && <HeaderSearchField/>}

                    {auth.isAuthenticated && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>

                            {!isFilesRoute && (
                                <Tooltip
                                    title={`Занято ${normalizeBytes(usedSpace)} из ${normalizeBytes(totalSpace)} (${progress.toFixed(0)}%)`}
                                    arrow
                                >
                                    <IconButton
                                        color={isTariffsRoute ? "primary" : "default"}
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                            <CircularProgress
                                                variant="determinate"
                                                value={100}
                                                size={36}
                                                thickness={4}
                                                sx={{ color: 'rgba(125,125,125,0.2)', position: 'absolute' }}
                                            />

                                            <CircularProgress
                                                variant={storageInfoLoading ? "indeterminate" : "determinate"}
                                                value={progress}
                                                size={36}
                                                thickness={4}
                                                color={progress > 90 ? "error" : progress > 70 ? "warning" : "primary"}
                                            />

                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '10px', fontWeight: 700 }}
                                                >
                                                    {storageInfoLoading ? '...' : `${Math.round(progress)}%`}
                                                </Typography>
                                            </Box>

                                        </Box>
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip title="Корзина">
                                <IconButton
                                    onClick={() => navigate('/trash')}
                                    color={isTrashRoute ? "primary" : "default"}
                                    sx={{
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': { transform: 'scale(1.1)' }
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Тарифы">
                                <IconButton
                                    onClick={() => navigate('/tariffs')}
                                    color={isTariffsRoute ? "primary" : "default"}
                                    sx={{
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
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
}