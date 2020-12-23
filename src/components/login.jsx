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
import { Snackbar } from '@material-ui/core';

import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
    const [snackBarOpen, setSnackBarOpen] = React.useState(0);
    const { user, setUser } = useContext(UserContext);

    const snackBarCodes = {
        "Invalid username or password.": 401,
        "Too many authentication requests. Account has been locked.": 429
    }

    const getSnackBarCode = (code) => {
        if(!snackBarCodes) return "Error"
        for (var [name, snackBarCode] of Object.entries(snackBarCodes)) {
            if(snackBarCode === code) return name
        }
    }

    if(user) return <Redirect to="/"/>

    let validateForm = () => (username.length > 0 && password.length > 0);
    
    const handleLogin = async (event) => {
        event.preventDefault();

        const result = await login(username, password, setUser);

        if(result === 200) return 
        setSnackBarOpen(result)
    }

    return (
        <Container className={classes.container} maxWidth="xs">
        <ASLogo className="login-logo"/>
        <form onSubmit={handleLogin}>
            <Grid container spacing={1}>
            <Grid item xs={12}>
                <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField fullWidth label="Username" name="username" variant="outlined" onChange={e => setUsername(e.target.value)}/>
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
        <Snackbar open={snackBarOpen !== 0} autoHideDuration={6000} onClose={() => setSnackBarOpen(0)}>
            <Alert onClose={() => setSnackBarOpen(0)} severity="error">
                {
                  getSnackBarCode(snackBarOpen)
                }
            </Alert>
        </Snackbar>
    </Container>
    )
}

export default Login;