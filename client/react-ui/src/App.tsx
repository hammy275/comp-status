import Login from "./page/Login.tsx"
import {useState} from "react";
import {Divider} from "@mui/material";
import ComputerStatus from "./page/ComputerStatus.tsx";

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
            <Login setAuthState={setAuthState} username={authState.username} password={authState.password} doLogin={doLogin}/>
            <Divider/>
            <ComputerStatus data={fakeComputerData()}/>
        </>
    )
}

export default App
