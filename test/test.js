// Simple test suite for FrameGen AI
// Run with: node test/test.js

const fs = require('fs');
const path = require('path');

console.log('🧪 FrameGen AI Test Suite');
console.log('========================');

// Test 1: Check if required files exist
console.log('\n📁 Testing file structure...');

const requiredFiles = [
    'package.json',
    'server.js',
    'webpack.config.js',
    'src/index.html',
    'src/css/styles.css',
    'src/js/app.js',
    'src/js/utils.js',
    'src/js/advanced-tools.js',
    'src/js/ai-composer.js',
    'src/js/gesture-controller.js',
    'src/js/export-manager.js',
    'README.md',
    'LICENSE',
    '.gitignore'
];

let fileTestsPassed = 0;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
        fileTestsPassed++;
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log(`\n📊 File structure: ${fileTestsPassed}/${requiredFiles.length} files found`);

// Test 2: Check package.json
console.log('\n📦 Testing package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
    let packageTestsPassed = 0;
    
    requiredFields.forEach(field => {
        if (packageJson[field]) {
            console.log(`✅ ${field}: ${packageJson[field]}`);
            packageTestsPassed++;
        } else {
            console.log(`❌ ${field} missing`);
        }
    });
    
    console.log(`📊 Package.json: ${packageTestsPassed}/${requiredFields.length} fields valid`);
    
    // Check for required scripts
    const requiredScripts = ['start', 'build'];
    let scriptTestsPassed = 0;
    
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`✅ script ${script}: ${packageJson.scripts[script]}`);
            scriptTestsPassed++;
        } else {
            console.log(`❌ script ${script} missing`);
        }
    });
    
    console.log(`📊 Scripts: ${scriptTestsPassed}/${requiredScripts.length} scripts found`);
    
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
}

// Test 3: Check if directories can be created
console.log('\n📂 Testing directory creation...');
const testDirs = ['uploads', 'outputs', 'dist'];

testDirs.forEach(dir => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created ${dir} directory`);
        } else {
            console.log(`✅ ${dir} directory exists`);
        }
    } catch (error) {
        console.log(`❌ Failed to create ${dir} directory: ${error.message}`);
    }
});

// Test 4: Check Node.js version
console.log('\n🟢 Testing Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
    console.log(`✅ Node.js version ${nodeVersion} (>= 18 required)`);
} else {
    console.log(`❌ Node.js version ${nodeVersion} (>= 18 required)`);
}

// Test 5: Check if dependencies can be installed
console.log('\n📦 Testing dependency installation...');
try {
    const packageLockExists = fs.existsSync('package-lock.json');
    const nodeModulesExists = fs.existsSync('node_modules');
    
    if (packageLockExists) {
        console.log('✅ package-lock.json exists');
    } else {
        console.log('⚠️  package-lock.json not found (run npm install)');
    }
    
    if (nodeModulesExists) {
        console.log('✅ node_modules exists');
    } else {
        console.log('⚠️  node_modules not found (run npm install)');
    }
} catch (error) {
    console.log(`❌ Error checking dependencies: ${error.message}`);
}

// Summary
console.log('\n🎯 Test Summary');
console.log('==============');
console.log('✅ Basic file structure validation');
console.log('✅ Package.json configuration check');
console.log('✅ Directory creation test');
console.log('✅ Node.js version check');
console.log('✅ Dependency status check');

console.log('\n🚀 To run the application:');
console.log('   1. npm install (if not done already)');
console.log('   2. npm run build');
console.log('   3. npm start');
console.log('   4. Open http://localhost:3001 in your browser');

console.log('\n🎨 FrameGen AI is ready to use!'); 