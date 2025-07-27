// AI Composition Assistant for FrameGen AI

export class AIComposer {
    constructor() {
        this.compositionRules = {
            ruleOfThirds: this.ruleOfThirdsAnalysis,
            goldenRatio: this.goldenRatioAnalysis,
            symmetry: this.symmetryAnalysis,
            leadingLines: this.leadingLinesAnalysis,
            balance: this.balanceAnalysis,
            depth: this.depthAnalysis
        };
    }

    /**
     * Analyze image and provide comprehensive composition feedback
     * @param {ImageData} imageData - The image data to analyze
     * @param {Object} cropSelection - Current crop selection
     * @returns {Object} Comprehensive analysis results
     */
    analyzeComposition(imageData, cropSelection = null) {
        const analysis = {
            overallScore: 0,
            strengths: [],
            weaknesses: [],
            suggestions: [],
            technicalScore: 0,
            artisticScore: 0,
            compositionScore: 0
        };

        // Technical analysis
        analysis.technicalScore = this.analyzeTechnicalAspects(imageData);
        
        // Artistic analysis
        analysis.artisticScore = this.analyzeArtisticAspects(imageData);
        
        // Composition analysis
        analysis.compositionScore = this.analyzeCompositionRules(imageData, cropSelection);
        
        // Overall score
        analysis.overallScore = (
            analysis.technicalScore * 0.3 +
            analysis.artisticScore * 0.3 +
            analysis.compositionScore * 0.4
        );

        // Generate feedback
        this.generateFeedback(analysis, imageData, cropSelection);

        return analysis;
    }

    /**
     * Analyze technical aspects of the image
     */
    analyzeTechnicalAspects(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        let sharpness = 0;
        let exposure = 0;
        let noise = 0;
        
        // Calculate sharpness using edge detection
        const edges = this.detectEdges(imageData);
        const edgePixels = edges.filter(edge => edge > 30).length;
        sharpness = edgePixels / edges.length;
        
        // Calculate exposure
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += brightness;
        }
        exposure = totalBrightness / (data.length / 4) / 255;
        
        // Calculate noise (simplified)
        let brightnessVariance = 0;
        const avgBrightness = totalBrightness / (data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            brightnessVariance += Math.pow(brightness - avgBrightness, 2);
        }
        noise = Math.sqrt(brightnessVariance / (data.length / 4)) / 255;
        
        return (sharpness * 0.4 + (1 - Math.abs(exposure - 0.5) * 2) * 0.4 + (1 - noise) * 0.2);
    }

    /**
     * Analyze artistic aspects of the image
     */
    analyzeArtisticAspects(imageData) {
        const data = imageData.data;
        
        // Color harmony analysis
        const colorHarmony = this.analyzeColorHarmony(data);
        
        // Mood analysis
        const mood = this.analyzeMood(data);
        
        // Visual interest
        const visualInterest = this.analyzeVisualInterest(imageData);
        
        return (colorHarmony * 0.4 + mood * 0.3 + visualInterest * 0.3);
    }

    /**
     * Analyze composition rules
     */
    analyzeCompositionRules(imageData, cropSelection) {
        let totalScore = 0;
        const scores = {};
        
        Object.entries(this.compositionRules).forEach(([rule, analyzer]) => {
            scores[rule] = analyzer.call(this, imageData, cropSelection);
            totalScore += scores[rule];
        });
        
        return totalScore / Object.keys(this.compositionRules).length;
    }

    /**
     * Rule of thirds analysis
     */
    ruleOfThirdsAnalysis(imageData, cropSelection) {
        if (!cropSelection) return 0.5;
        
        const width = imageData.width;
        const height = imageData.height;
        
        const thirdX = width / 3;
        const thirdY = height / 3;
        
        const cropCenterX = cropSelection.x + cropSelection.width / 2;
        const cropCenterY = cropSelection.y + cropSelection.height / 2;
        
        // Check if crop center is near rule of thirds intersections
        const intersections = [
            { x: thirdX, y: thirdY },
            { x: 2 * thirdX, y: thirdY },
            { x: thirdX, y: 2 * thirdY },
            { x: 2 * thirdX, y: 2 * thirdY }
        ];
        
        let bestScore = 0;
        intersections.forEach(intersection => {
            const distance = Math.sqrt(
                Math.pow(cropCenterX - intersection.x, 2) + 
                Math.pow(cropCenterY - intersection.y, 2)
            );
            const score = Math.max(0, 1 - distance / (Math.min(width, height) / 4));
            bestScore = Math.max(bestScore, score);
        });
        
        return bestScore;
    }

    /**
     * Golden ratio analysis
     */
    goldenRatioAnalysis(imageData, cropSelection) {
        if (!cropSelection) return 0.5;
        
        const goldenRatio = 1.618;
        const cropRatio = cropSelection.width / cropSelection.height;
        const ratioDifference = Math.abs(cropRatio - goldenRatio);
        
        return Math.max(0, 1 - ratioDifference / goldenRatio);
    }

    /**
     * Symmetry analysis
     */
    symmetryAnalysis(imageData, cropSelection) {
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
     * Leading lines analysis
     */
    leadingLinesAnalysis(imageData, cropSelection) {
        const edges = this.detectEdges(imageData);
        const width = imageData.width;
        const height = imageData.height;
        
        // Count strong edges that could be leading lines
        let leadingLinePixels = 0;
        let totalPixels = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (edges[y * width + x] > 50) {
                    leadingLinePixels++;
                }
                totalPixels++;
            }
        }
        
        return Math.min(1, leadingLinePixels / (totalPixels * 0.1));
    }

    /**
     * Balance analysis
     */
    balanceAnalysis(imageData, cropSelection) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // Analyze visual weight distribution
        const leftWeight = this.calculateVisualWeight(data, 0, 0, width / 2, height);
        const rightWeight = this.calculateVisualWeight(data, width / 2, 0, width / 2, height);
        const topWeight = this.calculateVisualWeight(data, 0, 0, width, height / 2);
        const bottomWeight = this.calculateVisualWeight(data, 0, height / 2, width, height / 2);
        
        const horizontalBalance = 1 - Math.abs(leftWeight - rightWeight) / Math.max(leftWeight, rightWeight);
        const verticalBalance = 1 - Math.abs(topWeight - bottomWeight) / Math.max(topWeight, bottomWeight);
        
        return (horizontalBalance + verticalBalance) / 2;
    }

    /**
     * Depth analysis
     */
    depthAnalysis(imageData, cropSelection) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Analyze depth of field effect (simplified)
        let sharpPixels = 0;
        let totalPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate local contrast
            const brightness = (r + g + b) / 3;
            const contrast = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            
            if (contrast > 30) {
                sharpPixels++;
            }
            totalPixels++;
        }
        
        return sharpPixels / totalPixels;
    }

    /**
     * Calculate visual weight of a region
     */
    calculateVisualWeight(data, x, y, width, height) {
        let weight = 0;
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const endX = Math.floor(x + width);
        const endY = Math.floor(y + height);
        
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                const idx = (py * Math.sqrt(data.length / 4) + px) * 4;
                if (idx < data.length - 3) {
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    weight += brightness;
                }
            }
        }
        
        return weight;
    }

    /**
     * Analyze color harmony
     */
    analyzeColorHarmony(data) {
        const colors = [];
        
        // Sample colors from the image
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            colors.push({ r, g, b });
        }
        
        // Calculate color harmony using color theory
        let harmonyScore = 0;
        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const color1 = colors[i];
                const color2 = colors[j];
                
                // Calculate color distance
                const distance = Math.sqrt(
                    Math.pow(color1.r - color2.r, 2) +
                    Math.pow(color1.g - color2.g, 2) +
                    Math.pow(color1.b - color2.b, 2)
                );
                
                // Colors that are complementary or similar are harmonious
                if (distance < 50 || distance > 200) {
                    harmonyScore += 1;
                }
            }
        }
        
        return Math.min(1, harmonyScore / (colors.length * (colors.length - 1) / 2));
    }

    /**
     * Analyze mood of the image
     */
    analyzeMood(data) {
        let warmColors = 0;
        let coolColors = 0;
        let totalPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > g && r > b) {
                warmColors++;
            } else if (b > r && b > g) {
                coolColors++;
            }
            totalPixels++;
        }
        
        const warmRatio = warmColors / totalPixels;
        const coolRatio = coolColors / totalPixels;
        
        // Balanced mood is preferred
        return 1 - Math.abs(warmRatio - coolRatio);
    }

    /**
     * Analyze visual interest
     */
    analyzeVisualInterest(imageData) {
        const edges = this.detectEdges(imageData);
        const width = imageData.width;
        const height = imageData.height;
        
        let interestingPixels = 0;
        let totalPixels = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (edges[y * width + x] > 20) {
                    interestingPixels++;
                }
                totalPixels++;
            }
        }
        
        return Math.min(1, interestingPixels / (totalPixels * 0.3));
    }

    /**
     * Detect edges using Sobel operator
     */
    detectEdges(imageData) {
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

    /**
     * Generate feedback based on analysis
     */
    generateFeedback(analysis, imageData, cropSelection) {
        // Technical feedback
        if (analysis.technicalScore < 0.6) {
            analysis.weaknesses.push('Image could benefit from better technical quality');
            analysis.suggestions.push('Consider improving focus and exposure');
        } else {
            analysis.strengths.push('Good technical quality');
        }
        
        // Artistic feedback
        if (analysis.artisticScore < 0.6) {
            analysis.weaknesses.push('Color harmony could be improved');
            analysis.suggestions.push('Try adjusting color balance or applying filters');
        } else {
            analysis.strengths.push('Strong artistic appeal');
        }
        
        // Composition feedback
        if (analysis.compositionScore < 0.6) {
            analysis.weaknesses.push('Composition could be enhanced');
            analysis.suggestions.push('Consider using rule of thirds or golden ratio');
        } else {
            analysis.strengths.push('Excellent composition');
        }
        
        // Overall feedback
        if (analysis.overallScore >= 0.8) {
            analysis.suggestions.push('This is a well-composed image!');
        } else if (analysis.overallScore >= 0.6) {
            analysis.suggestions.push('Good image with room for improvement');
        } else {
            analysis.suggestions.push('Consider recomposing or editing the image');
        }
    }

    /**
     * Get intelligent crop suggestions
     * @param {ImageData} imageData - The image data
     * @returns {Array} Array of crop suggestions
     */
    getIntelligentCropSuggestions(imageData) {
        const suggestions = [];
        const width = imageData.width;
        const height = imageData.height;
        
        // Analyze the image to find interesting areas
        const analysis = this.analyzeComposition(imageData);
        
        // Generate suggestions based on analysis
        if (analysis.compositionScore < 0.5) {
            suggestions.push({
                name: 'Rule of Thirds Crop',
                description: 'Improve composition by following rule of thirds',
                crop: { x: width * 0.33, y: height * 0.33, width: width * 0.34, height: height * 0.34 },
                score: 85
            });
        }
        
        if (analysis.balance < 0.6) {
            suggestions.push({
                name: 'Balanced Crop',
                description: 'Create better visual balance',
                crop: { x: width * 0.2, y: height * 0.2, width: width * 0.6, height: height * 0.6 },
                score: 80
            });
        }
        
        // Add golden ratio suggestion
        const goldenRatio = 1.618;
        const cropWidth = width * 0.6;
        const cropHeight = cropWidth / goldenRatio;
        suggestions.push({
            name: 'Golden Ratio Crop',
            description: 'Apply golden ratio for harmonious composition',
            crop: { x: width * 0.2, y: height * 0.2, width: cropWidth, height: cropHeight },
            score: 90
        });
        
        return suggestions.sort((a, b) => b.score - a.score);
    }
} 