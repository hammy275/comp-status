import {Button, Checkbox, FormControlLabel, Grid, Stack, TextField} from "@mui/material";

interface LoginProps {
    setAuthState: (changes: any) => void;
    username: string;
    password: string;
    doLogin: () => void;
}

function Login({setAuthState, username, password, doLogin}: LoginProps) {
    return (
        <Grid container spacing={2}>
            <Grid size={3}>
                <Stack spacing={2}>
                    <TextField fullWidth id="username" label="Username" variant="outlined" autoComplete="username"
                               value={username}
                               onChange={event => setAuthState({username: event.target.value})}/>
                    <TextField fullWidth id="password" label="Password" variant="outlined" type="password"
                               autoComplete="password" value={password}
                               onChange={event => setAuthState({password: event.target.value})}/>
                </Stack>
            </Grid>
            <Grid size={9}></Grid>
            <Grid size={3}>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" size="large" onClick={doLogin}>Login</Button>
                    <FormControlLabel control={<Checkbox id="remember_me"/>} label="Remember Me"/>
                </Stack>
            </Grid>
        </Grid>
    )
}

export default Login