const fs = require('fs');

const path = './src/views/NewScreeningView.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = "      {/* ================= STEP 4: SCREENING RESULT ================= */}";
const endMarker = "      {/* Camera Capture Modal */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const newContent = `      {/* ================= STEP 4: SCREENING RESULT ================= */}
      {currentStep === 4 && finalResult && (
        <div className="animate-in fade-in zoom-in-98 duration-200">
          <FinalScreeningResultCard
            record={finalResult}
            onGenerateReport={onOpenReport}
            onStartNewScreening={() => {
              setCurrentStep(1);
              setFinalResult(null);
              onTriggerToast('info', 'Started new screening workflow.');
            }}
            onTriggerToast={onTriggerToast}
            onFlagManualReview={(notes) => onTriggerToast('warning', notes || 'Flagged for manual review')}
            onDownloadResult={() => {}}
          />
        </div>
      )}

`;

const finalContent = content.substring(0, startIndex) + newContent + content.substring(endIndex);

fs.writeFileSync(path, finalContent, 'utf8');
console.log("Replaced Step 4 successfully");
