const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const versionA = process.argv[2]; // e.g., version-1.0.0
const versionB = process.argv[3]; // e.g., version-2.0.0

if (!versionA || !versionB) {
  console.error('Usage: node scripts/diffDocs.js <versionA> <versionB>');
  process.exit(1);
}

const docsPathA = path.join('versioned_docs', versionA);
const docsPathB = path.join('versioned_docs', versionB);
const outputPath = `version-diffs/${versionA}-vs-${versionB}.diff.txt`;

try {
  const diff = execSync(`diff -ruN ${docsPathA} ${docsPathB}`, { encoding: 'utf-8' });
  fs.mkdirSync('version-diffs', { recursive: true });
  fs.writeFileSync(outputPath, diff);
  console.log(`✅ Diff written to ${outputPath}`);
} catch (err) {
  // diff exits with non-zero code if differences exist, so handle that
  if (err.stdout) {
    fs.mkdirSync('version-diffs', { recursive: true });
    fs.writeFileSync(outputPath, err.stdout);
    console.log(`✅ Diff written to ${outputPath}`);
  } else {
    console.error(`❌ Error running diff: ${err.message}`);
  }
}
