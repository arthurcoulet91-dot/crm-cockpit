# Cockpit

Outil de gestion quotidien pour freelance/PME : clients, contrats, pipeline, tâches, finances (CA/bénéfice) et agenda, avec import GoHighLevel et synchronisation Google Agenda.

Stack : Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui (style "Nova" / Base UI) + Supabase (Postgres, Auth, RLS).

## Setup

1. **Installer les dépendances**

   ```bash
   npm install
   ```

2. **Créer un projet Supabase** sur [supabase.com](https://supabase.com) (gratuit), puis dans *Project Settings → API* récupérer :
   - Project URL
   - anon public key
   - service_role key (à garder secrète)

3. **Copier `.env.example` en `.env.local`** et renseigner les valeurs Supabase (au minimum). Les identifiants Google et GoHighLevel peuvent être ajoutés plus tard.

4. **Exécuter la migration SQL** : dans le dashboard Supabase → *SQL Editor*, coller et exécuter le contenu de `supabase/migrations/0001_init.sql`. Cela crée toutes les tables, les enums et les policies RLS (chaque utilisateur ne voit que ses propres données).

5. **Lancer le serveur de dev**

   ```bash
   npm run dev
   ```

6. Ouvrir [http://localhost:3000](http://localhost:3000), créer un compte via l'onglet "Créer un compte" de l'écran de connexion.

## Intégrations (optionnelles, à connecter depuis Réglages → Intégrations)

**Google Agenda** — nécessite un client OAuth Google Cloud :
1. [console.cloud.google.com](https://console.cloud.google.com) → créer un projet → *APIs & Services → Credentials* → *Create Credentials → OAuth client ID* (type "Web application")
2. Activer l'API "Google Calendar API"
3. Ajouter comme URI de redirection autorisée : `http://localhost:3000/api/integrations/google/callback` (et l'équivalent en production)
4. Renseigner `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` dans `.env.local`
5. Cliquer sur "Connecter Google Agenda" dans l'app

**GoHighLevel** — nécessite un Private Integration Token :
1. Dans GHL : *Settings → API → Private Integrations* → créer un token avec accès en lecture aux contacts et opportunités
2. Récupérer le Location ID du sous-compte
3. Renseigner le token et le Location ID directement dans Réglages → Intégrations de l'app

## Structure

- `src/app/(app)/` — pages de l'application (dashboard, clients, contrats, pipeline, tâches, calendrier, finances)
- `src/app/login/` — authentification
- `src/app/api/integrations/google/` — flux OAuth Google Calendar
- `src/lib/actions/` — Server Actions (mutations Supabase)
- `src/lib/supabase/` — clients Supabase (browser/server) et types générés à la main
- `supabase/migrations/` — schéma SQL
- `src/components/ui/` — composants shadcn/ui (style Nova, Base UI)

## Déploiement

Le plus simple est [Vercel](https://vercel.com/new) : connecter le repo, renseigner les mêmes variables d'environnement que `.env.local` (avec les vraies valeurs), et penser à ajouter l'URL de production comme URI de redirection autorisée côté Google Cloud.
