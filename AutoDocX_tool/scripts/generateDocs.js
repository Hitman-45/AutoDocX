const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(path.join(__dirname, "..", "static", "functions.json"), "utf-8");
const data = JSON.parse(raw);

const escapeHTML = str =>
  (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const grouped = {};

for (const fn of data) {
  const folder = fn.folder || "root";
  const file = fn.file_path || "unknown";

  if (!grouped[folder]) grouped[folder] = {};
  if (!grouped[folder][file]) grouped[folder][file] = [];

  grouped[folder][file].push(fn);
}

for (const [folder, files] of Object.entries(grouped)) {
  const dirPath = path.join("docs", folder);
  fs.mkdirSync(dirPath, { recursive: true });

  for (const [file, functions] of Object.entries(files)) {
    const fileName = file.replace(/[\\/]/g, "_").replace(/\./g, "_") + ".mdx";
    const mdPath = path.join(dirPath, fileName);
    const title = `File: ${file}`;

    // Function to transform the function JSON to a tree structure
    const transformToTree = (node, name = "root") => {
      if (!node || typeof node !== "object") return { name };

      const children = Object.entries(node).map(([key, value]) => {
        if (Array.isArray(value)) {
          return {
            name: key,
            children: value.map((item, i) => transformToTree(item, `${key}[${i}]`)),
          };
        } else if (typeof value === "object") {
          return transformToTree(value, key);
        } else {
          return { name: `${key}: ${JSON.stringify(value)}` };
        }
      });

      return { name, children };
    };

    // Generate AST tree and write to public/asts
    const astOutputDir = path.join("static", "asts");
    fs.mkdirSync(astOutputDir, { recursive: true });

    const tree = transformToTree({ functions }); // wrap all function data
    const astFileName = file.replace(/[\\/]/g, "_").replace(/\./g, "_") + ".ast.json";
    const astFilePath = path.join(astOutputDir, astFileName);

    fs.writeFileSync(astFilePath, JSON.stringify(tree, null, 2), "utf-8");
    console.log(`✅ AST will be saved: ${astFilePath}`);
    const astViewerComponent = `<ASTViewer file="${astFileName}" />`;
    console.log(`✅ AST saved: ${astFilePath}`);


    const baseFileName = path.basename(file, path.extname(file));

    // Sanitize the file name to replace any slashes with underscores
    const safeFileName = baseFileName.replace(/[\\/]/g, "_") + "_documentation.md";
    
// Full path to summary
// Path to summary folder
const summaryDir = path.join(__dirname, "..", "generated_newdocs");


// Try finding a matching summary file
let summaryFilePath = null;

const summaryCandidates = fs.readdirSync(summaryDir);
for (const candidate of summaryCandidates) {
  if (candidate.startsWith(safeFileName)) {
    summaryFilePath = path.join(summaryDir, candidate);
    break;
  }
}

let codeSummarySection = "";

if (summaryFilePath && fs.existsSync(summaryFilePath)) {
  const summaryContent = fs.readFileSync(summaryFilePath, "utf-8");
  // Regular expression to extract the content from "Class Name" to "[END OF TEXT]"
  const regex = /(\*\*Class Name:\*\*.*)/s;
  const match = summaryContent.match(regex);

  if (match) {
    const extractedContent = match[1].trim();

  codeSummarySection = `
---

### 🧠 Code Summarization

${extractedContent}

---
`;} else {
  console.warn("⚠️ No relevant content found between **Class Name** and [END OF TEXT]");
}
} else {
  console.warn(`⚠️ No summary found for: ${safeFileName}`);
}

    const content = [
      `import ASTViewer from '@site/scripts/AstViewer';`,
      ``,
      `# ${title}`,
      ``,
      `> Below is the AST visualization for this file.`,
      ``,
      astViewerComponent,
      ``,
            
      
      ...functions.map(fn => {
        const escapedCode = escapeHTML(fn.body);
        const escapedDoc = escapeHTML(fn.docstring_or_comment);
      
        return `## \`${escapeHTML(fn.function_name)}()\`\n
      **Class:** ${escapeHTML(fn.class_name || "None")}  
      **Access:** ${escapeHTML(fn.access_specifier)}  
      **Return:** ${escapeHTML(fn.return_type || "void")}  
      **Language:** ${escapeHTML(fn.language)}  
      **Start Line:** ${fn.start_line}  
      **End Line:** ${fn.end_line}  
      
      ${fn.docstring_or_comment ? `> _${escapedDoc}_\n` : ""}
      
      \`\`\`${fn.language.toLowerCase()}
      ${escapedCode}
      \`\`\`
      `;
      }),
      codeSummarySection, 
    ].join("\n");

    fs.writeFileSync(mdPath, content, "utf-8");
    console.log(`📄 Markdown written: ${mdPath}`);
  }
}
