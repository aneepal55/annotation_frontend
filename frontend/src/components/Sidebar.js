import React from 'react';
import { Trash2, Code, Clock } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ annotations, onDeleteAnnotation, debugMode, debugLogs }) => {
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const formatCoords = (coords) => {
        return `(${coords.x1}, ${coords.y1}) → (${coords.x2}, ${coords.y2})`;
    };

    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">
                    Annotations
                    <span className="annotation-counter">{annotations.length}</span>
                </h3>

                {annotations.length === 0 ? (
                    <div className="empty-state">
                        <p>No annotations yet</p>
                        <small>Draw bounding boxes on the image to create annotations</small>
                    </div>
                ) : (
                    <div className="annotations-list">
                        {annotations.map((annotation, index) => (
                            <div key={annotation.id} className="annotation-item">
                                <div className="annotation-header">
                                    <span className="annotation-label">
                                        Box {index + 1}
                                    </span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => onDeleteAnnotation(annotation.id)}
                                        title="Delete annotation"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="annotation-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Coordinates:</span>
                                        <span className="detail-value coords">
                                            {formatCoords(annotation.originalImageCoords)}
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">Size:</span>
                                        <span className="detail-value">
                                            {annotation.originalImageCoords.width} × {annotation.originalImageCoords.height}
                                        </span>
                                    </div>

                                    {annotation.timestamp && (
                                        <div className="detail-row">
                                            <span className="detail-label">
                                                <Clock size={12} />
                                                Created:
                                            </span>
                                            <span className="detail-value timestamp">
                                                {formatTimestamp(annotation.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* JSON Export Preview */}
            {annotations.length > 0 && (
                <div className="sidebar-section">
                    <h4 className="subsection-title">
                        <Code size={16} />
                        JSON Preview
                    </h4>
                    <div className="json-preview">
                        <pre>{JSON.stringify(annotations, null, 2)}</pre>
                    </div>
                </div>
            )}

            {/* Debug Panel */}
            {debugMode && (
                <div className="sidebar-section debug-section">
                    <h4 className="subsection-title">
                        Debug Console
                    </h4>
                    <div className="debug-console">
                        {debugLogs.length === 0 ? (
                            <p className="debug-empty">No debug logs yet</p>
                        ) : (
                            debugLogs.slice(-20).map((log, index) => (
                                <div key={index} className="debug-entry">
                                    <span className="debug-timestamp">[{log.timestamp}]</span>
                                    <span className="debug-message">{log.message}</span>
                                    {log.data && (
                                        <div className="debug-data">{log.data}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
