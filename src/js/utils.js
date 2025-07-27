// Utility functions for FrameGen AI

export class ImageUtils {
    /**
     * Calculate the dominant colors in an image
     * @param {ImageData} imageData - The image data to analyze
     * @param {number} numColors - Number of dominant colors to extract
     * @returns {Array} Array of dominant colors as RGB objects
     */
    static getDominantColors(imageData, numColors = 5) {
        const data = imageData.data;
        const colorCounts = {};
        
        // Sample pixels (every 10th pixel for performance)
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Quantize colors to reduce similar colors
            const quantizedR = Math.floor(r / 32) * 32;
            const quantizedG = Math.floor(g / 32) * 32;
            const quantizedB = Math.floor(b / 32) * 32;
            
            const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
        
        // Sort by frequency and return top colors
        return Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, numColors)
            .map(([color]) => {
                const [r, g, b] = color.split(',').map(Number);
                return { r, g, b };
            });
    }

    /**
     * Calculate image brightness
     * @param {ImageData} imageData - The image data to analyze
     * @returns {number} Brightness value (0-1)
     */
    static getBrightness(imageData) {
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate perceived brightness
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            totalBrightness += brightness;
            pixelCount++;
        }
        
        return totalBrightness / pixelCount;
    }

    /**
     * Detect edges in an image using Sobel operator
     * @param {ImageData} imageData - The image data to analyze
     * @returns {Array} Edge strength map
     */
    static detectEdges(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const edges = new Array(width * height);
        
        // Sobel kernels
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                // Apply Sobel kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        
                        const kernelIdx = (ky + 1) * 3 + (kx + 1);
                        gx += gray * sobelX[kernelIdx];
                        gy += gray * sobelY[kernelIdx];
                    }
                }
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges[y * width + x] = magnitude;
            }
        }
        
        return edges;
    }

    /**
     * Find regions of interest (ROI) in an image
     * @param {ImageData} imageData - The image data to analyze
     * @returns {Array} Array of ROI objects with coordinates and scores
     */
    static findRegionsOfInterest(imageData) {
        const edges = this.detectEdges(imageData);
        const width = imageData.width;
        const height = imageData.height;
        const rois = [];
        
        // Simple ROI detection based on edge density
        const windowSize = Math.min(width, height) / 4;
        
        for (let y = 0; y < height - windowSize; y += windowSize / 2) {
            for (let x = 0; x < width - windowSize; x += windowSize / 2) {
                let edgeSum = 0;
                let pixelCount = 0;
                
                for (let wy = 0; wy < windowSize; wy++) {
                    for (let wx = 0; wx < windowSize; wx++) {
                        const idx = (y + wy) * width + (x + wx);
                        if (edges[idx]) {
                            edgeSum += edges[idx];
                        }
                        pixelCount++;
                    }
                }
                
                const edgeDensity = edgeSum / pixelCount;
                if (edgeDensity > 10) { // Threshold for interesting regions
                    rois.push({
                        x: x / width,
                        y: y / height,
                        width: windowSize / width,
                        height: windowSize / height,
                        score: edgeDensity
                    });
                }
            }
        }
        
        return rois.sort((a, b) => b.score - a.score).slice(0, 5);
    }
}

export class CompositionUtils {
    /**
     * Generate Fibonacci grid points
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Array} Array of grid points
     */
    static generateFibonacciGrid(width, height) {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
        const points = [];
        
        for (let i = 1; i < fib.length; i++) {
            const ratio = fib[i] / fib[fib.length - 1];
            points.push({
                x: ratio * width,
                y: ratio * height,
                type: 'fibonacci'
            });
        }
        
        return points;
    }

    /**
     * Generate rule of thirds grid points
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Array} Array of grid points
     */
    static generateRuleOfThirds(width, height) {
        return [
            { x: width / 3, y: height / 3, type: 'thirds' },
            { x: 2 * width / 3, y: height / 3, type: 'thirds' },
            { x: width / 3, y: 2 * height / 3, type: 'thirds' },
            { x: 2 * width / 3, y: 2 * height / 3, type: 'thirds' }
        ];
    }

    /**
     * Generate golden spiral points
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Array} Array of spiral points
     */
    static generateGoldenSpiral(width, height) {
        const points = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;
        
        for (let angle = 0; angle < 4 * Math.PI; angle += 0.1) {
            const radius = maxRadius * Math.exp(0.306349 * angle);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                points.push({ x, y, type: 'spiral' });
            }
        }
        
        return points;
    }

    /**
     * Calculate composition score based on crop selection and composition guides
     * @param {Object} cropSelection - The crop selection object
     * @param {Array} compositionPoints - Array of composition guide points
     * @returns {number} Composition score (0-100)
     */
    static calculateCompositionScore(cropSelection, compositionPoints) {
        if (!cropSelection || !compositionPoints.length) return 0;
        
        let score = 0;
        const cropCenter = {
            x: cropSelection.x + cropSelection.width / 2,
            y: cropSelection.y + cropSelection.height / 2
        };
        
        // Check proximity to composition points
        compositionPoints.forEach(point => {
            const distance = Math.sqrt(
                Math.pow(cropCenter.x - point.x, 2) + 
                Math.pow(cropCenter.y - point.y, 2)
            );
            
            const maxDistance = Math.min(cropSelection.width, cropSelection.height) / 2;
            if (distance < maxDistance) {
                score += (1 - distance / maxDistance) * 25;
            }
        });
        
        // Bonus for good aspect ratios
        const aspectRatio = cropSelection.width / cropSelection.height;
        const goldenRatio = 1.618;
        const ratioDiff = Math.abs(aspectRatio - goldenRatio);
        if (ratioDiff < 0.1) {
            score += 20;
        }
        
        return Math.min(100, score);
    }
}

export class AISuggestions {
    /**
     * Generate AI-powered crop suggestions
     * @param {ImageData} imageData - The image data to analyze
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @returns {Array} Array of crop suggestions
     */
    static generateCropSuggestions(imageData, width, height) {
        const suggestions = [];
        
        // Analyze image characteristics
        const brightness = ImageUtils.getBrightness(imageData);
        const dominantColors = ImageUtils.getDominantColors(imageData);
        const rois = ImageUtils.findRegionsOfInterest(imageData);
        
        // Generate different crop suggestions based on analysis
        suggestions.push({
            name: 'Balanced Composition',
            description: 'Centered crop with balanced elements',
            crop: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
            score: 75
        });
        
        if (rois.length > 0) {
            const bestROI = rois[0];
            suggestions.push({
                name: 'Focus on Interest',
                description: 'Crop focused on the most interesting region',
                crop: bestROI,
                score: 85
            });
        }
        
        if (brightness < 0.4) {
            suggestions.push({
                name: 'Dark Image Enhancement',
                description: 'Crop to emphasize brighter areas',
                crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
                score: 70
            });
        }
        
        // Add rule of thirds suggestions
        suggestions.push({
            name: 'Rule of Thirds',
            description: 'Classic composition following rule of thirds',
            crop: { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },
            score: 80
        });
        
        // Add golden ratio suggestions
        const goldenRatio = 1.618;
        const cropWidth = 0.6;
        const cropHeight = cropWidth / goldenRatio;
        suggestions.push({
            name: 'Golden Ratio',
            description: 'Crop following the golden ratio',
            crop: { x: 0.2, y: 0.2, width: cropWidth, height: cropHeight },
            score: 90
        });
        
        return suggestions.sort((a, b) => b.score - a.score);
    }
}

export class FileUtils {
    /**
     * Convert file size to human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Human readable file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate image file
     * @param {File} file - The file to validate
     * @returns {Object} Validation result
     */
    static validateImageFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Unsupported file type. Please use JPEG, PNG, GIF, or WebP.' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
        }
        
        return { valid: true };
    }
} 