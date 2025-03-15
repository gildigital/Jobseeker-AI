'use client';

import { useState } from 'react';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumePreview from '@/components/resume/ResumePreview';
import { ParsedResume } from '@/lib/resume/parser';
import { Card } from '@/components/ui/card';

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);

  const handleUploadComplete = (data: any) => {
    if (data.parsedData) {
      setResumeData(data.parsedData);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Resume Scanner</h1>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <ResumeUploader onUploadComplete={handleUploadComplete} />
        
        {resumeData ? (
          <ResumePreview resumeData={resumeData} />
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p>Upload your resume to see the parsed information</p>
          </Card>
        )}
      </div>
    </div>
  );
}
