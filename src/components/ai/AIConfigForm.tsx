'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Key } from 'lucide-react';

interface AIConfigFormProps {
  onSave: (config: AIConfig) => void;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
}

export default function AIConfigForm({ onSave }: AIConfigFormProps) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    
    setError(null);
    onSave({
      provider,
      apiKey: apiKey.trim()
    });
  };
  
  return (
    <Card className="p-6 border-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ai-provider">AI Provider</Label>
          <Select
            value={provider}
            onValueChange={setProvider}
          >
            <SelectTrigger id="ai-provider">
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
              <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
              <SelectItem value="google">Google (Gemini)</SelectItem>
              <SelectItem value="mistral">Mistral AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
              required
            />
            <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            Your API key is stored locally and never sent to our servers.
            It's used only for direct communication with the AI provider.
          </p>
        </div>
        
        {error && (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <Button type="submit" className="w-full">Save AI Configuration</Button>
      </form>
    </Card>
  );
}
