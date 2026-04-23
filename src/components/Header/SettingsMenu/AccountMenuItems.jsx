import {Divider, ListItemIcon, MenuItem} from "@mui/material";
import {GitHub, Logout, History} from "@mui/icons-material";
import {sendLogout} from "../../../services/fetch/auth/user/SendLogout.js";
import {useAuthContext} from "../../../context/Auth/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {useNotification} from "../../../context/Notification/NotificationProvider.jsx";
import {GITHUB_INFO} from "../../../UrlConstants.jsx";


export const accountMenuItems = (openProfileModal, openSecurityModal) => {
    const {logout, auth} = useAuthContext();
    const navigate = useNavigate();
    const {showInfo, showError} = useNotification();

    const handleLogout = async () => {
        try {
            await sendLogout();
            logout();
            setTimeout(() => {
                navigate("/login");
                showInfo("Выход успешно выполнен", 4000);
            }, 400);
        } catch (error) {
            showError(error.message);
            logout();
            console.log('Unknown error occurred! ');
        }
    }

    const handleAuditClick = () => {
        navigate("/audit");
    }

    const isAdmin = auth?.user?.role === 'ADMIN';

    return (
        <>

            <MenuItem
                component="a"
                href={GITHUB_INFO}
                target="_blank"
                rel="noopener noreferrer"
                sx={{'&:hover': {textDecoration: 'none', color: 'inherit',}}}
            >
                <ListItemIcon>
                    <GitHub fontSize="small"/>
                </ListItemIcon>
                Исходный код проекта
            </MenuItem>
            {isAdmin && (
                <>
                    <MenuItem onClick={handleAuditClick}>
                        <ListItemIcon>
                            <History fontSize="small"/>
                        </ListItemIcon>
                        Журнал аудита
                    </MenuItem>
                </>
            )}
            <Divider/>
            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <Logout fontSize="small"/>
                </ListItemIcon>
                Выход
            </MenuItem>
        </>
    )
}