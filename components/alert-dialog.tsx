import React from "react";

interface AlertDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
    open,
    title,
    description,
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                {description && <p className="mb-4 text-gray-700">{description}</p>}
                <div className="flex justify-end gap-2">
                    {/* <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button> */}
                    <button
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertDialog;