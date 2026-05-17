import {Box, Card, LinearProgress, Tab, Tabs, Typography} from "@mui/material";
import bytes from "bytes";
import {useLocation, useNavigate} from "react-router-dom";
import {useStorageMeta} from "../../context/Storage/StorageMetaProvider.jsx";

const normalizeBytes = (value) => bytes(value || 0, {decimalPlaces: 1});

const resolveTabValue = (pathname) => {
    if (pathname.startsWith('/trash')) {
        return '/trash';
    }

    if (pathname.startsWith('/tariffs')) {
        return '/tariffs';
    }

    return '/files';
};

export const StorageTabsBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {storageInfo, storageInfoLoading, currentTariff} = useStorageMeta();

    const totalSpace = storageInfo?.totalSpace ?? 0;
    const usedSpace = storageInfo?.usedSpace ?? 0;
    const activeSpace = storageInfo?.activeSpace ?? 0;
    const trashSpace = storageInfo?.trashSpace ?? 0;
    const progress = totalSpace > 0 ? Math.min((usedSpace / totalSpace) * 100, 100) : 0;

    return (
        <Box
            sx={{
                mt: 8,
                px: 1,
                width: '100%',
                position: 'fixed',
                transform: 'translateX(-50%)',
                left: '50%',
                zIndex: 3,
            }}
        >
            <Card
                elevation={0}
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'header',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: 4,
                }}
            >
                <Tabs
                    value={resolveTabValue(location.pathname)}
                    onChange={(_, value) => navigate(value)}
                    variant="fullWidth"
                    sx={{mb: 1}}
                >
                    <Tab value="/files" label="Файлы"/>
                    <Tab value="/trash" label="Корзина"/>
                    <Tab value="/tariffs" label="Тарифы"/>
                </Tabs>

                <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 1.5, alignItems: {md: 'center'}}}>
                    <Box sx={{flexGrow: 1}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1}}>
                            <Typography variant="body2" fontWeight={600}>
                                Занято {normalizeBytes(usedSpace)} из {normalizeBytes(totalSpace)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {progress.toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant={storageInfoLoading ? "indeterminate" : "determinate"}
                            value={progress}
                            sx={{
                                height: 10,
                                borderRadius: 99,
                                backgroundColor: 'rgba(125,125,125,0.2)',
                            }}
                        />
                    </Box>

                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5}}>
                        <Typography variant="caption" color="text.secondary">
                            Активные: <Box component="span" sx={{color: 'text.primary', fontWeight: 600}}>{normalizeBytes(activeSpace)}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Корзина: <Box component="span" sx={{color: 'text.primary', fontWeight: 600}}>{normalizeBytes(trashSpace)}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Тариф: <Box component="span" sx={{color: 'text.primary', fontWeight: 600}}>{currentTariff || '—'}</Box>
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};