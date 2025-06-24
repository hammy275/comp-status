import Login from "./page/Login.tsx"
import {useState} from "react";
import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import ComputerStatus from "./page/ComputerStatus.tsx";
import {Route, Routes} from "react-router";
import Index from "./page/Index.tsx";
import Page404 from "./page/Page404.tsx";

function App() {
    const [authState, doSetAuthState] = useState({username: "", password: ""});

    function setAuthState(changes: any) {
        doSetAuthState({
            ...authState,
            ...changes
        });
    }

    function doLogin() {
        console.log("TODO: Auth");
    }

    function fakeComputerData() {
        return {
            Computer1: {
                cpu_usage: 12.5,
                current_memory: 32.0,
                used_memory: 15.8
            },
            Computer2: {
                cpu_usage: 33.3,
                current_memory: 16.0,
                used_memory: 4.3,
                cpu_pack_temp: 55.2
            }
        }
    }

    return (
        <>
            <AppBar position="static">
                <Box sx={{marginLeft: "1rem"}}>
                    <Toolbar disableGutters>
                        <Typography variant="h5">comp-status</Typography>
                    </Toolbar>
                </Box>
            </AppBar>
            <Box sx={{margin: "1rem"}}>
                <Routes>
                    <Route path="/login" element={<Login setAuthState={setAuthState} username={authState.username} password={authState.password} doLogin={doLogin}/>}/>
                    <Route path="/status" element={<ComputerStatus data={fakeComputerData()}/>}/>
                    <Route path="/" element={<Index loggedIn={false}/>}/>
                    <Route path="*" element={<Page404/>}/>
                </Routes>
            </Box>
        </>
    )
}

export default App
