import { useTranslation } from '@/hooks/useTranslation';

// Traduzioni hardcoded per i titoli
const titleTranslations = {
  it: {
    "Socializzazione Progressiva": "Socializzazione Progressiva",
    "Controllo Aggressività Reattiva": "Controllo Aggressività Reattiva", 
    "Gestione Ansia da Separazione": "Gestione Ansia da Separazione",
    "Rieducazione Alimentare Comportamentale": "Rieducazione Alimentare Comportamentale",
    "Ottimizzazione Ciclo Sonno-Veglia": "Ottimizzazione Ciclo Sonno-Veglia",
    "Superare Fobie e Paure Specifiche": "Superare Fobie e Paure Specifiche",
    "Stop Comportamenti Distruttivi": "Stop Comportamenti Distruttivi",
    "Gestione Gelosia e Possessività": "Gestione Gelosia e Possessività",
    "Riattivazione Energia e Motivazione": "Riattivazione Energia e Motivazione",
    "Gestione Iperattività e Deficit Attenzione": "Gestione Iperattività e Deficit Attenzione",
    "Creazione Safe Space Personale": "Creazione Safe Space Personale"
  },
  en: {
    "Socializzazione Progressiva": "Progressive Socialization",
    "Controllo Aggressività Reattiva": "Reactive Aggression Control", 
    "Gestione Ansia da Separazione": "Separation Anxiety Management",
    "Rieducazione Alimentare Comportamentale": "Behavioral Food Re-education",
    "Ottimizzazione Ciclo Sonno-Veglia": "Sleep-Wake Cycle Optimization",
    "Superare Fobie e Paure Specifiche": "Overcoming Specific Phobias and Fears",
    "Stop Comportamenti Distruttivi": "Stop Destructive Behaviors",
    "Gestione Gelosia e Possessività": "Jealousy and Possessiveness Management",
    "Riattivazione Energia e Motivazione": "Energy and Motivation Reactivation",
    "Gestione Iperattività e Deficit Attenzione": "Hyperactivity and Attention Deficit Management",
    "Creazione Safe Space Personale": "Personal Safe Space Creation"
  },
  es: {
    "Socializzazione Progressiva": "Socialización Progresiva",
    "Controllo Aggressività Reattiva": "Control de Agresividad Reactiva", 
    "Gestione Ansia da Separazione": "Gestión de Ansiedad por Separación",
    "Rieducazione Alimentare Comportamentale": "Reeducación Alimentaria Comportamental",
    "Ottimizzazione Ciclo Sonno-Veglia": "Optimización del Ciclo Sueño-Vigilia",
    "Superare Fobie e Paure Specifiche": "Superar Fobias y Miedos Específicos",
    "Stop Comportamenti Distruttivi": "Detener Comportamientos Destructivos",
    "Gestione Gelosia e Possessività": "Gestión de Celos y Posesividad",
    "Riattivazione Energia e Motivazione": "Reactivación de Energía y Motivación",
    "Gestione Iperattività e Deficit Attenzione": "Gestión de Hiperactividad y Déficit de Atención",
    "Creazione Safe Space Personale": "Creación de Espacio Seguro Personal"
  }
};

// Traduzioni hardcoded per le descrizioni
const descriptionTranslations = {
  it: {
    "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.": "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.",
    "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.": "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.",
    "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.": "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.",
    "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.": "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.",
    "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.": "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.",
    "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.": "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.",
    "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.": "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.",
    "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.": "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.",
    "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.": "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.",
    "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.": "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.",
    "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali": "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali"
  },
  en: {
    "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.": "5-day protocol to improve the animal's social skills with other animals and people. Gradual and positive approach for shy or poorly socialized animals, with focus on confidence building and controlled interactions.",
    "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.": "Advanced protocol for safe management of reactive aggression. Absolute priority on safety, impulse control and development of alternative behaviors. Requires professional supervision.",
    "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.": "Scientific protocol to reduce separation anxiety through gradual desensitization. Develops independence and tranquility during owner absences with ultra-gradual approach.",
    "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.": "Intermediate protocol to resolve behavioral disorders related to feeding. Addresses compulsive eating, food refusal, food guarding and food anxiety through a gradual and non-punitive approach.",
    "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.": "Specialized protocol to establish healthy sleep patterns, reduce insomnia and night awakenings. Through pre-sleep routines, environmental optimization and circadian regulation, helps animals develop natural and restorative rest habits.",
    "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.": "Advanced systematic desensitization program to overcome intense phobias of noises, objects and specific situations through gradual scientific techniques.",
    "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.": "Intensive protocol to eliminate destructive chewing, excessive digging and destruction of household objects.",
    "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.": "Specialized protocol to reduce possessive behaviors and jealousy in pets. Includes advanced desensitization techniques, sharing training and resource management.",
    "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.": "Gradual protocol to combat depression, apathy and loss of interest in animals. Gentle and progressive approach to awaken motivation through sensory stimuli, physical activation and restoration of social interest.",
     "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.": "Complete protocol to reduce hyperactivity and improve concentration through a progressive approach: from constructive energy discharge to impulse control, up to relaxation and self-control.",
     "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali": "Advanced systematic desensitization program to overcome intense phobias of noises, objects and specific situations through gradual scientific techniques"
  },
  es: {
    "Protocollo di 5 giorni per migliorare le competenze sociali dell'animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.": "Protocolo de 5 días para mejorar las habilidades sociales del animal con otros animales y personas. Enfoque gradual y positivo para animales tímidos o poco socializados, con enfoque en construcción de confianza e interacciones controladas.",
    "Protocollo avanzato per la gestione sicura dell'aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.": "Protocolo avanzado para el manejo seguro de la agresividad reactiva. Prioridad absoluta en la seguridad, control de impulsos y desarrollo de comportamientos alternativos. Requiere supervisión profesional.",
    "Protocollo scientifico per ridurre l'ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.": "Protocolo científico para reducir la ansiedad por separación a través de desensibilización gradual. Desarrolla independencia y tranquilidad durante las ausencias del propietario con enfoque ultra-gradual.",
    "Protocollo intermedio per risolvere disturbi comportamentali legati all'alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.": "Protocolo intermedio para resolver trastornos comportamentales relacionados con la alimentación. Aborda alimentación compulsiva, rechazo de comida, guardia de alimentos y ansiedad alimentaria a través de un enfoque gradual y no punitivo.",
    "Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.": "Protocolo especializado para establecer patrones de sueño saludables, reducir insomnio y despertares nocturnos. A través de rutinas pre-sueño, optimización ambiental y regulación circadiana, ayuda a los animales a desarrollar hábitos de descanso naturales y reparadores.",
    "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.": "Programa avanzado de desensibilización sistemática para superar fobias intensas de ruidos, objetos y situaciones específicas a través de técnicas científicas graduales.",
    "Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.": "Protocolo intensivo para eliminar masticación destructiva, excavación excesiva y destrucción de objetos domésticos.",
    "Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.": "Protocolo especializado para reducir comportamientos posesivos y celos en mascotas. Incluye técnicas avanzadas de desensibilización, entrenamiento de compartir y gestión de recursos.",
    "Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell'interesse sociale.": "Protocolo gradual para combatir depresión, apatía y pérdida de interés en animales. Enfoque suave y progresivo para despertar la motivación a través de estímulos sensoriales, activación física y restauración del interés social.",
     "Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.": "Protocolo completo para reducir hiperactividad y mejorar concentración a través de un enfoque progresivo: desde descarga de energía constructiva al control de impulsos, hasta relajación y autocontrol.",
     "Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali": "Programa avanzado de desensibilización sistemática para superar fobias intensas de ruidos, objetos y situaciones específicas a través de técnicas científicas graduales"
  }
};

export const useProtocolTranslations = () => {
  const { language } = useTranslation();
  
  console.log('🔄 useProtocolTranslations initialized with language:', language);

  const translateProtocolTitle = (title: string): string => {
    console.log('🔤 translateProtocolTitle called:', { title, language, titleLength: title.length });
    console.log('🔤 Title characters:', title.split('').map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`));
    
    const lang = language as 'it' | 'en' | 'es';
    const translation = titleTranslations[lang]?.[title] || title;
    
    console.log('✅ Title translation result:', { title, language: lang, translation, foundMatch: title !== translation });
    console.log('🗂️ Available keys for', lang, ':', Object.keys(titleTranslations[lang] || {}));
    return translation;
  };

  const translateProtocolDescription = (description: string, title?: string): string => {
    console.log('📝 translateProtocolDescription called:', { description: description.substring(0, 50) + '...', title, language });
    
    const lang = language as 'it' | 'en' | 'es';
    const translation = descriptionTranslations[lang]?.[description] || description;
    
    console.log('✅ Description translation result:', { 
      descriptionStart: description.substring(0, 30) + '...', 
      language: lang, 
      translationStart: translation.substring(0, 30) + '...',
      wasTranslated: translation !== description
    });
    
    return translation;
  };

  return {
    translateProtocolTitle,
    translateProtocolDescription
  };
};