const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

const targetStr = `const mismatches = comparisonList.filter(c => !c.matches);`;

if (viewContent.includes(targetStr)) {
  const replacement = `const mismatches = comparisonList.filter(c => !c.matches);
    
    let serverFindings: any[] = [];
    try {
      const response = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: uploadedFile?.dataUrl || activeReferenceDoc?.rawImageUrl,
          comparisonData: comparisonList
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.findings) serverFindings = data.findings;
      }
    } catch(e) {
      console.warn("Screening API offline fallback");
    }

    const mergedFindings = [...(activeReferenceDoc?.findings || []), ...serverFindings];
`;

  viewContent = viewContent.replace(targetStr, replacement);
  
  viewContent = viewContent.replace(
    /activeReferenceDoc\?\.findings\?\.some/g,
    'mergedFindings.some'
  );
  
  viewContent = viewContent.replace(
    /activeReferenceDoc\?\.findings\?\.length \> 0/g,
    'mergedFindings.length > 0'
  );

  viewContent = viewContent.replace(
    /findings: activeReferenceDoc\?\.findings \|\| \[\]/g,
    'findings: mergedFindings'
  );
  
  fs.writeFileSync(viewPath, viewContent, 'utf8');
}
console.log("Added /api/screen call to NewScreeningView");
