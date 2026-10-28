import { Landmark, Hospital, WalletCards, GraduationCap, CarFront, ShieldCheck, Route } from 'lucide-react';

export const DEMO_LABEL = 'DEMO / EXAMPLE';

export const CATEGORIES = [
  { id: 'Government', icon: Landmark, description: 'Documents, certificates and civic services.' },
  { id: 'Healthcare', icon: Hospital, description: 'Visits, admission and care workflows.' },
  { id: 'Banking', icon: WalletCards, description: 'Accounts, KYC and service requests.' },
  { id: 'Education', icon: GraduationCap, description: 'Admissions, enrolment and campus tasks.' },
  { id: 'Transport', icon: CarFront, description: 'Licence and transport authority journeys.' },
  { id: 'Insurance', icon: ShieldCheck, description: 'Policy and claim workflows.' },
  { id: 'Other', icon: Route, description: 'Any process that needs a clearer map.' },
];

export const EXAMPLE_SEARCHES = [
  'Update Aadhaar',
  'PAN service',
  'Open a bank account',
  'Hospital admission',
  'College admission',
  'Driving licence',
];

export const LIVING_ABROAD_TASKS = [
  { id: 'aadhaar', title: 'Aadhaar-related work', progress: 0 },
  { id: 'pan', title: 'PAN-related service', progress: 0 },
  { id: 'banking', title: 'Banking / KYC', progress: 0 },
  { id: 'government', title: 'Government documentation', progress: 0 },
];
