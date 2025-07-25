import React, { useState } from 'react';
import { Upload, X, FileText, Image, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DocumentUploaderProps {
  onUpload: (urls: string[]) => void;
  existingFiles?: string[];
  maxFiles?: number;
  acceptedTypes?: string;
  bucketName?: string; // Nuovo parametro per specificare il bucket
}

interface FilePreview {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  existingFiles = [],
  maxFiles = 5,
  acceptedTypes = "image/*,application/pdf,.doc,.docx",
  bucketName = "medical-documents" // Default bucket
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<FilePreview[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<FilePreview | null>(null);
  const { toast } = useToast();

  // Initialize preview files with existing files
  React.useEffect(() => {
    if (existingFiles.length > 0) {
      const initialPreviews = existingFiles.map((url, index) => {
        // Extract filename from URL or generate one
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1] || `Documento ${index + 1}`;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        let fileType = 'application/pdf'; // default
        if (fileExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
          fileType = 'image/jpeg';
        }
        
        return {
          url,
          name: fileName,
          type: fileType,
          size: 0
        };
      });
      setPreviewFiles(initialPreviews);
    } else {
      setPreviewFiles([]);
    }
  }, [existingFiles]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + existingFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Troppi file",
        description: `Puoi caricare massimo ${maxFiles} file`
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Get the current user ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL valido per 7 giorni

        if (urlError || !signedUrlData?.signedUrl) {
          throw new Error('Errore nella generazione dell\'URL del file');
        }

        const fileUrl = signedUrlData.signedUrl;

        uploadedUrls.push(fileUrl);
        
        // Aggiungi alla preview
        setPreviewFiles(prev => [...prev, {
          url: fileUrl,
          name: file.name,
          type: file.type,
          size: file.size
        }]);
      }

      onUpload([...existingFiles, ...uploadedUrls]);
      
      toast({
        title: "Successo",
        description: `${files.length} file caricati con successo`
      });
    } catch (error) {
      console.error('Errore upload:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il caricamento dei file"
      });
    } finally {
      setUploading(false);
    }
  };

  const confirmRemoveFile = () => {
    if (fileToDelete) {
      const updatedFiles = existingFiles.filter(url => url !== fileToDelete);
      setPreviewFiles(prev => prev.filter(file => file.url !== fileToDelete));
      onUpload(updatedFiles);
      setFileToDelete(null);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPDF = (type: string) => type === 'application/pdf';

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Trascina i file qui o clicca per selezionare
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Formati supportati: PDF, DOC, DOCX, immagini (max {maxFiles} file)
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {uploading ? 'Caricamento...' : 'Seleziona file'}
        </Button>
      </div>

      {/* File Preview */}
      {previewFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">File caricati:</h4>
          <div className="grid grid-cols-1 gap-2">
            {previewFiles.map((preview, index) => (
              <Card key={preview.url} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                     {isImage(preview.type) ? (
                      <div 
                        className="relative cursor-pointer group" 
                        onClick={() => setViewingFile(preview)}
                      >
                        <img 
                          src={preview.url} 
                          alt={preview.name}
                          className="w-24 h-24 object-cover rounded-lg border-2 hover:border-primary transition-all group-hover:shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const icon = target.nextElementSibling as HTMLElement;
                            if (icon) icon.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border-2">
                          {getFileIcon(preview.type)}
                        </div>
                      </div>
                    ) : isPDF(preview.type) ? (
                      <div 
                        className="relative cursor-pointer group" 
                        onClick={() => setViewingFile(preview)}
                      >
                        <div className="w-24 h-24 border-2 rounded-lg flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all group-hover:shadow-lg">
                          <FileText className="h-8 w-8 text-red-600 mb-1" />
                          <span className="text-xs text-red-600 font-semibold">PDF</span>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border-2 cursor-pointer hover:border-primary transition-all group relative"
                        onClick={() => setViewingFile(preview)}
                      >
                        {getFileIcon(preview.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{preview.name}</p>
                      {preview.size > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(preview.size)}
                        </p>
                      )}
                    </div>
                  </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(preview.url, preview.name)}
                        title="Scarica file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFileToDelete(preview.url)}
                        title="Elimina file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo documento? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoveFile}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Viewing Dialog */}
      <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewingFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {viewingFile && isImage(viewingFile.type) ? (
              <img 
                src={viewingFile.url} 
                alt={viewingFile.name}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : viewingFile && isPDF(viewingFile.type) ? (
              <iframe 
                src={viewingFile.url}
                className="w-full h-[70vh] border-0"
                title={viewingFile.name}
              />
            ) : viewingFile ? (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">{viewingFile.name}</p>
                <Button 
                  onClick={() => downloadFile(viewingFile.url, viewingFile.name)}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Scarica file
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};