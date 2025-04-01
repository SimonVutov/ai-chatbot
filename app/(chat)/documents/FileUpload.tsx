'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from './fileUtils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            setUploadProgress(100);
            setTimeout(() => {
              setSelectedFile(null);
              setUploadProgress(0);
              setIsUploading(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }, 1000);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
            setIsUploading(false);
            setUploadProgress(0);
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
          setIsUploading(false);
          setUploadProgress(0);
        });
        
        xhr.open('POST', `${API_BASE_URL}/api/upload`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
      />
      
      {selectedFile ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          
          {uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleChooseFileClick}
              disabled={isUploading}
              className="flex-1"
            >
              Change File
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M9 12a1 1 0 112 0v3a1 1 0 11-2 0v-3z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-gray-500">Drag and drop a file here or</p>
          <Button onClick={handleChooseFileClick}>Choose File</Button>
        </div>
      )}
    </div>
  );
} 