const fs = require('fs');

const path = './src/views/ScreeningHistoryView.tsx';
let content = fs.readFileSync(path, 'utf8');

const tableStart = `            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">`;
const tableEnd = `            </tbody>`;

const startIndex = content.indexOf(tableStart);
const endIndex = content.indexOf(tableEnd) + tableEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.error("Table markers not found");
  process.exit(1);
}

const newTableContent = `            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Screening ID</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">Reference Match</th>
                <th className="py-3.5 px-4">Tampering Status</th>
                <th className="py-3.5 px-4">Face Verification</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sc) => {
                const refMatch = sc.riskAssessment?.signalsEvaluated?.referenceDatabaseStatus || 'N/A';
                const tampering = sc.pipelineResults?.tamperingDetection === 'warning' ? 'SUSPICIOUS' : sc.pipelineResults?.tamperingDetection === 'completed' ? 'PASSED' : 'UNKNOWN';
                const face = sc.faceVerificationResult ? sc.faceVerificationResult.status.replace('_', ' ') : sc.pipelineResults?.faceMatching === 'completed' ? 'PASSED' : 'UNKNOWN';
                return (
                <tr key={sc.caseId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-[11px]">
                    {sc.caseId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {sc.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-semibold text-[11px]">
                    {sc.document.typeName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider \${
                      refMatch.includes('MATCH') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }\`}>
                      {refMatch}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider \${
                      tampering === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      tampering === 'SUSPICIOUS' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }\`}>
                      {tampering}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider \${
                      face.includes('MATCH') && !face.includes('NO') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      face.includes('NO') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }\`}>
                      {face}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px]">
                    {sc.riskScore}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={\`inline-flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider \${
                      sc.riskLevel === 'low' || sc.riskLevel === 'moderate_low' ? 'text-emerald-700' :
                      sc.riskLevel === 'critical' || sc.riskLevel === 'high' ? 'text-red-700' :
                      'text-amber-700'
                    }\`}>
                      {sc.riskLevel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectCase(sc)}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-xs"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReport(sc)}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                    >
                      Report
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>`;

const finalContent = content.substring(0, startIndex) + newTableContent + content.substring(endIndex);

fs.writeFileSync(path, finalContent, 'utf8');
console.log("Replaced table successfully");
