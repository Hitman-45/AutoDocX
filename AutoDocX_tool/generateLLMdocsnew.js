const axios = require('axios'); // Make sure axios is imported
const fs = require('fs');
const path = require('path');

// Endpoint to FastAPI server
const apiUrl = 'https://6355-14-139-176-131.ngrok-free.app/generate'; 

async function sendToLLM(code, filePath) {
  const requestBody = {
    filename: path.basename(filePath), // Use the filename
    code: code, // Send the code
  };

  try {
    const response = await axios.post(apiUrl, requestBody); // Send POST request
    const documentation = response.data.documentation;
    
    // Save documentation to a file
    const outputDir = path.join(__dirname, 'generated_docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFilePath = path.join(outputDir, `${path.basename(filePath, path.extname(filePath))}_documentation.md`);
    fs.writeFileSync(outputFilePath, documentation);
    console.log(`📝 Documentation saved to ${outputFilePath}`);
  } catch (error) {
    console.error(`❌ Error generating documentation for ${filePath}: ${error.response ? error.response.data : error.message}`);
  }
}

function readFilesRecursively(dir) {
  const entries = fs.readdirSync(dir);

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      readFilesRecursively(fullPath); // Recurse into subdirectories
    } else if (/\.(js|py|java|cpp)$/i.test(fullPath)) { // Filter by file types
      const code = fs.readFileSync(fullPath, 'utf-8');
      console.log(`--- Sending ${fullPath} to LLM ---`);
      sendToLLM(code, fullPath); // Send code to the LLM for documentation generation
    }
  });
}

// const readline = require('readline');

// // Create an interface for interactive input
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // Prompt the user to enter the path
// rl.question('Enter your path: ', (inputPath) => {
//   console.log("Input received:", inputPath);
//   const codeDirectory = path.join(__dirname, inputPath); // Define your code directory path
//   readFilesRecursively(codeDirectory); // Start processing files
//   // Close the readline interface after the input
//   rl.close();
// });

const codeDirectory = path.join(__dirname, "code"); // Define your code directory path
readFilesRecursively(codeDirectory); // Start processi


