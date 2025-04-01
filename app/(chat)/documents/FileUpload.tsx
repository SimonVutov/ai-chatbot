import React, { useState } from 'react';
import axios from 'axios';
import { formatFileSize } from './fileUtils';
import { Button } from '@/components/ui/button';

export default function FileUpload() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [message, setMessage] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false); // New state to track upload status

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(Array.from(e.target.files || []));
        setUploadProgress({});
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': '*/*'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 1)
                        );
                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: percentCompleted
                        }));
                    }
                }
            );
            console.log('Upload response:', response.data);
            return true;
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error.response || error);
            setMessage(`Error uploading ${file.name}: ${error.response?.data?.error || error.message}`);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setIsUploading(true); // Set uploading state to true

        let successCount = 0;
        for (const file of selectedFiles) {
            const success = await uploadFile(file);
            if (success) successCount++;
            setMessage(`Uploaded ${successCount}/${selectedFiles.length} files`); // Update message during upload
        }

        setMessage(`Successfully uploaded ${successCount} of ${selectedFiles.length} files`);
        setSelectedFiles([]);
        setIsUploading(false); // Reset uploading state after completion
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(files);
        setUploadProgress({});
    };

    return (
        <div className="space-y-4 p-4 rounded-lg">
            <div
                className="drop-zone p-4 rounded-lg text-center cursor-pointer bg-secondary hover:bg-primary/10 transition"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    id="file-input"
                />
                <label htmlFor="file-input" className="flex flex-col items-center">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600">Drag & drop files here or click to select</p>
                    <span className="text-sm text-gray-500">
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length} files selected`
                            : 'No files selected'}
                    </span>
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="selected-files mt-4">
                    <h4 className="font-semibold">Selected Files:</h4>
                    <div className="file-list space-y-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item flex justify-between items-center">
                                <span className="text-gray-800">{file.name}</span>
                                <span className="text-gray-600">({formatFileSize(file.size)})</span>
                                {uploadProgress[file.name] && (
                                    <div className="progress-bar w-1/2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="progress bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${uploadProgress[file.name]}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isUploading} // Disable button while uploading
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Upload {selectedFiles.length} Files
                    </Button>
                </div>
            )}

            {message && <p className="upload-message text-black">{message}</p>} {/* Changed text color to black */}
        </div>
    );
}