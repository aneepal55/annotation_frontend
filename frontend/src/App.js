import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Trash2, Eye, EyeOff, Settings, Zap, Image as ImageIcon } from 'lucide-react';
import './App.css';
import ImageCanvas from './components/ImageCanvas';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import StatusMessage from './components/StatusMessage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageFile, setCurrentImageFile] = useState(null);
    const [annotations, setAnnotations] = useState([]);
    const [maskUrl, setMaskUrl] = useState(null);
    const [maskVisible, setMaskVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [showSettings, setShowSettings] = useState(false);
    const [apiEndpoint, setApiEndpoint] = useState('http://127.0.0.1:8000/segment');
    const [debugMode, setDebugMode] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);

    const fileInputRef = useRef(null);
    let boxIdCounter = useRef(0);

    const log = useCallback((message, data) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            data: data !== undefined ? (typeof data === 'object' ? JSON.stringify(data) : data) : null
        };

        console.log(`[${timestamp}] ${message}`, data);

        if (debugMode) {
            setDebugLogs(prev => [...prev.slice(-49), logEntry]);
        }
    }, [debugMode]);

    const showStatus = useCallback((message, type = 'info') => {
        setStatus({ message, type });
        log('Status', `${type}: ${message}`);

        if (type === 'success') {
            setTimeout(() => {
                setStatus({ message: '', type: '' });
            }, 3000);
        }
    }, [log]);

    const handleFileUpload = useCallback((file) => {
        if (!file) return;

        setCurrentImageFile(file);
        log('Image selected', file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            setCurrentImage(event.target.result);
            clearAnnotations();
            log('Image loaded');
            showStatus('Image loaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }, [log, showStatus]);

    const clearAnnotations = useCallback(() => {
        setAnnotations([]);
        setMaskUrl(null);
        boxIdCounter.current = 0;
        log('All annotations cleared');
        showStatus('Annotations cleared', 'info');
    }, [log, showStatus]);

    const saveAnnotations = useCallback(() => {
        if (annotations.length === 0) {
            showStatus('No annotations to save', 'error');
            return;
        }

        const dataStr = JSON.stringify(annotations, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'annotations.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        log('Annotations saved', 'annotations.json');
        showStatus('Annotations saved successfully', 'success');
    }, [annotations, log, showStatus]);

    const getSamMask = useCallback(async (annotation) => {
        if (!currentImageFile) {
            showStatus('No image file available', 'error');
            return;
        }

        if (!apiEndpoint.trim()) {
            showStatus('Please configure API endpoint in settings', 'error');
            return;
        }

        setIsLoading(true);
        showStatus('Requesting mask from SAM...', 'info');
        log('Preparing API request for annotation', annotation.id);

        const formData = new FormData();
        formData.append('image', currentImageFile);

        const coords = annotation.originalImageCoords;
        const boxParam = `${coords.x1},${coords.y1},${coords.x2},${coords.y2}`;
        formData.append('box', boxParam);

        log('Box coordinates', boxParam);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData
            });

            log('API response received', {
                status: response.status,
                ok: response.ok,
                type: response.headers.get('content-type')
            });

            if (!response.ok) {
                const errorText = await response.text();
                log('Error response body', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('image/')) {
                const responseText = await response.text();
                log('Non-image response', responseText);
                throw new Error('Server did not return an image');
            }

            const blob = await response.blob();
            log('Response blob received', {
                type: blob.type,
                size: blob.size
            });

            if (blob.size === 0) {
                throw new Error('Received empty image');
            }

            if (maskUrl) {
                URL.revokeObjectURL(maskUrl);
            }

            const newMaskUrl = URL.createObjectURL(blob);
            setMaskUrl(newMaskUrl);
            setMaskVisible(true);

            log('Mask URL created', newMaskUrl);
            showStatus('Mask generated successfully', 'success');

        } catch (error) {
            log('Error in API request', error.message);
            showStatus(`Error getting mask: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentImageFile, apiEndpoint, maskUrl, log, showStatus]);

    const handleNewAnnotation = useCallback((boxData) => {
        const boxId = `box-${boxIdCounter.current++}`;

        const annotation = {
            id: boxId,
            ...boxData,
            timestamp: new Date().toISOString()
        };

        setAnnotations(prev => [...prev, annotation]);
        log('New annotation created', annotation);

        getSamMask(annotation);
    }, [log, getSamMask]);

    const deleteAnnotation = useCallback((annotationId) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
        log('Annotation deleted', annotationId);
        showStatus('Annotation deleted', 'info');
    }, [log, showStatus]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        saveAnnotations();
                        break;
                    case 'o':
                        e.preventDefault();
                        fileInputRef.current?.click();
                        break;
                    case 'd':
                        e.preventDefault();
                        clearAnnotations();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [saveAnnotations, clearAnnotations]);

    useEffect(() => {
        return () => {
            if (maskUrl) {
                URL.revokeObjectURL(maskUrl);
            }
        };
    }, [maskUrl]);

    return (
        <div className="app">
            <Header
                onUpload={() => fileInputRef.current?.click()}
                onSave={saveAnnotations}
                onClear={clearAnnotations}
                onSettings={() => setShowSettings(true)}
                hasAnnotations={annotations.length > 0}
                hasImage={!!currentImage}
            />

            <div className="app-content">
                <div className="main-area">
                    <ImageCanvas
                        image={currentImage}
                        maskUrl={maskUrl}
                        maskVisible={maskVisible}
                        onNewAnnotation={handleNewAnnotation}
                        annotations={annotations}
                        onUpload={() => fileInputRef.current?.click()}
                    />

                    {maskUrl && (
                        <div className="mask-controls">
                            <button
                                className={`mask-toggle-btn ${maskVisible ? 'active' : ''}`}
                                onClick={() => setMaskVisible(!maskVisible)}
                                title={maskVisible ? 'Hide mask' : 'Show mask'}
                            >
                                {maskVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                {maskVisible ? 'Hide Mask' : 'Show Mask'}
                            </button>
                        </div>
                    )}
                </div>

                <Sidebar
                    annotations={annotations}
                    onDeleteAnnotation={deleteAnnotation}
                    debugMode={debugMode}
                    debugLogs={debugLogs}
                />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
            />

            {showSettings && (
                <SettingsModal
                    apiEndpoint={apiEndpoint}
                    setApiEndpoint={setApiEndpoint}
                    debugMode={debugMode}
                    setDebugMode={setDebugMode}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <StatusMessage status={status} />
            <LoadingSpinner isLoading={isLoading} />
        </div>
    );
}

export default App;
