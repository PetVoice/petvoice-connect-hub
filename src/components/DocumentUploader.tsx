import React, { useState } from 'react';
import { Upload, X, FileText, Image, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

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
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${supabase.auth.getUser().then(u => u.data.user?.id)}/${fileName}`;

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
      {(existingFiles.length > 0 || previewFiles.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">File caricati:</h4>
          <div className="grid grid-cols-1 gap-2">
            {existingFiles.map((url, index) => {
              const preview = previewFiles.find(f => f.url === url);
              const fileName = preview?.name || `Documento ${index + 1}`;
              const fileType = preview?.type || 'application/pdf';
              const fileSize = preview?.size;
              
              return (
                <Card key={url} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(fileType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName}</p>
                        {fileSize && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileSize)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isImage(fileType) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImage(url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Anteprima immagine</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Anteprima documento" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};