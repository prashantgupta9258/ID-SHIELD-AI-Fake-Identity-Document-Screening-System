const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `          dbReferences.forEach((ref: any, idx: number) => {
            contents.push({ text: \`\\nREFERENCE RECORD \${idx + 1} (ID: \${ref.id}):\\nFields from Database: \${JSON.stringify(ref.extractedFields || {})}\` });
          });`;

const replacementStr = `          for (let idx = 0; idx < dbReferences.length; idx++) {
            const ref = dbReferences[idx];
            contents.push({ text: \`\\nREFERENCE RECORD \${idx + 1} (ID: \${ref.id}):\\nFields from Database: \${JSON.stringify(ref.extractedFields || {})}\` });
            
            if (ref.imageUrl) {
              try {
                if (ref.imageUrl.startsWith('data:image/')) {
                  const refMatches = ref.imageUrl.match(/^data:(image\\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
                  if (refMatches) {
                    contents.push({
                      inlineData: { mimeType: refMatches[1], data: refMatches[2] }
                    });
                  }
                } else if (ref.imageUrl.startsWith('http')) {
                  // Fetch the image from the URL and convert to base64
                  console.log('Fetching reference image from URL:', ref.imageUrl);
                  const imgRes = await fetch(ref.imageUrl);
                  if (imgRes.ok) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
                    contents.push({
                      inlineData: { mimeType, data: buffer.toString('base64') }
                    });
                  }
                }
              } catch (err) {
                console.error('Error fetching reference image:', err);
              }
            }
          }`;

if (content.includes(targetStr)) {
  const newContent = content.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', newContent);
  console.log('Fixed server.ts');
} else {
  console.log('Target string not found');
}
