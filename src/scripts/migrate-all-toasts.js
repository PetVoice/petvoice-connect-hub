#!/usr/bin/env node

/**
 * Script per migrare tutti i toast della piattaforma al nuovo sistema unificato
 * Questo script aggiorna automaticamente tutti i file per utilizzare useUnifiedToast
 */

const fs = require('fs');
const path = require('path');

// File che contengono toast da aggiornare
const filesToUpdate = [
  'src/components/AILiveChat.tsx',
  'src/components/AddPetDialog.tsx',
  'src/components/DocumentUploader.tsx',
  'src/components/MessageInput.tsx',
  'src/components/MultiFileUploader.tsx',
  'src/components/accessibility/SupportComponents.tsx',
  'src/components/admin/DataIntegrityDashboard.tsx',
  'src/components/ai-features/AIMusicTherapy.tsx',
  'src/components/ai-features/AITrainingProtocols.tsx',
  'src/components/ai-features/PetMatchingIntelligence.tsx',
  'src/components/analysis/AnalysisResults.tsx',
  'src/components/analysis/AudioPlayer.tsx',
  'src/components/community/Chat.tsx',
  'src/components/community/MessageInput.tsx',
  'src/components/private-chat/PrivateChat.tsx',
  'src/components/private-chat/PrivateChatWithReply.tsx',
  'src/components/settings/ChangePasswordForm.tsx',
  'src/components/settings/DeleteAccountSection.tsx',
  'src/components/settings/EmailManagement.tsx',
  'src/components/settings/ProfileEditForm.tsx',
  'src/components/settings/SubscriptionTab.tsx',
  'src/components/training/AITrainingHub.tsx',
  'src/components/training/ProtocolProgress.tsx',
  'src/components/training/ProtocolRatingModal.tsx',
  'src/components/calendar/CalendarView.tsx',
  'src/components/calendar/EventForm.tsx',
  'src/pages/CalendarPage.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/PetsPage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/TutorialPage.tsx',
  'src/pages/TrainingPage.tsx',
  'src/pages/TrainingDashboard.tsx',
  'src/pages/AnalysisPage.tsx',
  'src/pages/CommunityPage.tsx',
  'src/pages/PetMatchingPage.tsx',
  'src/pages/AIMusicTherapyPage.tsx',
  'src/pages/SubscriptionPage.tsx',
  'src/pages/SupportPage.tsx'
];

// Mapping per i diversi tipi di toast
const toastMappings = {
  // Successi e conferme (verde)
  'variant: "success"': 'showSuccessToast',
  'variant: \'success\'': 'showSuccessToast',
  'pet.added': 'showPetToast',
  'pet.updated': 'showPetToast',
  'pet.deleted': 'showDeleteToast',
  'calendar.eventCreated': 'showCalendarToast',
  'calendar.eventUpdated': 'showCalendarToast',
  'calendar.eventDeleted': 'showDeleteToast',
  'diary.entryCreated': 'showDiaryToast',
  'diary.entryUpdated': 'showDiaryToast',
  'diary.entryDeleted': 'showDeleteToast',
  'analysis.completed': 'showAnalysisToast',
  'music.playlistCreated': 'showMusicToast',
  'chat.messageSent': 'showChatToast',
  'upload.completed': 'showUploadToast',
  
  // Errori e eliminazioni (rosso)
  'variant: "destructive"': 'showErrorToast',
  'variant: \'destructive\'': 'showErrorToast',
  'error.title': 'showErrorToast',
  'delete': 'showDeleteToast',
  'eliminat': 'showDeleteToast',
  
  // Warning (giallo)
  'variant: "warning"': 'showWarningToast',
  'variant: \'warning\'': 'showWarningToast',
  'warning': 'showWarningToast',
  
  // Info (blu)
  'variant: "info"': 'showInfoToast',
  'variant: \'info\'': 'showInfoToast',
  'info': 'showInfoToast'
};

function updateFileToasts(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File non trovato: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // 1. Aggiorna gli import
  if (content.includes('from \'@/hooks/use-toast\'') || content.includes('from "@/hooks/use-toast"')) {
    content = content.replace(
      /import\s*{\s*[^}]*\s*}\s*from\s*['"]@\/hooks\/use-toast['"]/g,
      'import { useUnifiedToast } from \'@/hooks/use-unified-toast\''
    );
    hasChanges = true;
  }

  if (content.includes('from \'@/hooks/use-translated-toast\'') || content.includes('from "@/hooks/use-translated-toast"')) {
    content = content.replace(
      /import\s*{\s*[^}]*\s*}\s*from\s*['"]@\/hooks\/use-translated-toast['"]/g,
      'import { useUnifiedToast } from \'@/hooks/use-unified-toast\''
    );
    hasChanges = true;
  }

  // 2. Aggiorna le dichiarazioni hook
  if (content.includes('useToast()') || content.includes('useTranslatedToast()')) {
    // Determina quali funzioni toast sono usate nel file
    const usedFunctions = new Set();
    
    // Controlla per tipi specifici di toast basati sul contenuto
    if (content.includes('error') || content.includes('Error') || content.includes('destructive')) {
      usedFunctions.add('showErrorToast');
    }
    if (content.includes('success') || content.includes('Success') || content.includes('created') || content.includes('updated')) {
      usedFunctions.add('showSuccessToast');
    }
    if (content.includes('delete') || content.includes('Delete') || content.includes('eliminat')) {
      usedFunctions.add('showDeleteToast');
    }
    if (content.includes('warning') || content.includes('Warning')) {
      usedFunctions.add('showWarningToast');
    }
    if (content.includes('info') || content.includes('Info')) {
      usedFunctions.add('showInfoToast');
    }
    if (content.includes('pet') || content.includes('Pet')) {
      usedFunctions.add('showPetToast');
    }
    if (content.includes('calendar') || content.includes('Calendar') || content.includes('event')) {
      usedFunctions.add('showCalendarToast');
    }
    if (content.includes('diary') || content.includes('Diary')) {
      usedFunctions.add('showDiaryToast');
    }
    if (content.includes('music') || content.includes('Music') || content.includes('audio')) {
      usedFunctions.add('showMusicToast');
    }
    if (content.includes('chat') || content.includes('Chat') || content.includes('message')) {
      usedFunctions.add('showChatToast');
    }
    if (content.includes('upload') || content.includes('Upload') || content.includes('file')) {
      usedFunctions.add('showUploadToast');
    }
    if (content.includes('analysis') || content.includes('Analysis')) {
      usedFunctions.add('showAnalysisToast');
    }

    // Se non troviamo funzioni specifiche, usa le base
    if (usedFunctions.size === 0) {
      usedFunctions.add('showSuccessToast');
      usedFunctions.add('showErrorToast');
    }

    const functionsArray = Array.from(usedFunctions).sort();
    const destructuring = `{ ${functionsArray.join(', ')} }`;

    content = content.replace(
      /const\s*{\s*[^}]*\s*}\s*=\s*useToast\(\)/g,
      `const ${destructuring} = useUnifiedToast()`
    );
    content = content.replace(
      /const\s*{\s*[^}]*\s*}\s*=\s*useTranslatedToast\(\)/g,
      `const ${destructuring} = useUnifiedToast()`
    );
    hasChanges = true;
  }

  // 3. Aggiorna le chiamate toast
  // Sostituisci toast({ con la funzione appropriata
  content = content.replace(
    /toast\(\s*{\s*title:\s*['"](.*?)['"],?\s*description:\s*['"](.*?)['"],?\s*variant:\s*['"](.*?)['"][^}]*}\s*\)/g,
    (match, title, description, variant) => {
      let func = 'showSuccessToast';
      if (variant === 'destructive') func = 'showErrorToast';
      else if (variant === 'warning') func = 'showWarningToast';
      else if (variant === 'info') func = 'showInfoToast';
      else if (variant === 'success') func = 'showSuccessToast';
      
      // Determina emoji e funzione in base al titolo
      if (title.includes('error') || title.includes('Error')) func = 'showErrorToast';
      else if (title.includes('delete') || title.includes('eliminat')) func = 'showDeleteToast';
      else if (title.includes('pet')) func = 'showPetToast';
      else if (title.includes('calendar') || title.includes('event')) func = 'showCalendarToast';
      else if (title.includes('diary')) func = 'showDiaryToast';
      else if (title.includes('music') || title.includes('audio')) func = 'showMusicToast';
      else if (title.includes('chat') || title.includes('message')) func = 'showChatToast';
      else if (title.includes('upload') || title.includes('file')) func = 'showUploadToast';
      else if (title.includes('analysis')) func = 'showAnalysisToast';
      
      return `${func}({ title: '${title}', description: '${description}' })`;
    }
  );

  // Sostituisci showToast({ con la funzione appropriata
  content = content.replace(
    /showToast\(\s*{\s*title:\s*['"](.*?)['"],?\s*description:\s*['"](.*?)['"],?\s*variant:\s*['"](.*?)['"][^}]*}\s*\)/g,
    (match, title, description, variant) => {
      let func = 'showSuccessToast';
      if (variant === 'destructive') func = 'showErrorToast';
      else if (variant === 'warning') func = 'showWarningToast';
      else if (variant === 'info') func = 'showInfoToast';
      else if (variant === 'success') func = 'showSuccessToast';
      
      // Determina emoji e funzione in base al titolo
      if (title.includes('error') || title.includes('Error')) func = 'showErrorToast';
      else if (title.includes('delete') || title.includes('eliminat')) func = 'showDeleteToast';
      else if (title.includes('pet')) func = 'showPetToast';
      else if (title.includes('calendar') || title.includes('event')) func = 'showCalendarToast';
      else if (title.includes('diary')) func = 'showDiaryToast';
      else if (title.includes('music') || title.includes('audio')) func = 'showMusicToast';
      else if (title.includes('chat') || title.includes('message')) func = 'showChatToast';
      else if (title.includes('upload') || title.includes('file')) func = 'showUploadToast';
      else if (title.includes('analysis')) func = 'showAnalysisToast';
      
      return `${func}({ title: '${title}', description: '${description}' })`;
    }
  );

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Aggiornato: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Nessun cambiamento necessario: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🚀 Inizio migrazione toast...\n');
  
  let updatedFiles = 0;
  
  for (const file of filesToUpdate) {
    if (updateFileToasts(file)) {
      updatedFiles++;
    }
  }
  
  console.log(`\n✨ Migrazione completata!`);
  console.log(`📊 File aggiornati: ${updatedFiles}/${filesToUpdate.length}`);
  console.log(`\n📝 Ricorda di:`);
  console.log(`   1. Controllare manualmente i toast più complessi`);
  console.log(`   2. Testare l'applicazione per verificare che tutti i toast funzionino`);
  console.log(`   3. Cercare eventuali toast rimasti nel codice con 'useToast' o 'showToast'`);
}

if (require.main === module) {
  main();
}

module.exports = { updateFileToasts, toastMappings };