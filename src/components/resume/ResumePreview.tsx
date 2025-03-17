'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParsedResume } from '@/lib/resume/parser';

interface ResumePreviewProps {
  resumeData: ParsedResume;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!resumeData) {
    return null;
  }

  return (
    <Card className="p-6 border-2 border-primary/20">
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{resumeData.fullName}</h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.email && (
                <Badge variant="outline" className="px-2 py-1">
                  {resumeData.email}
                </Badge>
              )}
              {resumeData.phone && (
                <Badge variant="outline" className="px-2 py-1">
                  {resumeData.phone}
                </Badge>
              )}
              {resumeData.location && (
                <Badge variant="outline" className="px-2 py-1">
                  {resumeData.location}
                </Badge>
              )}
            </div>
          </div>
          
          {resumeData.summary && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Summary</h3>
              <p className="text-gray-700">{resumeData.summary}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <Badge key={index} className="px-2 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          {resumeData.languages && resumeData.languages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.languages.map((language, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="experience" className="space-y-4">
          <h3 className="text-xl font-semibold">Work Experience</h3>
          {resumeData.experience.map((exp, index) => (
            <Card key={index} className="p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium">{exp.title}</h4>
                  <p className="text-gray-700">{exp.company}</p>
                  {exp.location && <p className="text-gray-500 text-sm">{exp.location}</p>}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
              </div>
              {exp.description && (
                <p className="mt-2 text-gray-700">{exp.description}</p>
              )}
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="education" className="space-y-4">
          <h3 className="text-xl font-semibold">Education</h3>
          {resumeData.education.map((edu, index) => (
            <Card key={index} className="p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium">{edu.degree}</h4>
                  <p className="text-gray-700">{edu.institution}</p>
                  {edu.location && <p className="text-gray-500 text-sm">{edu.location}</p>}
                </div>
                <div className="text-right">
                  {edu.graduationDate && (
                    <p className="text-sm text-gray-500">Graduated: {edu.graduationDate}</p>
                  )}
                  {edu.gpa && (
                    <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <ul className="list-disc pl-5 space-y-1">
                {resumeData.certifications.map((cert, index) => (
                  <li key={index} className="text-gray-700">{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="skills" className="space-y-4">
          <h3 className="text-xl font-semibold">Skills Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border">
              <h4 className="text-lg font-medium mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills
                  .filter(skill => !skill.toLowerCase().includes('soft') && !skill.toLowerCase().includes('management'))
                  .map((skill, index) => (
                    <Badge key={index} className="px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </Card>
            
            <Card className="p-4 border">
              <h4 className="text-lg font-medium mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills
                  .filter(skill => skill.toLowerCase().includes('soft') || skill.toLowerCase().includes('management'))
                  .map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </Card>
          </div>
          
          {resumeData.languages && resumeData.languages.length > 0 && (
            <Card className="p-4 border mt-4">
              <h4 className="text-lg font-medium mb-2">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.languages.map((language, index) => (
                  <Badge key={index} variant="outline" className="px-2 py-1">
                    {language}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
