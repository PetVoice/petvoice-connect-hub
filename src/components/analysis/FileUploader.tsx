import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileAudio, 
  FileVideo, 
  X, 
  AlertCircle,
  CheckCircle2,
  File,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  autoAnalyzeAudio?: boolean; // Nuovo prop per auto-analisi audio
}

interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  error?: string;
}

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'
];

const ACCEPTED_VIDEO_TYPES = [
  'video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm'
];

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
];

const DEFAULT_ACCEPTED_TYPES = [...ACCEPTED_AUDIO_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_IMAGE_TYPES];

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSizePerFile = 100, // 100MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  autoAnalyzeAudio = false // Default false per retrocompatibilità
}) => {
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo file non supportato: ${file.type}`;
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizePerFile) {
      return `File troppo grande: ${sizeInMB.toFixed(1)}MB (max ${maxSizePerFile}MB)`;
    }

    return null;
  }, [acceptedTypes, maxSizePerFile]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (selectedFiles.length + fileArray.length > maxFiles) {
      alert(`Massimo ${maxFiles} file consentiti`);
      return;
    }

    const newFiles: FileWithPreview[] = fileArray.map(file => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const error = validateFile(file);
      
      let preview: string | undefined;
      if (file.type.startsWith('audio/')) {
        preview = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        preview = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      return {
        file,
        id,
        preview,
        error: error || undefined
      };
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles.length, maxFiles, validateFile]);

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Cleanup object URLs
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleStartAnalysis = useCallback(async () => {
    const validFiles = selectedFiles.filter(f => !f.error);
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    
    // Create FileList-like object
    const dt = new DataTransfer();
    validFiles.forEach(f => dt.items.add(f.file));
    
    try {
      await onFilesSelected(dt.files);
      // Clear files after successful upload
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, onFilesSelected]);

  // Auto-analyze audio files when autoAnalyzeAudio is true, and auto-analyze images and videos always
  useEffect(() => {
    if (selectedFiles.length > 0 && !isProcessing) {
      const audioFiles = selectedFiles.filter(f => 
        f.file.type.startsWith('audio/') && !f.error
      );
      const imageFiles = selectedFiles.filter(f => 
        f.file.type.startsWith('image/') && !f.error
      );
      const videoFiles = selectedFiles.filter(f => 
        f.file.type.startsWith('video/') && !f.error
      );
      
      // Auto-analyze audio files if autoAnalyzeAudio is true
      // Auto-analyze image files always
      // Auto-analyze video files always
      if ((autoAnalyzeAudio && audioFiles.length > 0) || imageFiles.length > 0 || videoFiles.length > 0) {
        // Delay per permettere il rendering
        const timer = setTimeout(() => {
          handleStartAnalysis();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoAnalyzeAudio, selectedFiles, isProcessing, handleStartAnalysis]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 text-coral" />;
    } else if (fileType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-teal" />;
    } else if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-primary" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validFiles = selectedFiles.filter(f => !f.error);
  const hasErrors = selectedFiles.some(f => f.error);
  const hasAudioFiles = selectedFiles.some(f => f.file.type.startsWith('audio/') && !f.error);
  const hasImageFiles = selectedFiles.some(f => f.file.type.startsWith('image/') && !f.error);
  const hasVideoFiles = selectedFiles.some(f => f.file.type.startsWith('video/') && !f.error);
  const shouldHideAnalysisButton = (autoAnalyzeAudio && hasAudioFiles) || hasImageFiles || hasVideoFiles;

  return (
    <Card className="h-full bg-gradient-to-br from-coral/5 to-coral/10 border border-coral/20 shadow-soft hover:shadow-glow transition-all duration-200 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-coral" />
          Carica File Multimediali
        </CardTitle>
        <CardDescription>
          Carica direttamente dalla memoria (max {maxSizePerFile}MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragActive ? "border-coral bg-coral/5" : "border-muted-foreground/25 hover:border-coral/50",
            isProcessing && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className={cn(
            "h-12 w-12 mx-auto mb-4 transition-colors",
            dragActive ? "text-coral" : "text-muted-foreground"
          )} />
          <p className="text-lg font-medium mb-2">
            {dragActive ? 'Rilascia i file qui' : 'Carica i tuoi file'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Formati supportati: Audio (MP3, WAV), Video (MP4, MOV), Immagini (JPG, PNG)
          </p>
          <Button variant="outline" type="button" disabled={isProcessing}>
            Seleziona File
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={isProcessing}
          />
        </div>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">File Selezionati ({selectedFiles.length})</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedFiles.forEach(f => {
                    if (f.preview) URL.revokeObjectURL(f.preview);
                  });
                  setSelectedFiles([]);
                }}
              >
                Cancella Tutti
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {selectedFiles.map((fileWithPreview) => (
                <div
                  key={fileWithPreview.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg",
                    fileWithPreview.error ? "border-destructive bg-destructive/5" : "border-border"
                  )}
                >
                  {getFileIcon(fileWithPreview.file.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileWithPreview.file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(fileWithPreview.file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {fileWithPreview.file.type.split('/')[1].toUpperCase()}
                      </Badge>
                    </div>
                    {fileWithPreview.error && (
                      <p className="text-xs text-destructive mt-1">
                        {fileWithPreview.error}
                      </p>
                    )}
                  </div>

                  {fileWithPreview.error ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileWithPreview.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {validFiles.length > 0 && !shouldHideAnalysisButton && (
              <Button 
                onClick={handleStartAnalysis}
                disabled={isProcessing || hasErrors}
                className="w-full bg-coral hover:bg-coral/90 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    Inizia Analisi ({validFiles.length} file)
                  </>
                )}
              </Button>
            )}

            {shouldHideAnalysisButton && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    ✨ File {hasVideoFiles ? 'video' : hasImageFiles ? 'multimediale' : 'audio'} caricato
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  🚀 Avvio analisi automatica in corso...
                </p>
              </div>
            )}

            {hasErrors && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4" />
                Alcuni file hanno errori. Correggi i problemi per procedere.
              </div>
            )}
          </div>
        )}

        {/* Analysis Description */}
        <div className="bg-coral/5 p-4 rounded-lg border border-coral/20">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-coral mb-2">📊 Analisi Multimediale Avanzata con IA</h4>
              <p className="text-sm text-muted-foreground mb-3">
                La nostra IA analizza i file per rilevare emozioni e comportamenti attraverso:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>🎵 Vocalizzazioni e tono</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📸 Postura e espressioni</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏃 Linguaggio corporeo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🧠 Emozioni</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⏱️ Tempo medio: 15-30 secondi per file • 🎯 Accuratezza: 85-95% • 🔬 Emozioni rilevate: Felice, Ansioso, Calmo, Triste, Aggressivo, Eccitato, Giocoso
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;