const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

const typeSelectorRegex = /\{\/\* Document Type Selector \*\/\}\s*<div>\s*<label[\s\S]*?<\/div>\s*<\/div>/;
viewContent = viewContent.replace(typeSelectorRegex, '');

fs.writeFileSync(viewPath, viewContent, 'utf8');
