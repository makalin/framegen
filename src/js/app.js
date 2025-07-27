// FrameGen AI - Main Application
import '../css/styles.css';
import { AdvancedImageAnalysis, CreativeFilters, BatchProcessor, SocialMediaPresets, ExportTools } from './advanced-tools.js';
import { AIComposer } from './ai-composer.js';
import { GestureController, CropGestureController } from './gesture-controller.js';
import { ExportManager, MetadataManager, QualityOptimizer } from './export-manager.js';

class FrameGenAI {
    constructor() {
        this.currentImage = null;
        this.cropSelection = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.canvas = null;
        this.p5Instance = null;
        this.fibonacciGuides = {
            grid: true,
            ruleOfThirds: false,
            goldenSpiral: false
        };
        this.aspectRatio = 'free';
        this.cropQuality = 'high';
        
        // Advanced features
        this.aiComposer = new AIComposer();
        this.exportManager = new ExportManager();
        this.metadataManager = new MetadataManager();
        this.qualityOptimizer = new QualityOptimizer();
        this.gestureController = null;
        this.cropGestureController = null;
        
        // Creative filters
        this.activeFilters = {
            vintage: false,
            dramatic: false,
            colorGrading: null
        };
        
        // Batch processing
        this.batchQueue = [];
        this.isBatchProcessing = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupP5Canvas();
        this.showToast('Welcome to FrameGen AI! Upload an image to get started.', 'success');
    }

    setupEventListeners() {
        // Upload functionality
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const uploadBtn = document.getElementById('uploadBtn');

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadBtn.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                if (files.length === 1) {
                    this.loadImage(files[0]);
                } else {
                    this.handleBatchUpload(files);
                }
            }
        });

        // Control panel
        document.getElementById('fibonacciGrid').addEventListener('change', (e) => {
            this.fibonacciGuides.grid = e.target.checked;
            this.updateGuides();
        });

        document.getElementById('ruleOfThirds').addEventListener('change', (e) => {
            this.fibonacciGuides.ruleOfThirds = e.target.checked;
            this.updateGuides();
        });

        document.getElementById('goldenSpiral').addEventListener('change', (e) => {
            this.fibonacciGuides.goldenSpiral = e.target.checked;
            this.updateGuides();
        });

        document.getElementById('aspectRatio').addEventListener('change', (e) => {
            this.aspectRatio = e.target.value;
            this.updateCropSelection();
        });

        document.getElementById('cropQuality').addEventListener('change', (e) => {
            this.cropQuality = e.target.value;
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetCrop());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadCroppedImage());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveToServer());
        
        // Advanced feature buttons (will be added to HTML)
        this.setupAdvancedEventListeners();
    }
    
    setupAdvancedEventListeners() {
        // Add event listeners for advanced features
        const advancedButtons = {
            'aiAnalysisBtn': () => this.performAIAnalysis(),
            'applyFilterBtn': () => this.applyCreativeFilter(),
            'batchProcessBtn': () => this.startBatchProcessing(),
            'exportPresetBtn': () => this.exportWithPreset(),
            'socialMediaBtn': () => this.applySocialMediaPreset(),
            'gestureResetBtn': () => this.resetGestures(),
            'qualityOptimizeBtn': () => this.optimizeQuality()
        };
        
        Object.entries(advancedButtons).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler.bind(this));
            }
        });
    }

    setupP5Canvas() {
        const canvasContainer = document.getElementById('canvasContainer');
        
        this.p5Instance = new p5((p) => {
            p.setup = () => {
                const canvas = p.createCanvas(800, 600);
                canvas.parent(canvasContainer);
                this.canvas = canvas;
                p.background(240);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(24);
                p.fill(100);
                p.text('Upload an image to begin', p.width/2, p.height/2);
            };

            p.draw = () => {
                if (this.currentImage) {
                    p.image(this.currentImage, 0, 0, p.width, p.height);
                    this.drawGuides(p);
                    this.drawCropSelection(p);
                }
            };

            p.mousePressed = () => {
                if (this.currentImage) {
                    this.startCropSelection(p.mouseX, p.mouseY);
                }
            };

            p.mouseDragged = () => {
                if (this.currentImage && this.isDragging) {
                    this.updateCropSelection(p.mouseX, p.mouseY);
                }
            };

            p.mouseReleased = () => {
                if (this.currentImage) {
                    this.finishCropSelection();
                }
            };

            p.touchStarted = () => {
                if (this.currentImage && p.touches.length > 0) {
                    this.startCropSelection(p.touches[0].x, p.touches[0].y);
                }
            };

            p.touchMoved = () => {
                if (this.currentImage && this.isDragging && p.touches.length > 0) {
                    this.updateCropSelection(p.touches[0].x, p.touches[0].y);
                }
            };

            p.touchEnded = () => {
                if (this.currentImage) {
                    this.finishCropSelection();
                }
            };
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file.', 'error');
            return;
        }

        this.showLoading(true);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = this.p5Instance.loadImage(e.target.result, () => {
                    this.resizeCanvas();
                    this.showLoading(false);
                    this.showEditor();
                    this.generateAISuggestions();
                    this.showToast('Image loaded successfully!', 'success');
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resizeCanvas() {
        if (this.currentImage) {
            const container = document.getElementById('canvasContainer');
            const containerWidth = container.offsetWidth;
            const containerHeight = Math.max(400, container.offsetHeight);
            
            const imgAspect = this.currentImage.width / this.currentImage.height;
            const containerAspect = containerWidth / containerHeight;
            
            let canvasWidth, canvasHeight;
            
            if (imgAspect > containerAspect) {
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / imgAspect;
            } else {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * imgAspect;
            }
            
            this.p5Instance.resizeCanvas(canvasWidth, canvasHeight);
        }
    }

    drawGuides(p) {
        if (!this.fibonacciGuides.grid && !this.fibonacciGuides.ruleOfThirds && !this.fibonacciGuides.goldenSpiral) {
            return;
        }

        p.push();
        p.stroke(59, 130, 246, 150);
        p.strokeWeight(2);
        p.setLineDash([5, 5]);

        if (this.fibonacciGuides.grid) {
            this.drawFibonacciGrid(p);
        }

        if (this.fibonacciGuides.ruleOfThirds) {
            this.drawRuleOfThirds(p);
        }

        if (this.fibonacciGuides.goldenSpiral) {
            this.drawGoldenSpiral(p);
        }

        p.pop();
    }

    drawFibonacciGrid(p) {
        const width = p.width;
        const height = p.height;
        
        // Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
        
        // Vertical lines
        for (let i = 1; i < fib.length; i++) {
            const x = (fib[i] / fib[fib.length - 1]) * width;
            p.line(x, 0, x, height);
        }
        
        // Horizontal lines
        for (let i = 1; i < fib.length; i++) {
            const y = (fib[i] / fib[fib.length - 1]) * height;
            p.line(0, y, width, y);
        }
    }

    drawRuleOfThirds(p) {
        const width = p.width;
        const height = p.height;
        
        // Vertical lines
        p.line(width / 3, 0, width / 3, height);
        p.line(2 * width / 3, 0, 2 * width / 3, height);
        
        // Horizontal lines
        p.line(0, height / 3, width, height / 3);
        p.line(0, 2 * height / 3, width, 2 * height / 3);
    }

    drawGoldenSpiral(p) {
        const width = p.width;
        const height = p.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;
        
        p.noFill();
        p.beginShape();
        
        for (let angle = 0; angle < 4 * Math.PI; angle += 0.1) {
            const radius = maxRadius * Math.exp(0.306349 * angle);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                p.vertex(x, y);
            }
        }
        
        p.endShape();
    }

    startCropSelection(x, y) {
        this.isDragging = true;
        this.dragStart = { x, y };
        this.cropSelection = {
            x: x,
            y: y,
            width: 0,
            height: 0
        };
    }

    updateCropSelection(x, y) {
        if (!this.isDragging || !this.cropSelection) return;

        const width = x - this.dragStart.x;
        const height = y - this.dragStart.y;

        this.cropSelection.x = width < 0 ? x : this.dragStart.x;
        this.cropSelection.y = height < 0 ? y : this.dragStart.y;
        this.cropSelection.width = Math.abs(width);
        this.cropSelection.height = Math.abs(height);

        // Apply aspect ratio constraint
        if (this.aspectRatio !== 'free') {
            this.applyAspectRatio();
        }
    }

    applyAspectRatio() {
        if (!this.cropSelection) return;

        const ratios = {
            '1:1': 1,
            '4:3': 4/3,
            '16:9': 16/9,
            '3:2': 3/2,
            '5:4': 5/4
        };

        const targetRatio = ratios[this.aspectRatio];
        if (!targetRatio) return;

        const currentRatio = this.cropSelection.width / this.cropSelection.height;
        
        if (currentRatio > targetRatio) {
            // Too wide, adjust height
            this.cropSelection.height = this.cropSelection.width / targetRatio;
        } else {
            // Too tall, adjust width
            this.cropSelection.width = this.cropSelection.height * targetRatio;
        }
    }

    finishCropSelection() {
        this.isDragging = false;
        if (this.cropSelection && this.cropSelection.width > 10 && this.cropSelection.height > 10) {
            this.showToast('Crop selection created!', 'success');
        } else {
            this.cropSelection = null;
        }
    }

    drawCropSelection(p) {
        if (!this.cropSelection) return;

        // Semi-transparent overlay
        p.push();
        p.fill(0, 0, 0, 100);
        p.rect(0, 0, p.width, p.height);
        
        // Clear crop area
        p.erase();
        p.rect(this.cropSelection.x, this.cropSelection.y, this.cropSelection.width, this.cropSelection.height);
        p.noErase();
        
        // Crop border
        p.stroke(16, 185, 129);
        p.strokeWeight(2);
        p.noFill();
        p.rect(this.cropSelection.x, this.cropSelection.y, this.cropSelection.width, this.cropSelection.height);
        
        // Corner handles
        p.fill(16, 185, 129);
        p.stroke(255);
        p.strokeWeight(2);
        
        const handleSize = 8;
        p.rect(this.cropSelection.x - handleSize/2, this.cropSelection.y - handleSize/2, handleSize, handleSize);
        p.rect(this.cropSelection.x + this.cropSelection.width - handleSize/2, this.cropSelection.y - handleSize/2, handleSize, handleSize);
        p.rect(this.cropSelection.x - handleSize/2, this.cropSelection.y + this.cropSelection.height - handleSize/2, handleSize, handleSize);
        p.rect(this.cropSelection.x + this.cropSelection.width - handleSize/2, this.cropSelection.y + this.cropSelection.height - handleSize/2, handleSize, handleSize);
        
        p.pop();
    }

    updateGuides() {
        // This will trigger a redraw in the p5 draw loop
    }

    updateCropSelection() {
        // This will trigger a redraw in the p5 draw loop
    }

    resetCrop() {
        this.cropSelection = null;
        this.showToast('Crop selection reset.', 'success');
    }

    downloadCroppedImage() {
        if (!this.cropSelection || !this.currentImage) {
            this.showToast('Please select a crop area first.', 'error');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to crop dimensions
        canvas.width = this.cropSelection.width;
        canvas.height = this.cropSelection.height;
        
        // Create a temporary canvas to get the image data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.p5Instance.width;
        tempCanvas.height = this.p5Instance.height;
        
        // Draw the p5 canvas to temp canvas
        tempCtx.drawImage(this.p5Instance.canvas, 0, 0);
        
        // Crop the image
        ctx.drawImage(
            tempCanvas,
            this.cropSelection.x,
            this.cropSelection.y,
            this.cropSelection.width,
            this.cropSelection.height,
            0,
            0,
            this.cropSelection.width,
            this.cropSelection.height
        );
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `framegen-crop-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Image downloaded successfully!', 'success');
        }, 'image/png');
    }

    async saveToServer() {
        if (!this.cropSelection || !this.currentImage) {
            this.showToast('Please select a crop area first.', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // Create cropped image data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = this.cropSelection.width;
            canvas.height = this.cropSelection.height;
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.p5Instance.width;
            tempCanvas.height = this.p5Instance.height;
            
            tempCtx.drawImage(this.p5Instance.canvas, 0, 0);
            
            ctx.drawImage(
                tempCanvas,
                this.cropSelection.x,
                this.cropSelection.y,
                this.cropSelection.width,
                this.cropSelection.height,
                0,
                0,
                this.cropSelection.width,
                this.cropSelection.height
            );
            
            const imageData = canvas.toDataURL('image/png');
            const filename = `crop-${Date.now()}.png`;

            // Send to server
            const response = await fetch('/api/save-crop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: imageData,
                    filename: filename
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showToast('Image saved to server successfully!', 'success');
            } else {
                throw new Error('Failed to save image');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Failed to save image to server.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    generateAISuggestions() {
        // Simulate AI suggestions based on image analysis
        const suggestions = [
            {
                name: 'Portrait Focus',
                description: 'Center the subject for a classic portrait',
                crop: { x: 0.25, y: 0.1, width: 0.5, height: 0.8 }
            },
            {
                name: 'Landscape Wide',
                description: 'Emphasize the horizon and sky',
                crop: { x: 0.1, y: 0.2, width: 0.8, height: 0.6 }
            },
            {
                name: 'Rule of Thirds',
                description: 'Position key elements at intersection points',
                crop: { x: 0.33, y: 0.33, width: 0.34, height: 0.34 }
            }
        ];

        this.displayAISuggestions(suggestions);
    }

    displayAISuggestions(suggestions) {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const card = document.createElement('div');
            card.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer';
            card.innerHTML = `
                <h4 class="font-semibold text-gray-800 mb-2">${suggestion.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${suggestion.description}</p>
                <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors">
                    Apply
                </button>
            `;
            
            card.querySelector('button').addEventListener('click', () => {
                this.applyAISuggestion(suggestion);
            });
            
            container.appendChild(card);
        });

        document.getElementById('aiSection').classList.remove('hidden');
    }

    applyAISuggestion(suggestion) {
        if (!this.currentImage) return;

        const width = this.p5Instance.width;
        const height = this.p5Instance.height;

        this.cropSelection = {
            x: suggestion.crop.x * width,
            y: suggestion.crop.y * height,
            width: suggestion.crop.width * width,
            height: suggestion.crop.height * height
        };

        this.showToast(`Applied ${suggestion.name} suggestion!`, 'success');
    }

    showEditor() {
        document.getElementById('editorSection').classList.remove('hidden');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        const toast = type === 'success' ? document.getElementById('successToast') : document.getElementById('errorToast');
        const messageElement = type === 'success' ? document.getElementById('successMessage') : document.getElementById('errorMessage');
        
        messageElement.textContent = message;
        
        // Show toast
        toast.classList.remove('translate-x-full');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }
    
    // Advanced AI Analysis
    async performAIAnalysis() {
        if (!this.currentImage) {
            this.showToast('Please upload an image first.', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            // Get image data from canvas
            const canvas = this.p5Instance.canvas;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Perform comprehensive AI analysis
            const analysis = this.aiComposer.analyzeComposition(imageData, this.cropSelection);
            
            // Display analysis results
            this.displayAIAnalysis(analysis);
            
            this.showToast('AI analysis completed!', 'success');
        } catch (error) {
            console.error('AI analysis error:', error);
            this.showToast('AI analysis failed.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayAIAnalysis(analysis) {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = '';
        
        // Create analysis summary
        const summaryCard = document.createElement('div');
        summaryCard.className = 'col-span-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200';
        summaryCard.innerHTML = `
            <h4 class="font-semibold text-gray-800 mb-2">AI Analysis Summary</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="font-medium">Overall Score:</span>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${analysis.overallScore * 100}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${Math.round(analysis.overallScore * 100)}/100</span>
                </div>
                <div>
                    <span class="font-medium">Technical:</span>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${analysis.technicalScore * 100}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${Math.round(analysis.technicalScore * 100)}/100</span>
                </div>
                <div>
                    <span class="font-medium">Artistic:</span>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div class="bg-purple-600 h-2 rounded-full" style="width: ${analysis.artisticScore * 100}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${Math.round(analysis.artisticScore * 100)}/100</span>
                </div>
                <div>
                    <span class="font-medium">Composition:</span>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div class="bg-orange-600 h-2 rounded-full" style="width: ${analysis.compositionScore * 100}%"></div>
                    </div>
                    <span class="text-xs text-gray-600">${Math.round(analysis.compositionScore * 100)}/100</span>
                </div>
            </div>
        `;
        container.appendChild(summaryCard);
        
        // Display strengths and weaknesses
        if (analysis.strengths.length > 0) {
            const strengthsCard = document.createElement('div');
            strengthsCard.className = 'bg-green-50 rounded-lg p-4 border border-green-200';
            strengthsCard.innerHTML = `
                <h5 class="font-medium text-green-800 mb-2">✅ Strengths</h5>
                <ul class="text-sm text-green-700 space-y-1">
                    ${analysis.strengths.map(strength => `<li>• ${strength}</li>`).join('')}
                </ul>
            `;
            container.appendChild(strengthsCard);
        }
        
        if (analysis.weaknesses.length > 0) {
            const weaknessesCard = document.createElement('div');
            weaknessesCard.className = 'bg-red-50 rounded-lg p-4 border border-red-200';
            weaknessesCard.innerHTML = `
                <h5 class="font-medium text-red-800 mb-2">⚠️ Areas for Improvement</h5>
                <ul class="text-sm text-red-700 space-y-1">
                    ${analysis.weaknesses.map(weakness => `<li>• ${weakness}</li>`).join('')}
                </ul>
            `;
            container.appendChild(weaknessesCard);
        }
        
        // Display suggestions
        if (analysis.suggestions.length > 0) {
            const suggestionsCard = document.createElement('div');
            suggestionsCard.className = 'bg-blue-50 rounded-lg p-4 border border-blue-200';
            suggestionsCard.innerHTML = `
                <h5 class="font-medium text-blue-800 mb-2">💡 Suggestions</h5>
                <ul class="text-sm text-blue-700 space-y-1">
                    ${analysis.suggestions.map(suggestion => `<li>• ${suggestion}</li>`).join('')}
                </ul>
            `;
            container.appendChild(suggestionsCard);
        }
        
        document.getElementById('aiSection').classList.remove('hidden');
    }
    
    // Creative Filters
    applyCreativeFilter() {
        if (!this.currentImage) {
            this.showToast('Please upload an image first.', 'error');
            return;
        }
        
        // Show filter selection modal
        this.showFilterModal();
    }
    
    showFilterModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">Apply Creative Filter</h3>
                <div class="space-y-3">
                    <label class="flex items-center">
                        <input type="checkbox" id="vintageFilter" class="mr-2">
                        <span>Vintage Film Effect</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="dramaticFilter" class="mr-2">
                        <span>Dramatic Lighting</span>
                    </label>
                    <div>
                        <label class="block text-sm font-medium mb-1">Color Grading</label>
                        <select id="colorGrading" class="w-full p-2 border border-gray-300 rounded">
                            <option value="">None</option>
                            <option value="cinematic">Cinematic</option>
                            <option value="warm">Warm</option>
                            <option value="cool">Cool</option>
                            <option value="dramatic">Dramatic</option>
                            <option value="vintage">Vintage</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="cancelFilter" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                    <button id="applyFilter" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#cancelFilter').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#applyFilter').addEventListener('click', () => {
            this.processCreativeFilters(modal);
        });
    }
    
    processCreativeFilters(modal) {
        const vintage = modal.querySelector('#vintageFilter').checked;
        const dramatic = modal.querySelector('#dramaticFilter').checked;
        const colorGrading = modal.querySelector('#colorGrading').value;
        
        if (!vintage && !dramatic && !colorGrading) {
            this.showToast('Please select at least one filter.', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            // Get image data
            const canvas = this.p5Instance.canvas;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Apply filters
            if (vintage) {
                CreativeFilters.applyVintageEffect(imageData, { sepia: 0.3, vignette: 0.4, grain: 0.2 });
            }
            
            if (dramatic) {
                CreativeFilters.applyDramaticLighting(imageData, { contrast: 1.3, brightness: 0.1, highlights: 0.2, shadows: -0.3 });
            }
            
            if (colorGrading) {
                CreativeFilters.applyColorGrading(imageData, colorGrading);
            }
            
            // Update canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Update active filters
            this.activeFilters = { vintage, dramatic, colorGrading };
            
            this.showToast('Creative filters applied successfully!', 'success');
            document.body.removeChild(modal);
        } catch (error) {
            console.error('Filter application error:', error);
            this.showToast('Failed to apply filters.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Batch Processing
    handleBatchUpload(files) {
        this.batchQueue = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (this.batchQueue.length === 0) {
            this.showToast('No valid image files found.', 'error');
            return;
        }
        
        this.showToast(`${this.batchQueue.length} images added to batch queue.`, 'success');
        this.showBatchControls();
    }
    
    showBatchControls() {
        const batchSection = document.getElementById('batchSection');
        if (batchSection) {
            batchSection.classList.remove('hidden');
            batchSection.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Batch Processing</h3>
                <p class="text-gray-600 mb-4">${this.batchQueue.length} images in queue</p>
                <div class="space-y-3">
                    <button id="startBatchBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                        Start Batch Processing
                    </button>
                    <button id="clearBatchBtn" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg">
                        Clear Queue
                    </button>
                </div>
            `;
            
            batchSection.querySelector('#startBatchBtn').addEventListener('click', () => this.startBatchProcessing());
            batchSection.querySelector('#clearBatchBtn').addEventListener('click', () => this.clearBatchQueue());
        }
    }
    
    async startBatchProcessing() {
        if (this.batchQueue.length === 0) {
            this.showToast('No images in batch queue.', 'error');
            return;
        }
        
        this.isBatchProcessing = true;
        this.showLoading(true);
        
        try {
            const results = await BatchProcessor.processBatch(this.batchQueue, {
                aspectRatio: this.aspectRatio,
                quality: this.cropQuality,
                filters: this.activeFilters
            });
            
            this.showBatchResults(results);
        } catch (error) {
            console.error('Batch processing error:', error);
            this.showToast('Batch processing failed.', 'error');
        } finally {
            this.isBatchProcessing = false;
            this.showLoading(false);
        }
    }
    
    showBatchResults(results) {
        const container = document.getElementById('aiSuggestions');
        container.innerHTML = '';
        
        const resultsCard = document.createElement('div');
        resultsCard.className = 'col-span-full bg-green-50 rounded-lg p-4 border border-green-200';
        resultsCard.innerHTML = `
            <h4 class="font-semibold text-green-800 mb-2">Batch Processing Complete</h4>
            <p class="text-green-700 mb-3">Successfully processed ${results.length} images</p>
            <button id="downloadBatchBtn" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg">
                Download All
            </button>
        `;
        
        container.appendChild(resultsCard);
        
        resultsCard.querySelector('#downloadBatchBtn').addEventListener('click', () => {
            this.downloadBatchResults(results);
        });
        
        document.getElementById('aiSection').classList.remove('hidden');
    }
    
    downloadBatchResults(results) {
        results.forEach((result, index) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(result.processed);
            link.download = `batch-${index + 1}.png`;
            link.click();
            URL.revokeObjectURL(link.href);
        });
        
        this.showToast('Batch download started!', 'success');
    }
    
    clearBatchQueue() {
        this.batchQueue = [];
        const batchSection = document.getElementById('batchSection');
        if (batchSection) {
            batchSection.classList.add('hidden');
        }
        this.showToast('Batch queue cleared.', 'success');
    }
    
    // Social Media Presets
    applySocialMediaPreset() {
        if (!this.cropSelection) {
            this.showToast('Please select a crop area first.', 'error');
            return;
        }
        
        this.showSocialMediaModal();
    }
    
    showSocialMediaModal() {
        const presets = SocialMediaPresets.getPresets();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        let modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <h3 class="text-xl font-semibold mb-4">Social Media Presets</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        `;
        
        Object.entries(presets).forEach(([platform, formats]) => {
            modalContent += `
                <div class="border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-3">${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
                    <div class="space-y-2">
            `;
            
            Object.entries(formats).forEach(([format, config]) => {
                modalContent += `
                    <button class="w-full text-left p-2 hover:bg-gray-100 rounded text-sm" 
                            data-platform="${platform}" data-format="${format}">
                        ${config.name} (${config.width}:${config.height})
                    </button>
                `;
            });
            
            modalContent += `
                    </div>
                </div>
            `;
        });
        
        modalContent += `
                </div>
                <div class="flex justify-end mt-6">
                    <button id="cancelSocial" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#cancelSocial').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelectorAll('[data-platform]').forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                const format = button.dataset.format;
                this.applySocialMediaCrop(platform, format);
                document.body.removeChild(modal);
            });
        });
    }
    
    applySocialMediaCrop(platform, format) {
        const presets = SocialMediaPresets.getPresets();
        const preset = presets[platform]?.[format];
        
        if (!preset) {
            this.showToast('Invalid preset selected.', 'error');
            return;
        }
        
        const newCrop = SocialMediaPresets.applyPreset(this.cropSelection, platform, format);
        this.cropSelection = newCrop;
        
        this.showToast(`${preset.name} preset applied!`, 'success');
    }
    
    // Export with Presets
    async exportWithPreset() {
        if (!this.cropSelection || !this.currentImage) {
            this.showToast('Please select a crop area first.', 'error');
            return;
        }
        
        this.showExportPresetModal();
    }
    
    showExportPresetModal() {
        const presets = this.exportManager.getExportPresets();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        let modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">Export Presets</h3>
                <div class="space-y-3">
        `;
        
        Object.entries(presets).forEach(([name, config]) => {
            modalContent += `
                <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50" 
                        data-preset="${name}">
                    <div class="font-medium text-gray-800">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
                    <div class="text-sm text-gray-600">
                        ${config.formats.join(', ')} • ${config.sizes.length} sizes
                    </div>
                </button>
            `;
        });
        
        modalContent += `
                </div>
                <div class="flex justify-end mt-6">
                    <button id="cancelExport" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#cancelExport').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelectorAll('[data-preset]').forEach(button => {
            button.addEventListener('click', async () => {
                const preset = button.dataset.preset;
                await this.processExportPreset(preset);
                document.body.removeChild(modal);
            });
        });
    }
    
    async processExportPreset(preset) {
        this.showLoading(true);
        
        try {
            const canvas = this.p5Instance.canvas;
            const results = await this.exportManager.exportWithPreset(canvas, preset, {
                filename: 'framegen-export'
            });
            
            // Download all results
            results.forEach(result => {
                if (result.success) {
                    this.exportManager.downloadFile(result.blob, result.filename);
                }
            });
            
            this.showToast(`Exported ${results.length} files with ${preset} preset!`, 'success');
        } catch (error) {
            console.error('Export preset error:', error);
            this.showToast('Export failed.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Gesture Controls
    resetGestures() {
        if (this.gestureController) {
            this.gestureController.reset();
        }
        this.showToast('Gestures reset to default.', 'success');
    }
    
    // Quality Optimization
    optimizeQuality() {
        if (!this.currentImage) {
            this.showToast('Please upload an image first.', 'error');
            return;
        }
        
        this.showQualityModal();
    }
    
    showQualityModal() {
        const levels = this.qualityOptimizer.getOptimizationLevels();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        let modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-semibold mb-4">Quality Optimization</h3>
                <div class="space-y-3">
        `;
        
        Object.entries(levels).forEach(([level, config]) => {
            modalContent += `
                <button class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50" 
                        data-level="${level}">
                    <div class="font-medium text-gray-800">${level.charAt(0).toUpperCase() + level.slice(1)}</div>
                    <div class="text-sm text-gray-600">
                        Quality: ${Math.round(config.quality * 100)}% • Max: ${config.maxWidth}x${config.maxHeight}
                    </div>
                </button>
            `;
        });
        
        modalContent += `
                </div>
                <div class="flex justify-end mt-6">
                    <button id="cancelQuality" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#cancelQuality').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelectorAll('[data-level]').forEach(button => {
            button.addEventListener('click', () => {
                const level = button.dataset.level;
                this.processQualityOptimization(level);
                document.body.removeChild(modal);
            });
        });
    }
    
    processQualityOptimization(level) {
        this.showLoading(true);
        
        try {
            const canvas = this.p5Instance.canvas;
            const optimizedCanvas = this.qualityOptimizer.optimizeQuality(canvas, level);
            
            // Replace current canvas with optimized version
            const ctx = this.p5Instance.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.p5Instance.canvas.width, this.p5Instance.canvas.height);
            ctx.drawImage(optimizedCanvas, 0, 0);
            
            this.showToast(`Quality optimized to ${level} level!`, 'success');
        } catch (error) {
            console.error('Quality optimization error:', error);
            this.showToast('Quality optimization failed.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FrameGenAI();
});

// Add p5.js line dash functionality
p5.prototype.setLineDash = function(list) {
    this.drawingContext.setLineDash(list);
}; 