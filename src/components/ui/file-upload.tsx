import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Trash2, Eye } from 'lucide-react';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  onFileRemoved: () => void;
  existingFileUrl?: string;
  existingFileName?: string;
  bucketName: string;
  folderName: string;
  acceptedTypes?: string;
  maxSizeInMB?: number;
  label?: string;
  placeholder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  existingFileUrl,
  existingFileName,
  bucketName,
  folderName,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSizeInMB = 10,
  label = 'Carica File',
  placeholder = 'Seleziona un file...'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showSuccessToast, showErrorToast } = useUnifiedToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validazione dimensione file
    if (file.size > maxSizeInMB * 1024 * 1024) {
      showErrorToast({
        title: 'File troppo grande',
        description: `Il file non può superare ${maxSizeInMB}MB`
      });
      return;
    }

    // Validazione tipo file
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      showErrorToast({
        title: 'Tipo file non supportato',
        description: `Tipi accettati: ${acceptedTypes}`
      });
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // Genera nome file unico
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${user.id}/${folderName}/${fileName}`;

      // Simula progresso upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      // Ottieni URL pubblico del file
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      onFileUploaded(publicUrl, file.name);
      
      showSuccessToast({
        title: 'Upload completato',
        description: 'File caricato con successo'
      });

    } catch (error: any) {
      console.error('Errore upload:', error);
      showErrorToast({
        title: 'Errore upload',
        description: error.message || 'Si è verificato un errore durante il caricamento'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async () => {
    if (existingFileUrl) {
      try {
        // Estrai il path del file dall'URL
        const urlParts = existingFileUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === bucketName);
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (error) {
            console.error('Errore rimozione file:', error);
          }
        }
      } catch (error) {
        console.error('Errore durante la rimozione:', error);
      }
    }
    
    onFileRemoved();
    showSuccessToast({
      title: 'File rimosso',
      description: 'File rimosso con successo'
    });
  };

  const handleViewFile = () => {
    if (existingFileUrl) {
      window.open(existingFileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {existingFileUrl ? (
        <Card className="border-2 border-dashed border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {existingFileName || 'File caricato'}
                  </p>
                  <p className="text-sm text-green-600">
                    File presente
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleViewFile}
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div 
              onClick={handleFileSelect}
              className="text-center space-y-3"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {placeholder}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {acceptedTypes} - Max {maxSizeInMB}MB
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                Seleziona File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Caricamento in corso...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};