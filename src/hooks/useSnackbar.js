import { useState } from "react";

const defaultAnchorOrigin = {
    vertical: "bottom",
    horizontal: "right",
};

export default function useSnackbar() {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
        anchorOrigin: defaultAnchorOrigin,
        duration: 2222,
    });

    const showSnackbar = ({
        message,
        severity = "success",
        anchorOrigin = defaultAnchorOrigin,
        duration = 2222,
    }) => {
    setSnackbar({
        open: true,
        message,
        severity,
        anchorOrigin,
        duration,
        });
    };

    const closeSnackbar = () => {
        setSnackbar((prev) => ({
        ...prev,
        open: false,
        }));
    };

    return {
        snackbar,
        showSnackbar,
        closeSnackbar,
    };
}