const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

viewContent = viewContent.replace(
  /const \[currentStep, setCurrentStep\] = useState<1 \| 2 \| 3 \| 4>\(1\);/,
  'const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);'
);

viewContent = viewContent.replace(
  /<div className="grid grid-cols-4 gap-2 sm:gap-4">/,
  '<div className="grid grid-cols-3 gap-2 sm:gap-4">'
);

viewContent = viewContent.replace(
  /\{\[\s*\{ num: '01', title: 'Identity Information', step: 1 \},\s*\{ num: '02', title: 'Document Upload', step: 2 \},\s*\{ num: '03', title: 'AI Analysis Pipeline', step: 3 \},\s*\{ num: '04', title: 'Screening Result', step: 4 \},\s*\]\.map\(\(item\) => \{/m,
  `{[
            { num: '01', title: 'Document Upload', step: 1 },
            { num: '02', title: 'AI Analysis Pipeline', step: 2 },
            { num: '03', title: 'Screening Result', step: 3 },
          ].map((item) => {`
);

viewContent = viewContent.replace(
  /\{currentStep === 1 && \([\s\S]*?\{currentStep === 2 && \(/m,
  '{currentStep === 1 && ('
);

viewContent = viewContent.replace(
  /\{currentStep === 3 && \(/,
  '{currentStep === 2 && ('
);

viewContent = viewContent.replace(
  /\{currentStep === 4 && finalResult && \(/,
  '{currentStep === 3 && finalResult && ('
);

viewContent = viewContent.replace(
  /setCurrentStep\(3\);/g,
  'setCurrentStep(2);'
);

viewContent = viewContent.replace(
  /setCurrentStep\(4\);/g,
  'setCurrentStep(3);'
);

// We need to carefully remove the back button from Step 2 (now Step 1) which was setCurrentStep(1)
// Wait, the back button was: onClick={() => setCurrentStep(1)}
// We'll replace it with a commented line or just remove it later. Let's see.

fs.writeFileSync(viewPath, viewContent, 'utf8');
