import React, {useContext} from 'react';
import { Redirect } from 'react-router-dom';

import { login } from '../services/AuthService';
import UserContext from '../services/UserContext';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import {ReactComponent as ASLogo} from "../assets/logo.svg";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3),
        position: "absolute",
        margin: "auto",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "400px",
        height: "300px",
        borderRadius: "4px",
        background: "#fff"
    },
    button: {
        height: 40,
    }
}));

const Login = () => {
    const classes = useStyles();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { user, setUser } = useContext(UserContext);

    if(user) return <Redirect to="/"/>

    let validateForm = () => (username.length > 0 && password.length > 0);
    
    const handleLogin = (event) => {
        event.preventDefault();

        login(username, password, setUser);
    }

    return (
        <Container className={classes.container} maxWidth="xs">
        <ASLogo className="login-logo"/>
        <form onSubmit={handleLogin}>
            <Grid container spacing={1}>
            <Grid item xs={12}>
                <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField fullWidth label="Email" name="email" variant="outlined" onChange={e => setUsername(e.target.value)}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    variant="outlined"
                    onChange={e => setPassword(e.target.value)}
                    />
                </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Button className={classes.button} color="primary" fullWidth type="submit" variant="contained" disabled={!validateForm()}>
                Log in
                </Button>
            </Grid>
            </Grid>
        </form>
    </Container>
    )
}

export default Login;