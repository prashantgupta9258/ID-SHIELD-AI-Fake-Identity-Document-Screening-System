import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { NewScreeningView } from './views/NewScreeningView';
import { DocumentAnalysisView } from './views/DocumentAnalysisView';
import { IdentityVerificationView } from './views/IdentityVerificationView';
import { SuspiciousCasesView } from './views/SuspiciousCasesView';
import { ScreeningHistoryView } from './views/ScreeningHistoryView';
import { ReportsView } from './views/ReportsView';
import { SystemAnalyticsView } from './views/SystemAnalyticsView';
import { ReferenceDatabaseView } from './views/ReferenceDatabaseView';
import { AuditLogsView } from './views/AuditLogsView';
import { InvestigationModal } from './components/InvestigationModal';
import { ScreeningRecord, ReferenceDocument } from './types';
import { INITIAL_SCREENINGS, INITIAL_ALERTS } from './data/screeningsData';
import { REFERENCE_DOCUMENTS } from './data/referenceDataset';
import { subscribeToScreeningRecords } from './services/screeningService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>(INITIAL_SCREENINGS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedReferenceDoc, setSelectedReferenceDoc] = useState<ReferenceDocument>(REFERENCE_DOCUMENTS[0]);
  const [selectedRecordForInvestigation, setSelectedRecordForInvestigation] = useState<ScreeningRecord | null>(null);
  const [selectedRecordForReport, setSelectedRecordForReport] = useState<ScreeningRecord>(INITIAL_SCREENINGS[0]);

  // Subscribe to real-time Cloud Firestore screening records
  useEffect(() => {
    const unsubscribe = subscribeToScreeningRecords((records) => {
      if (records && records.length > 0) {
        setScreenings(records);
      }
    });
    return () => unsubscribe();
  }, []);

  // Notification system disabled
  const addToast = (_type?: 'success' | 'warning' | 'error' | 'info', _message?: string) => {
    // Notifications disabled
  };

  // Handlers for cross-view navigation
  const handleStartNewScreening = (refDoc?: ReferenceDocument) => {
    if (refDoc) {
      setSelectedReferenceDoc(refDoc);
    }
    setCurrentTab('new_screening');
  };

  const handleInspectDocument = (refDoc: ReferenceDocument) => {
    setSelectedReferenceDoc(refDoc);
    setCurrentTab('document_analysis');
  };

  const handleOpenInvestigation = (record: ScreeningRecord) => {
    setSelectedRecordForInvestigation(record);
  };

  const handleOpenInvestigationFromRefDoc = (doc: ReferenceDocument) => {
    const match = screenings.find(s => s.document.docNumber === doc.docNumber) || {
      caseId: `CASE-REF-${doc.id}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      person: {
        fullName: doc.personName,
        dob: doc.dob,
        nationality: doc.nationality,
        gender: doc.gender,
        passportNumber: doc.docNumber,
        countryOfIssue: doc.country,
      },
      document: {
        type: doc.docType,
        typeName: doc.docTypeName,
        docNumber: doc.docNumber,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        issuingAuthority: doc.issuingAuthority,
        previewType: doc.imageThumbnail,
      },
      aiScore: doc.aiScore,
      riskScore: doc.riskScore,
      riskLevel: doc.riskLevel,
      status: doc.status,
      screeningTimeSeconds: 14.2,
      officer: 'Officer V. Sharma (BOI-8842)',
      checkpoint: 'Terminal 3 - E-Gates, IGI Airport',
      findings: doc.findings,
      pipelineResults: {
        qualityCheck: 'completed',
        ocrExtraction: 'completed',
        photoVerification: 'completed',
        tamperingDetection: doc.tamperingDetected ? 'warning' : 'completed',
        mrzValidation: 'completed',
        faceMatching: 'completed',
        identityConsistency: doc.tamperingDetected ? 'warning' : 'completed',
        fraudRiskAnalysis: doc.tamperingDetected ? 'failed' : 'completed',
      },
      comparisonData: [
        { field: 'Full Name', documentData: doc.personName, verifiedData: doc.personName, matches: true, confidence: 99.4 },
        { field: 'DOB', documentData: doc.dob, verifiedData: doc.dob, matches: true, confidence: 99.8 },
      ],
    };

    setSelectedRecordForInvestigation(match as ScreeningRecord);
  };

  const handleOpenReport = (record: ScreeningRecord) => {
    setSelectedRecordForReport(record);
    setCurrentTab('reports');
  };

  const handleScreeningCompleted = (record: ScreeningRecord) => {
    setScreenings((prev) => [record, ...prev]);
  };

  const handleUpdateRecordStatus = (caseId: string, newStatus: ScreeningRecord['status'], notes?: string) => {
    setScreenings((prev) =>
      prev.map((s) => (s.caseId === caseId ? { ...s, status: newStatus } : s))
    );
    addToast(
      newStatus === 'verified' ? 'success' : newStatus === 'rejected' ? 'error' : 'info',
      `Case ${caseId} updated: ${newStatus.toUpperCase()}`
    );
  };

  const handleSearchCase = (query: string) => {
    setCurrentTab('screening_history');
    addToast('info', `Filtering records for query: "${query}"`);
  };

  const handleSelectForScreeningFromUnderstanding = (doc: any) => {
    if (doc.fields && doc.docType) {
      const fields = doc.fields;
      const docTypeNormalized = (doc.docType || '').toLowerCase();
      const mappedType = 
        docTypeNormalized === 'passport' ? 'passport' :
        docTypeNormalized === 'visa' ? 'visa' :
        docTypeNormalized === 'driving_license' ? 'driving_license' :
        docTypeNormalized === 'permit' ? 'permit' :
        docTypeNormalized === 'travel_authorization' ? 'travel_auth' :
        docTypeNormalized === 'national_id' ? 'aadhaar' : 'other';

      const convertedDoc: ReferenceDocument = {
        id: `OCR-${Date.now()}`,
        name: `${doc.docType} Verified Scan`,
        docType: mappedType as any,
        docTypeName: `${doc.docType} Document`,
        country: fields.nationality || 'IND',
        personName: fields.fullName || fields.name || fields.applicantName || 'ARYA SINGH',
        dob: fields.dateOfBirth || fields.dob || '1992-07-15',
        gender: fields.gender === 'F' ? 'Female' : fields.gender === 'M' ? 'Male' : 'Female',
        nationality: fields.nationality || 'IND',
        docNumber: fields.passportNumber || fields.visaNumber || fields.identityNumber || fields.licenseNumber || fields.permitNumber || fields.documentNumber || 'DOC-001',
        issueDate: fields.dateOfIssue || fields.issueDate || '2023-01-20',
        expiryDate: fields.dateOfExpiry || fields.expiryDate || fields.validUntil || '2033-01-19',
        issuingAuthority: fields.issuingAuthority || 'Issuing Authority',
        riskLevel: 'low',
        status: 'verified',
        aiScore: 98.4,
        riskScore: 6,
        badgeLabel: doc.docType,
        description: 'Extracted with strict zero-hallucination structured field OCR',
        tamperingDetected: false,
        imageThumbnail: 'passport-arya',
        rawImageUrl: undefined,
        extractedFields: fields as any,
        findings: [],
        boundingBoxes: [],
      };

      setSelectedReferenceDoc(convertedDoc);
      setCurrentTab('new_screening');
      addToast('info', `Transferred extracted ${doc.docType} data to New Screening form`);
      return;
    }

    const docTypeNormalized = (doc.documentType || '').toLowerCase();
    const mappedType = 
      docTypeNormalized === 'passport' ? 'passport' :
      docTypeNormalized === 'visa' ? 'visa' :
      docTypeNormalized === 'driving_license' ? 'driving_license' :
      docTypeNormalized === 'permit' ? 'permit' :
      docTypeNormalized === 'travel_authorization' ? 'travel_auth' :
      docTypeNormalized === 'national_id' ? 'aadhaar' : 'other';

    const convertedDoc: ReferenceDocument = {
      id: doc.id || `AI-DOC-${Date.now()}`,
      name: doc.fileName || `${doc.documentType} Credential`,
      docType: mappedType as any,
      docTypeName: doc.inspection?.visualLayout?.description || `${doc.documentType} Document`,
      country: doc.inspection?.headings?.[0] || 'Republic of India (IND)',
      personName: doc.extractedFields?.fullName || 'ARYA SINGH',
      dob: doc.inspection?.dates?.dob || '1992-07-15',
      gender: 'Female',
      nationality: doc.extractedFields?.nationality || 'INDIAN',
      docNumber: doc.extractedFields?.documentNumber || doc.inspection?.numbers?.[0] || 'Z1234567',
      issueDate: doc.inspection?.dates?.issueDate || '2023-01-20',
      expiryDate: doc.inspection?.dates?.expiryDate || '2033-01-19',
      issuingAuthority: doc.extractedFields?.issuingAuthority || doc.inspection?.headings?.[0] || 'Government Authority',
      riskLevel: doc.documentType === 'UNKNOWN' ? 'critical' : 'low',
      status: doc.documentType === 'UNKNOWN' ? 'rejected' : 'verified',
      aiScore: doc.confidence || 96.5,
      riskScore: doc.documentType === 'UNKNOWN' ? 88 : 8,
      badgeLabel: doc.documentType,
      description: doc.reason || 'Multimodal AI classified document',
      tamperingDetected: false,
      imageThumbnail: 'passport-arya',
      rawImageUrl: doc.previewUrl,
      extractedFields: doc.extractedFields || {},
      findings: [],
      boundingBoxes: [],
    };

    setSelectedReferenceDoc(convertedDoc);
    setCurrentTab('new_screening');
    addToast('info', `Document "${doc.fileName}" loaded into New Screening.`);
  };

  // Map active tab to Title and Subtitle for Header
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Screening Dashboard', subtitle: 'AI-powered identity and document verification overview' };
      case 'new_screening':
        return { title: 'New Identity Screening', subtitle: 'Upload identity documents and biometric information for AI-powered verification' };
      case 'document_analysis':
        return { title: 'AI Document Analysis', subtitle: 'Multi-layer AI forensic pipeline evaluating travel credentials' };
      case 'identity_verification':
        return { title: 'Identity & Biometric Verification', subtitle: '1:1 Biometric facial matching, ICAO 9303 MRZ algorithm check, and international watchlist queries' };
      case 'reference_database':
        return { title: 'Reference Document Database', subtitle: 'Canonical SIH Demo Reference Dataset stored in Firebase Firestore (referenceDocuments) and Storage' };
      case 'suspicious_cases':
        return { title: 'Alerts & Suspicious Cases', subtitle: 'Cases requiring additional review or officer verification due to forensic heuristic flags' };
      case 'screening_history':
        return { title: 'Screening History', subtitle: 'Immutable audit record of all past checkpoint identity verifications and forensic decisions' };
      case 'reports':
        return { title: 'Official Screening Report', subtitle: 'Standardized border control certificate with SHA-256 digital signature' };
      case 'audit_logs':
        return { title: 'Checkpoint Audit & Security Logs', subtitle: 'Immutable audit trail of screening queries, forensic determinations, and manual officer overrides' };
      case 'system_analytics':
        return { title: 'System Analytics & AI Performance', subtitle: 'Border checkpoint throughput, detection accuracy rates, and forensic trend distributions' };
      default:
        return { title: 'Screening Dashboard', subtitle: 'AI-powered identity and document verification' };
    }
  };

  const headerInfo = getHeaderInfo();
  const suspiciousCount = (screenings || []).filter(s => s.status === 'suspicious' || s.status === 'rejected' || s.riskScore > 35).length;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans antialiased overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        suspiciousCount={suspiciousCount}
        isOpenMobile={isOpenMobile}
        onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Application Header */}
        <Header
          pageTitle={headerInfo.title}
          breadcrumb="Bureau of Immigration • Border Security System"
          onToggleMobileMenu={() => setIsOpenMobile(!isOpenMobile)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {currentTab === 'dashboard' && (
            <DashboardView
              screenings={screenings}
              alerts={alerts}
              onStartNewScreening={() => handleStartNewScreening()}
              onSelectCase={handleOpenInvestigation}
              onSelectReferenceDoc={handleInspectDocument}
              onOpenReferenceDatabase={() => setCurrentTab('reference_database')}
              onViewAllAlerts={() => setCurrentTab('suspicious_cases')}
              onNewScreening={() => handleStartNewScreening()}
              onInspectDocument={handleInspectDocument}
              onOpenInvestigation={handleOpenInvestigation}
              onOpenReport={handleOpenReport}
            />
          )}

          {currentTab === 'new_screening' && (
            <NewScreeningView
              initialRefDoc={selectedReferenceDoc}
              onScreeningCompleted={handleScreeningCompleted}
              onOpenReport={handleOpenReport}
              onTriggerToast={addToast}
            />
          )}

          {currentTab === 'document_analysis' && (
            <DocumentAnalysisView
              currentDoc={selectedReferenceDoc}
              onSelectDoc={(doc) => setSelectedReferenceDoc(doc)}
              onOpenInvestigation={handleOpenInvestigationFromRefDoc}
              onSelectForScreening={handleSelectForScreeningFromUnderstanding}
              onTriggerToast={addToast}
            />
          )}

          {currentTab === 'identity_verification' && (
            <IdentityVerificationView
              currentDoc={selectedReferenceDoc}
              onSelectDoc={(doc) => setSelectedReferenceDoc(doc)}
              onTriggerToast={addToast}
            />
          )}

          {currentTab === 'reference_database' && (
            <ReferenceDatabaseView
              onSelectDocumentForScreening={(docRecord) => {
                const match = REFERENCE_DOCUMENTS.find(d => d.id === docRecord.referenceDocumentId) || {
                  id: docRecord.referenceDocumentId,
                  name: docRecord.displayName,
                  docType: (docRecord.documentType.toLowerCase() === 'national_id' ? 'aadhaar' : docRecord.documentType.toLowerCase()) as any,
                  docTypeName: docRecord.displayName,
                  country: 'India (IND)',
                  personName: String(docRecord.normalizedFields?.FULLNAME || 'Arya Singh'),
                  dob: '1992-07-15',
                  gender: 'F',
                  nationality: 'INDIAN',
                  docNumber: String(docRecord.normalizedFields?.DOCNUMBER || 'Z1234567'),
                  issueDate: '2023-01-20',
                  expiryDate: '2033-01-19',
                  issuingAuthority: 'Government Authority',
                  riskLevel: 'low' as const,
                  status: 'verified' as const,
                  aiScore: 98.4,
                  riskScore: 6,
                  badgeLabel: 'Reference Standard',
                  description: docRecord.displayName,
                  tamperingDetected: false,
                  imageThumbnail: 'passport-arya',
                  rawImageUrl: docRecord.imageUrl,
                  extractedFields: {},
                  findings: [],
                  boundingBoxes: [],
                };
                setSelectedReferenceDoc(match as any);
                setCurrentTab('new_screening');
                addToast('info', `Loaded reference credential ${docRecord.referenceDocumentId} for screening.`);
              }}
            />
          )}

          {currentTab === 'suspicious_cases' && (
            <SuspiciousCasesView
              cases={screenings}
              onSelectCase={handleOpenInvestigation}
            />
          )}

          {currentTab === 'screening_history' && (
            <ScreeningHistoryView
              screenings={screenings}
              onSelectCase={handleOpenInvestigation}
              onOpenReport={handleOpenReport}
              onTriggerToast={addToast}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              reportRecord={selectedRecordForReport}
              onBack={() => setCurrentTab('screening_history')}
              onTriggerToast={addToast}
            />
          )}

          {currentTab === 'audit_logs' && (
            <AuditLogsView onTriggerToast={addToast} />
          )}

          {currentTab === 'system_analytics' && (
            <SystemAnalyticsView />
          )}
          </div>
        </main>
      </div>

      {/* Case Investigation Modal */}
      <InvestigationModal
        caseRecord={selectedRecordForInvestigation}
        isOpen={Boolean(selectedRecordForInvestigation)}
        onClose={() => setSelectedRecordForInvestigation(null)}
        onUpdateStatus={handleUpdateRecordStatus}
        onOpenReport={(rec) => {
          setSelectedRecordForInvestigation(null);
          handleOpenReport(rec);
        }}
      />
    </div>
  );
}
