import { useState } from "react";

export default function useConfirmDialog() {
    const [dialog, setDialog] = useState({
        open: false,
        title: "Konfirmasi",
        message: "",
        confirmText: "Ya",
        cancelText: "Batal",
        onConfirm: null,
    });

    const openConfirm = ({
        title = "Konfirmasi",
        message = "",
        confirmText = "Ya",
        cancelText = "Batal",
        onConfirm,
    }) => {
        setDialog({
            open: true,
            title,
            message,
            confirmText,
            cancelText,
            onConfirm,
        });
    };

    const closeConfirm = () => {
        setDialog((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const handleConfirm = async () => {
        if (!dialog.onConfirm) return;

        await dialog.onConfirm();

        closeConfirm();
    };

    return {
        dialog,
        openConfirm,
        closeConfirm,
        handleConfirm,
    };
}