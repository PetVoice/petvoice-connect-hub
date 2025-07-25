import React, { useState } from 'react';
import { Upload, X, FileText, Image, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DocumentUploaderProps {
  onUpload: (urls: string[]) => void;
  existingFiles?: string[];
  maxFiles?: number;
  acceptedTypes?: string;
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
  acceptedTypes = "image/*,application/pdf,.doc,.docx"
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<FilePreview[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; type: string } | null>(null);
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
          .from('medical-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        
        // Aggiungi alla preview
        setPreviewFiles(prev => [...prev, {
          url: publicUrl,
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

  const removeFile = (urlToRemove: string) => {
    const updatedFiles = existingFiles.filter(url => url !== urlToRemove);
    setPreviewFiles(prev => prev.filter(file => file.url !== urlToRemove));
    onUpload(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {isImage(preview.type) ? (
                      <div 
                        className="relative cursor-pointer" 
                        onClick={() => setSelectedDocument({ url: preview.url, type: preview.type })}
                      >
                        <img 
                          src={preview.url} 
                          alt={preview.name}
                          className="w-12 h-12 object-cover rounded border hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const icon = target.nextElementSibling as HTMLElement;
                            if (icon) icon.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }}>
                          {getFileIcon(preview.type)}
                        </div>
                      </div>
                    ) : isPDF(preview.type) ? (
                      <div 
                        className="relative cursor-pointer" 
                        onClick={() => setSelectedDocument({ url: preview.url, type: preview.type })}
                      >
                        <div className="w-12 h-12 border rounded flex items-center justify-center bg-red-50 hover:opacity-80 transition-opacity">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-12 h-12 flex items-center justify-center bg-muted rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedDocument({ url: preview.url, type: preview.type })}
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
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument({ url: preview.url, type: preview.type })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(preview.url)}
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

      {/* Document Preview Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Anteprima documento
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(selectedDocument?.url, '_blank')}
              >
                Apri in nuova scheda
              </Button>
            </DialogTitle>
            <DialogDescription>
              Visualizza l'anteprima del documento caricato
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="flex justify-center">
              {isImage(selectedDocument.type) ? (
                <img 
                  src={selectedDocument.url} 
                  alt="Anteprima documento" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Errore caricamento immagine:', selectedDocument.url);
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              ) : isPDF(selectedDocument.type) ? (
                <div className="w-full h-[70vh]">
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-full border rounded-lg"
                    title="Anteprima PDF"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p>Anteprima non disponibile per questo tipo di file</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => window.open(selectedDocument.url, '_blank')}
                    >
                      Apri file
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};