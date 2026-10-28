export const DEMO_JOURNEYS = [
  {
  "id": "journey-gujarat-sc-scholarship",
  "title": "Gujarat Post-Matric Scholarship for SC Students",
  "category": "Education",
  "country": "India",
  "region": "Gujarat",
  "description": "Centrally Sponsored Scheme (BCK-6.1) providing tuition fee reimbursement and monthly maintenance allowances for Scheduled Caste students pursuing post-matriculation higher education in recognized colleges and universities across Gujarat.",
  "targetUser": "SC students enrolled in post-matriculation courses (Class 11, Class 12, ITI, Diploma, UG, PG, Ph.D.)",
  "organizationName": "Directorate of Scheduled Caste Welfare",
  "department": "Social Justice and Empowerment Department, Government of Gujarat",
  "officialWebsite": "https://www.digitalgujarat.gov.in",
  "sourceUrl": "https://www.digitalgujarat.gov.in/CitizenNew/CitizenServices.aspx",
  "verificationStatus": "verified",
  "lastVerified": "2026-10-28",
  "location": "Gujarat, India (All Districts)",
  "isDemo": false,
  "status": "published",
  "createdBy": "system",
  "steps": [
    {
      "id": "sc-step-1",
      "title": "Step 1: Check Eligibility & Acquire Prerequisite Certificates",
      "description": "Verify annual family income is within ₹2,50,000 (₹2.50 Lakh) per annum. Procure digital SC Caste Certificate and Digital Income Certificate issued for the current financial year by competent state authority (Mamlatdar / Taluka Development Officer / Executive Magistrate) before the portal submission window closes.",
      "requiredDocuments": [
        "SC Caste Certificate (Competent Authority)",
        "Digital Income Certificate (Current FY <= ₹2,50,000)",
        "Student Aadhaar Card",
        "Previous Qualifying Examination Marksheet"
      ],
      "location": "Jana Seva Kendra / Digital Gujarat Portal / Mamlatdar Office",
      "responsibleOrganization": "Revenue Department & Social Justice and Empowerment Department",
      "estimatedTime": "3-7 working days",
      "possibleFee": "Free (₹0 portal fee; nominal ₹20 kiosk service charge if applied offline)",
      "whatHappensNext": "Verify that your Aadhaar and certificate demographic details match your college enrolment record, then proceed to bank account seeding.",
      "commonProblems": [
        "Income certificate issued for an expired financial year.",
        "Spelling mismatch between student name on Aadhaar Card and SSC passing marksheet.",
        "Submitting caste certificate from another state without Gujarat domicile endorsement."
      ],
      "officialSource": "https://www.digitalgujarat.gov.in",
      "branch": {
        "question": "Is your annual family income from all sources at or below ₹2,50,000?",
        "yes": "Eligible for 100% tuition fee waiver/reimbursement and monthly maintenance allowance under Centrally Sponsored Scheme BCK-6.1.",
        "no": "Ineligible for BCK-6.1 central scholarship. Inquire with your college desk regarding state companion assistance (e.g. BCK-5 for girls) or college Freeship Card provisions."
      }
    },
    {
      "id": "sc-step-2",
      "title": "Step 2: Bank Account NPCI / Aadhaar Seeding for DBT",
      "description": "Ensure the student holds an active, independent savings bank account in their own name seeded with Aadhaar on the NPCI (National Payments Corporation of India) mapper. Government scholarship grants are strictly disbursed via Direct Benefit Transfer (DBT) into the Aadhaar-seeded bank account.",
      "requiredDocuments": [
        "Student Bank Passbook / Cancelled Cheque",
        "Aadhaar Card",
        "Bank NPCI Aadhaar Seeding Consent Form"
      ],
      "location": "Home Bank Branch / UIDAI Portal DBT Status Checker",
      "responsibleOrganization": "Student Home Bank & NPCI",
      "estimatedTime": "1-2 banking days",
      "possibleFee": "Free (₹0)",
      "whatHappensNext": "Once NPCI confirms Aadhaar seeding, log in to the Digital Gujarat portal to submit the online scholarship application.",
      "commonProblems": [
        "Bank account is dormant, inactive, or frozen due to lack of updated re-KYC.",
        "Using a minor or joint account with parents (causes automated DBT transfer failure).",
        "Bank account linked for SMS alerts but not active on the NPCI mapper."
      ],
      "officialSource": "https://www.npci.org.in",
      "branch": {
        "question": "Is your personal savings bank account already seeded on the NPCI mapper?",
        "yes": "Bank account is DBT-ready. Proceed directly to online application on Digital Gujarat.",
        "no": "Visit your home bank branch immediately, submit the NPCI Aadhaar Seeding Form, and obtain bank seal confirmation."
      }
    },
    {
      "id": "sc-step-3",
      "title": "Step 3: Online Application on Digital Gujarat Portal",
      "description": "Create or sign in to your citizen account on digitalgujarat.gov.in. Navigate to \"Scholarship Services\" -> Select \"BCK-6.1 Post Matric Scholarship for SC Students (Government of India Scheme)\". Enter academic enrolment, course year, fee receipt details, and hostel status. Upload clean scanned PDF/JPEG copies of all mandatory certificates.",
      "requiredDocuments": [
        "Current College Admission Fee Receipt",
        "College Bonafide Certificate",
        "Recent Passport-sized Photograph",
        "Hostel Certificate / Warden Receipt (Hostellers only)",
        "Study Gap Affidavit (Conditional: only if gap exceeds 1 year)"
      ],
      "location": "Digital Gujarat Citizen Portal (https://www.digitalgujarat.gov.in)",
      "responsibleOrganization": "Directorate of Scheduled Caste Welfare, Gandhinagar",
      "estimatedTime": "45-60 minutes",
      "possibleFee": "Free (₹0 statutory portal fee)",
      "whatHappensNext": "Submit application, generate acknowledgment receipt, and download the full application PDF with barcode.",
      "commonProblems": [
        "Uploading unreadable or blurry document scans.",
        "Selecting incorrect college name or AISHE/DISE institution code.",
        "Exiting the portal without completing final OTP confirmation / Final Submit button.",
        "Applying on the National Scholarship Portal (NSP) instead of Digital Gujarat for Gujarat colleges."
      ],
      "officialSource": "https://www.digitalgujarat.gov.in",
      "branch": {
        "question": "Are you residing in a college or approved government hostel?",
        "yes": "Upload the official Warden Hostel Certificate to claim hosteller maintenance allowance.",
        "no": "Day-scholar rates will automatically apply; no hostel certificate required."
      }
    },
    {
      "id": "sc-step-4",
      "title": "Step 4: Hard Copy Submission & Institutional Verification",
      "description": "Print the submitted Digital Gujarat application form with barcode. Attach self-attested photocopies of all uploaded documents. Submit the hard copy packet to your College Scholarship Clerk / Principal Office for physical document verification against originals within the institutional cutoff date.",
      "requiredDocuments": [
        "Printed Application Form with Barcode (Signed)",
        "Original certificates for counter verification",
        "Self-attested photocopies set"
      ],
      "location": "College Administrative Office / Scholarship Desk",
      "responsibleOrganization": "College Principal & Institutional Scholarship Scrutiny Committee",
      "estimatedTime": "7-15 days following application cutoff",
      "possibleFee": "Free (₹0)",
      "whatHappensNext": "The college scholarship nodal officer verifies attendance and admission fee payment, then digitally forwards the proposal to the District Social Welfare Office.",
      "commonProblems": [
        "Failing to submit physical application to college before the college verification deadline.",
        "Missing student or parent signature on the printed application declaration.",
        "Course fee entered does not match the approved Fee Regulatory Committee (FRC) structure."
      ],
      "officialSource": "https://www.digitalgujarat.gov.in",
      "branch": {
        "question": "Has your college principal verified and digitally forwarded your proposal?",
        "yes": "Proposal forwarded to District Welfare Officer. Application status updates to \"Under District Scrutiny\".",
        "no": "Contact your college scholarship clerk immediately to resolve any document discrepancy before the institutional portal window closes."
      }
    },
    {
      "id": "sc-step-5",
      "title": "Step 5: District Approval, DBT Disbursal & Status Tracking",
      "description": "The District Social Welfare Officer (Directorate of SC Welfare) scrutinizes the proposal. Upon approval, the central and state share of tuition fee and maintenance allowance are credited directly into the student Aadhaar-seeded bank account via Public Financial Management System (PFMS) / DBT.",
      "requiredDocuments": [
        "Application Reference Number / Barcode for tracking"
      ],
      "location": "Digital Gujarat Portal (Track Status) / PFMS Portal (https://pfms.nic.in)",
      "responsibleOrganization": "District Social Welfare Office & State DBT Cell",
      "estimatedTime": "30-60 days following district verification",
      "possibleFee": "Free (₹0)",
      "whatHappensNext": "Receive automated SMS confirmation upon DBT credit. Note: approval is subject to document scrutiny and fund availability; submission does not guarantee automatic approval.",
      "commonProblems": [
        "PFMS payment rejection due to name mismatch between Aadhaar and bank ledger.",
        "Duplicate benefit claim detected on central portal.",
        "Failure to check portal queries or defect notices in student inbox."
      ],
      "officialSource": "https://pfms.nic.in"
    }
  ]
},
  {
    id: 'demo-government-doc',
    title: 'Government Document Application',
    category: 'Government',
    country: 'India',
    region: 'Example region',
    description: 'A visual example showing how a multi-step administrative application can be mapped before starting.',
    targetUser: 'Anyone planning an administrative application',
    organizationName: 'Responsible organization — verify officially',
    department: 'Relevant department — verify officially',
    officialWebsite: '',
    sourceUrl: '',
    verificationStatus: 'demo',
    lastVerified: 'Demo data',
    location: 'Service location — verify officially',
    isDemo: true,
    steps: [
      {
        id: 'gov-1', title: 'Check eligibility', description: 'Review the official eligibility rules for the specific service you need.',
        requiredDocuments: ['Identity proof — verify', 'Supporting information — verify'],
        location: 'Official service information channel', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Prepare the documents that the official service requests.',
        commonProblems: ['Eligibility rules can differ by service.', 'Demo information should not be treated as official guidance.'],
        officialSource: '',
        branch: { question: 'Do you already have the required document?', yes: 'Continue to prepare the remaining documents.', no: 'Obtain the document first, then return to the application.' }
      },
      {
        id: 'gov-2', title: 'Prepare documents', description: 'Collect only the documents confirmed by the official source for this specific service.',
        requiredDocuments: ['Identity proof — verify', 'Address proof — verify', 'Photograph — verify', 'Supporting document — verify'],
        location: 'At home / service location', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Complete the application using the verified instructions.',
        commonProblems: ['Document format or validity rules may vary.'], officialSource: ''
      },
      {
        id: 'gov-3', title: 'Complete application', description: 'Fill in the application using the verified instructions and information.',
        requiredDocuments: ['Prepared documents'], location: 'Online or service location — verify officially', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Review the information and submit through the verified channel.', commonProblems: ['Missing information can block submission.'], officialSource: ''
      },
      {
        id: 'gov-4', title: 'Submit', description: 'Submit through the official route and save any confirmation or reference provided.',
        requiredDocuments: ['Completed application'], location: 'Verified submission channel', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Follow the official verification/status process.', commonProblems: ['Submission channels may change.'], officialSource: ''
      },
      {
        id: 'gov-5', title: 'Verification', description: 'The responsible organization may review submitted information according to its official procedure.',
        requiredDocuments: ['Submission/reference details'], location: 'As specified by official source', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Check the official status or follow-up instructions.', commonProblems: ['Additional information may be requested.'], officialSource: ''
      },
      {
        id: 'gov-6', title: 'Status / follow-up', description: 'Use the official reference or status channel, when one is provided.',
        requiredDocuments: ['Reference number — if issued'], location: 'Official status channel', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Follow the official instructions for receiving the outcome.', commonProblems: ['Status systems and contact routes vary.'], officialSource: ''
      },
      {
        id: 'gov-7', title: 'Receive document', description: 'Completion stage for this demo journey. Verify the actual delivery or collection method officially.',
        requiredDocuments: ['Official confirmation — verify'], location: 'As specified officially', responsibleOrganization: 'Responsible organization — verify officially',
        estimatedTime: 'Not provided', possibleFee: 'Not provided', whatHappensNext: 'Done.', commonProblems: [], officialSource: ''
      }
    ]
  },
  {
    id: 'demo-hospital', title: 'Hospital Visit Journey', category: 'Healthcare', country: 'India', region: 'Example region',
    description: 'A demo map for organizing a hospital visit from preparation through follow-up without presenting operational details as official.',
    targetUser: 'Patient / attendant', organizationName: 'Hospital — verify officially', department: 'Relevant department — verify officially', officialWebsite: '', sourceUrl: '', verificationStatus: 'demo', lastVerified: 'Demo data', location: 'Hospital — verify officially', isDemo: true,
    steps: [
      'Check visit requirements','Prepare documents','Registration / arrival','Consultation','Next action','Follow-up'
    ].map((title,i)=>({id:`hospital-${i}`, title, description:'Demo content only. Verify exact requirements, channels, fees and timings with the hospital.', requiredDocuments:['Document — verify'], location:'Hospital — verify officially', responsibleOrganization:'Hospital / department — verify officially', estimatedTime:'Not provided', possibleFee:'Not provided', whatHappensNext:i===5?'Done.':'Continue to the next verified step.', commonProblems:['Processes vary by hospital and service.'], officialSource:''}))
  },
  {
    id: 'demo-college', title: 'College Admission Journey', category: 'Education', country: 'India', region: 'Example region',
    description: 'A demo map for understanding an admission workflow from eligibility through joining formalities.',
    targetUser: 'Student / applicant', organizationName: 'Institution — verify officially', department: 'Admissions office — verify officially', officialWebsite: '', sourceUrl: '', verificationStatus: 'demo', lastVerified: 'Demo data', location: 'Institution — verify officially', isDemo: true,
    steps: ['Check eligibility','Prepare documents','Complete application','Application review','Admission decision','Joining formalities'].map((title,i)=>({id:`college-${i}`, title, description:'Demo content only. Verify exact requirements, dates and processes with the institution.', requiredDocuments:['Required document — verify'], location:'Institution — verify officially', responsibleOrganization:'Institution / admissions office — verify officially', estimatedTime:'Not provided', possibleFee:'Not provided', whatHappensNext:i===5?'Done.':'Continue to the next verified step.', commonProblems:['Requirements and dates vary by institution.'], officialSource:''}))
  },
  {
    id: 'demo-bank', title: 'Bank Account Opening', category: 'Banking', country: 'India', region: 'Example region',
    description: 'A demo map showing how a banking task can be made easier to follow without assuming product-specific requirements.',
    targetUser: 'Prospective account holder', organizationName: 'Bank — verify officially', department: 'Relevant banking team — verify officially', officialWebsite: '', sourceUrl: '', verificationStatus: 'demo', lastVerified: 'Demo data', location: 'Bank / official online channel — verify', isDemo: true,
    steps: ['Choose account / service','Check requirements','Prepare documents','Submit application','Verification','Account setup'].map((title,i)=>({id:`bank-${i}`, title, description:'Demo content only. Verify KYC, eligibility, fees and channels with the bank.', requiredDocuments:['KYC document — verify'], location:'Bank / official online channel — verify', responsibleOrganization:'Bank — verify officially', estimatedTime:'Not provided', possibleFee:'Not provided', whatHappensNext:i===5?'Done.':'Continue to the next verified step.', commonProblems:['Requirements vary by product and customer context.'], officialSource:''}))
  },
  {
    id: 'demo-driving', title: 'Driving Licence Journey', category: 'Transport', country: 'India', region: 'Example region',
    description: 'A demo journey structure for a driving-licence-related process; exact rules must be checked with the responsible authority.',
    targetUser: 'Applicant', organizationName: 'Transport authority — verify officially', department: 'Relevant transport office — verify officially', officialWebsite: '', sourceUrl: '', verificationStatus: 'demo', lastVerified: 'Demo data', location: 'Transport authority — verify officially', isDemo: true,
    steps: ['Check eligibility','Prepare documents','Submit application','Complete required assessment','Verification','Receive outcome'].map((title,i)=>({id:`licence-${i}`, title, description:'Demo content only. Verify the exact process with the responsible authority.', requiredDocuments:['Required document — verify'], location:'Transport authority — verify officially', responsibleOrganization:'Responsible authority — verify officially', estimatedTime:'Not provided', possibleFee:'Not provided', whatHappensNext:i===5?'Done.':'Continue to the next verified step.', commonProblems:['Rules, tests, appointments and fees can vary.'], officialSource:''}))
  }
];

export const DEMO_REQUESTS = [
  { id:'req-1', title:'Add a state-specific service', submittedBy:'Demo request', category:'Government', status:'pending', note:'Example request only.' },
  { id:'req-2', title:'Review hospital journey source', submittedBy:'Demo request', category:'Healthcare', status:'pending', note:'Example request only.' }
];
