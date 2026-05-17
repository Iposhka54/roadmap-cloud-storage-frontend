import {Box, Card, CircularProgress, Container, FormControl, InputLabel, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getAuditRecords} from "../services/fetch/auth/admin/GetAuditRecords.js";
import {getActionTypeName, getActionTypeOptions} from "../services/util/ActionType.js";
import {useNotification} from "../context/Notification/NotificationProvider.jsx";
import {useAuthContext} from "../context/Auth/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

export default function Audit() {
    const {auth} = useAuthContext();
    const navigate = useNavigate();
    const {showError} = useNotification();

    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    
    const [usernameFilter, setUsernameFilter] = useState('');
    const [actionTypeFilter, setActionTypeFilter] = useState('');
    
    const actionTypeOptions = getActionTypeOptions();

    useEffect(() => {
        // Проверяем, что пользователь - админ
        if (!auth.isAuthenticated || auth.user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
    }, [auth, navigate]);

    useEffect(() => {
        loadAuditData();
    }, [page, usernameFilter, actionTypeFilter]);

    const loadAuditData = async () => {
        try {
            setLoading(true);
            const username = usernameFilter.trim() || null;
            const actionType = actionTypeFilter !== '' ? parseInt(actionTypeFilter) : null;
            
            const data = await getAuditRecords({
                username,
                actionType,
                page,
                size
            });
            
            setAuditData(data);
        } catch (error) {
            console.error('Ошибка при загрузке аудита:', error);
            showError('Не удалось загрузить данные аудита');
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameChange = (event) => {
        setUsernameFilter(event.target.value);
        setPage(0); // Сбрасываем на первую страницу при изменении фильтра
    };

    const handleActionTypeChange = (event) => {
        setActionTypeFilter(event.target.value);
        setPage(0); // Сбрасываем на первую страницу при изменении фильтра
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1); // MUI Pagination использует 1-based индексацию
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    if (!auth.isAuthenticated || auth.user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <Container disableGutters sx={{mt: 10, mb: 5, px: 2}}>
            <Box sx={{maxWidth: '1200px', mx: 'auto'}}>
                <Typography variant="h4" sx={{mb: 3, mt: 2}}>
                    Журнал аудита
                </Typography>

                {/* Фильтры */}
                <Card sx={{p: 3, mb: 3, backgroundColor: 'searchInput'}}>
                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                        <TextField
                            label="Имя пользователя"
                            value={usernameFilter}
                            onChange={handleUsernameChange}
                            placeholder="Введите имя пользователя"
                            sx={{minWidth: 200, flexGrow: 1}}
                            size="small"
                        />
                        <FormControl sx={{minWidth: 200}} size="small">
                            <InputLabel>Тип действия</InputLabel>
                            <Select
                                value={actionTypeFilter}
                                onChange={handleActionTypeChange}
                                label="Тип действия"
                            >
                                <MenuItem value="">
                                    <em>Все</em>
                                </MenuItem>
                                {actionTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Card>

                {/* Таблица */}
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 5}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} sx={{backgroundColor: 'searchInput'}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold'}}>Пользователь</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>Тип действия</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>Описание</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>Время</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {auditData?.content && auditData.content.length > 0 ? (
                                        auditData.content.map((record, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{record.username || '-'}</TableCell>
                                                <TableCell>
                                                    {getActionTypeName(record.actionType)}
                                                </TableCell>
                                                <TableCell>{record.action || '-'}</TableCell>
                                                <TableCell>{formatDate(record.actionTime)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{py: 3}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Записи не найдены
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {auditData && auditData.totalPages > 1 && (
                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                <Pagination
                                    count={auditData.totalPages}
                                    page={page + 1}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}

                        {/* Информация о количестве записей */}
                        {auditData && (
                            <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>
                                Показано {auditData.content?.length || 0} из {auditData.totalElements || 0} записей
                            </Typography>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
}