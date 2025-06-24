import {useNavigate} from "react-router";
import {useEffect} from "react";

interface IndexProps {
    loggedIn: boolean
}

function Index({loggedIn}: IndexProps) {
    let navigate = useNavigate();
    useEffect(() => {
        if (loggedIn) {
            navigate("/status");
        } else {
            navigate("/login");
        }
    });
    return (<></>)
}

export default Index