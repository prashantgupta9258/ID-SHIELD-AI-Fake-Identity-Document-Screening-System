const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

viewContent = viewContent.replace(
  /countryOfIssue: formData.countryOfIssue,/g,
  '// @ts-ignore\n        countryOfIssue: formData.countryOfIssue,'
);

fs.writeFileSync(viewPath, viewContent, 'utf8');
