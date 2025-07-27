# FrameGen AI

## Overview
FrameGen AI is a web-based application that leverages artificial intelligence to assist users in cropping images with precision, using Fibonacci-inspired guide lines to enhance composition. This project aims to simplify the cropping process with AI-driven suggestions and allow users to save their edited images effortlessly, now optimized for mobile devices.

## Features
- Upload and preview images
- AI-guided Fibonacci lines for optimal cropping
- Interactive crop selection and download
- User-friendly interface with mobile responsiveness

## Tech Stack
- **Frontend**: HTML5, CSS3 (with Tailwind CSS for mobile-first design), JavaScript (with p5.js for drawing Fibonacci lines)
- **Backend**: Node.js with Express (for potential future API integration)
- **AI/ML**: TensorFlow.js (for lightweight AI cropping suggestions in-browser)
- **Mobile Optimization**: Responsive design with media queries, touch event support
- **Build Tools**: Webpack (for bundling and optimization)
- **Version Control**: Git
- **Hosting**: GitHub Pages (for static deployment)

## Installation

### Quick Start (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/makalin/framegen.git
   cd framegen
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

   This script will automatically:
   - Check Node.js version
   - Install dependencies
   - Build the application
   - Create necessary directories
   - Start the server

### Manual Installation

1. **Prerequisites:**
   - Node.js 18 or higher
   - npm or yarn

2. **Clone and setup:**
   ```bash
   git clone https://github.com/makalin/framegen.git
   cd framegen
   npm install
   npm run build
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Using Docker Compose (Recommended):**
   ```bash
   docker-compose up -d
   ```

2. **Using Docker directly:**
   ```bash
   docker build -t framegen-ai .
   docker run -p 3001:3001 -v $(pwd)/uploads:/app/uploads -v $(pwd)/outputs:/app/outputs framegen-ai
   ```

## Usage

### Basic Workflow

1. **Upload an Image:**
   - Drag and drop an image onto the upload area, or
   - Click "Choose Image" to browse and select a file
   - Supported formats: JPEG, PNG, GIF, WebP (max 10MB)

2. **Use Composition Guides:**
   - **Fibonacci Grid:** Mathematical composition guide based on Fibonacci sequence
   - **Rule of Thirds:** Classic photography composition rule
   - **Golden Spiral:** Golden ratio spiral overlay
   - Toggle guides on/off using the checkboxes in the control panel

3. **Select Crop Area:**
   - Click and drag on the image to create a crop selection
   - Use corner handles to resize the selection
   - Choose from predefined aspect ratios or use free-form cropping

4. **Apply AI Suggestions:**
   - View AI-generated crop suggestions based on image analysis
   - Click "Apply" on any suggestion to automatically set the crop area
   - Suggestions include: Portrait Focus, Landscape Wide, Rule of Thirds, Golden Ratio

5. **Download or Save:**
   - **Download:** Save the cropped image directly to your device
   - **Save to Server:** Store the cropped image on the server for later access

### Advanced Features

#### 🤖 **AI-Powered Analysis**
- **Comprehensive Image Analysis:** Technical, artistic, and composition scoring
- **Subject Detection:** AI-powered face and object detection
- **Composition Feedback:** Real-time suggestions for improving image composition
- **Focus Analysis:** Sharpness and depth of field assessment
- **Color Harmony Analysis:** Advanced color theory-based recommendations

#### 🎨 **Creative Filters & Effects**
- **Vintage Film Effect:** Sepia tones, vignette, and film grain simulation
- **Dramatic Lighting:** Enhanced contrast, highlights, and shadow manipulation
- **Color Grading Presets:** Cinematic, warm, cool, dramatic, and vintage color schemes
- **Real-time Filter Preview:** See effects applied instantly
- **Filter Combinations:** Stack multiple effects for unique results

#### 📱 **Social Media Integration**
- **Platform-Specific Presets:** Instagram, Facebook, Twitter, LinkedIn, YouTube
- **Automatic Crop Optimization:** Perfect aspect ratios for each platform
- **Batch Social Media Export:** Process multiple images for different platforms
- **Story & Post Formats:** Optimized for various social media content types

#### ⚡ **Advanced Export System**
- **Multiple Format Support:** PNG, JPEG, WebP, GIF with quality control
- **Export Presets:** Web, print, and social media optimized settings
- **Batch Export:** Process multiple images simultaneously
- **Quality Optimization:** Automatic image optimization for different use cases
- **Metadata Management:** EXIF data preservation and customization

#### 🔄 **Gesture & Touch Controls**
- **Multi-touch Support:** Pinch-to-zoom, rotation, and pan gestures
- **Advanced Crop Controls:** Resize handles and aspect ratio constraints
- **Touch-friendly Interface:** Optimized for mobile and tablet devices
- **Gesture Reset:** Quick restoration of default view settings

#### 📦 **Batch Processing**
- **Multiple Image Upload:** Drag and drop multiple images at once
- **Batch Crop Application:** Apply same crop settings to multiple images
- **Filter Application:** Apply creative filters to entire batches
- **Batch Export:** Export multiple processed images simultaneously

#### 🎯 **Quality & Performance**
- **Smart Optimization:** Automatic quality adjustment based on output requirements
- **Performance Monitoring:** Real-time processing feedback
- **Memory Management:** Efficient handling of large image files
- **Progressive Loading:** Smooth experience with large images

#### 🔧 **Developer Features**
- **Modular Architecture:** Easy to extend and customize
- **API Integration:** RESTful endpoints for server-side processing
- **Plugin System:** Support for custom filters and effects
- **Comprehensive Documentation:** Detailed API and usage guides

## API Reference

### Endpoints

#### POST /api/upload
Upload an image file to the server.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "filename": "image-1234567890.jpg",
  "originalName": "photo.jpg",
  "size": 1024000,
  "path": "/uploads/image-1234567890.jpg"
}
```

#### POST /api/save-crop
Save a cropped image to the server.

**Request:**
```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "cropped-image.png"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "cropped-cropped-image.png",
  "path": "/outputs/cropped-cropped-image.png"
}
```

## Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run build:dev` - Build the application for development
- `npm run watch` - Watch for changes and rebuild automatically

### Project Structure

```
framegen/
├── src/                   # Source code
│   ├── css/               # Stylesheets
│   │   └── styles.css     # Main styles
│   ├── js/                # JavaScript files
│   │   ├── app.js         # Main application
│   │   └── utils.js       # Utility functions
│   ├── images/            # Image assets
│   └── index.html         # Main HTML file
├── dist/                  # Built files (generated)
├── uploads/               # Uploaded images (generated)
├── outputs/               # Cropped images (generated)
├── server.js              # Express server
├── webpack.config.js      # Webpack configuration
├── package.json           # Dependencies and scripts
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── nginx.conf             # Nginx configuration
├── deploy.sh              # Deployment script
└── README.md              # Project documentation
```

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/framegen.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes and submit a pull request

## License

MIT License - See the [LICENSE](LICENSE) file for details.

## Contact

- **Email:** [makalin@gmail.com](mailto:makalin@gmail.com)
- **Issues:** [GitHub Issues](https://github.com/makalin/framegen/issues)
- **Discussions:** [GitHub Discussions](https://github.com/makalin/framegen/discussions)

## Acknowledgments

- [p5.js](https://p5js.org/) - Creative coding library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Express.js](https://expressjs.com/) - Web application framework
- [Webpack](https://webpack.js.org/) - Module bundler
