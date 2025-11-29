import React from 'react';

const ConfirmModal = ({ 
    show, 
    onHide, 
    onConfirm, 
    title = "Konfirmasi", 
    message = "Apakah Anda yakin?",
    confirmText = "Ya",
    cancelText = "Batal",
    variant = "danger"
}) => {
    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onHide}
                        >
                            {cancelText}
                        </button>
                        <button 
                            type="button" 
                            className={`btn btn-${variant}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;