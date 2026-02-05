# Deployment Guide - Roosevelt OPS Metrics Dashboard

Complete deployment guide voor het DORA + SPACE metrics dashboard naar production.

## Overzicht

Deze guide leidt je door:
1. ✅ GitHub Repository (al gedaan!)
2. Supabase Cloud Project Setup
3. Vercel Deployment
4. GitHub Actions Configuration

---

## 1. ✅ GitHub Repository

**Status:** COMPLEET
**URL:** https://github.com/hansbeeksma/roosevelt-ops

---

## 2. Supabase Cloud Project Setup

### 2.1 Project Aanmaken

1. Ga naar https://supabase.com/dashboard
2. Klik op **"New Project"**
3. Vul in:
   - **Name:** `roosevelt-ops-metrics`
   - **Database Password:** Genereer een sterk wachtwoord (sla op in wachtwoordmanager!)
   - **Region:** `Europe West (Ireland)` of dichtstbijzijnde
   - **Pricing Plan:** Free tier is voldoende voor starten
4. Klik **"Create new project"**
5. Wacht ~2 minuten tot project klaar is

### 2.2 Database Migraties Uitvoeren

#### Optie A: Via Supabase Dashboard (Aanbevolen)

1. Ga naar je project → **SQL Editor** (linker menu)
2. Klik **"New query"**
3. Kopieer en plak de inhoud van `supabase/migrations/20260205120000_space_metrics_schema.sql`
4. Klik **"Run"**
5. Herhaal voor `supabase/migrations/20260205_dora_metrics_schema.sql`

#### Optie B: Via Supabase CLI (Geavanceerd)

```bash
# Link lokaal project aan cloud project
supabase link --project-ref <your-project-ref>

# Push migraties
supabase db push
```

### 2.3 Credentials Ophalen

1. Ga naar **Settings** → **API**
2. Kopieer de volgende waarden:
   - **Project URL** (onder "Project URL")
   - **anon public** key (onder "Project API keys")

Sla deze op - je hebt ze nodig voor Vercel!

### 2.4 Row Level Security Verificatie

Ga naar **Authentication** → **Policies** en verifieer dat de policies zijn aangemaakt:
- `dora_metrics` table: "Allow read access to authenticated users"
- `developer_surveys` table: "Allow read access to authenticated users"
- Etc.

Als policies ontbreken, zijn de migraties niet correct uitgevoerd.

---

## 3. Vercel Deployment

### 3.1 Project Importeren

1. Ga naar https://vercel.com/new
2. Klik **"Import Git Repository"**
3. Selecteer **"hansbeeksma/roosevelt-ops"**
4. Klik **"Import"**

### 3.2 Environment Variables Configureren

In de Vercel deployment configuratie, voeg toe onder **"Environment Variables"**:

```env
NEXT_PUBLIC_SUPABASE_URL=<jouw-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jouw-supabase-anon-key>
```

**Let op:** Gebruik de waarden uit stap 2.3!

### 3.3 Deploy Settings

- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Klik **"Deploy"** en wacht ~2 minuten.

### 3.4 Deployment Verificatie

1. Zodra deployment klaar is, klik op de **"Visit"** link
2. Verifieer dat het dashboard laadt
3. Check of DORA en SPACE charts data tonen

Als je "No data available" ziet, betekent dat de sample data niet is geladen. Dit is normaal - echte data komt van GitHub Actions.

---

## 4. GitHub Actions Configuration

### 4.1 GitHub Secrets Toevoegen

1. Ga naar https://github.com/hansbeeksma/roosevelt-ops/settings/secrets/actions
2. Klik **"New repository secret"**
3. Voeg toe:

**Secret 1:**
- Name: `SUPABASE_URL`
- Value: `<jouw-supabase-project-url>`

**Secret 2:**
- Name: `SUPABASE_ANON_KEY`
- Value: `<jouw-supabase-anon-key>`

### 4.2 Workflows Verificatie

De workflows zijn al geconfigureerd in `.github/workflows/`:
- `dora-metrics.yml` - Triggered by pushes, PRs, deployments
- `dora-mttr.yml` - Triggered by incident issues

### 4.3 Test de Workflow

Maak een test commit:

```bash
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger DORA metrics workflow"
git push
```

Ga naar **Actions** tab op GitHub en verifieer dat de workflow draait.

---

## 5. Verificatie Checklist

### Database
- [ ] Supabase project is aangemaakt
- [ ] Beide migraties zijn uitgevoerd
- [ ] Tabellen zijn aanwezig (check via Table Editor)
- [ ] Row Level Security policies zijn actief

### Deployment
- [ ] Vercel deployment succesvol
- [ ] Dashboard is toegankelijk via Vercel URL
- [ ] Environment variables zijn correct
- [ ] Geen build errors

### GitHub Actions
- [ ] Secrets zijn toegevoegd
- [ ] Workflows zijn actief
- [ ] Test workflow heeft gedraaid
- [ ] Metrics worden naar Supabase geschreven

### Functionaliteit
- [ ] Dashboard laadt zonder errors
- [ ] DORA metrics section toont tabellen en charts
- [ ] SPACE framework section toont scores
- [ ] Geen console errors in browser

---

## 6. Productie URLs

Na deployment heb je:

| Service | URL | Gebruik |
|---------|-----|---------|
| **GitHub Repo** | https://github.com/hansbeeksma/roosevelt-ops | Code repository |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/<project-id> | Database management |
| **Vercel Dashboard** | https://vercel.com/hansbeeksma/roosevelt-ops | Deployment management |
| **Live Dashboard** | https://roosevelt-ops.vercel.app | Production app |

---

## 7. Volgende Stappen

### Automatische Metrics Collectie

Nu de setup compleet is, verzamelen de GitHub Actions automatisch metrics bij:
- Elke push naar main/master
- Elke PR merge
- Elke deployment
- Elk incident (issue met label "incident", "production-bug", of "p0")

### Custom Domain (Optioneel)

1. Ga naar Vercel project → **Settings** → **Domains**
2. Voeg custom domain toe (bijv. `metrics.rooseveltops.com`)
3. Update DNS records volgens Vercel instructies

### Monitoring & Alerts

1. **Supabase Monitoring:**
   - Ga naar project → **Reports**
   - Monitor API usage, database size

2. **Vercel Analytics:**
   - Ga naar project → **Analytics**
   - Monitor pageviews, performance

### Data Backup

1. **Database Backups:**
   - Supabase maakt automatisch backups (Free tier: daily)
   - Ga naar **Database** → **Backups** om te restaureren

2. **Code Backups:**
   - Automatisch via GitHub

---

## Troubleshooting

### "No data available" in Dashboard

**Oorzaak:** Geen metrics verzameld of sample data niet geladen.

**Oplossing:**
1. Check of GitHub Actions hebben gedraaid (Actions tab)
2. Maak een test commit om workflow te triggeren
3. Check Supabase Table Editor of data aanwezig is

### "Failed to fetch" errors

**Oorzaak:** Verkeerde Supabase credentials.

**Oplossing:**
1. Verifieer environment variables in Vercel
2. Check of NEXT_PUBLIC_ prefix aanwezig is
3. Redeploy na environment variable wijziging

### GitHub Actions falen

**Oorzaak:** Ontbrekende of verkeerde secrets.

**Oplossing:**
1. Verifieer secrets in GitHub Settings
2. Check workflow logs voor specifieke error
3. Test Supabase URL en key handmatig via curl

### Build errors op Vercel

**Oorzaak:** Missing dependencies of TypeScript errors.

**Oplossing:**
1. Check build logs in Vercel dashboard
2. Run `npm run build` lokaal om errors te reproduceren
3. Fix errors en push nieuwe commit

---

## Support

Voor vragen of problemen:
- Check de [Next.js docs](https://nextjs.org/docs)
- Check de [Supabase docs](https://supabase.com/docs)
- Check de [Tremor docs](https://tremor.so/docs)
- Open een issue op GitHub

---

**Deployment Status:** 🚀 Ready for Production

*Laatste update: 2026-02-05*
