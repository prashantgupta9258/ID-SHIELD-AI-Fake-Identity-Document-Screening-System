// High-fidelity SVG and visual demo reference document assets for SIH Prototype
// Categories: PASSPORT, VISA, NATIONAL_ID, DRIVING_LICENSE, PERMIT, TRAVEL_AUTHORIZATION

export interface DemoRawDocument {
  id: string;
  category: 'PASSPORT' | 'VISA' | 'NATIONAL_ID' | 'DRIVING_LICENSE' | 'PERMIT' | 'TRAVEL_AUTHORIZATION';
  fileName: string;
  storageSubdir: string;
  displayName: string;
  svgContent: string;
  samplePerson: {
    fullName: string;
    dob: string;
    gender: string;
    nationality: string;
    docNumber: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    secondaryNumber?: string;
  };
  ocrText: string;
  extractedFields: Record<string, string | number | boolean>;
  normalizedFields: Record<string, string>;
  knownTamperFlag: boolean;
  tamperReason?: string;
}

export const DEMO_RAW_DOCUMENTS: DemoRawDocument[] = [
  // 1. PASSPORT
  {
    id: 'REF-DOC-PASSPORT-IND-01',
    category: 'PASSPORT',
    fileName: 'passport_ind_arya_singh.svg',
    storageSubdir: 'passport',
    displayName: 'Republic of India - Biometric Passport (Bio-Data Page)',
    samplePerson: {
      fullName: 'ARYA SINGH',
      dob: '1992-07-15',
      gender: 'F',
      nationality: 'INDIAN',
      docNumber: 'Z1234567',
      issueDate: '2023-01-20',
      expiryDate: '2033-01-19',
      issuingAuthority: 'Passport Office, Chandigarh',
    },
    ocrText: `P<INDSINGH<<ARYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<
Z1234567<0IND9207153F3301193<<<<<<<<<<<<<<06
REPUBLIC OF INDIA / भारत गणराज्य
PASSPORT / पासपोर्ट
Type/प्रकार: P  Code/कोड: IND  Passport No./पासपोर्ट क्र.: Z1234567
Surname/उपनाम: SINGH
Given Name(s)/दिया गया नाम: ARYA
Nationality/राष्ट्रीयता: INDIAN / भारतीय
Sex/लिंग: F  Date of Birth/जन्म तिथि: 15/07/1992
Place of Birth/जन्म स्थान: CHANDIGARH
Date of Issue/जारी करने की तिथि: 20/01/2023
Date of Expiry/समाप्ति की तिथि: 19/01/2033
Place of Issue/जारी करने का स्थान: CHANDIGARH`,
    extractedFields: {
      docType: 'PASSPORT',
      country: 'IND',
      passportNumber: 'Z1234567',
      surname: 'SINGH',
      givenNames: 'ARYA',
      fullName: 'ARYA SINGH',
      dob: '1992-07-15',
      gender: 'F',
      nationality: 'INDIAN',
      placeOfBirth: 'CHANDIGARH',
      dateOfIssue: '2023-01-20',
      dateOfExpiry: '2033-01-19',
      mrzLine1: 'P<INDSINGH<<ARYA<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'Z1234567<0IND9207153F3301193<<<<<<<<<<<<<<06',
    },
    normalizedFields: {
      FULLNAME: 'ARYA SINGH',
      DOCNUMBER: 'Z1234567',
      DOB: '1992-07-15',
      NATIONALITY: 'INDIAN',
      CATEGORY: 'PASSPORT',
      EXPIRY: '2033-01-19',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
          <path d="M 0 20 Q 10 0 20 20 T 40 20" fill="none" stroke="#cbd5e1" stroke-width="0.6"/>
        </pattern>
        <linearGradient id="passportBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#f1f5f9"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="16" fill="url(#passportBg)" stroke="#94a3b8" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#guilloche)"/>
      
      <!-- Header -->
      <rect x="25" y="25" width="750" height="60" fill="#0f172a" rx="6"/>
      <text x="50" y="55" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="20" letter-spacing="1">REPUBLIC OF INDIA / भारत गणराज्य</text>
      <text x="50" y="73" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="12">PASSPORT / पासपोर्ट • ICAO 9303 BIOMETRIC SPECIFICATION</text>
      <text x="680" y="60" fill="#facc15" font-family="monospace" font-weight="700" font-size="16">IND P</text>
      
      <!-- Biometric Photo Placeholder -->
      <rect x="45" y="110" width="180" height="230" rx="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2"/>
      <circle cx="135" cy="180" r="45" fill="#94a3b8"/>
      <path d="M 80 280 C 80 230, 190 230, 190 280 Z" fill="#64748b"/>
      <text x="135" y="320" fill="#0f172a" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle">ARYA SINGH</text>
      <circle cx="185" cy="305" r="14" fill="#0284c7" opacity="0.85"/>
      <text x="185" y="309" fill="#fff" font-family="system-ui" font-weight="bold" font-size="9" text-anchor="middle">CHIP</text>

      <!-- Security Emblem / Watermark -->
      <circle cx="450" cy="220" r="85" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>
      <text x="450" y="225" fill="#3b82f6" font-family="system-ui" font-weight="900" font-size="14" opacity="0.4" text-anchor="middle">ASHOKA WATERMARK</text>

      <!-- Document Data Fields -->
      <g font-family="system-ui, sans-serif" font-size="11" fill="#475569">
        <text x="255" y="125">Passport No. / पासपोर्ट क्र.</text>
        <text x="255" y="145" font-family="monospace" font-weight="bold" font-size="16" fill="#0f172a">Z1234567</text>

        <text x="480" y="125">Country Code / देश कोड</text>
        <text x="480" y="145" font-family="monospace" font-weight="bold" font-size="16" fill="#0f172a">IND</text>

        <text x="255" y="175">Surname / उपनाम</text>
        <text x="255" y="195" font-weight="bold" font-size="15" fill="#0f172a">SINGH</text>

        <text x="480" y="175">Given Name(s) / दिया गया नाम</text>
        <text x="480" y="195" font-weight="bold" font-size="15" fill="#0f172a">ARYA</text>

        <text x="255" y="225">Nationality / राष्ट्रीयता</text>
        <text x="255" y="243" font-weight="bold" font-size="13" fill="#0f172a">INDIAN / भारतीय</text>

        <text x="480" y="225">Sex / लिंग</text>
        <text x="480" y="243" font-weight="bold" font-size="13" fill="#0f172a">F</text>

        <text x="580" y="225">Date of Birth / जन्म तिथि</text>
        <text x="580" y="243" font-weight="bold" font-size="13" fill="#0f172a">15/07/1992</text>

        <text x="255" y="275">Place of Birth / जन्म स्थान</text>
        <text x="255" y="293" font-weight="bold" font-size="13" fill="#0f172a">CHANDIGARH</text>

        <text x="480" y="275">Date of Issue / जारी</text>
        <text x="480" y="293" font-weight="bold" font-size="13" fill="#0f172a">20/01/2023</text>

        <text x="580" y="275">Date of Expiry / समाप्ति</text>
        <text x="580" y="293" font-weight="bold" font-size="13" fill="#0f172a">19/01/2033</text>

        <text x="255" y="325">Issuing Authority / जारी करने वाला प्राधिकारी</text>
        <text x="255" y="343" font-weight="bold" font-size="12" fill="#0284c7">PASSPORT OFFICE, CHANDIGARH</text>
      </g>

      <!-- Ghost Portrait Optical Verification Area -->
      <rect x="680" y="220" width="75" height="95" fill="#e0f2fe" opacity="0.6" rx="4" stroke="#38bdf8" stroke-width="1"/>
      <circle cx="717" cy="255" r="18" fill="#93c5fd" opacity="0.5"/>
      <text x="717" y="305" font-size="8" fill="#0369a1" text-anchor="middle">GHOST PHOTO</text>

      <!-- MRZ Zone (Machine Readable Zone) -->
      <rect x="25" y="390" width="750" height="105" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="45" y="435" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#0f172a" letter-spacing="3.5">
        P&lt;INDSINGH&lt;&lt;ARYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      </text>
      <text x="45" y="475" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#0f172a" letter-spacing="3.5">
        Z1234567&lt;0IND9207153F3301193&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
      </text>
    </svg>`,
  },

  // 2. VISA
  {
    id: 'REF-DOC-VISA-SCH-02',
    category: 'VISA',
    fileName: 'visa_schengen_rahul_verma.svg',
    storageSubdir: 'visa',
    displayName: 'Schengen Business Visa (Type C - Multiple Entry)',
    samplePerson: {
      fullName: 'RAHUL VERMA',
      dob: '1985-11-23',
      gender: 'M',
      nationality: 'INDIAN',
      docNumber: 'V98765432',
      issueDate: '2024-03-01',
      expiryDate: '2025-02-28',
      issuingAuthority: 'Consulate General of France, Mumbai',
      secondaryNumber: 'M9876543',
    },
    ocrText: `SCHENGEN VISA / ETATS SCHENGEN
VALID FOR: ETATS SCHENGEN
FROM / DU: 01-03-2024  UNTIL / AU: 28-02-2025
NUMBER OF ENTRIES: MULT  DURATION OF STAY: 90 DAYS
ISSUED IN: MUMBAI  ON: 01-03-2024
PASSPORT NUMBER: M9876543
SURNAME, NAME: VERMA, RAHUL
TYPE OF VISA: C  REMARKS: BUSINESS
VCFRAVERMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<
V987654321IND8511234M2502284C090<<<<<<<<<<08`,
    extractedFields: {
      docType: 'VISA',
      visaNumber: 'V98765432',
      visaType: 'C (MULTIPLE ENTRY)',
      validFor: 'SCHENGEN STATES',
      validFrom: '2024-03-01',
      validUntil: '2025-02-28',
      durationOfStayDays: 90,
      passportNumber: 'M9876543',
      holderName: 'VERMA, RAHUL',
      fullName: 'RAHUL VERMA',
      issuingCity: 'MUMBAI',
      mrzLine1: 'VCFRAVERMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'V987654321IND8511234M2502284C090<<<<<<<<<<08',
    },
    normalizedFields: {
      FULLNAME: 'RAHUL VERMA',
      DOCNUMBER: 'V98765432',
      PASSPORTNO: 'M9876543',
      CATEGORY: 'VISA',
      EXPIRY: '2025-02-28',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <pattern id="visaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 0 15 L 30 15 M 15 0 L 15 30" stroke="#e0e7ff" stroke-width="0.8"/>
          <circle cx="15" cy="15" r="4" fill="none" stroke="#c7d2fe" stroke-width="0.6"/>
        </pattern>
      </defs>
      <rect width="800" height="520" rx="16" fill="#f8fafc" stroke="#6366f1" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#visaGrid)"/>
      
      <!-- Visa Header -->
      <rect x="25" y="25" width="750" height="65" fill="#312e81" rx="6"/>
      <text x="45" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="20">SCHENGEN VISA / ETATS SCHENGEN</text>
      <text x="45" y="75" fill="#a5b4fc" font-family="system-ui, sans-serif" font-weight="700" font-size="12">TYPE C SHORT STAY • DURATION: 90 DAYS • MULTIPLE ENTRY</text>
      <text x="640" y="60" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="16">V98765432</text>

      <!-- Photo Box -->
      <rect x="45" y="115" width="160" height="210" rx="6" fill="#e2e8f0" stroke="#4f46e5" stroke-width="2"/>
      <circle cx="125" cy="180" r="40" fill="#94a3b8"/>
      <path d="M 75 270 C 75 225, 175 225, 175 270 Z" fill="#64748b"/>
      <text x="125" y="305" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">RAHUL VERMA</text>

      <!-- Hologram Seal -->
      <circle cx="680" cy="170" r="45" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
      <text x="680" y="174" fill="#4338ca" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">EU HOLOGRAM</text>

      <!-- Fields Grid -->
      <g font-family="system-ui, sans-serif" font-size="11" fill="#475569">
        <text x="235" y="125">VALID FOR / VALABLE POUR</text>
        <text x="235" y="145" font-weight="bold" font-size="14" fill="#0f172a">ETATS SCHENGEN (ALL MEMBER STATES)</text>

        <text x="235" y="180">FROM / DU</text>
        <text x="235" y="200" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">01-03-2024</text>

        <text x="420" y="180">UNTIL / AU</text>
        <text x="420" y="200" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">28-02-2025</text>

        <text x="235" y="235">PASSPORT NUMBER / PASSEPORT NO</text>
        <text x="235" y="255" font-family="monospace" font-weight="bold" font-size="15" fill="#0f172a">M9876543</text>

        <text x="480" y="235">NUMBER OF ENTRIES / ENTREES</text>
        <text x="480" y="255" font-weight="bold" font-size="14" fill="#059669">MULT (MULTIPLE)</text>

        <text x="235" y="290">SURNAME, NAME / NOM, PRENOM</text>
        <text x="235" y="310" font-weight="bold" font-size="16" fill="#0f172a">VERMA, RAHUL</text>

        <text x="480" y="290">ISSUING POST / DELIVRE A</text>
        <text x="480" y="310" font-weight="bold" font-size="13" fill="#4f46e5">MUMBAI (FRANCE CON.)</text>
      </g>

      <!-- MRZ Lines -->
      <rect x="25" y="395" width="750" height="95" rx="6" fill="#ffffff" stroke="#c7d2fe" stroke-width="1.5"/>
      <text x="45" y="435" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#0f172a" letter-spacing="3.5">
        VCFRAVERMA&lt;&lt;RAHUL&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      </text>
      <text x="45" y="470" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#0f172a" letter-spacing="3.5">
        V987654321IND8511234M2502284C090&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;08
      </text>
    </svg>`,
  },

  // 3. NATIONAL IDENTITY CARD (AADHAAR DEMO)
  {
    id: 'REF-DOC-AADHAAR-IND-03',
    category: 'NATIONAL_ID',
    fileName: 'national_id_aadhaar_vikramaditya.svg',
    storageSubdir: 'national-id',
    displayName: 'Government of India - Aadhaar Identity Card',
    samplePerson: {
      fullName: 'VIKRAMADITYA SHARMA',
      dob: '1979-04-12',
      gender: 'M',
      nationality: 'INDIAN',
      docNumber: '9845 2314 6789',
      issueDate: '2018-06-10',
      expiryDate: 'LIFELONG / PERMANENT',
      issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
    },
    ocrText: `GOVERNMENT OF INDIA / भारत सरकार
UNIQUE IDENTIFICATION AUTHORITY OF INDIA
MERA AADHAAR, MERI PEHCHAN / मेरा आधार, मेरी पहचान
NAME: VIKRAMADITYA SHARMA / विक्रमादित्य शर्मा
DOB: 12/04/1979
GENDER: MALE / पुरुष
AADHAAR NO: 9845 2314 6789
SECURE QR CODE: VALID
VID: 9182 3746 5920 1827`,
    extractedFields: {
      docType: 'NATIONAL_ID',
      country: 'IND',
      aadhaarNumber: '9845 2314 6789',
      fullName: 'VIKRAMADITYA SHARMA',
      dob: '1979-04-12',
      gender: 'MALE',
      vidNumber: '9182 3746 5920 1827',
      issuingAuthority: 'UIDAI',
      qrCodePresent: true,
    },
    normalizedFields: {
      FULLNAME: 'VIKRAMADITYA SHARMA',
      DOCNUMBER: '984523146789',
      DOB: '1979-04-12',
      CATEGORY: 'NATIONAL_ID',
      NATIONALITY: 'INDIAN',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="aadhaarHeader" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#16a34a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      
      <!-- Top Tiranga Header Bar -->
      <rect x="0" y="0" width="800" height="18" fill="url(#aadhaarHeader)"/>

      <!-- UIDAI Emblem Header -->
      <rect x="25" y="30" width="750" height="60" fill="#f8fafc" rx="8" stroke="#e2e8f0"/>
      <circle cx="65" cy="60" r="22" fill="#ea580c"/>
      <text x="65" y="66" fill="#ffffff" font-family="system-ui" font-weight="bold" font-size="14" text-anchor="middle">GOI</text>
      <text x="105" y="55" fill="#0f172a" font-family="system-ui, sans-serif" font-weight="900" font-size="18">GOVERNMENT OF INDIA / भारत सरकार</text>
      <text x="105" y="75" fill="#dc2626" font-family="system-ui, sans-serif" font-weight="700" font-size="11">UNIQUE IDENTIFICATION AUTHORITY OF INDIA • AADHAAR</text>

      <!-- Biometric Photo -->
      <rect x="45" y="120" width="170" height="210" rx="6" fill="#e2e8f0" stroke="#f97316" stroke-width="2"/>
      <circle cx="130" cy="185" r="45" fill="#94a3b8"/>
      <path d="M 75 285 C 75 235, 185 235, 185 285 Z" fill="#64748b"/>
      <text x="130" y="315" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">V. SHARMA</text>

      <!-- Secure QR Code Matrix Box -->
      <rect x="580" y="120" width="175" height="175" rx="6" fill="#f1f5f9" stroke="#0f172a" stroke-width="2"/>
      <!-- QR Sim -->
      <rect x="595" y="135" width="40" height="40" fill="#0f172a"/>
      <rect x="605" y="145" width="20" height="20" fill="#ffffff"/>
      <rect x="700" y="135" width="40" height="40" fill="#0f172a"/>
      <rect x="710" y="145" width="20" height="20" fill="#ffffff"/>
      <rect x="595" y="240" width="40" height="40" fill="#0f172a"/>
      <rect x="605" y="250" width="20" height="20" fill="#ffffff"/>
      <circle cx="667" cy="207" r="14" fill="#0284c7"/>
      <text x="667" y="312" fill="#0f172a" font-family="monospace" font-weight="bold" font-size="10" text-anchor="middle">DIGITALLY SIGNED QR</text>

      <!-- Cardholder Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="245" y="145" font-size="12" fill="#64748b">Name / नाम</text>
        <text x="245" y="170" font-weight="bold" font-size="18" fill="#0f172a">VIKRAMADITYA SHARMA</text>
        <text x="245" y="190" font-weight="bold" font-size="14" fill="#ea580c">विक्रमादित्य शर्मा</text>

        <text x="245" y="225" font-size="12" fill="#64748b">Date of Birth / जन्म तिथि</text>
        <text x="245" y="245" font-family="monospace" font-weight="bold" font-size="15" fill="#0f172a">12/04/1979</text>

        <text x="420" y="225" font-size="12" fill="#64748b">Gender / लिंग</text>
        <text x="420" y="245" font-weight="bold" font-size="15" fill="#0f172a">MALE / पुरुष</text>

        <text x="245" y="280" font-size="12" fill="#64748b">Virtual ID (VID)</text>
        <text x="245" y="298" font-family="monospace" font-weight="bold" font-size="13" fill="#0284c7">9182 3746 5920 1827</text>
      </g>

      <!-- Large Aadhaar Number Bar -->
      <rect x="25" y="375" width="750" height="85" rx="8" fill="#fff7ed" stroke="#fdba74" stroke-width="2"/>
      <text x="400" y="430" font-family="monospace" font-weight="900" font-size="34" fill="#c2410c" letter-spacing="8" text-anchor="middle">
        9845 2314 6789
      </text>

      <!-- Bottom Tagline -->
      <text x="400" y="495" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="#15803d" text-anchor="middle">
        मेरा आधार, मेरी पहचान (आधार — आम आदमी का अधिकार)
      </text>
    </svg>`,
  },

  // 4. DRIVING LICENCE
  {
    id: 'REF-DOC-DL-IND-04',
    category: 'DRIVING_LICENSE',
    fileName: 'driving_license_rajesh_kumar.svg',
    storageSubdir: 'driving-license',
    displayName: 'Union of India - Smart Driving Licence',
    samplePerson: {
      fullName: 'RAJESH KUMAR',
      dob: '1988-09-14',
      gender: 'M',
      nationality: 'INDIAN',
      docNumber: 'DL-0420110056789',
      issueDate: '2011-05-18',
      expiryDate: '2038-09-13',
      issuingAuthority: 'Licensing Authority, Transport Dept. Delhi',
    },
    ocrText: `UNION OF INDIA / भारतीय संघ
DRIVING LICENCE / ड्राइविंग लाइसेंस
DELHI TRANSPORT INFRASTRUCTURE DEVELOPMENT CORPORATION
LICENCE NO: DL-0420110056789
NAME: RAJESH KUMAR
S/W/D OF: RAMESH CHANDRA
DOB: 14-09-1988  BG: B+VE
ISSUE DATE: 18-05-2011  VALID TILL: 13-09-2038 (NT)
VEHICLE CLASS: LMV, MCWG
SMART CARD CHIP ENABLED`,
    extractedFields: {
      docType: 'DRIVING_LICENSE',
      licenceNumber: 'DL-0420110056789',
      fullName: 'RAJESH KUMAR',
      fatherName: 'RAMESH CHANDRA',
      dob: '1988-09-14',
      bloodGroup: 'B+VE',
      dateOfIssue: '2011-05-18',
      validTill: '2038-09-13',
      vehicleClasses: 'LMV, MCWG',
      stateCode: 'DL-04',
    },
    normalizedFields: {
      FULLNAME: 'RAJESH KUMAR',
      DOCNUMBER: 'DL-0420110056789',
      DOB: '1988-09-14',
      CATEGORY: 'DRIVING_LICENSE',
      EXPIRY: '2038-09-13',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="dlBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#eff6ff"/>
          <stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="16" fill="url(#dlBg)" stroke="#2563eb" stroke-width="3"/>
      
      <!-- Top Header -->
      <rect x="25" y="25" width="750" height="60" fill="#1e40af" rx="6"/>
      <text x="45" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="20">UNION OF INDIA • DRIVING LICENCE</text>
      <text x="45" y="73" fill="#93c5fd" font-family="system-ui, sans-serif" font-weight="bold" font-size="11">GOVERNMENT OF NCT OF DELHI • TRANSPORT DEPARTMENT</text>
      <text x="630" y="60" fill="#facc15" font-family="monospace" font-weight="bold" font-size="14">SMART CARD</text>

      <!-- Smart Card Golden Chip Simulator -->
      <rect x="45" y="115" width="65" height="50" rx="6" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <line x1="45" y1="140" x2="110" y2="140" stroke="#b45309" stroke-width="1"/>
      <circle cx="77" cy="140" r="10" fill="none" stroke="#b45309" stroke-width="1"/>

      <!-- Photograph Box -->
      <rect x="45" y="185" width="160" height="200" rx="6" fill="#e2e8f0" stroke="#1d4ed8" stroke-width="2"/>
      <circle cx="125" cy="245" r="40" fill="#94a3b8"/>
      <path d="M 75 345 C 75 300, 175 300, 175 345 Z" fill="#64748b"/>
      <text x="125" y="375" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">RAJESH KUMAR</text>

      <!-- Licence Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="240" y="125" font-size="12" fill="#64748b">DL Number / लाइसेंस संख्या</text>
        <text x="240" y="150" font-family="monospace" font-weight="900" font-size="20" fill="#1e40af">DL-0420110056789</text>

        <text x="240" y="185" font-size="12" fill="#64748b">Name / नाम</text>
        <text x="240" y="208" font-weight="bold" font-size="17" fill="#0f172a">RAJESH KUMAR</text>

        <text x="490" y="185" font-size="12" fill="#64748b">S/W/D Of</text>
        <text x="490" y="208" font-weight="bold" font-size="15" fill="#0f172a">RAMESH CHANDRA</text>

        <text x="240" y="245" font-size="12" fill="#64748b">Date of Birth</text>
        <text x="240" y="265" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">14-09-1988</text>

        <text x="390" y="245" font-size="12" fill="#64748b">Blood Group</text>
        <text x="390" y="265" font-weight="bold" font-size="14" fill="#dc2626">B+VE</text>

        <text x="510" y="245" font-size="12" fill="#64748b">Class of Vehicles</text>
        <text x="510" y="265" font-weight="bold" font-size="14" fill="#059669">LMV, MCWG</text>

        <text x="240" y="305" font-size="12" fill="#64748b">Issue Date</text>
        <text x="240" y="325" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">18-05-2011</text>

        <text x="390" y="305" font-size="12" fill="#64748b">Valid Till (Non-Transport)</text>
        <text x="390" y="325" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">13-09-2038</text>
      </g>

      <!-- Signature Strip -->
      <rect x="45" y="415" width="710" height="70" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
      <text x="65" y="445" font-size="11" fill="#64748b">Holder Signature:</text>
      <text x="185" y="455" font-family="'Brush Script MT', cursive, sans-serif" font-size="24" fill="#1e3a8a">Rajesh Kumar</text>
      <text x="500" y="450" font-size="11" fill="#64748b">Issuing Authority: RTO JANAKPURI DELHI</text>
    </svg>`,
  },

  // 5. PERMIT DOCUMENT
  {
    id: 'REF-DOC-PERMIT-RESTRICTED-05',
    category: 'PERMIT',
    fileName: 'permit_restricted_priya_nair.svg',
    storageSubdir: 'permit',
    displayName: 'Restricted Area Entry & Work Permit',
    samplePerson: {
      fullName: 'PRIYA NAIR',
      dob: '1995-02-18',
      gender: 'F',
      nationality: 'INDIAN',
      docNumber: 'RAP-2024-8841',
      issueDate: '2024-01-10',
      expiryDate: '2024-12-31',
      issuingAuthority: 'Ministry of Home Affairs / Border Area Command',
    },
    ocrText: `MINISTRY OF HOME AFFAIRS / गृह मंत्रालय
OFFICIAL RESTRICTED AREA PERMIT (RAP)
GOVERNMENT OF INDIA • BORDER DEFENCE SECTOR
PERMIT NO: RAP-2024-8841
AUTHORIZED HOLDER: PRIYA NAIR
ORGANIZATION: BORDER ROADS SCIENTIFIC CORPS
SECURITY CLEARANCE LEVEL: TIER 2 (RESTRICTED ZONE B)
VALID FROM: 10-01-2024  VALID UPTO: 31-12-2024
AUTHORIZED CHECKPOINTS: NATHU LA, TAWANG, LEH SECTOR
OFFICIAL EMBOSSED SEAL VERIFIED`,
    extractedFields: {
      docType: 'PERMIT',
      permitNumber: 'RAP-2024-8841',
      fullName: 'PRIYA NAIR',
      dob: '1995-02-18',
      securityClearance: 'TIER 2 (RESTRICTED ZONE B)',
      organization: 'BORDER ROADS SCIENTIFIC CORPS',
      validFrom: '2024-01-10',
      validUpto: '2024-12-31',
      authorizedCheckpoints: 'NATHU LA, TAWANG, LEH SECTOR',
      status: 'ACTIVE',
    },
    normalizedFields: {
      FULLNAME: 'PRIYA NAIR',
      DOCNUMBER: 'RAP-2024-8841',
      CATEGORY: 'PERMIT',
      EXPIRY: '2024-12-31',
      NATIONALITY: 'INDIAN',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <pattern id="permitStripes" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 0 40 L 40 0" stroke="#f1f5f9" stroke-width="2"/>
        </pattern>
      </defs>
      <rect width="800" height="520" rx="16" fill="#fffbeb" stroke="#b45309" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#permitStripes)"/>

      <!-- Header -->
      <rect x="25" y="25" width="750" height="70" fill="#78350f" rx="6"/>
      <text x="45" y="55" fill="#fef3c7" font-family="system-ui, sans-serif" font-weight="900" font-size="20">MINISTRY OF HOME AFFAIRS • RESTRICTED AREA PERMIT</text>
      <text x="45" y="77" fill="#fde68a" font-family="system-ui, sans-serif" font-weight="bold" font-size="12">BORDER AREA SECURITY CLEARANCE • TIER 2 CREDENTIAL</text>
      <text x="630" y="62" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="15">RAP-2024-8841</text>

      <!-- Badge & Photo -->
      <rect x="45" y="125" width="160" height="200" rx="6" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
      <circle cx="125" cy="185" r="40" fill="#cbd5e1"/>
      <path d="M 75 285 C 75 240, 175 240, 175 285 Z" fill="#94a3b8"/>
      <text x="125" y="312" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">PRIYA NAIR</text>

      <!-- Official Security Stamp -->
      <circle cx="680" cy="190" r="50" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="8,4"/>
      <text x="680" y="185" fill="#dc2626" font-family="system-ui" font-weight="900" font-size="12" text-anchor="middle">OFFICIAL</text>
      <text x="680" y="202" fill="#dc2626" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">SECURITY SEAL</text>

      <!-- Body Content -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="240" y="135" font-size="12" fill="#78350f">Authorized Permit Holder</text>
        <text x="240" y="160" font-weight="bold" font-size="19" fill="#0f172a">PRIYA NAIR</text>

        <text x="470" y="135" font-size="12" fill="#78350f">Permit Number</text>
        <text x="470" y="160" font-family="monospace" font-weight="bold" font-size="16" fill="#b45309">RAP-2024-8841</text>

        <text x="240" y="200" font-size="12" fill="#78350f">Organization / Affiliation</text>
        <text x="240" y="222" font-weight="bold" font-size="15" fill="#0f172a">BORDER ROADS SCIENTIFIC CORPS</text>

        <text x="240" y="260" font-size="12" fill="#78350f">Security Clearance Level</text>
        <text x="240" y="280" font-weight="bold" font-size="14" fill="#059669">TIER 2 (RESTRICTED BORDER ZONE B)</text>

        <text x="240" y="315" font-size="12" fill="#78350f">Validity Period</text>
        <text x="240" y="335" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">10-01-2024 TO 31-12-2024</text>
      </g>

      <!-- Authorized Sectors Bar -->
      <rect x="25" y="370" width="750" height="95" rx="6" fill="#ffffff" stroke="#fde68a" stroke-width="2"/>
      <text x="45" y="405" font-family="system-ui" font-weight="bold" font-size="13" fill="#92400e">
        AUTHORIZED IMMIGRATION &amp; BORDER CHECKPOINTS:
      </text>
      <text x="45" y="435" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">
        [✓] NATHU LA SECTOR  [✓] TAWANG CORRIDOR  [✓] LEH / LADAKH SECURITY PERIMETER
      </text>
    </svg>`,
  },

  // 6. TRAVEL AUTHORIZATION (eTA - Synthetic Flagged Example)
  {
    id: 'REF-DOC-ETA-US-06',
    category: 'TRAVEL_AUTHORIZATION',
    fileName: 'travel_auth_eta_david_smith.svg',
    storageSubdir: 'travel-authorization',
    displayName: 'International Electronic Travel Authorization (eTA - Flagged)',
    samplePerson: {
      fullName: 'DAVID K. SMITH',
      dob: '1984-06-20',
      gender: 'M',
      nationality: 'UNITED STATES',
      docNumber: 'ETA-2026-99014',
      issueDate: '2014-04-12',
      expiryDate: '2016-04-11',
      issuingAuthority: 'Department of Immigration & Border Protection',
      secondaryNumber: 'PASSPORT: USA-94810239',
    },
    ocrText: `ELECTRONIC TRAVEL AUTHORITY (eTA)
BORDER SECURITY CONFIRMATION SLIP
AUTHORIZATION CODE: ETA-2026-99014
NAME: DAVID K. SMITH
NATIONALITY: UNITED STATES OF AMERICA
PASSPORT NO: USA-94810239
EXPIRY OF DOCUMENT: 2016-04-11
WARNING: ANOMALOUS STAMP DETECTED DATED 2019-04-12
SECURITY FLAG: CREDENTIAL SPLICING DETECTED`,
    extractedFields: {
      docType: 'TRAVEL_AUTHORIZATION',
      etaCode: 'ETA-2026-99014',
      fullName: 'DAVID K. SMITH',
      passportNo: 'USA-94810239',
      nationality: 'USA',
      expiryDate: '2016-04-11',
      stampAnomalyYear: 2019,
      tamperingDetected: true,
      riskLevel: 'CRITICAL',
    },
    normalizedFields: {
      FULLNAME: 'DAVID K SMITH',
      DOCNUMBER: 'ETA-2026-99014',
      CATEGORY: 'TRAVEL_AUTHORIZATION',
      EXPIRY: '2016-04-11',
      NATIONALITY: 'USA',
    },
    knownTamperFlag: true,
    tamperReason: 'Document expired in 2016; forged transit stamp dated 2019 spliced onto credential.',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <pattern id="flaggedPattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 30 30 M 30 0 L 0 30" stroke="#fee2e2" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="800" height="520" rx="16" fill="#fef2f2" stroke="#dc2626" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#flaggedPattern)"/>

      <!-- Red Security Alert Header -->
      <rect x="25" y="25" width="750" height="65" fill="#991b1b" rx="6"/>
      <text x="45" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="20">ELECTRONIC TRAVEL AUTHORIZATION (eTA)</text>
      <text x="45" y="75" fill="#fca5a5" font-family="system-ui, sans-serif" font-weight="bold" font-size="12">BORDER FORCE RE-ENTRY CLEARANCE RECORD • SAMPLE FORENSIC TEST</text>
      <text x="630" y="60" fill="#fef08a" font-family="monospace" font-weight="bold" font-size="15">FLAGGED TEST</text>

      <!-- Photo Box -->
      <rect x="45" y="115" width="160" height="200" rx="6" fill="#ffffff" stroke="#ef4444" stroke-width="2"/>
      <circle cx="125" cy="180" r="40" fill="#cbd5e1"/>
      <path d="M 75 275 C 75 230, 175 230, 175 275 Z" fill="#94a3b8"/>
      <text x="125" y="305" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">DAVID K. SMITH</text>

      <!-- Spliced Stamp Highlight Box -->
      <rect x="530" y="115" width="220" height="150" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="640" y="145" fill="#b91c1c" font-family="system-ui" font-weight="900" font-size="11" text-anchor="middle">⚠ SUSPICIOUS TRANSIT STAMP</text>
      <circle cx="640" cy="195" r="38" fill="none" stroke="#dc2626" stroke-width="2"/>
      <text x="640" y="190" fill="#dc2626" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle">IMMIGRATION</text>
      <text x="640" y="206" fill="#dc2626" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle">12 APR 2019</text>
      <text x="640" y="250" fill="#991b1b" font-family="system-ui" font-size="9" text-anchor="middle">(Credential Expired 2016-04-11)</text>

      <!-- Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="235" y="125" font-size="12" fill="#991b1b">Authorization Code</text>
        <text x="235" y="145" font-family="monospace" font-weight="bold" font-size="16" fill="#0f172a">ETA-2026-99014</text>

        <text x="235" y="180" font-size="12" fill="#991b1b">Passenger Name</text>
        <text x="235" y="202" font-weight="bold" font-size="16" fill="#0f172a">DAVID K. SMITH</text>

        <text x="235" y="235" font-size="12" fill="#991b1b">Passport Number</text>
        <text x="235" y="255" font-family="monospace" font-weight="bold" font-size="15" fill="#0f172a">USA-94810239</text>

        <text x="235" y="290" font-size="12" fill="#991b1b">Official Expiry Date</text>
        <text x="235" y="310" font-family="monospace" font-weight="bold" font-size="15" fill="#dc2626">2016-04-11 [EXPIRED]</text>
      </g>

      <!-- Tamper Alert Banner -->
      <rect x="25" y="360" width="750" height="110" rx="8" fill="#fef2f2" stroke="#f87171" stroke-width="2"/>
      <text x="45" y="395" font-family="system-ui" font-weight="900" font-size="14" fill="#b91c1c">
        AI HEURISTIC DETECTION: CHRONOLOGICAL POST-DATING TAMPERING DETECTED
      </text>
      <text x="45" y="420" font-family="system-ui" font-size="12" fill="#7f1d1d">
        • Stamp dated 2019-04-12 appears on a document expired on 2016-04-11 (3-year inconsistency).
      </text>
      <text x="45" y="440" font-family="system-ui" font-size="12" fill="#7f1d1d">
        • Synthetic demonstration credential designed for border screening tamper detection evaluation.
      </text>
    </svg>`,
  },
];
