// Advanced Export Manager for FrameGen AI

export class ExportManager {
    constructor() {
        this.exportQueue = [];
        this.isProcessing = false;
        this.exportHistory = [];
        
        this.supportedFormats = {
            png: { mimeType: 'image/png', extension: '.png', quality: null },
            jpg: { mimeType: 'image/jpeg', extension: '.jpg', quality: 0.9 },
            webp: { mimeType: 'image/webp', extension: '.webp', quality: 0.9 },
            gif: { mimeType: 'image/gif', extension: '.gif', quality: null }
        };
        
        this.exportPresets = {
            web: {
                formats: ['webp', 'jpg'],
                sizes: [
                    { width: 1920, height: 1080, suffix: '_large' },
                    { width: 1280, height: 720, suffix: '_medium' },
                    { width: 640, height: 360, suffix: '_small' }
                ],
                quality: 0.8
            },
            print: {
                formats: ['png', 'tiff'],
                sizes: [
                    { width: 3000, height: 2000, suffix: '_print' },
                    { width: 1500, height: 1000, suffix: '_preview' }
                ],
                quality: 1.0
            },
            social: {
                formats: ['jpg'],
                sizes: [
                    { width: 1080, height: 1080, suffix: '_instagram' },
                    { width: 1200, height: 630, suffix: '_facebook' },
                    { width: 1500, height: 500, suffix: '_twitter' }
                ],
                quality: 0.9
            }
        };
    }
    
    /**
     * Export image with custom settings
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportImage(canvas, options = {}) {
        const {
            format = 'png',
            quality = 0.9,
            filename = 'framegen-export',
            width = null,
            height = null,
            preserveAspectRatio = true
        } = options;
        
        try {
            // Create export canvas
            const exportCanvas = this.createExportCanvas(canvas, { width, height, preserveAspectRatio });
            
            // Generate blob
            const blob = await this.canvasToBlob(exportCanvas, format, quality);
            
            // Create filename
            const finalFilename = this.generateFilename(filename, format);
            
            // Add to history
            this.addToHistory({
                filename: finalFilename,
                format,
                size: { width: exportCanvas.width, height: exportCanvas.height },
                timestamp: new Date(),
                blob
            });
            
            return {
                success: true,
                filename: finalFilename,
                blob,
                size: { width: exportCanvas.width, height: exportCanvas.height },
                format
            };
            
        } catch (error) {
            console.error('Export failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Export with preset configuration
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} preset - Preset name
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Array of export results
     */
    async exportWithPreset(canvas, preset, options = {}) {
        const presetConfig = this.exportPresets[preset];
        if (!presetConfig) {
            throw new Error(`Unknown preset: ${preset}`);
        }
        
        const results = [];
        const { filename = 'framegen-export' } = options;
        
        for (const format of presetConfig.formats) {
            for (const size of presetConfig.sizes) {
                const result = await this.exportImage(canvas, {
                    format,
                    quality: presetConfig.quality,
                    filename: `${filename}${size.suffix}`,
                    width: size.width,
                    height: size.height,
                    preserveAspectRatio: true
                });
                
                results.push(result);
            }
        }
        
        return results;
    }
    
    /**
     * Batch export multiple images
     * @param {Array} images - Array of image data
     * @param {Object} options - Export options
     * @returns {Promise<Array>} Array of export results
     */
    async batchExport(images, options = {}) {
        const results = [];
        const { format = 'png', quality = 0.9, filename = 'framegen-batch' } = options;
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const result = await this.exportImage(image.canvas, {
                format,
                quality,
                filename: `${filename}-${i + 1}`,
                ...options
            });
            
            results.push({
                original: image.name,
                export: result
            });
        }
        
        return results;
    }
    
    /**
     * Create optimized export canvas
     * @param {HTMLCanvasElement} sourceCanvas - Source canvas
     * @param {Object} options - Canvas options
     * @returns {HTMLCanvasElement} Export canvas
     */
    createExportCanvas(sourceCanvas, options = {}) {
        const { width, height, preserveAspectRatio = true } = options;
        
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        
        let targetWidth = width || sourceCanvas.width;
        let targetHeight = height || sourceCanvas.height;
        
        // Preserve aspect ratio if specified
        if (preserveAspectRatio && width && height) {
            const sourceRatio = sourceCanvas.width / sourceCanvas.height;
            const targetRatio = width / height;
            
            if (sourceRatio > targetRatio) {
                targetHeight = width / sourceRatio;
            } else {
                targetWidth = height * sourceRatio;
            }
        }
        
        exportCanvas.width = targetWidth;
        exportCanvas.height = targetHeight;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the source canvas onto the export canvas
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
        
        return exportCanvas;
    }
    
    /**
     * Convert canvas to blob
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} format - Export format
     * @param {number} quality - Export quality
     * @returns {Promise<Blob>} Image blob
     */
    canvasToBlob(canvas, format, quality) {
        return new Promise((resolve, reject) => {
            const formatConfig = this.supportedFormats[format];
            if (!formatConfig) {
                reject(new Error(`Unsupported format: ${format}`));
                return;
            }
            
            try {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    formatConfig.mimeType,
                    formatConfig.quality || quality
                );
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Generate filename with timestamp
     * @param {string} baseFilename - Base filename
     * @param {string} format - File format
     * @returns {string} Generated filename
     */
    generateFilename(baseFilename, format) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const extension = this.supportedFormats[format]?.extension || '.png';
        return `${baseFilename}-${timestamp}${extension}`;
    }
    
    /**
     * Download exported file
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Add export to history
     * @param {Object} exportData - Export data
     */
    addToHistory(exportData) {
        this.exportHistory.unshift(exportData);
        
        // Keep only last 50 exports
        if (this.exportHistory.length > 50) {
            this.exportHistory = this.exportHistory.slice(0, 50);
        }
    }
    
    /**
     * Get export history
     * @returns {Array} Export history
     */
    getHistory() {
        return [...this.exportHistory];
    }
    
    /**
     * Clear export history
     */
    clearHistory() {
        this.exportHistory = [];
    }
    
    /**
     * Create ZIP archive of multiple exports
     * @param {Array} exports - Array of export results
     * @param {string} filename - ZIP filename
     * @returns {Promise<Blob>} ZIP blob
     */
    async createZipArchive(exports, filename = 'framegen-exports.zip') {
        // This would require JSZip library
        // For now, return the first export
        if (exports.length > 0) {
            return exports[0].blob;
        }
        throw new Error('No exports to archive');
    }
    
    /**
     * Get supported formats
     * @returns {Object} Supported formats
     */
    getSupportedFormats() {
        return { ...this.supportedFormats };
    }
    
    /**
     * Get export presets
     * @returns {Object} Export presets
     */
    getExportPresets() {
        return { ...this.exportPresets };
    }
    
    /**
     * Add custom export preset
     * @param {string} name - Preset name
     * @param {Object} config - Preset configuration
     */
    addExportPreset(name, config) {
        this.exportPresets[name] = config;
    }
    
    /**
     * Remove export preset
     * @param {string} name - Preset name
     */
    removeExportPreset(name) {
        delete this.exportPresets[name];
    }
}

// Advanced metadata manager
export class MetadataManager {
    constructor() {
        this.metadata = new Map();
    }
    
    /**
     * Add metadata to export
     * @param {string} exportId - Export identifier
     * @param {Object} metadata - Metadata object
     */
    addMetadata(exportId, metadata) {
        this.metadata.set(exportId, {
            ...metadata,
            timestamp: new Date(),
            version: '1.0'
        });
    }
    
    /**
     * Get metadata for export
     * @param {string} exportId - Export identifier
     * @returns {Object} Metadata object
     */
    getMetadata(exportId) {
        return this.metadata.get(exportId);
    }
    
    /**
     * Generate EXIF data
     * @param {Object} imageData - Image data
     * @returns {Object} EXIF data
     */
    generateEXIF(imageData) {
        return {
            Software: 'FrameGen AI',
            DateTime: new Date().toISOString(),
            ImageWidth: imageData.width,
            ImageHeight: imageData.height,
            Orientation: 1,
            ColorSpace: 1,
            XResolution: 72,
            YResolution: 72,
            ResolutionUnit: 2
        };
    }
    
    /**
     * Embed metadata in image
     * @param {Blob} imageBlob - Image blob
     * @param {Object} metadata - Metadata to embed
     * @returns {Promise<Blob>} Image blob with embedded metadata
     */
    async embedMetadata(imageBlob, metadata) {
        // This would require a library like exif-js
        // For now, return the original blob
        return imageBlob;
    }
}

// Quality optimization manager
export class QualityOptimizer {
    constructor() {
        this.optimizationLevels = {
            low: { quality: 0.6, maxWidth: 800, maxHeight: 600 },
            medium: { quality: 0.8, maxWidth: 1200, maxHeight: 900 },
            high: { quality: 0.9, maxWidth: 1920, maxHeight: 1080 },
            maximum: { quality: 1.0, maxWidth: 3000, maxHeight: 2000 }
        };
    }
    
    /**
     * Optimize image quality
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} level - Optimization level
     * @returns {HTMLCanvasElement} Optimized canvas
     */
    optimizeQuality(canvas, level = 'medium') {
        const config = this.optimizationLevels[level];
        if (!config) {
            throw new Error(`Unknown optimization level: ${level}`);
        }
        
        const optimizedCanvas = document.createElement('canvas');
        const ctx = optimizedCanvas.getContext('2d');
        
        // Calculate optimal dimensions
        let { width, height } = canvas;
        if (width > config.maxWidth || height > config.maxHeight) {
            const ratio = Math.min(config.maxWidth / width, config.maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        optimizedCanvas.width = width;
        optimizedCanvas.height = height;
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw with optimization
        ctx.drawImage(canvas, 0, 0, width, height);
        
        return optimizedCanvas;
    }
    
    /**
     * Get optimization levels
     * @returns {Object} Optimization levels
     */
    getOptimizationLevels() {
        return { ...this.optimizationLevels };
    }
    
    /**
     * Add custom optimization level
     * @param {string} name - Level name
     * @param {Object} config - Level configuration
     */
    addOptimizationLevel(name, config) {
        this.optimizationLevels[name] = config;
    }
} 