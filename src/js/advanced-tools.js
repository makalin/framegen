// Advanced Tools and Unique Functions for FrameGen AI

export class AdvancedImageAnalysis {
    /**
     * AI-powered subject detection and focus analysis
     * @param {ImageData} imageData - The image data to analyze
     * @returns {Object} Analysis results with subject locations and focus scores
     */
    static detectSubjects(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // Simple face detection simulation using skin tone detection
        const skinToneRegions = [];
        const skinToneThreshold = 0.6;
        
        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                // Skin tone detection algorithm
                const skinToneScore = this.calculateSkinToneScore(r, g, b);
                if (skinToneScore > skinToneThreshold) {
                    skinToneRegions.push({ x, y, score: skinToneScore });
                }
            }
        }
        
        // Group nearby skin tone regions
        const subjectGroups = this.groupRegions(skinToneRegions, 50);
        
        return {
            subjects: subjectGroups.map(group => ({
                center: group.center,
                bounds: group.bounds,
                confidence: group.averageScore,
                type: 'face'
            })),
            focusScore: this.calculateFocusScore(imageData),
            compositionAnalysis: this.analyzeComposition(imageData)
        };
    }
    
    /**
     * Calculate skin tone probability
     */
    static calculateSkinToneScore(r, g, b) {
        // YCrCb color space skin tone detection
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cr = 0.713 * (r - y) + 128;
        const cb = 0.564 * (b - y) + 128;
        
        // Skin tone ranges in YCrCb
        const skinToneY = y >= 80 && y <= 250;
        const skinToneCr = cr >= 133 && cr <= 173;
        const skinToneCb = cb >= 77 && cb <= 127;
        
        return skinToneY && skinToneCr && skinToneCb ? 0.8 : 0.1;
    }
    
    /**
     * Group nearby regions into clusters
     */
    static groupRegions(regions, maxDistance) {
        const groups = [];
        const visited = new Set();
        
        regions.forEach((region, index) => {
            if (visited.has(index)) return;
            
            const group = {
                regions: [region],
                center: { x: region.x, y: region.y },
                bounds: { minX: region.x, minY: region.y, maxX: region.x, maxY: region.y },
                totalScore: region.score
            };
            
            visited.add(index);
            
            // Find nearby regions
            regions.forEach((otherRegion, otherIndex) => {
                if (visited.has(otherIndex)) return;
                
                const distance = Math.sqrt(
                    Math.pow(region.x - otherRegion.x, 2) + 
                    Math.pow(region.y - otherRegion.y, 2)
                );
                
                if (distance <= maxDistance) {
                    group.regions.push(otherRegion);
                    group.totalScore += otherRegion.score;
                    visited.add(otherIndex);
                    
                    // Update bounds
                    group.bounds.minX = Math.min(group.bounds.minX, otherRegion.x);
                    group.bounds.minY = Math.min(group.bounds.minY, otherRegion.y);
                    group.bounds.maxX = Math.max(group.bounds.maxX, otherRegion.x);
                    group.bounds.maxY = Math.max(group.bounds.maxY, otherRegion.y);
                }
            });
            
            // Calculate center and average score
            group.center = {
                x: (group.bounds.minX + group.bounds.maxX) / 2,
                y: (group.bounds.minY + group.bounds.maxY) / 2
            };
            group.averageScore = group.totalScore / group.regions.length;
            
            groups.push(group);
        });
        
        return groups;
    }
    
    /**
     * Calculate image focus/sharpness score
     */
    static calculateFocusScore(imageData) {
        const edges = this.detectEdges(imageData);
        const totalPixels = edges.length;
        let sharpPixels = 0;
        
        edges.forEach(edge => {
            if (edge > 30) sharpPixels++;
        });
        
        return sharpPixels / totalPixels;
    }
    
    /**
     * Analyze overall composition
     */
    static analyzeComposition(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        
        // Analyze symmetry
        const symmetryScore = this.calculateSymmetry(imageData);
        
        // Analyze balance
        const balanceScore = this.calculateBalance(imageData);
        
        // Analyze leading lines
        const leadingLines = this.detectLeadingLines(imageData);
        
        return {
            symmetry: symmetryScore,
            balance: balanceScore,
            leadingLines: leadingLines,
            overallScore: (symmetryScore + balanceScore + leadingLines.score) / 3
        };
    }
    
    /**
     * Calculate image symmetry
     */
    static calculateSymmetry(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        let symmetryScore = 0;
        let totalPixels = 0;
        
        // Check vertical symmetry
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width / 2; x++) {
                const leftIdx = (y * width + x) * 4;
                const rightIdx = (y * width + (width - 1 - x)) * 4;
                
                const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
                const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
                
                const difference = Math.abs(leftBrightness - rightBrightness) / 255;
                symmetryScore += 1 - difference;
                totalPixels++;
            }
        }
        
        return symmetryScore / totalPixels;
    }
    
    /**
     * Calculate image balance
     */
    static calculateBalance(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // Divide image into quadrants and compare weights
        const quadrants = [
            { x: 0, y: 0, w: width / 2, h: height / 2, weight: 0 },
            { x: width / 2, y: 0, w: width / 2, h: height / 2, weight: 0 },
            { x: 0, y: height / 2, w: width / 2, h: height / 2, weight: 0 },
            { x: width / 2, y: height / 2, w: width / 2, h: height / 2, weight: 0 }
        ];
        
        quadrants.forEach(quad => {
            for (let y = quad.y; y < quad.y + quad.h; y++) {
                for (let x = quad.x; x < quad.x + quad.w; x++) {
                    const idx = (y * width + x) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    quad.weight += brightness;
                }
            }
        });
        
        // Calculate balance score
        const totalWeight = quadrants.reduce((sum, q) => sum + q.weight, 0);
        const averageWeight = totalWeight / 4;
        
        let balanceScore = 0;
        quadrants.forEach(quad => {
            const normalizedWeight = quad.weight / totalWeight;
            balanceScore += 1 - Math.abs(normalizedWeight - 0.25);
        });
        
        return balanceScore / 4;
    }
    
    /**
     * Detect leading lines in the image
     */
    static detectLeadingLines(imageData) {
        const edges = this.detectEdges(imageData);
        const width = imageData.width;
        const height = imageData.height;
        
        // Hough transform for line detection (simplified)
        const lines = [];
        const angles = 180;
        const distances = Math.sqrt(width * width + height * height);
        
        for (let angle = 0; angle < angles; angle += 5) {
            for (let distance = 0; distance < distances; distance += 10) {
                let votes = 0;
                
                for (let y = 0; y < height; y += 2) {
                    for (let x = 0; x < width; x += 2) {
                        if (edges[y * width + x] > 20) {
                            const lineDistance = x * Math.cos(angle * Math.PI / 180) + 
                                               y * Math.sin(angle * Math.PI / 180);
                            if (Math.abs(lineDistance - distance) < 5) {
                                votes++;
                            }
                        }
                    }
                }
                
                if (votes > 50) {
                    lines.push({ angle, distance, votes });
                }
            }
        }
        
        return {
            lines: lines.sort((a, b) => b.votes - a.votes).slice(0, 5),
            score: lines.length > 0 ? Math.min(lines[0].votes / 100, 1) : 0
        };
    }
    
    /**
     * Detect edges using Sobel operator
     */
    static detectEdges(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const edges = new Array(width * height);
        
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
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
}

export class CreativeFilters {
    /**
     * Apply vintage film effect
     * @param {ImageData} imageData - The image data to process
     * @param {Object} options - Filter options
     * @returns {ImageData} Processed image data
     */
    static applyVintageEffect(imageData, options = {}) {
        const { sepia = 0.3, vignette = 0.4, grain = 0.2 } = options;
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            // Sepia effect
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const newR = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const newG = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const newB = (r * 0.272) + (g * 0.534) + (b * 0.131);
            
            data[i] = Math.min(255, r * (1 - sepia) + newR * sepia);
            data[i + 1] = Math.min(255, g * (1 - sepia) + newG * sepia);
            data[i + 2] = Math.min(255, b * (1 - sepia) + newB * sepia);
            
            // Vignette effect
            const centerX = width / 2;
            const centerY = height / 2;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            const vignetteFactor = 1 - (distance / maxDistance) * vignette;
            
            data[i] *= vignetteFactor;
            data[i + 1] *= vignetteFactor;
            data[i + 2] *= vignetteFactor;
            
            // Film grain
            if (grain > 0) {
                const grainValue = (Math.random() - 0.5) * 50 * grain;
                data[i] = Math.max(0, Math.min(255, data[i] + grainValue));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grainValue));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grainValue));
            }
        }
        
        return imageData;
    }
    
    /**
     * Apply dramatic lighting effect
     * @param {ImageData} imageData - The image data to process
     * @param {Object} options - Filter options
     * @returns {ImageData} Processed image data
     */
    static applyDramaticLighting(imageData, options = {}) {
        const { contrast = 1.3, brightness = 0.1, highlights = 0.2, shadows = -0.3 } = options;
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate luminance
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Apply contrast
            let newR = (r - 128) * contrast + 128;
            let newG = (g - 128) * contrast + 128;
            let newB = (b - 128) * contrast + 128;
            
            // Apply brightness
            newR += brightness * 255;
            newG += brightness * 255;
            newB += brightness * 255;
            
            // Apply highlights and shadows
            if (luminance > 128) {
                newR += highlights * 255;
                newG += highlights * 255;
                newB += highlights * 255;
            } else {
                newR += shadows * 255;
                newG += shadows * 255;
                newB += shadows * 255;
            }
            
            data[i] = Math.max(0, Math.min(255, newR));
            data[i + 1] = Math.max(0, Math.min(255, newG));
            data[i + 2] = Math.max(0, Math.min(255, newB));
        }
        
        return imageData;
    }
    
    /**
     * Apply artistic color grading
     * @param {ImageData} imageData - The image data to process
     * @param {string} preset - Color grading preset
     * @returns {ImageData} Processed image data
     */
    static applyColorGrading(imageData, preset = 'cinematic') {
        const presets = {
            cinematic: { r: 1.1, g: 0.9, b: 0.8, saturation: 1.2 },
            warm: { r: 1.2, g: 1.1, b: 0.8, saturation: 1.1 },
            cool: { r: 0.8, g: 0.9, b: 1.2, saturation: 1.1 },
            dramatic: { r: 1.3, g: 0.7, b: 0.6, saturation: 1.4 },
            vintage: { r: 1.1, g: 0.8, b: 0.7, saturation: 0.8 }
        };
        
        const settings = presets[preset] || presets.cinematic;
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply color multipliers
            r *= settings.r;
            g *= settings.g;
            b *= settings.b;
            
            // Apply saturation
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            r = luminance + (r - luminance) * settings.saturation;
            g = luminance + (g - luminance) * settings.saturation;
            b = luminance + (b - luminance) * settings.saturation;
            
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
        
        return imageData;
    }
}

export class BatchProcessor {
    /**
     * Process multiple images with the same settings
     * @param {Array} images - Array of image files
     * @param {Object} settings - Processing settings
     * @returns {Promise<Array>} Array of processed images
     */
    static async processBatch(images, settings) {
        const results = [];
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const result = await this.processImage(image, settings);
            results.push({
                original: image.name,
                processed: result,
                settings: settings
            });
        }
        
        return results;
    }
    
    /**
     * Process a single image with given settings
     * @param {File} imageFile - Image file to process
     * @param {Object} settings - Processing settings
     * @returns {Promise<Blob>} Processed image blob
     */
    static async processImage(imageFile, settings) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Apply filters based on settings
                if (settings.vintage) {
                    CreativeFilters.applyVintageEffect(imageData, settings.vintageOptions);
                }
                
                if (settings.dramatic) {
                    CreativeFilters.applyDramaticLighting(imageData, settings.dramaticOptions);
                }
                
                if (settings.colorGrading) {
                    CreativeFilters.applyColorGrading(imageData, settings.colorGradingPreset);
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                canvas.toBlob(resolve, 'image/png');
            };
            
            img.src = URL.createObjectURL(imageFile);
        });
    }
}

export class SocialMediaPresets {
    /**
     * Get crop presets for different social media platforms
     * @returns {Object} Platform-specific crop presets
     */
    static getPresets() {
        return {
            instagram: {
                square: { width: 1, height: 1, name: 'Instagram Square' },
                portrait: { width: 4, height: 5, name: 'Instagram Portrait' },
                landscape: { width: 1.91, height: 1, name: 'Instagram Landscape' },
                story: { width: 9, height: 16, name: 'Instagram Story' }
            },
            facebook: {
                post: { width: 1.91, height: 1, name: 'Facebook Post' },
                cover: { width: 2.7, height: 1, name: 'Facebook Cover' },
                profile: { width: 1, height: 1, name: 'Facebook Profile' }
            },
            twitter: {
                post: { width: 16, height: 9, name: 'Twitter Post' },
                header: { width: 3, height: 1, name: 'Twitter Header' },
                profile: { width: 1, height: 1, name: 'Twitter Profile' }
            },
            linkedin: {
                post: { width: 1.91, height: 1, name: 'LinkedIn Post' },
                cover: { width: 4, height: 1, name: 'LinkedIn Cover' },
                profile: { width: 1, height: 1, name: 'LinkedIn Profile' }
            },
            youtube: {
                thumbnail: { width: 16, height: 9, name: 'YouTube Thumbnail' },
                banner: { width: 6.2, height: 1, name: 'YouTube Banner' }
            }
        };
    }
    
    /**
     * Apply social media preset crop
     * @param {Object} cropSelection - Current crop selection
     * @param {string} platform - Social media platform
     * @param {string} format - Format type
     * @returns {Object} New crop selection
     */
    static applyPreset(cropSelection, platform, format) {
        const presets = this.getPresets();
        const preset = presets[platform]?.[format];
        
        if (!preset) return cropSelection;
        
        const currentRatio = cropSelection.width / cropSelection.height;
        const targetRatio = preset.width / preset.height;
        
        let newWidth, newHeight;
        
        if (currentRatio > targetRatio) {
            // Too wide, adjust height
            newWidth = cropSelection.width;
            newHeight = cropSelection.width / targetRatio;
        } else {
            // Too tall, adjust width
            newHeight = cropSelection.height;
            newWidth = cropSelection.height * targetRatio;
        }
        
        return {
            x: cropSelection.x + (cropSelection.width - newWidth) / 2,
            y: cropSelection.y + (cropSelection.height - newHeight) / 2,
            width: newWidth,
            height: newHeight
        };
    }
}

export class ExportTools {
    /**
     * Export image in multiple formats and sizes
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export results
     */
    static async exportMultipleFormats(canvas, options = {}) {
        const { formats = ['png', 'jpg', 'webp'], quality = 0.9 } = options;
        const results = {};
        
        for (const format of formats) {
            const blob = await new Promise(resolve => {
                if (format === 'jpg') {
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                } else if (format === 'webp') {
                    canvas.toBlob(resolve, 'image/webp', quality);
                } else {
                    canvas.toBlob(resolve, 'image/png');
                }
            });
            
            results[format] = blob;
        }
        
        return results;
    }
    
    /**
     * Create a ZIP file with multiple exports
     * @param {Object} exports - Export results
     * @param {string} filename - Base filename
     * @returns {Promise<Blob>} ZIP file blob
     */
    static async createExportZip(exports, filename) {
        // This would require a ZIP library like JSZip
        // For now, return the first export
        const format = Object.keys(exports)[0];
        return exports[format];
    }
} 