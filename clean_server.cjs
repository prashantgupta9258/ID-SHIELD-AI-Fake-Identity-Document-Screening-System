const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const badStart = content.indexOf('        geminiAnalysisText = response.text || \'\';');
const badEnd = content.indexOf('// Start Server with Vite Middleware');

if (badStart !== -1 && badEnd !== -1) {
  content = content.substring(0, badStart) + content.substring(badEnd);
  fs.writeFileSync('server.ts', content, 'utf8');
}

console.log("Cleaned server.ts");
