export interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
}

export interface Commercial {
  id: string;
  nom: string;
  telephone: string;
  poste?: string; // e.g. "Sénior Account Manager"
}

export interface Service {
  id: string;
  nom: string;
}

export interface Categorie {
  id: string;
  service_id: string;
  nom: string;
}

export interface Facture {
  id: string;
  numero: string;
  client_id: string;
  commercial_id: string;
  service_id: string;
  categorie_id: string; // e.g. "standard" | "premium" | "express"
  date_livraison: string; // YYYY-MM-DD
  date_echeance: string; // Calculated: livraison + 30 days
  montant: number; // Montant à payer (€)
  montant_utilise: number; // Montant utilisé (€) (cost)
  marge: number; // Calculated: montant - montant_utilise
  prime: number; // Calculated: 10% of margin
  montant_paye: number; // Recalculated from payments
  reste: number; // Calculated: montant - montant_paye
  statut: 'Payée' | 'En attente' | 'En retard';
  created_at: string;
}

export interface Paiement {
  id: string;
  facture_id: string;
  montant: number;
  date_paiement: string;
  mode_paiement: string; // e.g., "Virement", "Chèque", "Carte", "Espèces"
  reference: string;
  observation: string;
}

export interface NotificationAlert {
  id: string;
  type: 'echeance_today' | 'echeance_7d' | 'en_retard';
  facture_id: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Director {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  avatarUrl?: string;
  status: 'pending' | 'active';
  setupToken: string;
}

