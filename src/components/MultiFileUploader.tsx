import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded: boolean;
  progress: number;
}

interface MultiFileUploaderProps {
  bucketName: string;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  onFilesChanged?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
}

export const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({
  bucketName,
  maxFiles = 10,
  maxSizePerFile = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  onFilesChanged,
  initialFiles = []
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File troppo grande. Massimo ${maxSizePerFile}MB`;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isAccepted) {
      return 'Tipo di file non supportato';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${bucketName}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Troppi file",
        description: `Massimo ${maxFiles} file consentiti`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    const uploadPromises = newFiles.map(async (file) => {
      const fileId = Math.random().toString(36);
      const validation = validateFile(file);
      
      if (validation) {
        toast({
          title: "File non valido",
          description: `${file.name}: ${validation}`,
          variant: "destructive"
        });
        return null;
      }

      // Add file to state immediately with 0 progress
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        uploaded: false,
        progress: 0
      };

      setFiles(prev => [...prev, newFile]);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        const url = await uploadFile(file);
        
        clearInterval(progressInterval);
        
        // Update file with final URL and complete status
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, url, uploaded: true, progress: 100 } : f
        ));

        return { ...newFile, url, uploaded: true, progress: 100 };
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Errore upload",
          description: `Impossibile caricare ${file.name}`,
          variant: "destructive"
        });
        
        // Remove failed file
        setFiles(prev => prev.filter(f => f.id !== fileId));
        return null;
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
  }, [files.length, maxFiles, bucketName]);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChanged?.(updatedFiles);
  };

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const viewFile = (file: UploadedFile) => {
    window.open(file.url, '_blank');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update parent when files change
  React.useEffect(() => {
    onFilesChanged?.(files);
  }, [files, onFilesChanged]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Trascina i file qui o clicca per selezionare
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || files.length >= maxFiles}
        >
          Seleziona File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Massimo {maxFiles} file, {maxSizePerFile}MB ciascuno
        </p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">File caricati ({files.length})</h4>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-background"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                {!file.uploaded && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
              </div>
              <div className="flex gap-1">
                {file.uploaded && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewFile(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  disabled={!file.uploaded && file.progress > 0}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Caricamento file in corso...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};