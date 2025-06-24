import Login from "./page/Login.tsx"
import {useState} from "react";

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

    return (
        <>
            <Login setAuthState={setAuthState} username={authState.username} password={authState.password} doLogin={doLogin}/>
        </>
    )
}

export default App
