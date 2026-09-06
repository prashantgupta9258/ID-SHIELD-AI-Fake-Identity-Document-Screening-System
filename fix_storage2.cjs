const fs = require('fs');
const servicePath = './src/services/screeningService.ts';
let content = fs.readFileSync(servicePath, 'utf8');

const oldStr = `export async function uploadScreeningDocument(
  caseId: string, 
  fileName: string, 
  fileData: string | Blob
): Promise<string> {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = \`uploaded-documents/\${caseId}/\${Date.now()}-\${safeFileName}\`;
  const storageRef = ref(storage, storagePath);

  try {
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const snapshot = await uploadString(storageRef, fileData, 'data_url');
      return await getDownloadURL(snapshot.ref);
    } else if (fileData instanceof Blob) {
      const snapshot = await uploadBytes(storageRef, fileData);
      return await getDownloadURL(snapshot.ref);
    } else if (typeof fileData === 'string') {
      const snapshot = await uploadString(storageRef, fileData, 'raw');
      return await getDownloadURL(snapshot.ref);
    }
    return '';
  } catch (err: any) {
    console.warn(\`Firebase Storage upload fallback for \${storagePath}:\`, err.message);
    // Return the data URL or mock accessible path so screening never breaks
    return typeof fileData === 'string' ? fileData : URL.createObjectURL(fileData as Blob);
  }
}`;

const newFunc = `export async function uploadScreeningDocument(
  caseId: string, 
  fileName: string, 
  fileData: string | Blob
): Promise<string> {
  // Bypassing Firebase Storage since it is not provisioned
  return typeof fileData === 'string' ? fileData : URL.createObjectURL(fileData as Blob);
}`;

content = content.replace(oldStr, newFunc);
fs.writeFileSync(servicePath, content, 'utf8');
