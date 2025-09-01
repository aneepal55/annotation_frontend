import React from 'react';
import { Loader } from 'lucide-react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="spinner">
                    <Loader className="spinner-icon" size={32} />
                </div>
                <h3>Processing with SAM</h3>
                <p>Generating segmentation mask...</p>
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
