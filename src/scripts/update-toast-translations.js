// Script per aggiornare automaticamente tutti i toast con il sistema di traduzioni
// Questo script potrebbe essere eseguito manualmente per aggiornare i file rimanenti

const filesToUpdate = [
  'src/components/AddPetDialog.tsx',
  'src/components/accessibility/SupportComponents.tsx',
  'src/components/admin/DataIntegrityDashboard.tsx',
  'src/components/ai-features/AIMusicTherapy.tsx',
  'src/components/ai-features/PetMatchingIntelligence.tsx',
  'src/components/analysis/AnalysisResults.tsx',
  'src/components/analysis/AudioPlayer.tsx',
  'src/components/community/Chat.tsx',
  'src/components/community/MessageInput.tsx',
  'src/components/private-chat/PrivateChat.tsx',
  'src/components/private-chat/PrivateChatWithReply.tsx',
  'src/components/settings/DeleteAccountSection.tsx',
  'src/components/settings/EmailManagement.tsx',
  'src/components/settings/ProfileAvatar.tsx',
  'src/components/settings/ProfileEditForm.tsx'
];

// Pattern comuni di toast da sostituire
const replacements = [
  // Import statement
  {
    from: "import { useToast } from '@/hooks/use-toast';",
    to: "import { useTranslatedToast } from '@/hooks/use-translated-toast';"
  },
  {
    from: "import { toast } from '@/hooks/use-toast';",
    to: "import { useTranslatedToast } from '@/hooks/use-translated-toast';"
  },
  // Hook usage
  {
    from: "const { toast } = useToast();",
    to: "const { showToast } = useTranslatedToast();"
  },
  // Toast calls - basic pattern
  {
    from: /toast\(\{[\s\S]*?\}\);/g,
    to: (match) => {
      return match.replace('toast(', 'showToast(');
    }
  }
];

console.log('Files that need toast translation updates:');
filesToUpdate.forEach(file => console.log(`- ${file}`));
console.log('\nPlease update these files manually using the useTranslatedToast hook.');
console.log('Replace:');
console.log('1. Import: useToast → useTranslatedToast');
console.log('2. Hook: { toast } = useToast() → { showToast } = useTranslatedToast()');
console.log('3. Calls: toast({ ... }) → showToast({ ... })');
console.log('4. Add variables parameter for dynamic text like { variables: { channelName } }');