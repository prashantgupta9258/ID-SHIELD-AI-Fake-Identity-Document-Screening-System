const fs = require('fs');
const viewPath = './src/views/NewScreeningView.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');

viewContent = viewContent.replace(
  /person: \{\s*fullName: formData\.fullName,\s*dob: formData\.dob,\s*nationality: formData\.countryOfIssue,\s*gender: formData\.gender,\s*\}/,
  'person: { fullName: formData.fullName, dob: formData.dob, nationality: formData.countryOfIssue, gender: formData.gender, countryOfIssue: formData.countryOfIssue } as any'
);

fs.writeFileSync(viewPath, viewContent, 'utf8');
