import {Box, Button, Card, Chip, CircularProgress, Container, Stack, Typography} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import bytes from "bytes";
import {useStorageMeta} from "../context/Storage/StorageMetaProvider.jsx";

const tariffDescriptions = {
    BASIC: "Базовый тариф для личного использования и хранения повседневных файлов.",
    PREMIUM: "Расширенный тариф для больших коллекций документов, фото и рабочих материалов.",
    ENTERPRISE: "Максимальный тариф для крупных архивов и интенсивной работы с хранилищем."
};

const formatSize = (value) => bytes(value || 0, {decimalPlaces: 1});

export default function Tariffs() {
    const { tariffs, currentTariff, changeTariff, changingTariff, storageInfo, tariffsLoading } = useStorageMeta();

    return (
        <Box sx={{height: '100%'}}>

            <Container disableGutters sx={{mt: 12, width: '100%'}}>
                <Box sx={{p: 1, pb: 4}}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                            backgroundColor: 'header', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 4,
                        }}
                    >
                        <Typography variant="h5" sx={{fontSize: '22px', fontWeight: 700}}>
                            Тарифы
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                            Выберите подходящий тариф. Активный тариф подсвечивается, а после переключения
                            лимит хранилища обновится автоматически.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 1}}>
                            Текущий тариф: <Typography component="span" fontWeight={600} color="text.primary">{currentTariff || '—'}</Typography> •
                            Текущий лимит: <Typography component="span" fontWeight={600} color="text.primary">{formatSize(storageInfo?.totalSpace || 0)}</Typography>
                        </Typography>
                    </Card>

                    {tariffsLoading ? (
                        <Card elevation={0} sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'header', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 4 }}>
                            <CircularProgress/>
                        </Card>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.5 }}>
                            {tariffs.map((item) => {
                                const isCurrent = item.current || item.tariff === currentTariff;

                                return (
                                    <Card
                                        key={item.tariff} elevation={0}
                                        sx={{
                                            p: 2, minHeight: 260, display: 'flex', flexDirection: 'column', borderRadius: 2,
                                            border: '1px solid', borderColor: isCurrent ? 'primary.main' : 'divider',
                                            background: isCurrent ? 'linear-gradient(180deg, rgba(28,50,163,0.16) 0%, rgba(16,113,195,0.08) 100%)' : 'header',
                                            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 4,
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{mb: 1.5}}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <WorkspacePremiumIcon color={isCurrent ? 'primary' : 'action'}/>
                                                <Typography variant="h6" sx={{fontWeight: 700}}>{item.tariff}</Typography>
                                            </Stack>
                                            {isCurrent && <Chip icon={<CheckCircleOutlineIcon/>} color="primary" label="Выбран" size="small" />}
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{tariffDescriptions[item.tariff]}</Typography>

                                        <Box sx={{mt: 'auto'}}>
                                            <Typography variant="caption" color="text.secondary">Лимит хранилища</Typography>
                                            <Typography variant="h4" sx={{fontSize: '30px', fontWeight: 800, mb: 1.5}}>{formatSize(item.size)}</Typography>

                                            {isCurrent && (
                                                <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1.5}}>
                                                    Сейчас используется: {formatSize(storageInfo?.usedSpace || 0)}
                                                </Typography>
                                            )}

                                            <Button fullWidth variant={isCurrent ? 'outlined' : 'contained'} disabled={isCurrent || changingTariff} onClick={() => changeTariff(item.tariff)}>
                                                {isCurrent ? 'Текущий тариф' : 'Выбрать тариф'}
                                            </Button>
                                        </Box>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
}