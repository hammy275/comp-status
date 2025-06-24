import {Typography} from "@mui/material";
import { Link } from "react-router";

function Page404() {
    return (
        <>
            <Typography variant="h3">Page Not Found!</Typography>
            <br/>
            <Link to="/"><Typography variant="h5">Get ouf of here!</Typography></Link>
        </>
    )
}

export default Page404