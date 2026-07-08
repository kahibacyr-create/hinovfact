-- =====================================================================
-- HINOV FACTURES - SCHEMA DE BASE DE DONNÉES POSTGRESQL AVEC RLS (Row Level Security)
-- =====================================================================
-- Ce fichier contient la définition complète des tables, index, triggers
-- de mise à jour temporelle et politiques de sécurité au niveau des lignes.
-- Conçu pour une intégration transparente avec PostgreSQL / Supabase / Cloud SQL.
-- =====================================================================

-- Activer les extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. FONCTIONS DE SÉCURITÉ ET ENUMERATIONS
-- =====================================================================

-- Rôles utilisateurs supportés par Hinov
CREATE TYPE user_role AS ENUM ('admin', 'director');

-- Statut d'invitation des directeurs
CREATE TYPE director_status AS ENUM ('pending', 'active');

-- Statut de règlement d'une facture
CREATE TYPE facture_status AS ENUM ('Payée', 'En attente', 'En retard');

-- Type de notification d'échéance financière
CREATE TYPE notification_type AS ENUM ('echeance_today', 'echeance_7d', 'en_retard');

-- Fonction pour obtenir le rôle de l'utilisateur connecté via auth.jwt() ou sessions d'API
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
  -- Dans le cas de Supabase / Firebase ou sessions JWT :
  -- SELECT COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'director');
  -- Pour un développement générique, on retourne une variable de session ou 'director' par défaut :
  SELECT COALESCE(nullif(current_setting('app.current_user_role', true), ''), 'director');
$$ LANGUAGE sql STABLE;

-- Fonction pour vérifier si l'utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT current_user_role() = 'admin';
$$ LANGUAGE sql STABLE;


-- =====================================================================
-- 2. DÉFINITION DES TABLES
-- =====================================================================

-- Table: directors (Comptes de l'équipe de Direction et de l'Admin)
CREATE TABLE directors (
    email VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    status director_status DEFAULT 'pending'::director_status,
    setup_token VARCHAR(100),
    role user_role DEFAULT 'director'::user_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: commerciaux (L'équipe commerciale Hinov)
CREATE TABLE commerciaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    poste VARCHAR(150) DEFAULT 'Commercial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: services (Départements Hinov, ex: Développement, Design, Marketing)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories (Gamme ou formule, ex: standard, premium, express)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: factures
CREATE TABLE factures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    commercial_id UUID NOT NULL REFERENCES commerciaux(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    date_livraison DATE NOT NULL,
    date_echeance DATE NOT NULL,
    montant NUMERIC(15, 2) NOT NULL CHECK (montant >= 0),
    montant_utilise NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (montant_utilise >= 0),
    marge NUMERIC(15, 2) GENERATED ALWAYS AS (montant - montant_utilise) STORED,
    prime NUMERIC(15, 2) GENERATED ALWAYS AS ((montant - montant_utilise) * 0.10) STORED,
    montant_paye NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (montant_paye >= 0),
    reste NUMERIC(15, 2) GENERATED ALWAYS AS (montant - montant_paye) STORED,
    statut facture_status NOT NULL DEFAULT 'En attente'::facture_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: paiements (Tranches de règlement d'une facture)
CREATE TABLE paiements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facture_id UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
    montant NUMERIC(15, 2) NOT NULL CHECK (montant > 0),
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    mode_paiement VARCHAR(100) NOT NULL, -- e.g., "Virement", "Chèque", "Carte", "Espèces"
    reference VARCHAR(255),
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: notifications (Alertes d'échéances et de retards de paiement)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL,
    facture_id UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 3. TRIGGERS AUTOMATIQUES DE COMPORTEMENT
-- =====================================================================

-- A. Mise à jour automatique de la colonne updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger de modification temporelle sur toutes les tables
CREATE TRIGGER update_directors_updated_at BEFORE UPDATE ON directors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commerciaux_updated_at BEFORE UPDATE ON commerciaux FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON factures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_paiements_updated_at BEFORE UPDATE ON paiements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- B. Trigger de recalculation financière de la Facture lors d'un Paiement
-- Met à jour la somme totale réglée (montant_paye) et ajuste le statut de la facture.
CREATE OR REPLACE FUNCTION sync_facture_financials()
RETURNS TRIGGER AS $$
DECLARE
    v_facture_id UUID;
    v_total_paye NUMERIC(15, 2);
    v_montant_facture NUMERIC(15, 2);
    v_date_echeance DATE;
    v_new_statut facture_status;
BEGIN
    -- Identifier la facture concernée
    IF TG_OP = 'DELETE' THEN
        v_facture_id := OLD.facture_id;
    ELSE
        v_facture_id := NEW.facture_id;
    END IF;

    -- Calculer la somme des paiements de cette facture
    SELECT COALESCE(SUM(montant), 0.00) INTO v_total_paye
    FROM paiements
    WHERE facture_id = v_facture_id;

    -- Obtenir le montant total et la date d'échéance de la facture
    SELECT montant, date_echeance INTO v_montant_facture, v_date_echeance
    FROM factures
    WHERE id = v_facture_id;

    -- Déterminer le nouveau statut
    IF v_total_paye >= v_montant_facture THEN
        v_new_statut := 'Payée'::facture_status;
    ELSIF CURRENT_DATE > v_date_echeance THEN
        v_new_statut := 'En retard'::facture_status;
    ELSE
        v_new_statut := 'En attente'::facture_status;
    END IF;

    -- Mettre à jour la facture
    UPDATE factures
    SET montant_paye = v_total_paye,
        statut = v_new_statut
    WHERE id = v_facture_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger financier de paiement
CREATE TRIGGER trigger_sync_payments_to_facture
AFTER INSERT OR UPDATE OR DELETE ON paiements
FOR EACH ROW EXECUTE FUNCTION sync_facture_financials();


-- =====================================================================
-- 4. CONFIGURATION DE LA SÉCURITÉ AU NIVEAU DES LIGNES (RLS)
-- =====================================================================

-- Activer RLS sur chaque table
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerciaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- POLITIQUE DE SÉCURITÉ SUR LA TABLE : directors
-- ---------------------------------------------------------------------

-- Lecture : Les administrateurs voient tout le monde. Un directeur voit uniquement son propre profil.
CREATE POLICY select_directors_policy ON directors
    FOR SELECT
    USING (is_admin() OR (email = current_setting('app.current_user_email', true)));

-- Insertion : Seul l'administrateur peut insérer un nouveau directeur.
-- Exception pour l'auto-enregistrement initial (setup token valide)
CREATE POLICY insert_directors_policy ON directors
    FOR INSERT
    WITH CHECK (is_admin() OR (setup_token IS NOT NULL));

-- Modification : Un administrateur peut tout modifier. Un directeur peut uniquement modifier son propre profil.
CREATE POLICY update_directors_policy ON directors
    FOR UPDATE
    USING (is_admin() OR (email = current_setting('app.current_user_email', true)))
    WITH CHECK (is_admin() OR (email = current_setting('app.current_user_email', true)));

-- Suppression : Seul l'administrateur peut supprimer un compte directeur.
CREATE POLICY delete_directors_policy ON directors
    FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------
-- POLITIQUES COMMUNES SUR LES TABLES MÉTIERS (clients, commerciaux, services, categories, factures, paiements, notifications)
-- ---------------------------------------------------------------------

-- Les directeurs et les administrateurs ont accès complet en lecture.
CREATE POLICY read_all_clients ON clients FOR SELECT USING (true);
CREATE POLICY read_all_commerciaux ON commerciaux FOR SELECT USING (true);
CREATE POLICY read_all_services ON services FOR SELECT USING (true);
CREATE POLICY read_all_categories ON categories FOR SELECT USING (true);
CREATE POLICY read_all_factures ON factures FOR SELECT USING (true);
CREATE POLICY read_all_paiements ON paiements FOR SELECT USING (true);
CREATE POLICY read_all_notifications ON notifications FOR SELECT USING (true);

-- Les directeurs et les administrateurs ont accès complet en écriture/mise à jour.
CREATE POLICY write_all_clients ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_commerciaux ON commerciaux FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_services ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_categories ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_factures ON factures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_paiements ON paiements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY write_all_notifications ON notifications FOR ALL USING (true) WITH CHECK (true);


-- =====================================================================
-- 5. INDEXATION STRATÉGIQUE DES PERFORMANCES FINANCIÈRES
-- =====================================================================

-- Indexations pour accélérer les jointures fréquentes du dashboard directeur
CREATE INDEX idx_categories_service ON categories(service_id);
CREATE INDEX idx_factures_client ON factures(client_id);
CREATE INDEX idx_factures_commercial ON factures(commercial_id);
CREATE INDEX idx_factures_service ON factures(service_id);
CREATE INDEX idx_factures_categorie ON factures(categorie_id);
CREATE INDEX idx_factures_statut ON factures(statut);
CREATE INDEX idx_paiements_facture ON paiements(facture_id);
CREATE INDEX idx_notifications_facture ON notifications(facture_id);
CREATE INDEX idx_notifications_read ON notifications(read);


-- =====================================================================
-- 6. DONNÉES INITIALES (SEED DE DÉMONSTRATION)
-- =====================================================================

-- Insertion de l'Admin Général initial
-- Note : Le mot de passe hashé 'admin2026' doit être configuré
INSERT INTO directors (email, first_name, last_name, password_hash, status, role)
VALUES (
    'admin@hinov-factures.com',
    'Admin',
    'Hinov',
    'admin2026', -- En production, utilisez un algorithme robuste comme bcrypt/argon2
    'active'::director_status,
    'admin'::user_role
) ON CONFLICT (email) DO NOTHING;

-- Insertion du Directeur Général initial
-- Note : Le mot de passe hashé 'director2026' doit être configuré
INSERT INTO directors (email, first_name, last_name, password_hash, status, role, setup_token)
VALUES (
    'jm.hinov@hinov-factures.com',
    'Jean-Marc',
    'Hinov',
    'director2026',
    'active'::director_status,
    'director'::user_role,
    'root-token'
) ON CONFLICT (email) DO NOTHING;
