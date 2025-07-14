// This script will be used to update API endpoints in the frontend
// It replaces all references to local API endpoints with the production backend URL
// Usage: node update-api-endpoints.js https://your-backend-url.com

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Get the backend URL from command line arguments
const backendUrl = process.argv[2];
if (!backendUrl) {
    console.error('Please provide a backend URL');
    console.error(
        'Usage: node update-api-endpoints.js https://your-backend-url.com'
    );
    process.exit(1);
}

// Directories to scan
const directories = [
    path.join(__dirname, 'public', 'components'),
    path.join(__dirname, 'public', 'utils'),
    path.join(__dirname, 'public', 'js'),
];

// Find all JS files in the directories
async function findJsFiles(dir) {
    const files = await promisify(fs.readdir)(dir);
    const jsFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await promisify(fs.stat)(fullPath);

        if (stat.isDirectory()) {
            const nestedFiles = await findJsFiles(fullPath);
            jsFiles.push(...nestedFiles);
        } else if (file.endsWith('.js')) {
            jsFiles.push(fullPath);
        }
    }

    return jsFiles;
}

// Update fetch URLs in a file
async function updateFile(filePath) {
    try {
        const content = await readFile(filePath, 'utf8');

        // Replace all fetch calls to relative URLs with the backend URL
        // Pattern: fetch('/api/something') -> fetch('https://backend-url.com/api/something')
        const updatedContent = content.replace(
            /fetch\(\s*['"]\/api\//g,
            `fetch('${backendUrl}/api/`
        );

        if (content !== updatedContent) {
            await writeFile(filePath, updatedContent, 'utf8');
            console.log(`Updated ${filePath}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
        return false;
    }
}

// Main function
async function main() {
    let updatedCount = 0;

    for (const dir of directories) {
        try {
            const files = await findJsFiles(dir);

            for (const file of files) {
                const updated = await updateFile(file);
                if (updated) updatedCount++;
            }
        } catch (error) {
            console.error(`Error processing directory ${dir}:`, error);
        }
    }

    console.log(`\nUpdated API endpoints in ${updatedCount} files`);
    console.log(`Backend URL: ${backendUrl}`);
}

main().catch(console.error);
