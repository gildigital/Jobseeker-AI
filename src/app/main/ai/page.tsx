'use client';

import { useState } from 'react';
import { AIConfigForm, AIConfig } from '@/components/ai/AIConfigForm';
import { ResumeScore } from '@/components/ai/ResumeScore';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AISettingsPage() {
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [activeTab, setActiveTab] = useState('config');
  
  const handleSaveConfig = (config: AIConfig) => {
    setAIConfig(config);
    // In a real implementation, we would store this in localStorage or a secure cookie
    localStorage.setItem('aiConfig', JSON.stringify(config));
    alert('AI configuration saved successfully!');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Integration</h1>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <Tabs defaultValue="config" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="config">AI Configuration</TabsTrigger>
            <TabsTrigger value="about">About AI Scoring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <AIConfigForm onSave={handleSaveConfig} />
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="p-6 border-2">
              <h2 className="text-xl font-semibold mb-4">About AI Resume Scoring</h2>
              <div className="space-y-4">
                <p>
                  Our AI scoring system analyzes your resume against job descriptions to provide a match score on a scale of 1-10.
                </p>
                <p>
                  <strong>How it works:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The AI compares your resume content with the job description</li>
                  <li>It identifies matching qualifications and missing keywords</li>
                  <li>Scores below 6 indicate your resume might be discarded by automated systems</li>
                  <li>The system provides specific feedback to improve your match score</li>
                </ul>
                <p>
                  <strong>Privacy & Security:</strong>
                </p>
                <p>
                  Your API key is stored locally in your browser and is never sent to our servers.
                  It's used only for direct communication between your browser and the AI provider.
                </p>
                <p>
                  <strong>Supported AI Providers:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>OpenAI (GPT-4)</li>
                  <li>Anthropic (Claude)</li>
                  <li>Google (Gemini)</li>
                  <li>Mistral AI</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
