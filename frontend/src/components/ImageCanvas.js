import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import './ImageCanvas.css';

const ImageCanvas = ({
    image,
    maskUrl,
    maskVisible,
    onNewAnnotation,
    annotations,
    onUpload
}) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentBox, setCurrentBox] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    const handleMouseDown = useCallback((e) => {
        if (!image) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentBox({ x, y, width: 0, height: 0 });
    }, [image]);

    const handleMouseMove = useCallback((e) => {
        if (!isDrawing || !image) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);
        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);

        setCurrentBox({ x, y, width, height });
    }, [isDrawing, startPos, image]);

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !currentBox || !image) return;

        const { x, y, width, height } = currentBox;

        if (width > 10 && height > 10) {
            const canvas = canvasRef.current;
            const img = canvas.querySelector('img');

            if (img) {
                const scaleX = img.naturalWidth / img.offsetWidth;
                const scaleY = img.naturalHeight / img.offsetHeight;

                const x1 = Math.round(x * scaleX);
                const y1 = Math.round(y * scaleY);
                const x2 = Math.round((x + width) * scaleX);
                const y2 = Math.round((y + height) * scaleY);

                const annotation = {
                    normalizedCoords: {
                        x: x / img.offsetWidth,
                        y: y / img.offsetHeight,
                        width: width / img.offsetWidth,
                        height: height / img.offsetHeight
                    },
                    displayCoords: { x, y, width, height },
                    originalImageCoords: {
                        x1, y1, x2, y2,
                        width: x2 - x1,
                        height: y2 - y1
                    }
                };

                onNewAnnotation(annotation);
            }
        }

        setIsDrawing(false);
        setCurrentBox(null);
    }, [isDrawing, currentBox, image, onNewAnnotation]);

    const handleImageLoad = useCallback((e) => {
        setImageSize({
            width: e.target.naturalWidth,
            height: e.target.naturalHeight
        });
    }, []);

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDrawing) {
                handleMouseUp();
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDrawing, handleMouseUp]);

    if (!image) {
        return (
            <div className="image-canvas empty" onClick={onUpload}>
                <div className="upload-prompt">
                    <div className="upload-icon">
                        <ImageIcon size={48} />
                    </div>
                    <h3>Upload an Image</h3>
                    <p>Click here or use the upload button to get started</p>
                    <div className="upload-hint">
                        <Upload size={16} />
                        Supports JPG, PNG
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="image-canvas-container">
            <div
                ref={canvasRef}
                className="image-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={image}
                    alt="Annotation target"
                    className="main-image"
                    draggable={false}
                    onLoad={handleImageLoad}
                />

                {maskUrl && maskVisible && (
                    <img
                        src={maskUrl}
                        alt="Segmentation mask"
                        className="mask-overlay"
                        draggable={false}
                    />
                )}

                {annotations.map((annotation) => (
                    <div
                        key={annotation.id}
                        className="annotation-box existing"
                        style={{
                            left: `${annotation.displayCoords.x}px`,
                            top: `${annotation.displayCoords.y}px`,
                            width: `${annotation.displayCoords.width}px`,
                            height: `${annotation.displayCoords.height}px`,
                        }}
                    />
                ))}

                {currentBox && isDrawing && (
                    <div
                        className="annotation-box current"
                        style={{
                            left: `${currentBox.x}px`,
                            top: `${currentBox.y}px`,
                            width: `${currentBox.width}px`,
                            height: `${currentBox.height}px`,
                        }}
                    />
                )}
            </div>

            <div className="image-info">
                <span className="image-dimensions">
                    {imageSize.width} × {imageSize.height}
                </span>
                <span className="annotation-count">
                    {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );
};

export default ImageCanvas;
