const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

// Update header
viewContent = viewContent.replace(
  /<h3 className="font-bold text-slate-900 text-base">Step 2 — Document Upload & Biometric Attachment<\/h3>/,
  '<h3 className="font-bold text-slate-900 text-base">Step 1 — Document Upload & Biometric Attachment</h3>'
);

// Remove Back button
viewContent = viewContent.replace(
  /<button\s+type="button"\s+onClick=\{\(\) => setCurrentStep\(1\)\}\s+className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"\s*>\s*Back to Identity Info\s*<\/button>/,
  ''
);

fs.writeFileSync(viewPath, viewContent, 'utf8');
