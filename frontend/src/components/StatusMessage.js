import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './StatusMessage.css';

const StatusMessage = ({ status }) => {
    const { message, type } = status;

    if (!message) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={16} />;
            case 'error':
                return <AlertCircle size={16} />;
            case 'info':
            default:
                return <Info size={16} />;
        }
    };

    const getClassName = () => {
        return `status-message ${type}`;
    };

    return (
        <div className={getClassName()}>
            <div className="status-content">
                {getIcon()}
                <span className="status-text">{message}</span>
            </div>
        </div>
    );
};

export default StatusMessage;
