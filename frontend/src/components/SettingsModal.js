import React from 'react';
import { X, Globe, Bug } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({
    apiEndpoint,
    setApiEndpoint,
    debugMode,
    setDebugMode,
    onClose
}) => {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="setting-group">
                        <label className="setting-label">
                            <Globe size={16} />
                            API Endpoint
                        </label>
                        <input
                            type="text"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            placeholder="http://127.0.0.1:8000/segment"
                            className="setting-input"
                        />
                        <p className="setting-description">
                            URL of your SAM segmentation API endpoint. Make sure the server is running.
                        </p>
                    </div>

                    <div className="setting-group">
                        <label className="setting-checkbox">
                            <input
                                type="checkbox"
                                checked={debugMode}
                                onChange={(e) => setDebugMode(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <div className="checkbox-label">
                                <Bug size={16} />
                                Enable Debug Mode
                            </div>
                        </label>
                        <p className="setting-description">
                            Show debug console with detailed logging information in the sidebar.
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
