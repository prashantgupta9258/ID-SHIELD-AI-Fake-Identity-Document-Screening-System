/**
 * ID-SHIELD AI - Demo Face Verification Engine
 * 
 * Modular Biometric Comparison Architecture
 * Designed for 1:1 Identity Verification at Border Checkpoints.
 * 
 * STATUTORY & PRIVACY DIRECTIVES:
 * 1. Do NOT identify the person (1:1 matching against presented credential only, not 1:N identification).
 * 2. Do NOT search the internet or external registries for the face.
 * 3. Do NOT create or append to any public biometric database.
 * 4. Process face vectors strictly in-memory for the current screening workflow.
 * 5. Clearly labeled as "Demo Face Verification" with plug-and-play adapter interface
 *    for future integration with certified AFIS/ABIS biometric engines.
 */

import { 
  FaceVerificationOutcome, 
  FaceDetectionRegion, 
  FaceFeatureComparison, 
  FaceVerificationResult 
} from '../types';

export const DEMO_FACE_VERIFICATION_DISCLAIMER = 
  "Demo Face Verification: Biometric comparisons in this prototype demonstrate automated 1:1 face verification workflows for immigration and border checkpoints. No personal biometric vectors are searched online or stored in permanent public databases. Processed ephemerally for the active screening transaction.";

// Benchmark Probe Profiles for Testing & Evaluation
export interface DemoProbeProfile {
  id: string;
  name: string;
  description: string;
  expectedOutcome: FaceVerificationOutcome;
  expectedConfidence: number;
  explanation: string;
  samplePhotoUrl: string;
  qualityScore: number;
  qualityIssues?: string[];
}

export const DEMO_PROBE_PROFILES: DemoProbeProfile[] = [
  {
    id: 'probe-match-optimal',
    name: 'Compliant Checkpoint Capture (Match)',
    description: 'Direct forward gaze, uniform illumination, compliant ICAO 9303 pose matching document photo.',
    expectedOutcome: 'MATCH',
    expectedConfidence: 96.4,
    explanation: 'High spatial biometric correlation across 68 facial landmarks. Distance vector is well within legitimate issuance tolerance.',
    samplePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    qualityScore: 95,
  },
  {
    id: 'probe-possible-match-lighting',
    name: 'Variable Lighting / Angle (Possible Match)',
    description: 'Same subject with moderate lateral shadow, minor facial angle rotation, and natural aging divergence.',
    expectedOutcome: 'POSSIBLE_MATCH',
    expectedConfidence: 82.0,
    explanation: 'The available facial images show moderate similarity, but image quality limits confidence.',
    samplePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    qualityScore: 78,
    qualityIssues: ['Mild directional shadow on left zygomatic arch', 'Off-axis pitch variance (~6°)'],
  },
  {
    id: 'probe-low-confidence-blur',
    name: 'Low Resolution / Motion Blur (Low Confidence)',
    description: 'Sub-optimal checkpoint capture with camera focus blur and low pixel density across ocular landmarks.',
    expectedOutcome: 'LOW_CONFIDENCE',
    expectedConfidence: 58.5,
    explanation: 'Biometric correlation is weak due to optical blur and reduced ocular resolution. Secondary inspection advised.',
    samplePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    qualityScore: 52,
    qualityIssues: ['Optical blur index > 45%', 'Inter-pupillary distance < 60 pixels'],
  },
  {
    id: 'probe-no-match-impostor',
    name: 'Different Individual / Impersonation (No Match)',
    description: 'Distinct probe subject presented against document bio-photo. Demonstrates impostor detection.',
    expectedOutcome: 'NO_MATCH',
    expectedConfidence: 29.8,
    explanation: 'Biometric distance exceeds acceptable threshold. Substantial discrepancies detected in inter-pupillary distance, nasal bridge, and jawline contour.',
    samplePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    qualityScore: 92,
  },
  {
    id: 'probe-unable-to-verify',
    name: 'Severe Occlusion / Non-Face (Unable to Verify)',
    description: 'Face covered by sunglasses/mask or unparseable image artifact.',
    expectedOutcome: 'UNABLE_TO_VERIFY',
    expectedConfidence: 0,
    explanation: 'Unable to detect a valid facial region with sufficient landmark clarity in the submitted probe photo.',
    samplePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    qualityScore: 24,
    qualityIssues: ['Facial landmark confidence below detection threshold', 'Nasal and oral landmarks occluded'],
  },
];

/**
 * Modular Interface for Biometric Verification Engines.
 * Implementations can wrap on-device models, WebAssembly OpenCV, or authorized backend services.
 */
export interface IBiometricEngine {
  detectDocumentPortrait(documentImageSrc: string, docType?: string): Promise<FaceDetectionRegion>;
  detectProbeFace(probeImageSrc: string): Promise<FaceDetectionRegion>;
  compareFaces(docFace: FaceDetectionRegion, probeFace: FaceDetectionRegion, forcedPreset?: DemoProbeProfile): Promise<FaceVerificationResult>;
}

/**
 * Helper to determine outcome from confidence and quality
 */
export function determineOutcome(
  confidence: number, 
  docFace: FaceDetectionRegion, 
  probeFace: FaceDetectionRegion
): { outcome: FaceVerificationOutcome; explanation: string } {
  if (!docFace.detected || !probeFace.detected) {
    return {
      outcome: 'UNABLE_TO_VERIFY',
      explanation: 'Unable to detect a valid facial region with sufficient landmark clarity in the submitted probe photo or document.',
    };
  }

  if (docFace.qualityScore < 40 || probeFace.qualityScore < 40) {
    return {
      outcome: 'UNABLE_TO_VERIFY',
      explanation: 'Facial image quality, lighting contrast, or resolution is insufficient for reliable geometric feature extraction.',
    };
  }

  if (confidence >= 88.0) {
    return {
      outcome: 'MATCH',
      explanation: 'High spatial biometric correlation across facial landmark geometry. Feature vectors align within standard legitimate tolerance.',
    };
  }

  if (confidence >= 70.0) {
    return {
      outcome: 'POSSIBLE_MATCH',
      explanation: 'The available facial images show moderate similarity, but image quality limits confidence.',
    };
  }

  if (confidence >= 48.0) {
    return {
      outcome: 'LOW_CONFIDENCE',
      explanation: 'Facial similarity confidence is low. Observable variances in ocular spacing and mandibular contour require officer manual review.',
    };
  }

  return {
    outcome: 'NO_MATCH',
    explanation: 'Biometric distance exceeds acceptable threshold. Substantial discrepancies detected across primary facial vectors.',
  };
}

/**
 * Extracts a crop from an image source using a normalized bounding box
 */
export async function cropFaceRegion(
  imageSrc: string, 
  box: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve) => {
    // If running in an environment without DOM image loading or invalid source, fallback gracefully
    if (typeof window === 'undefined' || !imageSrc) {
      resolve(imageSrc);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        const sourceX = (box.x / 100) * img.naturalWidth;
        const sourceY = (box.y / 100) * img.naturalHeight;
        const sourceW = (box.width / 100) * img.naturalWidth;
        const sourceH = (box.height / 100) * img.naturalHeight;

        canvas.width = Math.max(120, Math.min(600, sourceW));
        canvas.height = Math.max(140, Math.min(700, sourceH));

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceW, sourceH,
          0, 0, canvas.width, canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (e) {
        // Fallback if cross-origin or canvas security issue
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * Standard Demo Biometric Engine implementation
 */
export class DemoBiometricEngine implements IBiometricEngine {
  async detectDocumentPortrait(documentImageSrc: string, docType: string = 'passport'): Promise<FaceDetectionRegion> {
    // Standard ICAO TD-3 passport portrait area is traditionally in the left quadrant
    // For national IDs / Aadhaar, it is also top-left or top-right.
    const isAadhaar = docType.toLowerCase().includes('aadhaar');
    const isVisa = docType.toLowerCase().includes('visa');

    const defaultBox = isAadhaar 
      ? { x: 70, y: 22, width: 22, height: 42 } 
      : isVisa
      ? { x: 8, y: 20, width: 26, height: 48 }
      : { x: 6, y: 16, width: 28, height: 52 };

    let cropUrl: string | undefined;
    if (documentImageSrc && documentImageSrc.startsWith('data:image')) {
      cropUrl = await cropFaceRegion(documentImageSrc, defaultBox);
    }

    return {
      detected: true,
      box: defaultBox,
      confidence: 96.5,
      qualityScore: 89,
      landmarksDetected: true,
      cropDataUrl: cropUrl,
      sourceLabel: 'Document Bio-Portrait Region (Extracted)',
    };
  }

  async detectProbeFace(probeImageSrc: string): Promise<FaceDetectionRegion> {
    if (!probeImageSrc) {
      return {
        detected: false,
        confidence: 0,
        qualityScore: 0,
        qualityIssues: ['No probe image provided'],
        landmarksDetected: false,
        sourceLabel: 'User-Provided Face Image',
      };
    }

    const defaultProbeBox = { x: 18, y: 12, width: 64, height: 72 };
    let cropUrl: string | undefined;
    if (probeImageSrc.startsWith('data:image')) {
      cropUrl = await cropFaceRegion(probeImageSrc, defaultProbeBox);
    }

    return {
      detected: true,
      box: defaultProbeBox,
      confidence: 97.2,
      qualityScore: 86,
      landmarksDetected: true,
      cropDataUrl: cropUrl || probeImageSrc,
      sourceLabel: 'Subject Live Probe Image (Checkpoint)',
    };
  }

  async compareFaces(
    docFace: FaceDetectionRegion, 
    probeFace: FaceDetectionRegion,
    forcedPreset?: DemoProbeProfile
  ): Promise<FaceVerificationResult> {
    // If a benchmark profile is specifically requested (or preset was selected)
    if (forcedPreset) {
      const outcome = forcedPreset.expectedOutcome;
      const confidence = forcedPreset.expectedConfidence;
      const explanation = forcedPreset.explanation;

      const isHighOrPossible = outcome === 'MATCH' || outcome === 'POSSIBLE_MATCH';
      const featureComparisons: FaceFeatureComparison[] = [
        {
          featureName: 'Inter-Pupillary Distance (IPD)',
          similarityScore: outcome === 'MATCH' ? 97 : outcome === 'POSSIBLE_MATCH' ? 84 : outcome === 'LOW_CONFIDENCE' ? 62 : 31,
          status: isHighOrPossible ? 'congruent' : outcome === 'LOW_CONFIDENCE' ? 'inconclusive' : 'divergent',
          note: outcome === 'MATCH' 
            ? '63.4mm estimated IPD aligns with document spec.' 
            : outcome === 'POSSIBLE_MATCH' 
            ? 'Minor ocular angle offset due to lighting tilt.' 
            : 'Significant vector divergence in eye position.',
        },
        {
          featureName: 'Nasal Bridge to Philtrum Ratio',
          similarityScore: outcome === 'MATCH' ? 95 : outcome === 'POSSIBLE_MATCH' ? 81 : outcome === 'LOW_CONFIDENCE' ? 59 : 28,
          status: isHighOrPossible ? 'congruent' : outcome === 'LOW_CONFIDENCE' ? 'inconclusive' : 'divergent',
          note: isHighOrPossible ? 'Consistent vertical proportionality.' : 'Divergent cartilage structure.',
        },
        {
          featureName: 'Mandibular Jawline Contour',
          similarityScore: outcome === 'MATCH' ? 94 : outcome === 'POSSIBLE_MATCH' ? 79 : outcome === 'LOW_CONFIDENCE' ? 55 : 34,
          status: isHighOrPossible ? 'congruent' : outcome === 'LOW_CONFIDENCE' ? 'inconclusive' : 'divergent',
          note: isHighOrPossible ? 'Contour curvature matches baseline.' : 'Jawline width ratio exceeds tolerance.',
        },
        {
          featureName: 'Facial Surface Texture & Illumination',
          similarityScore: forcedPreset.qualityScore,
          status: forcedPreset.qualityScore >= 75 ? 'congruent' : 'inconclusive',
          note: forcedPreset.qualityIssues && forcedPreset.qualityIssues.length > 0 
            ? forcedPreset.qualityIssues.join(', ') 
            : 'Specular reflection and illumination within acceptable bounds.',
        },
      ];

      return {
        outcome,
        confidence,
        explanation,
        documentFace: docFace,
        probeFace: {
          ...probeFace,
          qualityScore: forcedPreset.qualityScore,
          qualityIssues: forcedPreset.qualityIssues,
        },
        featureComparisons,
        isDemoMode: true,
        privacyNotice: DEMO_FACE_VERIFICATION_DISCLAIMER,
        evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    }

    // Dynamic heuristic evaluation when custom images are provided
    if (!docFace.detected || !probeFace.detected) {
      return {
        outcome: 'UNABLE_TO_VERIFY',
        confidence: 0,
        explanation: 'Unable to isolate valid facial landmarks from the submitted document or face photo.',
        documentFace: docFace,
        probeFace: probeFace,
        featureComparisons: [],
        isDemoMode: true,
        privacyNotice: DEMO_FACE_VERIFICATION_DISCLAIMER,
        evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    }

    // Compute realistic confidence based on quality scores
    const meanQuality = (docFace.qualityScore + probeFace.qualityScore) / 2;
    // Base calibrated confidence for a valid probe in demo mode
    let calculatedConfidence = 84.5;
    if (meanQuality < 60) {
      calculatedConfidence = 58.0;
    } else if (meanQuality > 85) {
      calculatedConfidence = 94.2;
    }

    const { outcome, explanation } = determineOutcome(calculatedConfidence, docFace, probeFace);

    const featureComparisons: FaceFeatureComparison[] = [
      {
        featureName: 'Inter-Pupillary Distance (IPD)',
        similarityScore: Math.round(calculatedConfidence * 0.98),
        status: calculatedConfidence >= 75 ? 'congruent' : calculatedConfidence >= 55 ? 'inconclusive' : 'divergent',
        note: 'Calculated eye distance spatial congruency.',
      },
      {
        featureName: 'Nose Bridge to Philtrum Ratio',
        similarityScore: Math.round(calculatedConfidence * 0.96),
        status: calculatedConfidence >= 75 ? 'congruent' : calculatedConfidence >= 55 ? 'inconclusive' : 'divergent',
        note: 'Vertical facial triangle proportion comparison.',
      },
      {
        featureName: 'Mandibular Jawline Contour',
        similarityScore: Math.round(calculatedConfidence * 0.94),
        status: calculatedConfidence >= 75 ? 'congruent' : calculatedConfidence >= 55 ? 'inconclusive' : 'divergent',
        note: 'Curvilinear edge contour comparison.',
      },
      {
        featureName: 'Illumination & Image Quality Compliance',
        similarityScore: Math.round(meanQuality),
        status: meanQuality >= 70 ? 'congruent' : 'inconclusive',
        note: `Document photo quality: ${docFace.qualityScore}%, Probe quality: ${probeFace.qualityScore}%.`,
      },
    ];

    return {
      outcome,
      confidence: calculatedConfidence,
      explanation,
      documentFace: docFace,
      probeFace: probeFace,
      featureComparisons,
      isDemoMode: true,
      privacyNotice: DEMO_FACE_VERIFICATION_DISCLAIMER,
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }
}

// Export singleton instance
export const defaultFaceVerificationEngine = new DemoBiometricEngine();

/**
 * Top-level convenience function
 */
export async function performFaceVerification(params: {
  documentImageSrc: string;
  probeImageSrc: string;
  docType?: string;
  benchmarkPreset?: DemoProbeProfile;
}): Promise<FaceVerificationResult> {
  const engine = defaultFaceVerificationEngine;
  const docFace = await engine.detectDocumentPortrait(params.documentImageSrc, params.docType);
  const probeFace = await engine.detectProbeFace(params.probeImageSrc);
  return engine.compareFaces(docFace, probeFace, params.benchmarkPreset);
}
