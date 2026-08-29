import { useState } from "react";

export default function useDialog(initialState = false) {
    const [open, setOpen] = useState(initialState);

    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    return {
        open,
        openDialog,
        closeDialog,
    };
}