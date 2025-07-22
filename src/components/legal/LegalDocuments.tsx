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
          Ultima modifica: 22 gennaio 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Accettazione dei Termini</h3>
            <p className="text-muted-foreground">
              Utilizzando PetVoice, accetti integralmente i presenti Termini di Servizio. Se non accetti questi termini, 
              non utilizzare il servizio.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Descrizione del Servizio</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice è una piattaforma innovativa di AI per il benessere degli animali domestici che offre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Analisi avanzate dell'intelligenza artificiale per comprendere le emozioni del tuo pet</li>
              <li>Diario comportamentale digitale con tracking dettagliato</li>
              <li>Chat AI live per supporto immediato e consigli personalizzati</li>
              <li>Musicoterapia personalizzata basata sull'umore del pet</li>
              <li>Protocolli di addestramento AI-generati e personalizzati</li>
              <li>Gestione completa delle cartelle cliniche e visite veterinarie</li>
              <li>Sistema di promemoria intelligente per cure, farmaci e appuntamenti</li>
              <li>Community di pet owner e supporto veterinario professionale</li>
              <li>Dashboard analytics per monitorare trend e progressi nel tempo</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Registrazione e Account</h3>
            <p className="text-muted-foreground mb-3">
              Per utilizzare PetVoice devi:
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
              <li>Non utilizzare impropriamente i sistemi di AI per scopi diversi dal benessere animale</li>
              <li>Non condividere credenziali di accesso con terzi</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Intelligenza Artificiale e Limitazioni</h3>
            <p className="text-muted-foreground mb-3">
              Riguardo ai servizi di AI di PetVoice:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Le analisi comportamentali sono strumenti di supporto, non diagnosi mediche</li>
              <li>I consigli AI non sostituiscono mai la consulenza veterinaria professionale</li>
              <li>La musicoterapia è personalizzata ma non garantisce risultati specifici</li>
              <li>I protocolli di addestramento devono essere supervisionati dal proprietario</li>
              <li>In caso di emergenze sanitarie, contatta sempre un veterinario</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">6. Abbonamento Premium</h3>
            <p className="text-muted-foreground mb-3">
              Il servizio PetVoice Premium include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Accesso illimitato alle analisi AI avanzate</li>
              <li>Chat live con supporto AI personalizzato</li>
              <li>Protocolli di addestramento generati da AI</li>
              <li>Musicoterapia personalizzata senza limiti</li>
              <li>Dashboard analytics completa</li>
              <li>Supporto prioritario 24/7</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">7. Modifiche ai Termini</h3>
            <p className="text-muted-foreground">
              Ci riserviamo il diritto di modificare questi termini. Le modifiche saranno comunicate via email e 
              entreranno in vigore 30 giorni dopo la notifica.
            </p>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sui Termini di Servizio, contatta il nostro team legale all'indirizzo: 
              <span className="font-medium"> legal@petvoice.app</span>
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
          Ultima modifica: 22 gennaio 2025 - Conforme al GDPR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Informazioni Raccolte</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice raccoglie le seguenti tipologie di dati:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Dati di registrazione:</strong> Nome, email, password crittografata</li>
              <li><strong>Dati del pet:</strong> Nome, specie, razza, età, foto, dati sanitari</li>
              <li><strong>Dati comportamentali:</strong> Diario emotivo, mood tracking, attività giornaliere</li>
              <li><strong>Dati AI:</strong> Analisi emotive generate dall'AI, protocolli personalizzati</li>
              <li><strong>Dati di utilizzo:</strong> Interazioni con chat AI, preferenze musicoterapia</li>
              <li><strong>Dati tecnici:</strong> Indirizzo IP, tipo di browser, dispositivo utilizzato</li>
              <li><strong>Dati di pagamento:</strong> Informazioni di fatturazione (gestite tramite Stripe)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Finalità del Trattamento</h3>
            <p className="text-muted-foreground mb-3">
              I tuoi dati vengono utilizzati per:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Fornire servizi di analisi AI personalizzata</li>
              <li>Generare protocolli di addestramento su misura</li>
              <li>Offrire musicoterapia adattiva basata sull'umore del pet</li>
              <li>Migliorare algoritmi di intelligenza artificiale</li>
              <li>Fornire supporto tramite chat AI live</li>
              <li>Gestire abbonamenti e fatturazione</li>
              <li>Inviare comunicazioni di servizio e supporto</li>
              <li>Ricerca e sviluppo (solo con consenso esplicito)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Base Giuridica del Trattamento</h3>
            <p className="text-muted-foreground mb-3">
              Il trattamento dei dati si basa su:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Contratto:</strong> Esecuzione del servizio PetVoice Premium</li>
              <li><strong>Consenso:</strong> Analisi AI avanzate e marketing personalizzato</li>
              <li><strong>Interesse legittimo:</strong> Sicurezza della piattaforma e miglioramento servizi</li>
              <li><strong>Obbligo legale:</strong> Conservazione dati fiscali e di fatturazione</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. I Tuoi Diritti GDPR</h3>
            <p className="text-muted-foreground mb-3">
              Hai diritto a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Accedere ai tuoi dati personali tramite l'app</li>
              <li>Rettificare dati imprecisi nelle impostazioni</li>
              <li>Cancellare completamente i tuoi dati</li>
              <li>Limitare il trattamento per specifiche finalità</li>
              <li>Portabilità dei dati in formato JSON</li>
              <li>Opposizione al trattamento per marketing</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Sicurezza e Protezione Dati</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice implementa robuste misure di sicurezza:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Crittografia end-to-end per tutti i dati sensibili</li>
              <li>Autenticazione sicura tramite Supabase Auth</li>
              <li>Backup automatici con crittografia</li>
              <li>Monitoraggio 24/7 contro accessi non autorizzati</li>
              <li>Conformità alle migliori pratiche di sicurezza cloud</li>
            </ul>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per esercitare i tuoi diritti o per domande sulla privacy, contatta il nostro Data Protection Officer: 
              <span className="font-medium"> dpo@petvoice.app</span>
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
          Ultima modifica: 22 gennaio 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Cosa sono i Cookie</h3>
            <p className="text-muted-foreground">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando utilizzi PetVoice. 
              Ci aiutano a fornire un'esperienza AI personalizzata e funzionalità avanzate.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Tipologie di Cookie Utilizzati da PetVoice</h3>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="destructive">Necessari</Badge>
                  Cookie Tecnici
                </h4>
                <p className="text-sm text-muted-foreground">
                  Essenziali per autenticazione, sessioni AI e sicurezza della piattaforma. Include preferenze di chat AI e stato dell'abbonamento Premium.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Funzionali</Badge>
                  Cookie di Personalizzazione AI
                </h4>
                <p className="text-sm text-muted-foreground">
                  Memorizzano preferenze di musicoterapia, protocolli di addestramento personalizzati e impostazioni dell'interfaccia.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Analitici</Badge>
                  Cookie di Analytics Comportamentali
                </h4>
                <p className="text-sm text-muted-foreground">
                  Analizzano l'utilizzo dell'AI per migliorare algoritmi e suggerimenti. Dati aggregati per ottimizzare l'esperienza pet.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">Marketing</Badge>
                  Cookie Pubblicitari Intelligenti
                </h4>
                <p className="text-sm text-muted-foreground">
                  Personalizzano contenuti e comunicazioni basate sui bisogni del tuo pet identificati dall'AI.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Gestione Cookie nelle Impostazioni</h3>
            <p className="text-muted-foreground mb-3">
              Puoi gestire le tue preferenze sui cookie tramite:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Impostazioni avanzate dell'app PetVoice</li>
              <li>Pannello privacy nelle impostazioni account</li>
              <li>Banner dei cookie al primo accesso</li>
              <li>Impostazioni del browser web</li>
              <li>Supporto clienti dedicato</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Servizi Integrati di Terze Parti</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice utilizza servizi specializzati che possono impostare cookie:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>OpenAI (analisi AI comportamentali)</li>
              <li>ElevenLabs (generazione audio per musicoterapia)</li>
              <li>Stripe (elaborazione pagamenti sicuri)</li>
              <li>Supabase (autenticazione e database)</li>
              <li>Vercel (hosting della piattaforma)</li>
            </ul>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sui cookie o configurazioni avanzate, contatta: 
              <span className="font-medium"> privacy@petvoice.app</span>
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
          Conforme al GDPR - Ultima modifica: 22 gennaio 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Ruoli e Responsabilità</h3>
            <p className="text-muted-foreground mb-3">
              Nel trattamento dei dati personali tramite PetVoice:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Titolare:</strong> PetVoice determina finalità e mezzi del trattamento AI</li>
              <li><strong>Interessato:</strong> Tu, come utente del servizio e proprietario del pet</li>
              <li><strong>Responsabile:</strong> Fornitori di servizi AI e cloud (OpenAI, Supabase, ElevenLabs)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Categorie di Dati Trattati AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Dati Identificativi</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Nome e cognome</li>
                  <li>• Email crittografata</li>
                  <li>• Foto profilo</li>
                  <li>• Preferenze AI</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Dati del Pet e AI</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Analisi comportamentali AI</li>
                  <li>• Protocolli personalizzati</li>
                  <li>• Dati musicoterapia</li>
                  <li>• Chat AI conversazioni</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Misure di Sicurezza Avanzate</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice implementa misure all'avanguardia per proteggere i dati AI:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Crittografia end-to-end per tutte le interazioni AI</li>
              <li>Autenticazione multi-fattore e controllo accessi granulare</li>
              <li>Backup automatici crittografati con ridondanza geografica</li>
              <li>Audit trail completo per ogni operazione AI</li>
              <li>Monitoraggio 24/7 con alerting automatico per anomalie</li>
              <li>Conformità SOC 2 Type II e certificazioni ISO 27001</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Trasferimenti Internazionali Sicuri</h3>
            <p className="text-muted-foreground mb-3">
              I dati possono essere trasferiti ai seguenti fornitori certificati:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Stati Uniti (OpenAI, Stripe) - Clausole contrattuali standard UE</li>
              <li>Regno Unito (ElevenLabs, Vercel) - Decisione di adeguatezza GDPR</li>
              <li>Paesi UE (Supabase) - Trasferimento interno conforme</li>
              <li>Tutti i trasferimenti sono protetti da garanzie GDPR appropriate</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Tempi di Conservazione Dati</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Dati account e profilo:</strong> Fino alla cancellazione dell'account
              </p>
              <p className="text-muted-foreground">
                <strong>Analisi AI e protocolli:</strong> Fino alla rimozione del pet o cancellazione account
              </p>
              <p className="text-muted-foreground">
                <strong>Chat AI e conversazioni:</strong> 24 mesi dall'ultima interazione
              </p>
              <p className="text-muted-foreground">
                <strong>Log di sistema e audit:</strong> 12 mesi per sicurezza
              </p>
              <p className="text-muted-foreground">
                <strong>Dati di fatturazione Premium:</strong> 10 anni (obblighi fiscali italiani)
              </p>
            </div>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sul trattamento dati AI o per esercitare i tuoi diritti GDPR, contatta il nostro DPO: 
              <span className="font-medium"> dpo@petvoice.app</span>
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
              <span className="font-medium"> rights@petvoice.app</span>
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
          Condizioni di Cancellazione PetVoice Premium
        </CardTitle>
        <CardDescription>
          Termini per la cancellazione del servizio - Aggiornato 22 gennaio 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Cancellazione dell'Abbonamento Premium</h3>
            <p className="text-muted-foreground mb-3">
              Puoi cancellare il tuo abbonamento PetVoice Premium in qualsiasi momento tramite:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Scheda "Abbonamenti" nelle impostazioni del tuo account</li>
              <li>Pulsanti "Cancella Subito" o "Cancella a Fine Periodo"</li>
              <li>Portal di gestione Stripe integrato nell'app</li>
              <li>Contattando il supporto clienti prioritario</li>
              <li>Tramite email a billing@petvoice.app</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Modalità di Cancellazione</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cancellazione Immediata</h4>
                <p className="text-sm text-muted-foreground">
                  L'accesso alle funzioni AI Premium termina immediatamente. Nessun rimborso per il periodo rimanente.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cancellazione a Fine Periodo</h4>
                <p className="text-sm text-muted-foreground">
                  Continui ad accedere alle funzioni Premium fino alla scadenza naturale dell'abbonamento. Non verranno addebitati rinnovi.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Effetti della Cancellazione</h3>
            <p className="text-muted-foreground mb-3">
              Dopo la cancellazione del tuo abbonamento Premium:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Perderai l'accesso alle analisi AI avanzate illimitate</li>
              <li>La chat AI live diventerà limitata</li>
              <li>I protocolli di addestramento personalizzati saranno limitati</li>
              <li>La musicoterapia avrà restrizioni d'uso</li>
              <li>Il dashboard analytics completo non sarà più accessibile</li>
              <li>Il supporto prioritario 24/7 terminerà</li>
              <li>I dati storici rimarranno accessibili per 30 giorni</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Politica Rimborsi</h3>
            <p className="text-muted-foreground mb-3">
              I rimborsi per PetVoice Premium sono possibili nei seguenti casi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Cancellazione entro 14 giorni dall'attivazione (diritto di recesso UE)</li>
              <li>Malfunzionamenti AI non risolti entro 7 giorni</li>
              <li>Addebiti non autorizzati o errori di fatturazione</li>
              <li>Problemi tecnici che impediscono l'uso delle funzioni Premium</li>
              <li>Valutazione caso per caso per situazioni eccezionali</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Riattivazione Abbonamento</h3>
            <p className="text-muted-foreground mb-3">
              Se cambi idea prima della scadenza:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Puoi riattivare l'abbonamento dalle impostazioni</li>
              <li>Mantieni tutti i dati e le preferenze AI precedenti</li>
              <li>Nessuna penale per la riattivazione</li>
              <li>L'accesso Premium viene ripristinato immediatamente</li>
            </ul>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per assistenza sulla cancellazione o riattivazione Premium, contatta: 
              <span className="font-medium"> support@petvoice.app</span>
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
          Licenza d'Uso PetVoice
        </CardTitle>
        <CardDescription>
          Condizioni di utilizzo della piattaforma AI - Aggiornato 22 gennaio 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">1. Concessione della Licenza AI</h3>
            <p className="text-muted-foreground">
              PetVoice concede una licenza limitata, non esclusiva, non trasferibile e revocabile per utilizzare 
              la piattaforma AI esclusivamente per il benessere dei tuoi animali domestici e per scopi personali non commerciali.
            </p>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Restrizioni d'Uso della Piattaforma</h3>
            <p className="text-muted-foreground mb-3">
              È severamente vietato:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Copiare, modificare o distribuire il software e gli algoritmi AI</li>
              <li>Decompilare o effettuare reverse engineering dei modelli AI</li>
              <li>Utilizzare la piattaforma per scopi commerciali o di ricerca competitiva</li>
              <li>Tentare di accedere ai dati di altri utenti o ai sistemi interni</li>
              <li>Rimuovere avvisi di copyright, marchi registrati o proprietà intellettuale</li>
              <li>Creare opere derivate basate sui nostri algoritmi proprietari</li>
              <li>Utilizzare i servizi AI per addestrare modelli concorrenti</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Proprietà Intellettuale e AI</h3>
            <p className="text-muted-foreground mb-3">
              Tutti i diritti di proprietà intellettuale rimangono di esclusiva proprietà di PetVoice:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Algoritmi di analisi comportamentale AI proprietari</li>
              <li>Modelli di machine learning per l'interpretazione emotiva</li>
              <li>Sistema di generazione protocolli di addestramento personalizzati</li>
              <li>Tecnologia di musicoterapia adattiva</li>
              <li>Interface utente e design della piattaforma</li>
              <li>Database di knowledge base veterinaria</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Aggiornamenti e Evoluzione AI</h3>
            <p className="text-muted-foreground mb-3">
              PetVoice fornisce continuamente:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Aggiornamenti degli algoritmi AI per migliori performance</li>
              <li>Nuovi modelli di analisi comportamentale</li>
              <li>Correzioni di bug e ottimizzazioni di sistema</li>
              <li>Supporto tecnico specializzato per funzioni AI</li>
              <li>Nuove funzionalità AI Premium</li>
              <li>Miglioramenti alla precisione delle analisi</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Scadenza e Terminazione Licenza</h3>
            <p className="text-muted-foreground">
              La licenza termina automaticamente in caso di violazione dei termini, cancellazione dell'account, 
              o cessazione del servizio. Alla scadenza, devi cessare immediatamente l'uso della piattaforma e 
              delle tecnologie AI di PetVoice.
            </p>
          </section>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Per domande sulla licenza d'uso o proprietà intellettuale, contatta: 
              <span className="font-medium"> legal@petvoice.app</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};