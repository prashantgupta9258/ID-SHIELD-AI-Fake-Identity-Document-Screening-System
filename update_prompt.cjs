const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  '4. DECISION RULE: You must ONLY set "isDbMatch" to true if the Document Number AND Name exactly match ONE of the provided Reference Records.',
  '4. DECISION RULE: You must ONLY set "isDbMatch" to true if BOTH the face in the photo matches AND the Document Number AND Name exactly match ONE of the provided Reference Records.'
);

content = content.replace(
  '5. STRICT REJECTION RULE: If the Document Number and Name from the Uploaded Document DO NOT exist in ANY of the Reference Records, you MUST set "isDbMatch" to false. Do NOT hallucinate a match based on a generic face. If the data is not in the database, it is NOT a match.',
  '5. STRICT REJECTION RULE: If the face DOES NOT match, OR if the Document Number and Name DO NOT exist in ANY of the Reference Records, you MUST set "isDbMatch" to false. Do NOT hallucinate a match. If it is a completely different person or document, it is NOT a match.'
);

fs.writeFileSync('server.ts', content);
console.log('Updated prompt rules.');
