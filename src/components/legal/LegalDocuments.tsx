import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Shield, Cookie, Database, Scale, UserCheck, CreditCard } from 'lucide-react';

interface LegalDocumentProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Termini di Servizio
        </CardTitle>
        <CardDescription>
          Ultima modifica: 15 gennaio 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Accettazione dei Termini</h3>
            <p className="text-muted-foreground">
              Utilizzando PetVitality, accetti integralmente i presenti Termini di Servizio. Se non accetti questi termini, 
              non utilizzare il servizio.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Descrizione del Servizio</h3>
            <p className="text-muted-foreground mb-3">
              PetVitality è una piattaforma digitale per il monitoraggio del benessere degli animali domestici che offre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Tracciamento del diario comportamentale</li>
              <li>Analisi emotiva tramite IA</li>
              <li>Gestione delle cartelle cliniche</li>
              <li>Promemoria per cure e visite</li>
              <li>Community e supporto veterinario</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Registrazione e Account</h3>
            <p className="text-muted-foreground mb-3">
              Per utilizzare PetVitality devi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Avere almeno 18 anni o il consenso dei genitori</li>
              <li>Fornire informazioni accurate e complete</li>
              <li>Mantenere la sicurezza del tuo account</li>
              <li>Notificare immediatamente eventuali accessi non autorizzati</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Utilizzo del Servizio</h3>
            <p className="text-muted-foreground mb-3">
              Ti impegni a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Utilizzare il servizio solo per scopi legali</li>
              <li>Non interferire con il funzionamento del servizio</li>
              <li>Non caricare contenuti illegali o dannosi</li>
              <li>Rispettare i diritti degli altri utenti</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Limitazioni di Responsabilità</h3>
            <p className="text-muted-foreground">
              PetVitality fornisce strumenti di supporto al benessere animale ma non sostituisce la consulenza veterinaria professionale. 
              Non siamo responsabili per decisioni mediche basate sui nostri servizi.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">6. Modifiche ai Termini</h3>
            <p className="text-muted-foreground">
              Ci riserviamo il diritto di modificare questi termini. Le modifiche saranno comunicate via email e 
              entreranno in vigore 30 giorni dopo la notifica.
            </p>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sui Termini di Servizio, contatta il nostro team legale all'indirizzo: 
              <span className="font-medium"> legal@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PrivacyPolicy: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Policy
        </CardTitle>
        <CardDescription>
          Ultima modifica: 15 gennaio 2024 - Conforme al GDPR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Informazioni Raccolte</h3>
            <p className="text-muted-foreground mb-3">
              Raccogliamo le seguenti tipologie di dati:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Dati di registrazione:</strong> Nome, email, password</li>
              <li><strong>Dati del pet:</strong> Nome, specie, razza, età, foto</li>
              <li><strong>Dati comportamentali:</strong> Diario, mood, attività</li>
              <li><strong>Dati di utilizzo:</strong> Interazioni con l'app, preferenze</li>
              <li><strong>Dati tecnici:</strong> IP, browser, dispositivo</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Finalità del Trattamento</h3>
            <p className="text-muted-foreground mb-3">
              I tuoi dati vengono utilizzati per:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Fornire i servizi richiesti</li>
              <li>Migliorare l'esperienza utente</li>
              <li>Analisi comportamentale degli animali</li>
              <li>Comunicazioni di servizio</li>
              <li>Ricerca e sviluppo (solo con consenso)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Base Giuridica</h3>
            <p className="text-muted-foreground mb-3">
              Il trattamento dei dati si basa su:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Contratto:</strong> Esecuzione del servizio</li>
              <li><strong>Consenso:</strong> Analisi avanzate e marketing</li>
              <li><strong>Interesse legittimo:</strong> Sicurezza e miglioramento servizi</li>
              <li><strong>Obbligo legale:</strong> Conservazione dati fiscali</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. I Tuoi Diritti</h3>
            <p className="text-muted-foreground mb-3">
              Hai diritto a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Accedere ai tuoi dati personali</li>
              <li>Rettificare dati imprecisi</li>
              <li>Cancellare i tuoi dati</li>
              <li>Limitare il trattamento</li>
              <li>Portabilità dei dati</li>
              <li>Opposizione al trattamento</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Sicurezza dei Dati</h3>
            <p className="text-muted-foreground">
              Implementiamo misure di sicurezza tecniche e organizzative appropriate per proteggere i tuoi dati 
              da accessi non autorizzati, alterazioni, divulgazioni o distruzioni.
            </p>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per esercitare i tuoi diritti o per domande sulla privacy, contatta il nostro Data Protection Officer: 
              <span className="font-medium"> dpo@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CookiePolicy: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          Cookie Policy
        </CardTitle>
        <CardDescription>
          Ultima modifica: 15 gennaio 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Cosa sono i Cookie</h3>
            <p className="text-muted-foreground">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti il nostro sito web. 
              Ci aiutano a fornire un'esperienza migliore e personalizzata.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Tipologie di Cookie Utilizzati</h3>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="destructive">Necessari</Badge>
                  Cookie Tecnici
                </h4>
                <p className="text-sm text-muted-foreground">
                  Essenziali per il funzionamento del sito. Includono autenticazione, sessioni e preferenze di sicurezza.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Funzionali</Badge>
                  Cookie di Personalizzazione
                </h4>
                <p className="text-sm text-muted-foreground">
                  Memorizzano le tue preferenze come lingua, tema e impostazioni dell'interfaccia.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Analitici</Badge>
                  Cookie di Analytics
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza. Dati aggregati e anonimi.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Marketing</Badge>
                  Cookie Pubblicitari
                </h4>
                <p className="text-sm text-muted-foreground">
                  Utilizzati per mostrare contenuti e pubblicità personalizzati basati sui tuoi interessi.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Gestione dei Cookie</h3>
            <p className="text-muted-foreground mb-3">
              Puoi gestire le tue preferenze sui cookie:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Tramite le impostazioni del browser</li>
              <li>Attraverso il banner dei cookie sul sito</li>
              <li>Nelle impostazioni del tuo account</li>
              <li>Contattando il nostro supporto</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Cookie di Terze Parti</h3>
            <p className="text-muted-foreground mb-3">
              Utilizziamo servizi di terze parti che possono impostare cookie:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Google Analytics (analytics)</li>
              <li>Stripe (pagamenti)</li>
              <li>Supabase (autenticazione)</li>
              <li>Vercel (hosting)</li>
            </ul>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sui cookie, contatta: 
              <span className="font-medium"> privacy@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DataProcessingAgreement: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Accordo Trattamento Dati (DPA)
        </CardTitle>
        <CardDescription>
          Conforme al GDPR - Ultima modifica: 15 gennaio 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Ruoli e Responsabilità</h3>
            <p className="text-muted-foreground mb-3">
              Nel trattamento dei dati personali:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Titolare:</strong> PetVitality determina finalità e mezzi del trattamento</li>
              <li><strong>Interessato:</strong> Tu, come utente del servizio</li>
              <li><strong>Responsabile:</strong> Fornitori di servizi terzi (es. cloud provider)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Categorie di Dati Trattati</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Dati Identificativi</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Nome e cognome</li>
                  <li>• Email</li>
                  <li>• Foto profilo</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Dati del Pet</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Informazioni anagrafiche</li>
                  <li>• Dati sanitari</li>
                  <li>• Foto e video</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Misure di Sicurezza</h3>
            <p className="text-muted-foreground mb-3">
              Implementiamo misure tecniche e organizzative appropriate:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Crittografia dei dati in transito e a riposo</li>
              <li>Controllo degli accessi con autenticazione multi-fattore</li>
              <li>Backup regolari e disaster recovery</li>
              <li>Formazione del personale sulla protezione dati</li>
              <li>Audit e monitoraggio continuo</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Trasferimenti Internazionali</h3>
            <p className="text-muted-foreground mb-3">
              I dati possono essere trasferiti a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Stati Uniti (Google Cloud, Stripe) - Clausole contrattuali standard</li>
              <li>Paesi UE (Supabase) - Trasferimento interno UE</li>
              <li>Regno Unito (Vercel) - Decisione di adeguatezza</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Tempi di Conservazione</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Dati account:</strong> Fino alla cancellazione dell'account
              </p>
              <p className="text-muted-foreground">
                <strong>Dati pet:</strong> Fino alla rimozione del pet
              </p>
              <p className="text-muted-foreground">
                <strong>Log di sistema:</strong> 12 mesi
              </p>
              <p className="text-muted-foreground">
                <strong>Dati di fatturazione:</strong> 10 anni (obblighi fiscali)
              </p>
            </div>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sul trattamento dati, contatta il nostro DPO: 
              <span className="font-medium"> dpo@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserRights: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Diritti dell'Utente
        </CardTitle>
        <CardDescription>
          I tuoi diritti secondo il GDPR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Diritto di Accesso</h3>
            <p className="text-muted-foreground mb-3">
              Hai diritto di ottenere informazioni sui tuoi dati personali:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Conferma dell'esistenza di un trattamento</li>
              <li>Copia dei dati personali</li>
              <li>Finalità del trattamento</li>
              <li>Origine dei dati</li>
              <li>Destinatari dei dati</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Diritto di Rettifica</h3>
            <p className="text-muted-foreground">
              Puoi richiedere la correzione di dati personali inaccurati o la loro integrazione se incompleti. 
              Risponderemo entro 30 giorni dalla richiesta.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Diritto di Cancellazione</h3>
            <p className="text-muted-foreground mb-3">
              Puoi richiedere la cancellazione dei tuoi dati nei seguenti casi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>I dati non sono più necessari per le finalità originarie</li>
              <li>Revochi il consenso</li>
              <li>Ti opponi al trattamento</li>
              <li>I dati sono stati trattati illecitamente</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Diritto di Portabilità</h3>
            <p className="text-muted-foreground">
              Hai diritto di ricevere i tuoi dati in formato strutturato e leggibile da dispositivo automatico, 
              e di trasmetterli ad altro titolare senza impedimenti.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Come Esercitare i Diritti</h3>
            <p className="text-muted-foreground mb-3">
              Per esercitare i tuoi diritti puoi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Utilizzare le funzioni nell'app</li>
              <li>Contattare il nostro supporto</li>
              <li>Scrivere al DPO</li>
              <li>Presentare reclamo all'autorità di controllo</li>
            </ul>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per esercitare i tuoi diritti, contatta: 
              <span className="font-medium"> rights@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CancellationPolicy: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Condizioni di Cancellazione
        </CardTitle>
        <CardDescription>
          Termini per la cancellazione del servizio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Cancellazione dell'Abbonamento</h3>
            <p className="text-muted-foreground mb-3">
              Puoi cancellare il tuo abbonamento in qualsiasi momento:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Dalle impostazioni del tuo account</li>
              <li>Contattando il supporto clienti</li>
              <li>Tramite email a billing@petvitality.com</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Effetti della Cancellazione</h3>
            <p className="text-muted-foreground mb-3">
              Dopo la cancellazione:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>L'abbonamento rimane attivo fino alla fine del periodo pagato</li>
              <li>Non verranno addebitati ulteriori costi</li>
              <li>L'accesso alle funzioni premium cesserà alla scadenza</li>
              <li>I dati rimarranno accessibili per 30 giorni</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Rimborsi</h3>
            <p className="text-muted-foreground mb-3">
              I rimborsi sono possibili nei seguenti casi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Cancellazione entro 14 giorni dall'acquisto (diritto di recesso)</li>
              <li>Problemi tecnici non risolti entro 7 giorni</li>
              <li>Addebiti non autorizzati</li>
              <li>Valutazione caso per caso per altre situazioni</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Cancellazione dell'Account</h3>
            <p className="text-muted-foreground mb-3">
              Se decidi di cancellare completamente il tuo account:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Tutti i dati verranno eliminati definitivamente</li>
              <li>L'operazione non è reversibile</li>
              <li>Riceverai una conferma via email</li>
              <li>I backup verranno eliminati entro 30 giorni</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Procedura di Cancellazione</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Passo 1:</p>
                <p className="text-sm text-muted-foreground">Accedi alle impostazioni del tuo account</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Passo 2:</p>
                <p className="text-sm text-muted-foreground">Seleziona "Cancella abbonamento" o "Elimina account"</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Passo 3:</p>
                <p className="text-sm text-muted-foreground">Conferma la tua scelta e fornisci feedback (opzionale)</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Passo 4:</p>
                <p className="text-sm text-muted-foreground">Riceverai una conferma via email</p>
              </div>
            </div>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per assistenza sulla cancellazione, contatta: 
              <span className="font-medium"> support@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const LicenseAgreement: React.FC<LegalDocumentProps> = ({ onClose }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Licenza d'Uso
        </CardTitle>
        <CardDescription>
          Condizioni di utilizzo del software
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Concessione della Licenza</h3>
            <p className="text-muted-foreground">
              PetVitality concede una licenza limitata, non esclusiva, non trasferibile e revocabile per utilizzare 
              il software esclusivamente per scopi personali e non commerciali.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Restrizioni d'Uso</h3>
            <p className="text-muted-foreground mb-3">
              Non è consentito:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Copiare, modificare o distribuire il software</li>
              <li>Decompilare o effettuare reverse engineering</li>
              <li>Utilizzare il software per scopi commerciali</li>
              <li>Rimuovere avvisi di copyright o proprietà</li>
              <li>Creare opere derivate</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Proprietà Intellettuale</h3>
            <p className="text-muted-foreground">
              Tutti i diritti di proprietà intellettuale del software rimangono di proprietà di PetVitality. 
              La licenza non trasferisce alcun diritto di proprietà.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Aggiornamenti e Supporto</h3>
            <p className="text-muted-foreground mb-3">
              PetVitality può fornire:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Aggiornamenti del software</li>
              <li>Correzioni di bug</li>
              <li>Supporto tecnico</li>
              <li>Nuove funzionalità</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Scadenza della Licenza</h3>
            <p className="text-muted-foreground">
              La licenza termina automaticamente in caso di violazione dei termini o cancellazione dell'account. 
              Alla scadenza, devi cessare l'uso del software.
            </p>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sulla licenza, contatta: 
              <span className="font-medium"> legal@petvitality.com</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};