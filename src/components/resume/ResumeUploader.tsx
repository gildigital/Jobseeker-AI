'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';

interface ResumeUploaderProps {
  onUploadComplete: (data: any) => void;
}

export default function ResumeUploader({ onUploadComplete }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFile = e.target.files[0];
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload Progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('resume', file);
      
      // Send to API
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      setSuccess(true);
      
      // Call the callback with the parsed resume data
      onUploadComplete(data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to upload resume');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        {!file ? (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium pixel-text">Upload your resume</h3>
              <p className="text-sm mt-1 pixel-text">
                Drag and drop your resume file, or click to browse
              </p>
              <p className="text-xs mt-1 pixel-text">
                Supports PDF, DOC, DOCX, and TXT (Max 5MB)
              </p>
            </div>
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />
            <label htmlFor="resume-upload">
              <div className="pixel-btn mt-2 cursor-pointer">Browse Files</div>
            </label>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium pixel-text">{file.name}</h3>
              <p className="text-sm mt-1 pixel-text">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            {isUploading && (
              <div className="w-full mt-4">
                <div className="pixel-progress">
                  <div className="pixel-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-center mt-1 pixel-text">Uploading... {uploadProgress}%</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center text-red-500 mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm pixel-text">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center text-green-500 mt-2">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm pixel-text">Resume uploaded successfully!</span>
              </div>
            )}
            
            <div className="flex space-x-4 mt-4">
              <div 
                className={`pixel-btn pixel-btn-secondary ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!isUploading) {
                    setFile(null);
                    setError(null);
                    setSuccess(false);
                  }
                }}
              >
                Change File
              </div>
              <div 
                className={`pixel-btn ${(isUploading || success) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!isUploading && !success) {
                    handleUpload();
                  }
                }}
              >
                {isUploading ? 'Uploading...' : success ? 'Uploaded' : 'Upload Resume'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
