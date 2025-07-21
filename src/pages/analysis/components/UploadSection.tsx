import React from 'react';
import { Upload, Mic, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploader from '@/components/analysis/FileUploader';
import AudioRecorder from '@/components/analysis/AudioRecorder';
import TextAnalysis from '@/components/analysis/TextAnalysis';
import VoiceAnalysis from '@/components/analysis/VoiceAnalysis';
import ProcessingAnimation from '@/components/analysis/ProcessingAnimation';

interface UploadSectionProps {
  onFileUpload: (files: FileList) => void;
  onRecordingComplete: (audioBlob: Blob) => void;
  onStartRecording: () => void;
  processing: {
    isProcessing: boolean;
    progress: number;
    stage: string;
    currentFile?: string;
  };
  onDataRefresh: () => void;
}

const UploadGuide: React.FC = () => (
  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-xl border border-primary/10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
      {/* Cosa Descrivere */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Lightbulb className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">Cosa Descrivere</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-amber-600 font-bold mt-1 text-lg">•</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">Comportamento specifico osservato</span>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-amber-600 font-bold mt-1 text-lg">•</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">Contesto e situazione</span>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-amber-600 font-bold mt-1 text-lg">•</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">Cambiamenti rispetto al solito</span>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-amber-600 font-bold mt-1 text-lg">•</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">Postura e segnali del corpo</span>
          </div>
        </div>
      </div>

      {/* Come Scegliere il Metodo Giusto */}
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Upload className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold">Come Scegliere il Metodo Giusto?</h3>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
            <Upload className="h-10 w-10 text-blue-500 mx-auto mb-4" />
            <p className="font-bold text-lg mb-3">Upload File</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Hai già registrazioni o video del tuo pet</p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
            <Mic className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <p className="font-bold text-lg mb-3">Registra Ora</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Vuoi catturare l'emozione in tempo reale</p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
            <FileText className="h-10 w-10 text-purple-500 mx-auto mb-4" />
            <p className="font-bold text-lg mb-3">Descrivi Testo</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Preferisci descrivere il comportamento</p>
          </div>
        </div>
      </div>

      {/* Terza colonna per futuro contenuto */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold">Suggerimenti</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">🎤 Per Audio</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">Registra in ambiente silenzioso, vicino al pet</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">📱 Per Video</h4>
            <p className="text-sm text-green-700 dark:text-green-300">Inquadra bene il comportamento, luce sufficiente</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">✍️ Per Testo</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">Descrivi dettagliatamente il comportamento</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  onRecordingComplete,
  onStartRecording,
  processing,
  onDataRefresh
}) => {
  return (
    <div className="space-y-8">
      {processing.isProcessing && (
        <ProcessingAnimation
          progress={processing.progress}
          stage={processing.stage}
          currentFile={processing.currentFile}
        />
      )}

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Scegli il Tipo di Analisi Emotiva
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Scopri le emozioni del tuo pet attraverso diversi metodi di analisi. 
          Ogni opzione offre insights unici per comprendere meglio il benessere del tuo pet.
        </p>
      </div>

      {/* Analysis Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Upload File Audio/Video</h3>
          </div>
          <FileUploader 
            onFilesSelected={onFileUpload} 
            autoAnalyzeAudio={true}
          />
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">📁 Formati Supportati</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• <strong>Audio:</strong> MP3, WAV, M4A, WEBM</p>
              <p>• <strong>Video:</strong> MP4, MOV, AVI, WEBM</p>
              <p>• <strong>Dimensione max:</strong> 50MB per file</p>
            </div>
          </div>
        </div>
        
        {/* Audio Recorder */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Registrazione Diretta</h3>
          </div>
          <AudioRecorder 
            onRecordingComplete={onRecordingComplete} 
            onStartRecording={() => { onStartRecording(); return true; }}
            autoAnalyze={true}
          />
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">🎤 Suggerimenti per la Registrazione</h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <p>• Registra in un ambiente silenzioso</p>
              <p>• Posizionati vicino al tuo pet</p>
              <p>• Durata consigliata: 10-60 secondi</p>
            </div>
          </div>
        </div>
        
        {/* Text Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Analisi Comportamentale Testuale</h3>
          </div>
          <TextAnalysis onAnalysisComplete={onDataRefresh} />
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">✍️ Cosa Descrivere</h4>
            <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <p>• Comportamento specifico osservato</p>
              <p>• Contesto e situazione</p>
              <p>• Cambiamenti rispetto al solito</p>
              <p>• Postura e segnali del corpo</p>
            </div>
          </div>
        </div>
        
        {/* Voice Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Upload className="h-5 w-5 text-red-500" />
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Analisi Emotiva Combinata</h3>
          </div>
          <VoiceAnalysis onAnalysisComplete={onDataRefresh} />
          <div className="bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">🔄 Doppia Analisi AI</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>• <strong>Pet:</strong> Emozione rilevata dalle tue descrizioni</p>
              <p>• <strong>Tu:</strong> Emozione rilevata dal tuo tono di voce</p>
              <p>• <strong>Risultato:</strong> Consigli personalizzati per entrambi</p>
            </div>
          </div>
        </div>
      </div>

      <UploadGuide />
    </div>
  );
};