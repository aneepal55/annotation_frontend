import React from 'react';
import { Upload, Download, Trash2, Settings, Zap } from 'lucide-react';
import './Header.css';

const Header = ({
    onUpload,
    onSave,
    onClear,
    onSettings,
    hasAnnotations,
    hasImage
}) => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo">
                        <h1>Image Annotation Tool with SAM Integration</h1>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={onUpload}
                        title="Upload Image (Ctrl+O)"
                    >
                        <Upload size={16} />
                        Upload Image
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={onSave}
                        disabled={!hasAnnotations}
                        title="Save Annotations (Ctrl+S)"
                    >
                        <Download size={16} />
                        Save
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={onClear}
                        disabled={!hasAnnotations}
                        title="Clear All (Ctrl+D)"
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>

                    <button
                        className="btn btn-ghost"
                        onClick={onSettings}
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            {hasImage && (
                <div className="header-hint">
                    <p>💡 Click and drag on the image to create bounding boxes for segmentation</p>
                </div>
            )}
        </header>
    );
};

export default Header;
