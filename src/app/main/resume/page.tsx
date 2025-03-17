'use client';
import { useState } from 'react';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumePreview from '@/components/resume/ResumePreview';
import { ParsedResume } from '@/lib/resume/parser';
import { Card } from '@/components/ui/Card';
import '@/app/8bit.css';

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  
  const handleUploadComplete = (data: any) => {
    if (data.parsedData) {
      setResumeData(data.parsedData);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center pixel-text">Resume Scanner</h1>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <div className="pixel-card">
          <ResumeUploader onUploadComplete={handleUploadComplete} />
        </div>
        
        {resumeData ? (
          <div className="pixel-card">
            <ResumePreview resumeData={resumeData} />
          </div>
        ) : (
          <div className="pixel-card">
            <p className="text-center text-gray-500 pixel-text">Upload your resume to see the parsed information</p>
          </div>
        )}
      </div>
    </div>
  );
}
