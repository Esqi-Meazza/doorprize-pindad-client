import AppDialog from "../ui/AppDialog";

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Ya",
    cancelText = "Batal",
}) {
    return (
        <AppDialog
            open={open}
            onClose={onClose}
            title={title}
            actions={
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white"
                    >
                        {confirmText}
                    </button>
                </div>
            }
        >
            {message}
        </AppDialog>
    );
}