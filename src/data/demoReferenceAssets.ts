// High-fidelity SVG and visual demo reference document assets matching uploaded official documents
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
  // 1. PASSPORT (Arya Singh - Indian Biometric Passport)
  {
    id: 'REF-DOC-PASSPORT-IND-01',
    category: 'PASSPORT',
    fileName: 'passport_ind_arya_singh.svg',
    storageSubdir: 'passport',
    displayName: 'Republic of India - Biometric Passport (Arya Singh)',
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
    ocrText: `P<KHAMEANDOHT<ARYHARYA<<<<<<<<<<<<<<<<<<
Z12345671238ANDI02BE0AA0B4GAG7<<<<<<<<<<<<033
INDIAN REPUBLIC OF INDIA
PASSPORT / पासपोर्ट
Type / प्रकार: P  Code / कोड: IND  Passport No. / पासपोर्ट नं.: Z1234567
Surname / उपनाम: SINGH
Given Names / नाम: ARYA
Nationality / राष्ट्रीयता: भारतीय / INDIAN
Sex / लिंग: F  Date of Birth / जन्म तिथि: 15/07/1992
Place of Birth / जन्म स्थान: CHANDIGARH
Date of Issue / जारी करने की तारीख: 20/01/2023
Date of Expiry / समाप्ति की तारीख: 19/01/2033
Biometric Chip Enabled`,
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
      mrzLine1: 'P<KHAMEANDOHT<ARYHARYA<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'Z12345671238ANDI02BE0AA0B4GAG7<<<<<<<<<<<<033',
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
        <pattern id="guilloche1" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#e0f2fe" stroke-width="0.8"/>
          <path d="M 0 20 Q 10 0 20 20 T 40 20" fill="none" stroke="#bae6fd" stroke-width="0.6"/>
        </pattern>
        <linearGradient id="passportBg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f0f9ff"/>
          <stop offset="100%" stop-color="#e0f2fe"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="16" fill="url(#passportBg1)" stroke="#0284c7" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#guilloche1)"/>
      
      <!-- Top Title -->
      <text x="400" y="48" fill="#0369a1" font-family="system-ui, sans-serif" font-weight="900" font-size="22" letter-spacing="2" text-anchor="middle">INDIAN REPUBLIC OF INDIA</text>
      <text x="400" y="70" fill="#0284c7" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="middle">PASSPORT / पासपोर्ट</text>

      <!-- Biometric Photo Box -->
      <rect x="45" y="100" width="170" height="220" rx="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2"/>
      <circle cx="130" cy="170" r="45" fill="#38bdf8"/>
      <path d="M 80 270 C 80 220, 180 220, 180 270 Z" fill="#0284c7"/>
      <text x="130" y="305" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">ARYA SINGH</text>

      <!-- Ghost Photo -->
      <rect x="670" y="210" width="75" height="95" rx="6" fill="#f0f9ff" stroke="#38bdf8" stroke-width="1.5" opacity="0.8"/>
      <circle cx="707" cy="245" r="18" fill="#7dd3fc" opacity="0.6"/>
      <text x="707" y="295" font-family="system-ui" font-size="8" fill="#0369a1" font-weight="bold" text-anchor="middle">GHOST PHOTO</text>

      <!-- Fields Grid -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="245" y="115" font-size="11" fill="#64748b">Type / प्रकार</text>
        <text x="245" y="133" font-weight="bold" font-size="14">P</text>

        <text x="350" y="115" font-size="11" fill="#64748b">Code / कोड</text>
        <text x="350" y="133" font-weight="bold" font-size="14">IND</text>

        <text x="470" y="115" font-size="11" fill="#64748b">Passport No. / पासपोर्ट नं.</text>
        <text x="470" y="133" font-family="monospace" font-weight="bold" font-size="16" fill="#0369a1">Z1234567</text>

        <text x="245" y="165" font-size="11" fill="#64748b">Surname / उपनाम</text>
        <text x="245" y="183" font-weight="bold" font-size="15">SINGH</text>

        <text x="470" y="165" font-size="11" fill="#64748b">Given Names / नाम</text>
        <text x="470" y="183" font-weight="bold" font-size="15">ARYA</text>

        <text x="245" y="215" font-size="11" fill="#64748b">Nationality / राष्ट्रीयता</text>
        <text x="245" y="233" font-weight="bold" font-size="14">भारतीय / INDIAN</text>

        <text x="470" y="215" font-size="11" fill="#64748b">Sex / लिंग</text>
        <text x="470" y="233" font-weight="bold" font-size="14">F</text>

        <text x="245" y="265" font-size="11" fill="#64748b">Date of Birth / जन्म तिथि</text>
        <text x="245" y="283" font-family="monospace" font-weight="bold" font-size="14">15/07/1992</text>

        <text x="470" y="265" font-size="11" fill="#64748b">Place of Birth / जन्म स्थान</text>
        <text x="470" y="283" font-weight="bold" font-size="14">CHANDIGARH</text>

        <text x="245" y="315" font-size="11" fill="#64748b">Date of Issue / जारी तारीख</text>
        <text x="245" y="333" font-family="monospace" font-weight="bold" font-size="13">20/01/2023</text>

        <text x="470" y="315" font-size="11" fill="#64748b">Date of Expiry / समाप्ति तारीख</text>
        <text x="470" y="333" font-family="monospace" font-weight="bold" font-size="13" fill="#059669">19/01/2033</text>
      </g>

      <!-- Biometric Symbol -->
      <rect x="670" y="105" width="40" height="26" rx="4" fill="#0284c7"/>
      <circle cx="690" cy="118" r="7" fill="#f0f9ff"/>
      <rect x="675" y="116" width="30" height="4" fill="#0284c7"/>

      <!-- MRZ Zone -->
      <rect x="25" y="390" width="750" height="105" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="45" y="432" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="19" fill="#0f172a" letter-spacing="3">
        P&lt;KHAMEANDOHT&lt;ARYHARYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      </text>
      <text x="45" y="472" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="19" fill="#0f172a" letter-spacing="3">
        Z12345671238ANDI02BE0AA0B4GAG7&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;033
      </text>
    </svg>`,
  },

  // 2. VISA (Rajesh Singh - Republic of India Tourist Visa)
  {
    id: 'REF-DOC-VISA-IND-02',
    category: 'VISA',
    fileName: 'visa_ind_rajesh_singh.svg',
    storageSubdir: 'visa',
    displayName: 'Republic of India - Tourist Visa (Rajesh Singh)',
    samplePerson: {
      fullName: 'RAJESH SINGH',
      dob: '1982-04-10',
      gender: 'M',
      nationality: 'INDIAN ORIGIN / UK',
      docNumber: 'T12345678',
      issueDate: '2023-10-15',
      expiryDate: '2024-10-14',
      issuingAuthority: 'High Commission of India, London',
    },
    ocrText: `HIGH COMMISSION OF INDIA LONDON
सत्यमेव जयते
REPUBLIC OF INDIA VISA
Visa No: T12345678  Place: LONDON
Type: TOURIST (T)  No. of Entries: MULTIPLE
Date of Issue: 15 OCT 2023  Date of Expiry: 14 OCT 2024
Surname: SINGH  Given Name: RAJESH
IMMIGRATION AIRPORT (DEL) 20 OCT 2023`,
    extractedFields: {
      docType: 'VISA',
      visaNumber: 'T12345678',
      visaType: 'TOURIST (T)',
      entries: 'MULTIPLE',
      surname: 'SINGH',
      givenName: 'RAJESH',
      fullName: 'RAJESH SINGH',
      placeOfIssue: 'LONDON',
      issuingAuthority: 'HIGH COMMISSION OF INDIA LONDON',
      dateOfIssue: '2023-10-15',
      dateOfExpiry: '2024-10-14',
      immigrationStamp: 'DEL 20 OCT 2023',
    },
    normalizedFields: {
      FULLNAME: 'RAJESH SINGH',
      DOCNUMBER: 'T12345678',
      CATEGORY: 'VISA',
      EXPIRY: '2024-10-14',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <pattern id="visaLines" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="20" x2="20" y2="0" stroke="#f1f5f9" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="520" rx="16" fill="#f8fafc" stroke="#0284c7" stroke-width="3"/>
      <rect x="15" y="15" width="770" height="490" rx="10" fill="url(#visaLines)"/>

      <!-- Seal Circular Stamp -->
      <circle cx="120" cy="90" r="48" fill="none" stroke="#2563eb" stroke-width="2"/>
      <text x="120" y="80" fill="#1e40af" font-family="system-ui" font-weight="bold" font-size="8" text-anchor="middle">HIGH COMMISSION OF INDIA</text>
      <text x="120" y="105" fill="#1e40af" font-family="system-ui" font-weight="bold" font-size="9" text-anchor="middle">LONDON</text>

      <!-- Visa Header -->
      <text x="440" y="80" fill="#0369a1" font-family="system-ui, sans-serif" font-weight="900" font-size="24" letter-spacing="1">REPUBLIC OF INDIA VISA</text>

      <!-- Photo Box -->
      <rect x="45" y="160" width="160" height="210" rx="6" fill="#e2e8f0" stroke="#0284c7" stroke-width="2"/>
      <circle cx="125" cy="225" r="40" fill="#64748b"/>
      <path d="M 75 325 C 75 270, 175 270, 175 325 Z" fill="#334155"/>
      <text x="125" y="355" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">RAJESH SINGH</text>

      <!-- Hologram Seal -->
      <circle cx="680" cy="180" r="55" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
      <text x="680" y="175" fill="#0369a1" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">सत्यमेव जयते</text>
      <text x="680" y="195" fill="#0284c7" font-family="system-ui" font-weight="900" font-size="12" text-anchor="middle">INDIA</text>

      <!-- Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="240" y="135" font-size="12" fill="#64748b">Visa No / वीजा संख्या</text>
        <text x="240" y="158" font-family="monospace" font-weight="bold" font-size="18" fill="#0369a1">T12345678</text>

        <text x="450" y="135" font-size="12" fill="#64748b">Place of Issue</text>
        <text x="450" y="158" font-weight="bold" font-size="16">LONDON</text>

        <text x="240" y="195" font-size="12" fill="#64748b">Type</text>
        <text x="240" y="215" font-weight="bold" font-size="15">TOURIST (T)</text>

        <text x="450" y="195" font-size="12" fill="#64748b">No. of Entries</text>
        <text x="450" y="215" font-weight="bold" font-size="15" fill="#059669">MULTIPLE</text>

        <text x="240" y="250" font-size="12" fill="#64748b">Date of Issue</text>
        <text x="240" y="270" font-family="monospace" font-weight="bold" font-size="14">15 OCT 2023</text>

        <text x="450" y="250" font-size="12" fill="#64748b">Date of Expiry</text>
        <text x="450" y="270" font-family="monospace" font-weight="bold" font-size="14" fill="#059669">14 OCT 2024</text>

        <text x="240" y="305" font-size="12" fill="#64748b">Surname</text>
        <text x="240" y="325" font-weight="bold" font-size="16">SINGH</text>

        <text x="450" y="305" font-size="12" fill="#64748b">Given Name</text>
        <text x="450" y="325" font-weight="bold" font-size="16">RAJESH</text>
      </g>

      <!-- Immigration Airport Stamp -->
      <rect x="235" y="375" width="280" height="90" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="375" y="405" fill="#1e40af" font-family="system-ui" font-weight="bold" font-size="12" text-anchor="middle">IMMIGRATION AIRPORT (DEL)</text>
      <text x="375" y="440" fill="#1e40af" font-family="monospace" font-weight="900" font-size="20" text-anchor="middle">20 OCT 2023</text>
    </svg>`,
  },

  // 3. NATIONAL_ID (Sunita Devi - Government of India Aadhaar Card)
  {
    id: 'REF-DOC-AADHAAR-IND-03',
    category: 'NATIONAL_ID',
    fileName: 'aadhaar_ind_sunita_devi.svg',
    storageSubdir: 'national-id',
    displayName: 'Government of India - Aadhaar Card (Sunita Devi)',
    samplePerson: {
      fullName: 'Sunita Devi',
      dob: '1981-08-12',
      gender: 'Female',
      nationality: 'INDIAN',
      docNumber: '2345 6789 0123',
      issueDate: '2019-01-10',
      expiryDate: 'PERMANENT',
      issuingAuthority: 'UIDAI',
    },
    ocrText: `भारत सरकार / GOVERNMENT OF INDIA
AADHAAR / आधार
UIDAI
नाम / Name: Sunita Devi
सुनीता देवी
जन्म तिथि / Date of Birth: 12/08/1981
लिंग / Gender: महिला / Female
Aadhaar / आधार: 2345 6789 0123
UIDAI helpline: 1947`,
    extractedFields: {
      docType: 'NATIONAL_ID',
      country: 'IND',
      aadhaarNumber: '2345 6789 0123',
      fullName: 'Sunita Devi',
      hindiName: 'सुनीता देवी',
      dob: '1981-08-12',
      gender: 'Female',
      issuingAuthority: 'UIDAI',
      helpline: '1947',
    },
    normalizedFields: {
      FULLNAME: 'SUNITA DEVI',
      DOCNUMBER: '234567890123',
      DOB: '1981-08-12',
      CATEGORY: 'NATIONAL_ID',
      NATIONALITY: 'INDIAN',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="aadhaarTop" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#16a34a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="16" fill="#f0fdf4" stroke="#059669" stroke-width="3"/>
      <rect x="0" y="0" width="800" height="15" fill="url(#aadhaarTop)"/>

      <!-- Header -->
      <rect x="25" y="30" width="750" height="60" fill="#ffffff" rx="8" stroke="#cbd5e1"/>
      <text x="300" y="55" fill="#0f172a" font-family="system-ui" font-weight="900" font-size="18">भारत सरकार / GOVERNMENT OF INDIA</text>
      <text x="300" y="75" fill="#ea580c" font-family="system-ui" font-weight="bold" font-size="13">AADHAAR / आधार • UIDAI</text>

      <!-- Photo Box -->
      <rect x="45" y="115" width="160" height="210" rx="8" fill="#e2e8f0" stroke="#ea580c" stroke-width="2"/>
      <circle cx="125" cy="180" r="40" fill="#f472b6"/>
      <path d="M 75 285 C 75 235, 175 235, 175 285 Z" fill="#9d174d"/>
      <text x="125" y="315" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">SUNITA DEVI</text>

      <!-- Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="245" y="135" font-size="12" fill="#64748b">नाम / Name</text>
        <text x="245" y="160" font-weight="bold" font-size="18">Sunita Devi</text>
        <text x="245" y="185" font-weight="bold" font-size="15" fill="#ea580c">सुनीता देवी</text>

        <text x="245" y="225" font-size="12" fill="#64748b">जन्म तिथि / Date of Birth</text>
        <text x="245" y="248" font-family="monospace" font-weight="bold" font-size="16">12/08/1981</text>

        <text x="470" y="225" font-size="12" fill="#64748b">लिंग / Gender</text>
        <text x="470" y="248" font-weight="bold" font-size="16">महिला / Female</text>
      </g>

      <!-- QR Code Matrix -->
      <rect x="580" y="125" width="170" height="170" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
      <rect x="595" y="140" width="35" height="35" fill="#0f172a"/>
      <rect x="700" y="140" width="35" height="35" fill="#0f172a"/>
      <rect x="595" y="245" width="35" height="35" fill="#0f172a"/>
      <text x="665" y="312" font-family="monospace" font-weight="bold" font-size="10" fill="#64748b" text-anchor="middle">UIDAI SECURE QR</text>

      <!-- Large Aadhaar Bar -->
      <rect x="25" y="375" width="750" height="85" rx="8" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
      <text x="400" y="430" font-family="monospace" font-weight="900" font-size="34" fill="#c2410c" letter-spacing="8" text-anchor="middle">
        2345 6789 0123
      </text>

      <text x="400" y="490" font-family="system-ui" font-weight="bold" font-size="13" fill="#059669" text-anchor="middle">
        UIDAI Helpline : 1947 • मेरा आधार, मेरी पहचान
      </text>
    </svg>`,
  },

  // 4. DRIVING_LICENSE (Rajesh Kumar Sharma - Government of India DL)
  {
    id: 'REF-DOC-DL-IND-04',
    category: 'DRIVING_LICENSE',
    fileName: 'driving_license_rajesh_sharma.svg',
    storageSubdir: 'driving-license',
    displayName: 'Government of India - Driving Licence (Rajesh Kumar Sharma)',
    samplePerson: {
      fullName: 'RAJESH KUMAR SHARMA',
      dob: '1980-08-15',
      gender: 'M',
      nationality: 'INDIAN',
      docNumber: 'DL-14 20230012345',
      issueDate: '2023-05-10',
      expiryDate: '2043-05-09',
      issuingAuthority: 'Transport Dept, New Delhi',
      secondaryNumber: 'S/O SHRI OM PRAKASH SHARMA',
    },
    ocrText: `GOVERNMENT OF INDIA / भारत सरकार
DRIVING LICENCE / चालन अनुज्ञप्ति
Licence No: DL-14 20230012345
Name: RAJESH KUMAR SHARMA
S/O / W/O: S/O SHRI OM PRAKASH SHARMA
DOB: 15-08-1980
Address: FLAT NO. 202, SAI APARTMENTS, SECTOR 12, DWARKA, NEW DELHI - 110075
Blood Group: B+
Validity: Non-Transport: From 10-05-2023 To 09-05-2043
Class of Vehicles: MCWG, LMV`,
    extractedFields: {
      docType: 'DRIVING_LICENSE',
      licenceNumber: 'DL-14 20230012345',
      fullName: 'RAJESH KUMAR SHARMA',
      fatherName: 'SHRI OM PRAKASH SHARMA',
      dob: '1980-08-15',
      address: 'FLAT NO. 202, SAI APARTMENTS, SECTOR 12, DWARKA, NEW DELHI - 110075',
      bloodGroup: 'B+',
      validityNonTransport: 'From 10-05-2023 To 09-05-2043',
      vehicleClasses: 'MCWG, LMV',
    },
    normalizedFields: {
      FULLNAME: 'RAJESH KUMAR SHARMA',
      DOCNUMBER: 'DL1420230012345',
      DOB: '1980-08-15',
      CATEGORY: 'DRIVING_LICENSE',
      EXPIRY: '2043-05-09',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <rect width="800" height="520" rx="16" fill="#f0f9ff" stroke="#0284c7" stroke-width="3"/>
      
      <!-- Top Title -->
      <rect x="25" y="25" width="750" height="60" fill="#0284c7" rx="6"/>
      <text x="45" y="55" fill="#ffffff" font-family="system-ui" font-weight="900" font-size="18">GOVERNMENT OF INDIA • भारत सरकार</text>
      <text x="45" y="73" fill="#bae6fd" font-family="system-ui" font-weight="bold" font-size="12">DRIVING LICENCE • चालन अनुज्ञप्ति</text>

      <!-- Smart Card Chip -->
      <rect x="45" y="105" width="60" height="45" rx="6" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <line x1="45" y1="127" x2="105" y2="127" stroke="#b45309" stroke-width="1"/>

      <!-- Photo Box -->
      <rect x="45" y="170" width="160" height="200" rx="6" fill="#e2e8f0" stroke="#0284c7" stroke-width="2"/>
      <circle cx="125" cy="235" r="40" fill="#64748b"/>
      <path d="M 75 330 C 75 285, 175 285, 175 330 Z" fill="#334155"/>
      <text x="125" y="355" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">RAJESH K. SHARMA</text>

      <!-- Licence Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="240" y="115" font-size="11" fill="#64748b">Licence No</text>
        <text x="240" y="138" font-family="monospace" font-weight="900" font-size="17" fill="#0284c7">DL-14 20230012345</text>

        <text x="240" y="170" font-size="11" fill="#64748b">Name</text>
        <text x="240" y="190" font-weight="bold" font-size="16">RAJESH KUMAR SHARMA</text>

        <text x="240" y="220" font-size="11" fill="#64748b">S/O / W/O</text>
        <text x="240" y="240" font-weight="bold" font-size="14">S/O SHRI OM PRAKASH SHARMA</text>

        <text x="240" y="270" font-size="11" fill="#64748b">DOB: 15-08-1980  •  Blood Group: B+</text>
        <text x="240" y="300" font-size="11" fill="#64748b">Address: FLAT NO. 202, SAI APARTMENTS, SECTOR 12, DWARKA, NEW DELHI - 110075</text>
        
        <text x="240" y="335" font-size="11" fill="#64748b">Validity: Non-Transport: 10-05-2023 To 09-05-2043</text>
        <text x="240" y="360" font-weight="bold" font-size="13" fill="#059669">Class of Vehicles: MCWG, LMV</text>
      </g>

      <!-- Signature -->
      <text x="125" y="445" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" fill="#1e3a8a">Rajesh K. Sharma</text>
    </svg>`,
  },

  // 5. PERMIT (Ms. Renuka Sharma - Protected Area Permit)
  {
    id: 'REF-DOC-PAP-IND-05',
    category: 'PERMIT',
    fileName: 'permit_ind_renuka_sharma.svg',
    storageSubdir: 'permit',
    displayName: 'Protected Area Permit - Andaman & Nicobar (Renuka Sharma)',
    samplePerson: {
      fullName: 'MS. RENUKA SHARMA',
      dob: '1992-10-05',
      gender: 'F',
      nationality: 'INDIAN',
      docNumber: 'PAP/ANI/2023/1784',
      issueDate: '2023-11-14',
      expiryDate: '2023-11-28',
      issuingAuthority: 'Office of District Magistrate, Port Blair',
      secondaryNumber: 'PASSPORT: P6789012, Delhi',
    },
    ocrText: `सुरक्षित क्षेत्र परमिट / PROTECTED AREA PERMIT
GOVERNMENT OF INDIA (भारत सरकार)
MINISTRY OF HOME AFFAIRS (गृह मंत्रालय)
OFFICE OF THE DISTRICT MAGISTRATE (जिला मजिस्ट्रेट कार्यालय)
PORT BLAIR, ANDAMAN & NICOBAR ISLANDS
PERMIT NO: PAP/ANI/2023/1784  DATE OF ISSUE: 14/11/2023  VALID UNTIL: 28/11/2023
Applicant: MS. RENUKA SHARMA
Indian, DOB: 05/10/1992  Passport No: P6789012, Delhi
Area: North & Middle Andaman (specifically Havelock Island, Neil Island, Port Blair)
APPROVED / स्वीकृत - Assistant Secretary (Home)`,
    extractedFields: {
      docType: 'PERMIT',
      permitNumber: 'PAP/ANI/2023/1784',
      fullName: 'MS. RENUKA SHARMA',
      dob: '1992-10-05',
      passportNo: 'P6789012',
      areaAllowed: 'North & Middle Andaman (Havelock Island, Neil Island, Port Blair)',
      validFrom: '2023-11-14',
      validUntil: '2023-11-28',
      purpose: 'Tourism Only',
      approvalStatus: 'APPROVED',
    },
    normalizedFields: {
      FULLNAME: 'RENUKA SHARMA',
      DOCNUMBER: 'PAP/ANI/2023/1784',
      CATEGORY: 'PERMIT',
      EXPIRY: '2023-11-28',
      NATIONALITY: 'INDIAN',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <rect width="800" height="520" rx="16" fill="#fffbeb" stroke="#b45309" stroke-width="3"/>

      <!-- Header -->
      <text x="400" y="45" fill="#78350f" font-family="system-ui" font-weight="900" font-size="20" text-anchor="middle">सुरक्षित क्षेत्र परमिट / PROTECTED AREA PERMIT</text>
      <text x="400" y="68" fill="#92400e" font-family="system-ui" font-weight="bold" font-size="13" text-anchor="middle">GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS</text>
      <text x="400" y="88" fill="#b45309" font-family="system-ui" font-size="11" text-anchor="middle">OFFICE OF DISTRICT MAGISTRATE • PORT BLAIR, ANDAMAN &amp; NICOBAR</text>

      <!-- Photo -->
      <rect x="45" y="115" width="160" height="200" rx="6" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
      <circle cx="125" cy="180" r="40" fill="#f43f5e"/>
      <path d="M 75 275 C 75 230, 175 230, 175 275 Z" fill="#be123c"/>
      <text x="125" y="305" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">RENUKA SHARMA</text>

      <!-- Approved Stamp -->
      <rect x="580" y="115" width="170" height="80" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
      <text x="665" y="145" fill="#047857" font-family="system-ui" font-weight="900" font-size="16" text-anchor="middle">APPROVED</text>
      <text x="665" y="165" fill="#047857" font-family="system-ui" font-weight="bold" font-size="11" text-anchor="middle">स्वीकृत (Home Dept)</text>

      <!-- Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="235" y="125" font-size="12" fill="#78350f">PERMIT NO</text>
        <text x="235" y="148" font-family="monospace" font-weight="bold" font-size="16" fill="#b45309">PAP/ANI/2023/1784</text>

        <text x="235" y="185" font-size="12" fill="#78350f">Applicant</text>
        <text x="235" y="208" font-weight="bold" font-size="17">MS. RENUKA SHARMA</text>

        <text x="235" y="240" font-size="12" fill="#78350f">Indian, DOB: 05/10/1992  •  Passport No: P6789012, Delhi</text>
        <text x="235" y="270" font-size="12" fill="#78350f">Area: North &amp; Middle Andaman (Havelock Island, Neil Island, Port Blair)</text>
        <text x="235" y="300" font-size="12" fill="#78350f">Valid From: 14/11/2023  •  Valid Until: 28/11/2023</text>
        <text x="235" y="330" font-weight="bold" font-size="13" fill="#059669">Valid For: Tourism Only</text>
      </g>
    </svg>`,
  },

  // 6. TRAVEL_AUTHORIZATION (Travel Authorization - Government of India)
  {
    id: 'REF-DOC-TRAVEL-AUTH-06',
    category: 'TRAVEL_AUTHORIZATION',
    fileName: 'travel_auth_ind_meagov.svg',
    storageSubdir: 'travel-authorization',
    displayName: 'Government of India - Travel Authorization (AU026F60PC1IDBG8)',
    samplePerson: {
      fullName: 'OFFICIAL TRAVELER',
      dob: '1985-05-15',
      gender: 'M',
      nationality: 'INDIAN',
      docNumber: 'AU026F60PC1IDBG8',
      issueDate: '2013-02-06',
      expiryDate: '2016-01-07',
      issuingAuthority: 'Ministry of External Affairs, Passport & Visa Section',
    },
    ocrText: `GOVERNMENT OF INDIA
MINISTRY OF EXTERNAL AFFAIRS
TRAVEL AUTHORIZATION
EMBASSY OF INDIA, PASSPORT & VISA SECTION
DOCUMENT NO: AU026F60PC1IDBG8
DATE OF ISSUE: 06/02/2013  VALID UNTIL: 07/01/2016
NATIONALITY: INDIAN
APPROVED Date: 19-07-2019`,
    extractedFields: {
      docType: 'TRAVEL_AUTHORIZATION',
      documentNumber: 'AU026F60PC1IDBG8',
      dateOfIssue: '2013-02-06',
      validUntil: '2016-01-07',
      nationality: 'INDIAN',
      issuingAuthority: 'Ministry of External Affairs',
      approvedDate: '2019-07-19',
    },
    normalizedFields: {
      FULLNAME: 'OFFICIAL TRAVELER',
      DOCNUMBER: 'AU026F60PC1IDBG8',
      CATEGORY: 'TRAVEL_AUTHORIZATION',
      EXPIRY: '2016-01-07',
      NATIONALITY: 'INDIAN',
    },
    knownTamperFlag: false,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <rect width="800" height="520" rx="16" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      
      <!-- Top Title -->
      <text x="400" y="50" fill="#0f172a" font-family="system-ui" font-weight="900" font-size="18" text-anchor="middle">GOVERNMENT OF INDIA • MINISTRY OF EXTERNAL AFFAIRS</text>
      <text x="400" y="80" fill="#1e293b" font-family="system-ui" font-weight="900" font-size="22" letter-spacing="2" text-anchor="middle">TRAVEL AUTHORIZATION</text>

      <!-- Photo Box -->
      <rect x="580" y="125" width="160" height="200" rx="6" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
      <circle cx="660" cy="185" r="40" fill="#64748b"/>
      <path d="M 610 285 C 610 240, 710 240, 710 285 Z" fill="#334155"/>
      <text x="660" y="310" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">TRAVELER</text>

      <!-- Stamp Approved -->
      <rect x="580" y="345" width="180" height="70" rx="6" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
      <text x="670" y="372" fill="#0f172a" font-family="system-ui" font-weight="bold" font-size="14" text-anchor="middle">APPROVED</text>
      <text x="670" y="395" fill="#475569" font-family="system-ui" font-size="11" text-anchor="middle">Date: 19-07-2019</text>

      <!-- Details -->
      <g font-family="system-ui, sans-serif" fill="#1e293b">
        <text x="45" y="140" font-size="12" fill="#64748b">DOCUMENT NO</text>
        <text x="45" y="165" font-family="monospace" font-weight="bold" font-size="18" fill="#0f172a">AU026F60PC1IDBG8</text>

        <text x="45" y="210" font-size="12" fill="#64748b">DATE OF ISSUE</text>
        <text x="45" y="232" font-family="monospace" font-weight="bold" font-size="15">06/02/2013</text>

        <text x="245" y="210" font-size="12" fill="#64748b">VALID UNTIL</text>
        <text x="245" y="232" font-family="monospace" font-weight="bold" font-size="15">07/01/2016</text>

        <text x="45" y="275" font-size="12" fill="#64748b">NATIONALITY</text>
        <text x="45" y="295" font-weight="bold" font-size="16">INDIAN</text>

        <text x="45" y="350" font-size="12" fill="#64748b">EMBASSY OF INDIA, PASSPORT &amp; VISA SECTION</text>
      </g>
    </svg>`,
  },
];
