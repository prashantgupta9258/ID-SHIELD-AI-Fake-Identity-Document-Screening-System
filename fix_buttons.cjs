const fs = require('fs');

const path = './src/views/NewScreeningView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace onDownloadResult with real JSON download logic
const replaceTarget = 'onDownloadResult={() => {}}';
const replacement = `onDownloadResult={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalResult, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", \`\${finalResult.caseId}.json\`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}`;

content = content.replace(replaceTarget, replacement);
fs.writeFileSync(path, content, 'utf8');

console.log("Fixed empty button");
