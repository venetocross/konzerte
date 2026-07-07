# Pfotenprotokoll 🐾

Web-App (PWA) zum Tracken von Futter und Ausscheidungen von Haustieren (Hund, Katze, Pferd).

## Funktionen

- **Login per E-Mail** mit Passwort + Bestätigungslink (Firebase Authentication). Die App ist erst nach
  Bestätigung der E-Mail nutzbar.
- **Mehrere Haustierprofile** pro Konto, jederzeit umschaltbar.
- **Pflichtangaben** im Profil: Tierart (Hund/Katze/Pferd), Foto, Name, Gewicht, Geschlecht, Rasse, kastriert
  ja/nein.
- **Optionale Angaben**: Chipnummer, Versicherungsnummer, Name & Art der Versicherung.
- **Futterkomponenten** je Tier frei konfigurierbar (Vorschlagsliste je Tierart + eigene Einträge) – nur
  die ausgewählten Komponenten erscheinen im Tagesprotokoll.
- **Tagesprotokoll** mit 2–5 frei einstellbaren Mahlzeiten: Gesamtfuttermenge, Foto vom Futter,
  Mehrfachauswahl der Futterkomponenten. Zusätzlich beliebig viele Fotos der Ausscheidungen pro Tag.
- **Alle Fotos** erhalten automatisch einen eingebrannten Datums-/Uhrzeit-Stempel (direkt ins Bild
  gezeichnet, nicht nachträglich veränderbar).
- **Verlauf** der Protokolle tage- oder wochenweise, exportierbar als PDF (inkl. Fotos) und direkt teilbar
  (Share-Sheet: Mail, WhatsApp, etc.) oder herunterladbar.
- **Design**: Rot/Weiß, installierbar als PWA auf dem Homescreen.

## Tech-Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Firebase (Authentication, Firestore, Storage)
- react-router-dom, jsPDF
- vite-plugin-pwa (Installierbarkeit, Offline-App-Shell)

## Einrichtung

### 1. Firebase-Projekt anlegen

1. Auf [console.firebase.google.com](https://console.firebase.google.com) ein neues Projekt erstellen.
2. **Authentication** aktivieren → Sign-in-Methode **E-Mail/Passwort** einschalten. Unter
   *Templates* kann die Bestätigungs-E-Mail (Absendername, Text) angepasst werden.
3. **Firestore Database** anlegen (production mode).
4. **Storage** aktivieren (für Profil- und Protokollfotos).
5. Unter *Projekteinstellungen → Allgemein → Meine Apps* eine **Web-App** hinzufügen und die
   angezeigte Konfiguration übernehmen.

### 2. Umgebungsvariablen

`.env.example` nach `.env.local` kopieren und mit den Werten aus Schritt 1 befüllen:

```bash
cp .env.example .env.local
```

### 3. Sicherheitsregeln deployen

Die Dateien `firestore.rules` und `storage.rules` sorgen dafür, dass jede:r Nutzer:in nur die eigenen
Haustiere/Protokolle/Fotos lesen und schreiben kann. Mit der [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
npm install -g firebase-tools
firebase login
firebase init   # Firestore + Storage auswählen, bestehende Regel-Dateien beibehalten
firebase deploy --only firestore:rules,storage:rules
```

### 4. Lokal starten

```bash
npm install
npm run dev
```

### 5. Produktions-Build / Deployment

Die Datei `firebase.json` (SPA-Rewrite, Hosting-Ordner `dist/`) und `.firebaserc` (Projekt-ID
`pet-food-tracker-b7bac`) sind bereits vorbereitet. Deployment auf Firebase Hosting:

```bash
npm run build
npm install -g firebase-tools   # falls noch nicht installiert
firebase login                  # öffnet den Google-Login im Browser
firebase deploy                 # deployt Hosting + Firestore-/Storage-Regeln
```

Nach dem Deploy zeigt die CLI die fertige URL an (Format `https://<projekt-id>.web.app`) – die kann
direkt am Handy im Browser geöffnet oder als PWA installiert werden.

Alternativ kann der Ordner `dist/` (nach `npm run build`) auch auf jedem anderen statischen Hoster
(Netlify, Vercel, …) bereitgestellt werden – dann ggf. eine SPA-Fallback-Regel ergänzen (alle Pfade
→ `index.html`), analog zu den `rewrites` in `firebase.json`.

## Hinweise

- **PDF-Export**: Fotos werden clientseitig in das PDF eingebettet. Dazu müssen sie per Canvas aus
  Firebase Storage geladen werden – das funktioniert mit den Standard-Download-URLs von Firebase Storage
  ohne weitere Konfiguration. Sollte es zu CORS-Fehlern kommen, kann die Storage-CORS-Konfiguration mit
  `gsutil cors set cors.json gs://<bucket>` gesetzt werden (`cors.json`: `[{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]`).
- **Versand per PDF**: Es wird die native Web-Share-API genutzt (auf dem Smartphone öffnet sich das
  Teilen-Menü, z. B. direkt per Mail verschickbar). Auf Desktop-Browsern ohne Share-Support wird das PDF
  stattdessen heruntergeladen.
- **Icons**: Die App-Icons unter `public/icons/` sind Platzhalter (rotes Quadrat mit weißem Punkt) und
  sollten bei Bedarf durch ein eigenes Logo ersetzt werden (`icon-192.png`, `icon-512.png`).
