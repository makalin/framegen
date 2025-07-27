// Advanced Gesture Controller for FrameGen AI

export class GestureController {
    constructor(canvas, onGestureUpdate) {
        this.canvas = canvas;
        this.onGestureUpdate = onGestureUpdate;
        this.isEnabled = true;
        
        // Gesture state
        this.gestureState = {
            isPanning: false,
            isZooming: false,
            isRotating: false,
            scale: 1,
            rotation: 0,
            translateX: 0,
            translateY: 0,
            lastScale: 1,
            lastRotation: 0,
            lastTranslateX: 0,
            lastTranslateY: 0
        };
        
        // Touch tracking
        this.touches = new Map();
        this.touchStartTime = 0;
        this.touchStartDistance = 0;
        this.touchStartAngle = 0;
        
        // Configuration
        this.config = {
            minScale: 0.5,
            maxScale: 3.0,
            minRotation: -180,
            maxRotation: 180,
            panThreshold: 10,
            zoomThreshold: 0.1,
            rotationThreshold: 5,
            doubleTapDelay: 300,
            longPressDelay: 500
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // Mouse events for desktop
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleTouchStart(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        const touches = Array.from(event.touches);
        this.touchStartTime = Date.now();
        
        // Track all touches
        touches.forEach(touch => {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            });
        });
        
        if (touches.length === 1) {
            this.handleSingleTouchStart(touches[0]);
        } else if (touches.length === 2) {
            this.handleMultiTouchStart(touches);
        }
    }
    
    handleTouchMove(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        const touches = Array.from(event.touches);
        
        // Update touch positions
        touches.forEach(touch => {
            const existingTouch = this.touches.get(touch.identifier);
            if (existingTouch) {
                existingTouch.x = touch.clientX;
                existingTouch.y = touch.clientY;
            }
        });
        
        if (touches.length === 1) {
            this.handleSingleTouchMove(touches[0]);
        } else if (touches.length === 2) {
            this.handleMultiTouchMove(touches);
        }
    }
    
    handleTouchEnd(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        const touches = Array.from(event.changedTouches);
        
        // Remove ended touches
        touches.forEach(touch => {
            this.touches.delete(touch.identifier);
        });
        
        // Handle gesture end
        if (this.touches.size === 0) {
            this.handleGestureEnd();
        } else if (this.touches.size === 1) {
            // Switch to single touch mode
            const remainingTouch = Array.from(this.touches.values())[0];
            this.handleSingleTouchStart(remainingTouch);
        }
    }
    
    handleSingleTouchStart(touch) {
        const touchData = this.touches.get(touch.identifier);
        if (!touchData) return;
        
        // Check for double tap
        const timeSinceLastTap = Date.now() - (touchData.lastTapTime || 0);
        if (timeSinceLastTap < this.config.doubleTapDelay) {
            this.handleDoubleTap(touch);
            return;
        }
        
        touchData.lastTapTime = Date.now();
        
        // Start panning
        this.gestureState.isPanning = true;
        this.gestureState.lastTranslateX = this.gestureState.translateX;
        this.gestureState.lastTranslateY = this.gestureState.translateY;
        
        // Setup long press timer
        touchData.longPressTimer = setTimeout(() => {
            this.handleLongPress(touch);
        }, this.config.longPressDelay);
    }
    
    handleSingleTouchMove(touch) {
        const touchData = this.touches.get(touch.identifier);
        if (!touchData || !this.gestureState.isPanning) return;
        
        // Clear long press timer
        if (touchData.longPressTimer) {
            clearTimeout(touchData.longPressTimer);
            touchData.longPressTimer = null;
        }
        
        // Calculate pan distance
        const deltaX = touch.clientX - touchData.startX;
        const deltaY = touch.clientY - touchData.startY;
        
        // Check if movement exceeds threshold
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < this.config.panThreshold) return;
        
        // Update translation
        this.gestureState.translateX = this.gestureState.lastTranslateX + deltaX;
        this.gestureState.translateY = this.gestureState.lastTranslateY + deltaY;
        
        this.updateTransform();
    }
    
    handleMultiTouchStart(touches) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate initial distance and angle
        this.touchStartDistance = this.getDistance(touch1, touch2);
        this.touchStartAngle = this.getAngle(touch1, touch2);
        
        // Store initial gesture state
        this.gestureState.lastScale = this.gestureState.scale;
        this.gestureState.lastRotation = this.gestureState.rotation;
        this.gestureState.lastTranslateX = this.gestureState.translateX;
        this.gestureState.lastTranslateY = this.gestureState.translateY;
        
        // Start multi-touch gestures
        this.gestureState.isZooming = true;
        this.gestureState.isRotating = true;
    }
    
    handleMultiTouchMove(touches) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate current distance and angle
        const currentDistance = this.getDistance(touch1, touch2);
        const currentAngle = this.getAngle(touch1, touch2);
        
        // Handle scaling
        if (this.gestureState.isZooming) {
            const scaleDelta = currentDistance / this.touchStartDistance;
            const newScale = this.gestureState.lastScale * scaleDelta;
            
            if (Math.abs(newScale - this.gestureState.scale) > this.config.zoomThreshold) {
                this.gestureState.scale = Math.max(
                    this.config.minScale,
                    Math.min(this.config.maxScale, newScale)
                );
            }
        }
        
        // Handle rotation
        if (this.gestureState.isRotating) {
            const angleDelta = currentAngle - this.touchStartAngle;
            const newRotation = this.gestureState.lastRotation + angleDelta;
            
            if (Math.abs(angleDelta) > this.config.rotationThreshold) {
                this.gestureState.rotation = Math.max(
                    this.config.minRotation,
                    Math.min(this.config.maxRotation, newRotation)
                );
            }
        }
        
        // Handle panning with two fingers
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        const touch1Data = this.touches.get(touch1.identifier);
        const touch2Data = this.touches.get(touch2.identifier);
        
        if (touch1Data && touch2Data) {
            const startCenterX = (touch1Data.startX + touch2Data.startX) / 2;
            const startCenterY = (touch1Data.startY + touch2Data.startY) / 2;
            
            const deltaX = centerX - startCenterX;
            const deltaY = centerY - startCenterY;
            
            this.gestureState.translateX = this.gestureState.lastTranslateX + deltaX;
            this.gestureState.translateY = this.gestureState.lastTranslateY + deltaY;
        }
        
        this.updateTransform();
    }
    
    handleGestureEnd() {
        this.gestureState.isPanning = false;
        this.gestureState.isZooming = false;
        this.gestureState.isRotating = false;
        
        // Clear all timers
        this.touches.forEach(touch => {
            if (touch.longPressTimer) {
                clearTimeout(touch.longPressTimer);
                touch.longPressTimer = null;
            }
        });
    }
    
    handleDoubleTap(touch) {
        // Reset to original state
        this.gestureState.scale = 1;
        this.gestureState.rotation = 0;
        this.gestureState.translateX = 0;
        this.gestureState.translateY = 0;
        
        this.updateTransform();
        
        // Trigger double tap callback
        if (this.onGestureUpdate) {
            this.onGestureUpdate('doubleTap', { touch, gestureState: this.gestureState });
        }
    }
    
    handleLongPress(touch) {
        // Trigger long press callback
        if (this.onGestureUpdate) {
            this.onGestureUpdate('longPress', { touch, gestureState: this.gestureState });
        }
    }
    
    // Mouse event handlers for desktop
    handleMouseDown(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        this.gestureState.isPanning = true;
        this.gestureState.lastTranslateX = this.gestureState.translateX;
        this.gestureState.lastTranslateY = this.gestureState.translateY;
        
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;
        
        this.canvas.style.cursor = 'grabbing';
    }
    
    handleMouseMove(event) {
        if (!this.isEnabled || !this.gestureState.isPanning) return;
        
        event.preventDefault();
        
        const deltaX = event.clientX - this.mouseStartX;
        const deltaY = event.clientY - this.mouseStartY;
        
        this.gestureState.translateX = this.gestureState.lastTranslateX + deltaX;
        this.gestureState.translateY = this.gestureState.lastTranslateY + deltaY;
        
        this.updateTransform();
    }
    
    handleMouseUp(event) {
        if (!this.isEnabled) return;
        
        this.gestureState.isPanning = false;
        this.canvas.style.cursor = 'grab';
    }
    
    handleWheel(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        const newScale = this.gestureState.scale * delta;
        
        this.gestureState.scale = Math.max(
            this.config.minScale,
            Math.min(this.config.maxScale, newScale)
        );
        
        this.updateTransform();
    }
    
    // Utility methods
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getAngle(touch1, touch2) {
        return Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        ) * 180 / Math.PI;
    }
    
    updateTransform() {
        const transform = `translate(${this.gestureState.translateX}px, ${this.gestureState.translateY}px) 
                          scale(${this.gestureState.scale}) 
                          rotate(${this.gestureState.rotation}deg)`;
        
        this.canvas.style.transform = transform;
        
        if (this.onGestureUpdate) {
            this.onGestureUpdate('transform', { gestureState: this.gestureState });
        }
    }
    
    // Public methods
    reset() {
        this.gestureState.scale = 1;
        this.gestureState.rotation = 0;
        this.gestureState.translateX = 0;
        this.gestureState.translateY = 0;
        
        this.updateTransform();
    }
    
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    getTransformMatrix() {
        return {
            scale: this.gestureState.scale,
            rotation: this.gestureState.rotation,
            translateX: this.gestureState.translateX,
            translateY: this.gestureState.translateY
        };
    }
    
    setTransformMatrix(matrix) {
        this.gestureState.scale = matrix.scale || 1;
        this.gestureState.rotation = matrix.rotation || 0;
        this.gestureState.translateX = matrix.translateX || 0;
        this.gestureState.translateY = matrix.translateY || 0;
        
        this.updateTransform();
    }
}

// Advanced crop gesture controller
export class CropGestureController {
    constructor(canvas, cropSelection, onCropUpdate) {
        this.canvas = canvas;
        this.cropSelection = cropSelection;
        this.onCropUpdate = onCropUpdate;
        
        this.isResizing = false;
        this.resizeHandle = null;
        this.isMoving = false;
        this.startPoint = { x: 0, y: 0 };
        this.startCrop = null;
        
        this.setupCropEventListeners();
    }
    
    setupCropEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleCropMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCropMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleCropMouseUp.bind(this));
        
        this.canvas.addEventListener('touchstart', this.handleCropTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleCropTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleCropTouchEnd.bind(this), { passive: false });
    }
    
    handleCropMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.handleCropStart(x, y);
    }
    
    handleCropTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.touches[0].clientX - rect.left;
            const y = event.touches[0].clientY - rect.top;
            
            this.handleCropStart(x, y);
        }
    }
    
    handleCropStart(x, y) {
        if (!this.cropSelection) return;
        
        // Check if clicking on resize handle
        const handle = this.getResizeHandle(x, y);
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
        } else if (this.isInsideCrop(x, y)) {
            this.isMoving = true;
        }
        
        this.startPoint = { x, y };
        this.startCrop = { ...this.cropSelection };
    }
    
    handleCropMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.handleCropMove(x, y);
    }
    
    handleCropTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.touches[0].clientX - rect.left;
            const y = event.touches[0].clientY - rect.top;
            
            this.handleCropMove(x, y);
        }
    }
    
    handleCropMove(x, y) {
        if (!this.startCrop) return;
        
        const deltaX = x - this.startPoint.x;
        const deltaY = y - this.startPoint.y;
        
        if (this.isResizing) {
            this.resizeCrop(deltaX, deltaY);
        } else if (this.isMoving) {
            this.moveCrop(deltaX, deltaY);
        }
        
        if (this.onCropUpdate) {
            this.onCropUpdate(this.cropSelection);
        }
    }
    
    handleCropMouseUp() {
        this.handleCropEnd();
    }
    
    handleCropTouchEnd(event) {
        event.preventDefault();
        this.handleCropEnd();
    }
    
    handleCropEnd() {
        this.isResizing = false;
        this.isMoving = false;
        this.resizeHandle = null;
        this.startCrop = null;
    }
    
    resizeCrop(deltaX, deltaY) {
        if (!this.startCrop || !this.resizeHandle) return;
        
        const newCrop = { ...this.startCrop };
        
        switch (this.resizeHandle) {
            case 'nw':
                newCrop.x = this.startCrop.x + deltaX;
                newCrop.y = this.startCrop.y + deltaY;
                newCrop.width = this.startCrop.width - deltaX;
                newCrop.height = this.startCrop.height - deltaY;
                break;
            case 'ne':
                newCrop.y = this.startCrop.y + deltaY;
                newCrop.width = this.startCrop.width + deltaX;
                newCrop.height = this.startCrop.height - deltaY;
                break;
            case 'sw':
                newCrop.x = this.startCrop.x + deltaX;
                newCrop.width = this.startCrop.width - deltaX;
                newCrop.height = this.startCrop.height + deltaY;
                break;
            case 'se':
                newCrop.width = this.startCrop.width + deltaX;
                newCrop.height = this.startCrop.height + deltaY;
                break;
        }
        
        // Ensure minimum size
        if (newCrop.width > 20 && newCrop.height > 20) {
            this.cropSelection = newCrop;
        }
    }
    
    moveCrop(deltaX, deltaY) {
        if (!this.startCrop) return;
        
        this.cropSelection.x = this.startCrop.x + deltaX;
        this.cropSelection.y = this.startCrop.y + deltaY;
    }
    
    getResizeHandle(x, y) {
        if (!this.cropSelection) return null;
        
        const handleSize = 20;
        const handles = {
            nw: { x: this.cropSelection.x, y: this.cropSelection.y },
            ne: { x: this.cropSelection.x + this.cropSelection.width, y: this.cropSelection.y },
            sw: { x: this.cropSelection.x, y: this.cropSelection.y + this.cropSelection.height },
            se: { x: this.cropSelection.x + this.cropSelection.width, y: this.cropSelection.y + this.cropSelection.height }
        };
        
        for (const [handle, pos] of Object.entries(handles)) {
            if (Math.abs(x - pos.x) <= handleSize && Math.abs(y - pos.y) <= handleSize) {
                return handle;
            }
        }
        
        return null;
    }
    
    isInsideCrop(x, y) {
        if (!this.cropSelection) return false;
        
        return x >= this.cropSelection.x &&
               x <= this.cropSelection.x + this.cropSelection.width &&
               y >= this.cropSelection.y &&
               y <= this.cropSelection.y + this.cropSelection.height;
    }
} 