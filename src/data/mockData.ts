import { Client, Commercial, Service, Categorie, Facture, Paiement } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  { id: 'cli_1', nom: 'NeoSphere Technologies', telephone: '+33 6 12 34 56 78', email: 'contact@neosphere.tech' },
  { id: 'cli_2', nom: 'Lumina Design', telephone: '+33 6 98 76 54 32', email: 'hello@luminadesign.com' },
  { id: 'cli_3', nom: 'Velocity Logistics', telephone: '+33 7 45 61 23 89', email: 'shipping@velocity.fr' },
  { id: 'cli_4', nom: 'Acme Corp', telephone: '+33 1 45 89 12 56', email: 'billing@acme.corp' },
  { id: 'cli_5', nom: 'Global Tech Ltd', telephone: '+33 6 78 90 12 34', email: 'finance@globaltech.com' },
  { id: 'cli_6', nom: 'Sébastien Durand', telephone: '+33 6 45 12 89 23', email: 'sebastien.durand@gmail.com' },
  { id: 'cli_7', nom: 'Altos Digital', telephone: '+33 7 89 45 12 63', email: 'digital@altos.com' },
  { id: 'cli_8', nom: 'Solar Core', telephone: '+33 1 74 85 96 12', email: 'contact@solarcore.io' },
  { id: 'cli_9', nom: 'Pix Nord', telephone: '+33 6 36 25 14 78', email: 'admin@pixnord.fr' }
];

export const INITIAL_COMMERCIAUX: Commercial[] = [
  { id: 'com_1', nom: 'Jean Dupont', telephone: '+33 6 88 55 22 11', poste: 'Sénior Account Manager' },
  { id: 'com_2', nom: 'Marie Bernard', telephone: '+33 6 44 77 11 00', poste: 'Junior Sales Representative' },
  { id: 'com_3', nom: 'Pierre Lefebvre', telephone: '+33 7 55 11 99 88', poste: 'Business Developer' },
  { id: 'com_4', nom: 'Sophie Morel', telephone: '+33 6 11 44 22 33', poste: 'Inside Sales' },
  { id: 'com_5', nom: 'Alice Martin', telephone: '+33 6 22 33 44 55', poste: 'Sénior Account Manager' },
  { id: 'com_6', nom: 'Thomas Dubois', telephone: '+33 6 33 44 55 66', poste: 'Sales Consultant' },
  { id: 'com_7', nom: 'Sophie Petit', telephone: '+33 6 44 55 66 77', poste: 'Account Executive' }
];

export const INITIAL_SERVICES: Service[] = [
  { id: 'srv_1', nom: 'Consulting' },
  { id: 'srv_2', nom: 'Développement' },
  { id: 'srv_3', nom: 'Design UI/UX' },
  { id: 'srv_4', nom: 'Audit & Conseil' }
];

export const INITIAL_CATEGORIES: Categorie[] = [
  { id: 'cat_standard', service_id: 'srv_1', nom: 'Standard' },
  { id: 'cat_premium', service_id: 'srv_1', nom: 'Premium' },
  { id: 'cat_express', service_id: 'srv_1', nom: 'Express' }
];

// Helper to add days to date
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Business Rules calculations
export function calculateInvoiceFields(
  montant: number,
  montantUtilise: number,
  montantPaye: number,
  dateLivraison: string
): {
  dateEcheance: string;
  marge: number;
  prime: number;
  reste: number;
  statut: 'Payée' | 'En attente' | 'En retard';
} {
  const dateEcheance = addDays(dateLivraison, 30);
  const marge = montant - montantUtilise;
  const prime = marge > 0 ? marge * 0.10 : 0;
  const reste = Math.max(0, montant - montantPaye);

  // Status definition:
  // - Payée: reste = 0
  // - En attente: reste > 0 et échéance non dépassée
  // - En retard: reste > 0 et échéance dépassée
  let statut: 'Payée' | 'En attente' | 'En retard' = 'En attente';
  if (reste === 0) {
    statut = 'Payée';
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateEcheance < todayStr) {
      statut = 'En retard';
    } else {
      statut = 'En attente';
    }
  }

  return { dateEcheance, marge, prime, reste, statut };
}

// Initial Payments
export const INITIAL_PAIEMENTS: Paiement[] = [
  // Payments for FAC-2024-001 (Fully Paid)
  { id: 'pay_1', facture_id: 'fac_1', montant: 4560, date_paiement: '2024-10-10', mode_paiement: 'Virement', reference: 'VIR-TS-001', observation: 'Solde de tout compte' },
  // Payments for FAC-2024-004 (Fully Paid)
  { id: 'pay_2', facture_id: 'fac_4', montant: 850, date_paiement: '2024-10-09', mode_paiement: 'Carte', reference: 'CB-DW-1254', observation: 'Paiement en ligne' },
  // Payments for FAC-2023-089 (Partial Payment)
  { id: 'pay_3', facture_id: 'fac_5', montant: 1000, date_paiement: '2023-11-01', mode_paiement: 'Chèque', reference: 'CHQ-859432', observation: 'Acompte reçu' },
  // Payments for FAC-2023-012 (NeoSphere, Paid)
  { id: 'pay_4', facture_id: 'fac_7', montant: 3400, date_paiement: '2023-10-12', mode_paiement: 'Virement', reference: 'VIR-NS-99', observation: 'Paiement facture' },
  // Payments for FAC-2023-025 (NeoSphere, Unpaid, remaining 12,500.00 €)
  // Altos Digital (FAC-2024-005, remaining 4,400.00 €, total amount 12,400.00 €, 8,000.00 € paid)
  { id: 'pay_5', facture_id: 'fac_8', montant: 8000, date_paiement: '2024-11-10', mode_paiement: 'Virement', reference: 'VIR-AD-459', observation: 'Acompte 8000€' },
  // Solar Core (FAC-2024-006, 45,120.00 € paid, remaining 0.00 €)
  { id: 'pay_6', facture_id: 'fac_9', montant: 45120, date_paiement: '2024-11-15', mode_paiement: 'Virement', reference: 'VIR-SC-852', observation: 'Solde reçu' },
  // Pix Nord (FAC-2024-007, 1000.00 € paid, remaining 1,850.00 €)
  { id: 'pay_7', facture_id: 'fac_10', montant: 1000, date_paiement: '2024-11-02', mode_paiement: 'Espèces', reference: 'ESP-PN-02', observation: 'Acompte espèces' }
];

// Initial Invoices
export const INITIAL_FACTURES: Facture[] = [
  // FAC-2024-001 (Payée)
  {
    id: 'fac_1',
    numero: 'FAC-2024-001',
    client_id: 'cli_1', // NeoSphere Technologies
    commercial_id: 'com_5', // Alice Martin
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_premium',
    date_livraison: '2024-09-15',
    date_echeance: '2024-10-15',
    montant: 4560.00,
    montant_utilise: 3200.00,
    marge: 1360.00,
    prime: 136.00,
    montant_paye: 4560.00,
    reste: 0.00,
    statut: 'Payée',
    created_at: '2024-09-15'
  },
  // FAC-2024-002 (En attente)
  {
    id: 'fac_2',
    numero: 'FAC-2024-002',
    client_id: 'cli_3', // Velocity Logistics
    commercial_id: 'com_6', // Thomas Dubois
    service_id: 'srv_1', // Consulting
    categorie_id: 'cat_standard',
    // Let's set the delivery date dynamically to future-ish/recent so it is "En attente" or we keep it realistic
    date_livraison: '2026-06-15',
    date_echeance: '2026-07-15',
    montant: 12400.00,
    montant_utilise: 8000.00,
    marge: 4400.00,
    prime: 440.00,
    montant_paye: 0.00,
    reste: 12400.00,
    statut: 'En attente',
    created_at: '2026-06-15'
  },
  // FAC-2024-003 (En retard)
  {
    id: 'fac_3',
    numero: 'FAC-2024-003',
    client_id: 'cli_2', // Lumina Design
    commercial_id: 'com_7', // Sophie Petit
    service_id: 'srv_3', // Design UI/UX
    categorie_id: 'cat_express',
    date_livraison: '2026-05-10',
    date_echeance: '2026-06-10',
    montant: 2890.50,
    montant_utilise: 1500.00,
    marge: 1390.50,
    prime: 139.05,
    montant_paye: 0.00,
    reste: 2890.50,
    statut: 'En retard',
    created_at: '2026-05-10'
  },
  // FAC-2024-004 (Payée)
  {
    id: 'fac_4',
    numero: 'FAC-2024-004',
    client_id: 'cli_3', // Velocity Logistics
    commercial_id: 'com_5', // Alice Martin
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_standard',
    date_livraison: '2024-09-10',
    date_echeance: '2024-10-10',
    montant: 850.00,
    montant_utilise: 500.00,
    marge: 350.00,
    prime: 35.00,
    montant_paye: 850.00,
    reste: 0.00,
    statut: 'Payée',
    created_at: '2024-09-10'
  },
  // FAC-2023-089 (En retard / Alert)
  {
    id: 'fac_5',
    numero: 'FAC-2023-089',
    client_id: 'cli_4', // Acme Corp
    commercial_id: 'com_1', // Jean Dupont
    service_id: 'srv_4', // Audit & Conseil
    categorie_id: 'cat_standard',
    // We compute relative to current date '2026-07-07'. 
    // "Il y a 3 jours" means due 2026-07-04. So delivery date was 30 days before that: 2026-06-04.
    date_livraison: '2026-06-04',
    date_echeance: '2026-07-04',
    montant: 2240.00, // 1 240,00 € remaining (montant_paye was 1000.00)
    montant_utilise: 1400.00,
    marge: 840.00,
    prime: 84.00,
    montant_paye: 1000.00,
    reste: 1240.00,
    statut: 'En retard',
    created_at: '2026-06-04'
  },
  // FAC-2023-094 (En attente / Due tomorrow)
  {
    id: 'fac_6',
    numero: 'FAC-2023-094',
    client_id: 'cli_5', // Global Tech Ltd
    commercial_id: 'com_3', // Pierre Lefebvre
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_premium',
    // "Demain" means due 2026-07-08. Delivery date was 30 days before that: 2026-06-08.
    date_livraison: '2026-06-08',
    date_echeance: '2026-07-08',
    montant: 2150.00,
    montant_utilise: 1200.00,
    marge: 950.00,
    prime: 95.00,
    montant_paye: 0.00,
    reste: 2150.00,
    statut: 'En attente',
    created_at: '2026-06-08'
  },
  // FAC-2023-091 (En retard / Contentieux - due 10 days ago: 2026-06-27)
  {
    id: 'fac_11',
    numero: 'FAC-2023-091',
    client_id: 'cli_6', // Sébastien Durand
    commercial_id: 'com_4', // Sophie Morel
    service_id: 'srv_1', // Consulting
    categorie_id: 'cat_standard',
    date_livraison: '2026-05-28',
    date_echeance: '2026-06-27',
    montant: 450.00,
    montant_utilise: 200.00,
    marge: 250.00,
    prime: 25.00,
    montant_paye: 0.00,
    reste: 450.00,
    statut: 'En retard',
    created_at: '2026-05-28'
  },
  // FAC-2023-012 (NeoSphere, Paid)
  {
    id: 'fac_7',
    numero: 'FAC-2023-0012',
    client_id: 'cli_1', // NeoSphere Technologies
    commercial_id: 'com_1', // Jean Dupont
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_standard',
    date_livraison: '2023-09-12',
    date_echeance: '2023-10-12',
    montant: 3400.00,
    montant_utilise: 2000.00,
    marge: 1400.00,
    prime: 140.00,
    montant_paye: 3400.00,
    reste: 0.00,
    statut: 'Payée',
    created_at: '2023-09-12'
  },
  // FAC-2023-025 (NeoSphere, Unpaid, remaining 12,500.00 €)
  {
    id: 'fac_12',
    numero: 'FAC-2023-0025',
    client_id: 'cli_1', // NeoSphere Technologies
    commercial_id: 'com_1', // Jean Dupont
    service_id: 'srv_1', // Consulting
    categorie_id: 'cat_premium',
    date_livraison: '2023-09-28',
    date_echeance: '2023-10-28',
    montant: 12500.00,
    montant_utilise: 9000.00,
    marge: 3500.00,
    prime: 350.00,
    montant_paye: 0.00,
    reste: 12500.00,
    statut: 'En retard',
    created_at: '2023-09-28'
  },
  // FAC-2024-005 (Altos Digital, remaining 4,400.00 €, total amount 12,400.00 €, 8,000.00 € paid)
  {
    id: 'fac_8',
    numero: 'FAC-2024-005',
    client_id: 'cli_7', // Altos Digital
    commercial_id: 'com_3', // Pierre Lefebvre
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_premium',
    date_livraison: '2026-06-01',
    date_echeance: '2026-07-01',
    montant: 12400.00,
    montant_utilise: 8000.00,
    marge: 4400.00,
    prime: 440.00,
    montant_paye: 8000.00,
    reste: 4400.00,
    statut: 'En retard', // Today is 2026-07-07, so due date 2026-07-01 is indeed overdue!
    created_at: '2026-06-01'
  },
  // FAC-2024-006 (Solar Core, 45,120.00 € paid, remaining 0.00 €)
  {
    id: 'fac_9',
    numero: 'FAC-2024-006',
    client_id: 'cli_8', // Solar Core
    commercial_id: 'com_2', // Marie Bernard
    service_id: 'srv_4', // Audit & Conseil
    categorie_id: 'cat_standard',
    date_livraison: '2026-06-10',
    date_echeance: '2026-07-10',
    montant: 45120.00,
    montant_utilise: 35000.00,
    marge: 10120.00,
    prime: 1012.00,
    montant_paye: 45120.00,
    reste: 0.00,
    statut: 'Payée',
    created_at: '2026-06-10'
  },
  // FAC-2024-007 (Pix Nord, 1000.00 € paid, remaining 1,850.00 €)
  {
    id: 'fac_10',
    numero: 'FAC-2024-007',
    client_id: 'cli_9', // Pix Nord
    commercial_id: 'com_2', // Marie Bernard
    service_id: 'srv_2', // Développement
    categorie_id: 'cat_standard',
    date_livraison: '2026-06-15',
    date_echeance: '2026-07-15',
    montant: 2850.00,
    montant_utilise: 2000.00,
    marge: 850.00,
    prime: 85.00,
    montant_paye: 1000.00,
    reste: 1850.00,
    statut: 'En attente',
    created_at: '2026-06-15'
  }
];
