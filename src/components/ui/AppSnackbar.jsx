import {
    Snackbar,
    Alert,
} from "@mui/material";

export default function AppSnackbar({
    open,
    message,
    severity,
    anchorOrigin,
    duration,
    onClose,
    sx,
        }) 
    {
        return (
            <Snackbar
                open={open}
                onClose={onClose}
                autoHideDuration={duration}
                anchorOrigin={anchorOrigin}
            >
            <Alert
                severity={severity}
                variant="filled"
                onClose={onClose}
                sx={sx}
            >
                {message}
            </Alert>
            </Snackbar>
    );
}