import './App.css'

import {BrowserRouter, Route, Routes} from "react-router-dom";
import {BaseLayout} from "./pages/BaseLayout.jsx";
import {GlobalProvider} from "./context/GlobalProvider.jsx";
import {SignIn} from "./pages/SignIn.jsx";
import {SignUp} from "./pages/SignUp.jsx";
import Index from "./pages/Index.jsx";
import UnavailableAfterLoginRoute from "./context/Auth/UnavailableAfterLoginRoute.jsx";
import AvailableAfterLoginRoute from "./context/Auth/AvailableAfterLoginRoute.jsx";
import Files from "./pages/Files.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Audit from "./pages/Audit.jsx";
import Trash from "./pages/Trash.jsx";
import Tariffs from "./pages/Tariffs.jsx";

function App() {


    return (
        <BrowserRouter>
            <GlobalProvider>
                <Routes>
                    <Route element={<BaseLayout/>}>
                        <Route index element={<Index/>}/>

                        <Route path="*" element={<ErrorPage />}/>

                        {/*available before login only*/}
                        <Route path="login"
                               element={
                                   <UnavailableAfterLoginRoute>
                                       <SignIn/>
                                   </UnavailableAfterLoginRoute>
                               }/>

                        <Route path="registration"
                               element={
                                   <UnavailableAfterLoginRoute>
                                       <SignUp/>
                                   </UnavailableAfterLoginRoute>
                               }/>

                        {/*available after login only*/}

                        <Route path="files/*"
                               element={
                                   <AvailableAfterLoginRoute>
                                       <Files/>
                                   </AvailableAfterLoginRoute>
                               }/>

                        <Route path="trash"
                               element={
                                   <AvailableAfterLoginRoute>
                                       <Trash/>
                                   </AvailableAfterLoginRoute>
                               }/>

                        <Route path="tariffs"
                               element={
                                   <AvailableAfterLoginRoute>
                                       <Tariffs/>
                                   </AvailableAfterLoginRoute>
                               }/>

                        <Route path="audit"
                               element={
                                   <AvailableAfterLoginRoute>
                                       <Audit/>
                                   </AvailableAfterLoginRoute>
                               }/>

                    </Route>
                </Routes>
            </GlobalProvider>
        </BrowserRouter>
    )
}

export default App
