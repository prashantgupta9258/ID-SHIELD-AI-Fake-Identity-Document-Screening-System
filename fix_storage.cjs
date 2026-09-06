const fs = require('fs');
const servicePath = './src/services/screeningService.ts';
let content = fs.readFileSync(servicePath, 'utf8');

const regex = /export async function uploadScreeningDocument\([\s\S]*?\) \{\s*const safeFileName[\s\S]*?catch \(err: any\) \{[\s\S]*?return typeof fileData === 'string' \? fileData : URL\.createObjectURL\(fileData as Blob\);\s*\}\s*\}/;

const newFunc = `export async function uploadScreeningDocument(
  caseId: string, 
  fileName: string, 
  fileData: string | Blob
): Promise<string> {
  return typeof fileData === 'string' ? fileData : URL.createObjectURL(fileData as Blob);
}`;

content = content.replace(regex, newFunc);
fs.writeFileSync(servicePath, content, 'utf8');
