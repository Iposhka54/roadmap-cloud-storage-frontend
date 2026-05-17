import {AppBar, Box, Container, Toolbar} from "@mui/material";
import DarkModeSwitcher from "./DarkModeSwitcher.jsx";
import MainLabel from "./MainLabel.jsx";
import {HeaderSearchField} from "../InputElements/HeaderSearchField.jsx";
import {useAuthContext} from "../../context/Auth/AuthContext.jsx";
import {Settings} from "./SettingsMenu/Settings.jsx";
import {SelectHeader} from "../Selection/SelectHeader/SelectHeader.jsx";
import {FileButton} from "./FileButton.jsx";
import {useLocation} from "react-router-dom";


export default function Header() {
    const {auth} = useAuthContext();
    const location = useLocation();
    const isFilesRoute = location.pathname.startsWith('/files');

    return (
        <AppBar component="nav" position="fixed" elevation={0}
                sx={{
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderBottom: "1px solid ",
                    backgroundColor: 'header',
                    borderColor: 'divider',
                    height: "64px",
                }}
        >

            <SelectHeader/>

            <Container disableGutters>
                <Toolbar sx={{height: "65px",}} disableGutters>
                    <MainLabel/>

                    <Box sx={{flexGrow: 1, height: 1}}/>
                    {auth.isAuthenticated && !isFilesRoute && <FileButton/>}
                    {auth.isAuthenticated && isFilesRoute && <HeaderSearchField/>}

                    <DarkModeSwitcher/>

                    <Settings/>

                </Toolbar>

            </Container>
        </AppBar>
    )
};
