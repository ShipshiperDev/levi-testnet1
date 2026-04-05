const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.sol')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const ozFiles = getFiles('node_modules/@openzeppelin/contracts');
const myFiles = [
  'contracts/LeviToken.sol',
  'contracts/LeviPresale.sol'
];

function combine(mainFile) {
  let combined = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n';
  const visited = new Set();
  
  function process(file) {
    if (visited.has(file)) return;
    visited.add(file);
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Find imports
    const importRegex = /import\s+["'](.+?)["'];/g;
    let match;
    const imports = [];
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Process imports first
    for (const imp of imports) {
      let impPath;
      if (imp.startsWith('@openzeppelin/')) {
        impPath = path.resolve('node_modules', imp);
      } else {
        impPath = path.resolve(path.dirname(file), imp);
      }
      process(impPath);
    }
    
    // Add file content (without license and pragma)
    content = content.replace(/\/\/ SPDX-License-Identifier: .*\n/g, '');
    content = content.replace(/pragma solidity .*;[\n\r]*/g, '');
    content = content.replace(/import\s+["'](.+?)["'];/g, '');
    
    combined += `\n// File: ${path.relative('.', file)}\n`;
    combined += content;
  }
  
  process(mainFile);
  return combined;
}

fs.writeFileSync('contracts/LeviToken_flat.sol', combine('contracts/LeviToken.sol'));
fs.writeFileSync('contracts/LeviPresale_flat.sol', combine('contracts/LeviPresale.sol'));
console.log("Flattened files saved.");
